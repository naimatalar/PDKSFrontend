import React, { useEffect, useState } from 'react';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import { GetWithToken, PostWithToken } from '../../api/crud';
import ReactSelect from 'react-select';
import ExcelJS from 'exceljs';

const formatTarihTr = (val) => {
    if (!val) return '';
    try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return val;
        const dd = String(d.getDate()).padStart(2, '0');
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${dd}.${MM}.${yyyy} ${hh}:${mm}:${ss}`;
    } catch {
        return val;
    }
};

const basliklar = [
    { key: 'firma', label: 'Firma' },
    { key: 'altFirma', label: 'AltFirma' },
    { key: 'bolum', label: 'Bolum' },
    { key: 'pozisyon', label: 'Pozisyon' },
    { key: 'gorev', label: 'Gorev' },
    { key: 'ad', label: 'Ad' },
    { key: 'soyad', label: 'Soyad' },
    { key: 'baslangicTarihi', label: 'Başlangıç Tarihi' },
    { key: 'bitisTarihi', label: 'Bitiş Tarihi' },
    { key: 'mesaiSuresi', label: 'Mesai Süresi' },
    { key: 'eksikMesai', label: 'Eksik Mesai' },
    { key: 'fazlaMesai', label: 'Fazla Mesai' },
];

export default function AylikIlkSonRaporuIndex() {
    const [firmaList, setFirmaList] = useState([]);
    const [altFirmaList, setAltFirmaList] = useState([]);
    const [bolumList, setBolumList] = useState([]);
    const [pozisyonList, setPozisyonList] = useState([]);
    const [gorevList, setGorevList] = useState([]);
    const [sicilList, setSicilList] = useState([]);

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
    const [seciliSiciller, setSeciliSiciller] = useState([]);

    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [sicilLoading, setSicilLoading] = useState(false);

    useEffect(() => {
        loadOptions();
    }, []);

    useEffect(() => {
        loadSicilList();
    }, [firmaId, altFirmaId, bolumId, pozisyonId, gorevId]);

    const loadOptions = async () => {
        setOptionsLoading(true);
        const pagination = { PageNumber: 1, PageSize: 500 };
        const fetchOpt = (url) =>
            GetWithToken(url, pagination)
                .then((r) => r.data?.data?.list || [])
                .catch(() => []);

        const [firma, altFirma, bolum, pozisyon, gorev] = await Promise.all([
            fetchOpt('CboFirma/GetAll'),
            fetchOpt('CboAltFirma/GetAll'),
            fetchOpt('CboBolum/GetAll'),
            fetchOpt('CboPozisyon/GetAll'),
            fetchOpt('CboGorev/GetAll'),
        ]);

        setFirmaList([{ value: 0, label: 'Tümü' }, ...firma.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setAltFirmaList([{ value: 0, label: 'Tümü' }, ...altFirma.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setBolumList([{ value: 0, label: 'Tümü' }, ...bolum.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setPozisyonList([{ value: 0, label: 'Tümü' }, ...pozisyon.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setGorevList([{ value: 0, label: 'Tümü' }, ...gorev.map((x) => ({ value: x.id, label: x.ad || x.Ad }))]);
        setOptionsLoading(false);
    };

    const loadSicilList = async () => {
        setSicilLoading(true);
        try {
            const params = new URLSearchParams({
                firmaId: firmaId || 0,
                altFirmaId: altFirmaId || 0,
                bolumId: bolumId || 0,
                pozisyonId: pozisyonId || 0,
                gorevId: gorevId || 0,
            });
            const res = await GetWithToken(`GirisCikisRapor/GetSicilList?${params}`);
            const list = res?.data?.data || [];
            setSicilList(list);
            setSeciliSiciller([]);
        } catch (e) {
            console.error('Personel listesi yüklenemedi', e);
        } finally {
            setSicilLoading(false);
        }
    };

    const sicilSecenekleri = sicilList.map((s) => ({
        value: s.id,
        label: `${s.ad || ''} ${s.soyad || ''} (${s.sicilNo || ''})`.trim(),
        cikisTarih: s.cikisTarih,
    }));

    const tumunuSec = () => {
        setSeciliSiciller(sicilSecenekleri);
    };

    const secimiTemizle = () => {
        setSeciliSiciller([]);
    };

    const raporuGetir = async () => {
        const ids = seciliSiciller.length > 0 ? seciliSiciller.map((s) => s.value) : null;
        if (!ids) {
            alert('Personel Seçiniz...');
            return;
        }
        setLoading(true);
        setReportData(null);
        try {
            const res = await PostWithToken('GirisCikisRapor/GetAylikIlkSonReport', {
                sicilIds: ids,
                baslangicTarihi: baslangic,
                bitisTarihi: bitis,
            });
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
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Aylık İlk Son Raporu');
        const headerRow = sheet.addRow(basliklar.map((h) => h.label));
        headerRow.font = { bold: true };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.eachCell((c) => {
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
        reportData.forEach((row) => {
            sheet.addRow(basliklar.map((h) => {
                const val = row[h.key];
                if (h.key === 'baslangicTarihi' || h.key === 'bitisTarihi') return val ? formatTarihTr(val) : '';
                return val ?? '';
            }));
        });
        sheet.columns.forEach((col, i) => { col.width = i === 4 ? 35 : 18; });
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aylik-ilk-son-raporu-${baslangic}-${bitis}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Layout>
            <PageHeader
                title="Aylık İlk Son Raporu"
                map={[
                    { url: 'raporlar', name: 'Raporlar' },
                    { url: 'raporlar/aylik-ilk-son-raporu', name: 'Aylık İlk Son Raporu' },
                ]}
            />
            <div className="content p-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Aylık İlk Son Raporu</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-3">
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
                        </div>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-8">
                                <label className="form-label">Personel Seçin</label>
                                <ReactSelect
                                    isMulti
                                    options={sicilSecenekleri}
                                    value={seciliSiciller}
                                    onChange={setSeciliSiciller}
                                    isDisabled={sicilLoading}
                                    placeholder="Personel seçin..."
                                    formatOptionLabel={(opt) => (
                                        <span style={opt.cikisTarih ? { color: '#dc3545' } : {}}>
                                            {opt.label}
                                            {opt.cikisTarih ? ' (Ayrılmış)' : ''}
                                        </span>
                                    )}
                                />
                            </div>
                            <div className="col-md-4 d-flex gap-2 flex-wrap">
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={tumunuSec} disabled={sicilLoading}>
                                    Tümünü Seç
                                </button>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={secimiTemizle}>
                                    Temizle
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary flex-grow-1"
                                    onClick={raporuGetir}
                                    disabled={loading || sicilLoading}
                                >
                                    {loading ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="icon-search4 me-1" />}
                                    Ara
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {reportData !== null && (
                    <div className="card mt-3 shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom">
                            <h5 className="mb-0 fw-semibold">Rapor Sonucu ({reportData.length} kayıt)</h5>
                            <button type="button" className="btn btn-sm btn-success" onClick={exportToExcel} disabled={!reportData?.length}>
                                <i className="icon-file-excel me-1" />
                                Excel
                            </button>
                        </div>
                        <div className="card-body p-0">
                            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 380px)' }}>
                                {reportData.length > 0 ? (
                                    <table
                                        className="table table-bordered table-responsive table-striped"
                                        border="1"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        id="pdks"
                                        style={{ textAlign: 'center', minWidth: 'max-content' }}
                                    >
                                        <thead>
                                            <tr>
                                                <th>Firma</th>
                                                <th>AltFirma</th>
                                                <th>Bolum</th>
                                                <th>Pozisyon</th>
                                                <th style={{ width: '20%' }}>Gorev</th>
                                                <th>Ad</th>
                                                <th>Soyad</th>
                                                <th>Başlangıç Tarihi</th>
                                                <th>Bitiş Tarihi</th>
                                                <th>Mesai Süresi</th>
                                                <th>Eksik Mesai</th>
                                                <th>Fazla Mesai</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.map((row, idx) => (
                                                <tr
                                                    key={idx}
                                                    style={row.ayrilmis ? { backgroundColor: '#ffe0e0' } : {}}
                                                    data-sicil-pasif={row.ayrilmis ? '1' : undefined}
                                                >
                                                    <td>{row.firma ?? ''}</td>
                                                    <td>{row.altFirma ?? ''}</td>
                                                    <td>{row.bolum ?? ''}</td>
                                                    <td>{row.pozisyon ?? ''}</td>
                                                    <td>{row.gorev ?? ''}</td>
                                                    <td>{row.ad ?? ''}</td>
                                                    <td>{row.soyad ?? ''}</td>
                                                    <td>{formatTarihTr(row.baslangicTarihi)}</td>
                                                    <td>{formatTarihTr(row.bitisTarihi)}</td>
                                                    <td>{row.mesaiSuresi ?? ''}</td>
                                                    <td>{row.eksikMesai ?? ''}</td>
                                                    <td>{row.fazlaMesai ?? ''}</td>
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
