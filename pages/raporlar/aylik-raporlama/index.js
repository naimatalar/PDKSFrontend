import React, { useEffect, useState } from 'react';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import { GetWithToken } from '../../api/crud';
import ReactSelect from 'react-select';
import ExcelJS from 'exceljs';

const formatTarih = (val) => {
    if (!val) return '-';
    try {
        return new Date(val).toLocaleDateString('tr-TR');
    } catch {
        return val;
    }
};

const stripHtml = (str) => {
    if (!str || typeof str !== 'string') return str || '';
    return str.replace(/<[^>]*>/g, '').trim();
};

export default function AylikRaporlamaIndex() {
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
            const res = await GetWithToken(`AylikRapor/GetReport?${params}`);
            setReportData(res?.data?.data || null);
        } catch (e) {
            console.error('Rapor alınamadı', e);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = async () => {
        if (!reportData?.rows) return;
        const gunler = reportData.gunler || [];
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Aylik Rapor', { views: [{ state: 'frozen', ySplit: 3, activeCell: 'A4' }] });

        const titleRow = sheet.addRow([`Aylık Rapor - ${reportData.baslangicTarihi} / ${reportData.bitisTarihi} (${reportData.toplamKisi} Kişi)`]);
        titleRow.font = { bold: true, size: 14 };
        titleRow.alignment = { horizontal: 'center' };
        sheet.mergeCells(1, 1, 1, 4 + gunler.length);
        titleRow.height = 24;

        sheet.addRow([]);

        const colHeaders = [
            'Personel',
            ...gunler.map((g) => formatTarih(g)),
            'Toplam Fazla Mesai',
            'Toplam Eksik Mesai',
            'Sonuç',
        ];
        const headerRow = sheet.addRow(colHeaders);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        const cellStyles = {
            gec: { font: { color: { argb: 'FFDC3545' }, bold: false } },
            'is-girmedi': { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } } },
            haftalik_izin: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7F3FF' } } },
            izin: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } } },
        };

        reportData.rows.forEach((row) => {
            const rowData = [
                `${row.ad || ''} ${row.soyad || ''}`.trim(),
                ...(row.gunler || []).map((g) => stripHtml(g?.girisCikis || '-')),
                `${row.toplamFazlaMesai || 0} Dak / ${row.fazlaMesaiGun || 0} Gün`,
                `${row.toplamEksikMesai || 0} Dak / ${row.eksikMesaiGun || 0} Gün`,
                `${row.sonuc || 0} Dak / ${row.sonucSaat || '00:00'} Saat`,
            ];
            const dataRow = sheet.addRow(rowData);
            const gunlerData = row.gunler || [];
            dataRow.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
                if (colNumber === 1) {
                    cell.font = { bold: true };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9E9E9' } };
                } else if (colNumber >= 2 && colNumber <= 1 + gunlerData.length) {
                    const gun = gunlerData[colNumber - 2];
                    const cssClass = gun?.cssClass;
                    if (cssClass && cellStyles[cssClass]) {
                        const style = cellStyles[cssClass];
                        if (style.font) cell.font = { ...(cell.font || {}), ...style.font };
                        if (style.fill) cell.fill = style.fill;
                    }
                }
            });
        });

        sheet.columns = [
            { width: 22 },
            ...gunler.map(() => ({ width: 12 })),
            { width: 20 },
            { width: 20 },
            { width: 20 },
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aylik-rapor-${reportData.baslangicTarihi}-${reportData.bitisTarihi}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Layout>
            <PageHeader
                title="Aylık Rapor"
                map={[
                    { url: 'raporlar', name: 'Raporlar' },
                    { url: 'AylikRaporlama', name: 'Aylık Rapor' },
                ]}
            />
            <div className="content p-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Aylık Rapor Filtreleri</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-4">
                            <div className="col-md-2">
                                <label className="form-label">Başlangıç Tarihi</label>
                                <input type="date" className="form-control" value={baslangic} onChange={(e) => setBaslangic(e.target.value)} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Bitiş Tarihi</label>
                                <input type="date" className="form-control" value={bitis} onChange={(e) => setBitis(e.target.value)} />
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
                                    {loading ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="icon-play3 me-1" />}
                                    {""} Raporu Getir
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success ml-1"
                                    onClick={exportToExcel}
                                    disabled={!reportData?.rows?.length || loading || optionsLoading}
                                    title="Raporu Excel olarak indir "
                                >
                                    <i className="icon-file-excel me-1" />
                                   {""} Excel Aktar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {reportData && (
                    <div className="card mt-3">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                Rapor: {reportData.baslangicTarihi} - {reportData.bitisTarihi}
                            </h5>
                            <span className="badge bg-primary">Rapor Sonucu: {reportData.toplamKisi} Kişi</span>
                        </div>
                        <div className="card-body p-0 col-12">
                            <div className='row'>
                                <div className='col-12' style={{overflow: "scroll",
    width:"1px"}}>



                                    <table className="table table-bordered table-sm mb-0" >
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ minWidth: 120, position: 'sticky', left: 0, backgroundColor: '#f8f9fa', zIndex: 2 }}>
                                                    Personel
                                                </th>
                                                {reportData.gunler?.map((g) => (
                                                    <th key={g} style={{ minWidth: 90, whiteSpace: 'nowrap' }}>
                                                        {formatTarih(g)}
                                                    </th>
                                                ))}
                                                <th style={{ minWidth: 140 }}>Toplam Fazla Mesai</th>
                                                <th style={{ minWidth: 140 }}>Toplam Eksik Mesai</th>
                                                <th style={{ minWidth: 140 }}>Sonuç</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.rows?.map((row) => (
                                                <tr key={row.sicilId}>
                                                    <td style={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 1 }}>
                                                        <strong>
                                                            {row.ad} {row.soyad}
                                                        </strong>
                                                    </td>
                                                    {row.gunler?.map((gun, idx) => (
                                                        <td
                                                            key={`${row.sicilId}-${idx}`}
                                                            className={gun.cssClass}
                                                            style={
                                                                gun.cssClass === 'is-girmedi'
                                                                    ? { backgroundColor: '#90EE90' }
                                                                    : gun.cssClass === 'gec'
                                                                        ? { color: '#dc3545' }
                                                                        : gun.cssClass === 'haftalik_izin'
                                                                            ? { backgroundColor: '#e7f3ff' }
                                                                            : gun.cssClass === 'izin'
                                                                                ? { backgroundColor: '#fff3cd' }
                                                                                : {}
                                                            }
                                                            dangerouslySetInnerHTML={{
                                                                __html: gun.girisCikis || '-',
                                                            }}
                                                        />
                                                    ))}
                                                    <td>
                                                        {row.toplamFazlaMesai} - Dak / {row.fazlaMesaiGun} - Gün
                                                    </td>
                                                    <td>
                                                        {row.toplamEksikMesai} - Dak / {row.eksikMesaiGun} - Gün
                                                    </td>
                                                    <td>
                                                        {row.sonuc} - Dak / {row.sonucSaat} - Saat
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
