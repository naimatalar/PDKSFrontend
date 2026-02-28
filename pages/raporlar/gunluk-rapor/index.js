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

export default function GunlukRaporIndex() {
    const [firmaList, setFirmaList] = useState([]);
    const [altFirmaList, setAltFirmaList] = useState([]);
    const [bolumList, setBolumList] = useState([]);
    const [pozisyonList, setPozisyonList] = useState([]);
    const [gorevList, setGorevList] = useState([]);
    const [yakaList, setYakaList] = useState([]);

    const [tarih, setTarih] = useState(() => new Date().toISOString().split('T')[0]);
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

    const raporuGetir = async () => {
        setLoading(true);
        setReportData(null);
        try {
            const params = new URLSearchParams({
                tarih,
                firmaId: firmaId || 0,
                altFirmaId: altFirmaId || 0,
                bolumId: bolumId || 0,
                pozisyonId: pozisyonId || 0,
                gorevId: gorevId || 0,
                yakaId: yakaId || 0,
            });
            const res = await GetWithToken(`GunlukRapor/GetReport?${params}`);
            setReportData(res?.data?.data || []);
        } catch (e) {
            console.error('Rapor alınamadı', e);
            alert(e?.response?.data?.message || 'Rapor alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = async () => {
        if (!reportData || reportData.length === 0) return;
        const cols = ['ad', 'soyad', 'bolum', 'firma', 'pozisyon', 'yaka', 'sicilNo', 'tarih', 'girisSaati', 'cikisSaati'];
        const colLabels = ['Ad', 'Soyad', 'Bölüm', 'Firma', 'Pozisyon', 'Yaka', 'Sicil No', 'Tarih', 'Giriş Saati', 'Çıkış Saati'];
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Günlük Rapor');
        const headerRow = sheet.addRow(colLabels);
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
        reportData.forEach((row) => {
            sheet.addRow(cols.map((c) => row[c] ?? ''));
        });
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gunluk-rapor-${tarih}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const basliklar = [
        { key: 'ad', label: 'Ad' },
        { key: 'soyad', label: 'Soyad' },
        { key: 'bolum', label: 'Bölüm' },
        { key: 'firma', label: 'Firma' },
        { key: 'pozisyon', label: 'Pozisyon' },
        { key: 'yaka', label: 'Yaka' },
        { key: 'sicilNo', label: 'Sicil No' },
        { key: 'tarih', label: 'Tarih' },
        { key: 'girisSaati', label: 'Giriş Saati' },
        { key: 'cikisSaati', label: 'Çıkış Saati' },
    ];

    return (
        <Layout>
            <PageHeader
                title="Günlük Rapor"
                map={[
                    { url: 'raporlar', name: 'Raporlar' },
                    { url: 'raporlar/gunluk-rapor', name: 'Günlük Rapor' },
                ]}
            />
            <div className="content p-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Filtreler</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-2">
                                <label className="form-label">Tarih</label>
                                <input type="date" className="form-control" value={tarih} onChange={(e) => setTarih(e.target.value)} />
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
                            <div className="col-md-2 d-flex align-items-end">
                                <button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    onClick={raporuGetir}
                                    disabled={loading || optionsLoading}
                                >
                                    {loading ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="icon-play3 me-1" />}
                                    Raporu Getir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {reportData !== null && (
                    <div className="card mt-3 shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom">
                            <h5 className="mb-0 fw-semibold">
                                Günlük Rapor - {formatTarih(tarih)} ({reportData.length} kayıt)
                            </h5>
                            <button type="button" className="btn btn-sm btn-success" onClick={exportToExcel} disabled={!reportData?.length}>
                                <i className="icon-file-excel me-1" />
                                Excel Aktar
                            </button>
                        </div>
                        <div className="card-body p-0">
                            <div
                                style={{
                                    overflowX: 'auto',
                                    overflowY: 'auto',
                                    maxHeight: 'calc(100vh - 380px)',
                                }}
                            >
                                {reportData.length > 0 ? (
                                    <table
                                        className="table table-bordered table-hover table-striped table-sm mb-0"
                                        style={{ minWidth: 'max-content', fontSize: '0.9rem' }}
                                    >
                                        <thead>
                                            <tr>
                                                {basliklar.map((h) => (
                                                    <th
                                                        key={h.key}
                                                        style={{
                                                            whiteSpace: 'nowrap',
                                                            minWidth: 90,
                                                            padding: '12px 14px',
                                                            backgroundColor: '#4472C4',
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                            borderColor: '#3a62a8',
                                                            position: 'sticky',
                                                            top: 0,
                                                            zIndex: 1,
                                                            boxShadow: '0 2px 2px -1px rgba(0,0,0,0.1)',
                                                        }}
                                                    >
                                                        {h.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.map((row, idx) => (
                                                <tr key={idx} style={row.ayrilmis ? { backgroundColor: 'rgba(220, 53, 69, 0.12)' } : {}}>
                                                    {basliklar.map((col) => (
                                                        <td key={col.key} style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                                                            {col.key === 'tarih' ? formatTarih(row[col.key]) : String(row[col.key] ?? '')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-5 text-center text-muted">
                                        <i className="icon-list text-muted d-block mb-2" style={{ fontSize: '2rem', opacity: 0.5 }} />
                                        Kayıt bulunamadı.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
