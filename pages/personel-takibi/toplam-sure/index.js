import React, { useEffect, useState } from 'react';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import { GetWithToken } from '../../api/crud';
import ReactSelect from 'react-select';
import ExcelJS from 'exceljs';

export default function ToplamSureIndex() {
    const [firmaList, setFirmaList] = useState([]);
    const [altFirmaList, setAltFirmaList] = useState([]);
    const [bolumList, setBolumList] = useState([]);
    const [pozisyonList, setPozisyonList] = useState([]);
    const [gorevList, setGorevList] = useState([]);
    const [yakaList, setYakaList] = useState([]);

    const [baslangic, setBaslangic] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    });
    const [bitis, setBitis] = useState(() => new Date().toISOString().split('T')[0]);
    const [firmaId, setFirmaId] = useState(0);
    const [altFirmaId, setAltFirmaId] = useState(0);
    const [bolumId, setBolumId] = useState(0);
    const [pozisyonId, setPozisyonId] = useState(0);
    const [gorevId, setGorevId] = useState(0);
    const [yakaId, setYakaId] = useState(0);

    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [optionsLoading, setOptionsLoading] = useState(true);

    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        setOptionsLoading(true);
        const pagination = { PageNumber: 0, PageSize: 500 };
        const fetchOpt = (url) =>
            GetWithToken(url, pagination)
                .then((r) => r.data?.data?.list || [])
                .catch(() => []);

        const [firma, altFirma, bolum, pozisyon, gorev, yaka] = await Promise.all([
            fetchOpt('CboFirma/GetAll'),
            fetchOpt('CboAltFirma/GetAll'),
            fetchOpt('CboBolum/GetAll'),
            fetchOpt('CboPozisyon/GetAll'),
            fetchOpt('CboGorev/GetAll'),
            fetchOpt('CboYaka/GetAll'),
        ]);

        setFirmaList([{ value: 0, label: 'Tümü' }, ...firma.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setAltFirmaList([{ value: 0, label: 'Tümü' }, ...altFirma.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setBolumList([{ value: 0, label: 'Tümü' }, ...bolum.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setPozisyonList([{ value: 0, label: 'Tümü' }, ...pozisyon.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setGorevList([{ value: 0, label: 'Tümü' }, ...gorev.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setYakaList([{ value: 0, label: 'Tümü' }, ...yaka.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setOptionsLoading(false);
    };

    const runReport = async () => {
        setLoading(true);
        setReportData(null);
        try {
            const params = new URLSearchParams({
                baslangicTarihi: baslangic,
                bitisTarihi: bitis,
                firmaId: firmaId || 0,
                altFirmaId: altFirmaId || 0,
                bolumId: bolumId || 0,
                pozisyonId: pozisyonId || 0,
                gorevId: gorevId || 0,
                yakaId: yakaId || 0,
            });
            const res = await GetWithToken(`ToplamSure/GetReport?${params}`);
            setReportData(res?.data?.data || null);
        } catch (e) {
            console.error('Toplam süre raporu alınamadı', e);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = async () => {
        if (!reportData?.list?.length) return;
        const list = reportData.list;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Toplam Süre', { views: [{ state: 'frozen', ySplit: 2, activeCell: 'A2' }] });

        const titleRow = sheet.addRow([
            `Toplam Süre Raporu - ${reportData.baslangicTarihi} / ${reportData.bitisTarihi} (${reportData.toplamKisi} Kişi)`,
        ]);
        titleRow.font = { bold: true, size: 14 };
        titleRow.alignment = { horizontal: 'center' };
        sheet.mergeCells(1, 1, 1, 12);
        titleRow.height = 24;

        const colHeaders = [
            'Ad Soyad',
            'Sicil No',
            'Mesai Süresi',
            'Normal Mesai',
            'Fazla Mesai',
            'İzin Süre',
            'Hakediş',
            'Onaylı Fazla Mesai',
            'Resmi Tatil',
            'Eksik Mesai',
            'Devamsızlık',
        ];
        const headerRow = sheet.addRow(colHeaders);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        headerRow.height = 22;
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        list.forEach((row) => {
            const dataRow = sheet.addRow([
                row.adSoyad ?? '',
                row.sicilNo ?? '',
                row.mesaiSuresi ?? '',
                row.normalMesai ?? '',
                row.fazlaMesai ?? '',
                row.izinSure ?? '',
                row.hakedis ?? '',
                row.oFazlaMesai ?? '',
                row.resmiTatil ?? '',
                row.eksikMesai ?? '',
                row.devamsizlik ?? '',
            ]);
            dataRow.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });

        sheet.columns = [
            { width: 22 },
            { width: 14 },
            { width: 14 },
            { width: 14 },
            { width: 14 },
            { width: 12 },
            { width: 12 },
            { width: 18 },
            { width: 14 },
            { width: 14 },
            { width: 14 },
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `toplam-sure-${reportData.baslangicTarihi}-${reportData.bitisTarihi}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const list = reportData?.list ?? [];

    return (
        <Layout>
            <PageHeader
                title="Toplam Süre"
                map={[
                    { url: 'personel-takibi', name: 'Personel Takibi' },
                    { url: 'personel-takibi/toplam-sure', name: 'Toplam Süre' },
                ]}
            />
            <div className="content p-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Filtreler</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-4">
                            <div className="col-md-2">
                                <label className="form-label">Başlangıç Tarihi</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={baslangic}
                                    onChange={(e) => setBaslangic(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Bitiş Tarihi</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={bitis}
                                    onChange={(e) => setBitis(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Firma</label>
                                <ReactSelect
                                    options={firmaList}
                                    value={firmaList.find((x) => x.value === firmaId) || firmaList[0]}
                                    onChange={(o) => setFirmaId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Alt Firma</label>
                                <ReactSelect
                                    options={altFirmaList}
                                    value={altFirmaList.find((x) => x.value === altFirmaId) || altFirmaList[0]}
                                    onChange={(o) => setAltFirmaId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Bölüm</label>
                                <ReactSelect
                                    options={bolumList}
                                    value={bolumList.find((x) => x.value === bolumId) || bolumList[0]}
                                    onChange={(o) => setBolumId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Pozisyon</label>
                                <ReactSelect
                                    options={pozisyonList}
                                    value={pozisyonList.find((x) => x.value === pozisyonId) || pozisyonList[0]}
                                    onChange={(o) => setPozisyonId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Görev</label>
                                <ReactSelect
                                    options={gorevList}
                                    value={gorevList.find((x) => x.value === gorevId) || gorevList[0]}
                                    onChange={(o) => setGorevId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Yaka</label>
                                <ReactSelect
                                    options={yakaList}
                                    value={yakaList.find((x) => x.value === yakaId) || yakaList[0]}
                                    onChange={(o) => setYakaId(o?.value ?? 0)}
                                    isDisabled={optionsLoading}
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2 d-flex align-items-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-primary flex-grow-1"
                                    onClick={runReport}
                                    disabled={loading || optionsLoading}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm me-1" />
                                    ) : (
                                        <i className="icon-play3 me-1" />
                                    )}
                                    {' '}Raporu Getir
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success ml-1"
                                    onClick={exportToExcel}
                                    disabled={!list.length || loading || optionsLoading}
                                    title="Raporu Excel olarak indir"
                                >
                                    <i className="icon-file-excel me-1" />
                                    {' '}Excel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {reportData && (
                    <div className="card mt-3">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                Toplam Süre: {reportData.baslangicTarihi} - {reportData.bitisTarihi}
                            </h5>
                            <span className="badge bg-primary">Kişi Sayısı: {reportData.toplamKisi}</span>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ minWidth: 160 }}>Ad Soyad</th>
                                            <th style={{ minWidth: 100 }}>Sicil No</th>
                                            <th style={{ minWidth: 100 }}>Mesai Süresi</th>
                                            <th style={{ minWidth: 100 }}>Normal Mesai</th>
                                            <th style={{ minWidth: 100 }}>Fazla Mesai</th>
                                            <th style={{ minWidth: 90 }}>İzin Süre</th>
                                            <th style={{ minWidth: 90 }}>Hakediş</th>
                                            <th style={{ minWidth: 120 }}>Onaylı Fazla Mesai</th>
                                            <th style={{ minWidth: 100 }}>Resmi Tatil</th>
                                            <th style={{ minWidth: 100 }}>Eksik Mesai</th>
                                            <th style={{ minWidth: 90 }}>Devamsızlık</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {list.map((row) => (
                                            <tr key={row.sicilId}>
                                                <td><strong>{row.adSoyad ?? '-'}</strong></td>
                                                <td>{row.sicilNo ?? '-'}</td>
                                                <td>{row.mesaiSuresi ?? '-'}</td>
                                                <td>{row.normalMesai ?? '-'}</td>
                                                <td>{row.fazlaMesai ?? '-'}</td>
                                                <td>{row.izinSure ?? '-'}</td>
                                                <td>{row.hakedis ?? '-'}</td>
                                                <td>{row.oFazlaMesai ?? '-'}</td>
                                                <td>{row.resmiTatil ?? '-'}</td>
                                                <td>{row.eksikMesai ?? '-'}</td>
                                                <td>{row.devamsizlik ?? '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
