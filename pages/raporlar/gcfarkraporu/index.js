import React, { useEffect, useState } from 'react';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import { GetWithToken, PostWithToken } from '../../api/crud';
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

const HAFTA_GUNLERI = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

const isTimeFormat = (str) => str && /^\d{1,2}:\d{2}$/.test(String(str).trim());

const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const parts = String(timeStr).trim().split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
};

const calculateEf = (girisSaati, cikisSaati) => {
    const g = parseTimeToMinutes(girisSaati);
    const c = parseTimeToMinutes(cikisSaati);
    if (g == null || c == null) return null;
    const diffMin = c - g;
    if (diffMin < 0) return null;
    const hours = diffMin / 60;
    const rounded = Math.round(hours * 2) / 2;
    return rounded > 0 ? rounded.toString().replace('.', ',') : null;
};

const buildPivotData = (reportData, baslangic, bitis) => {
    if (!reportData || reportData.length === 0) return { dates: [], persons: [] };
    const start = new Date(baslangic);
    const end = new Date(bitis);
    const dates = [];
    const d = new Date(start);
    while (d <= end && dates.length < 31) {
        dates.push(new Date(d));
        d.setDate(d.getDate() + 1);
    }
    const dateKeys = dates.map((x) => x.toISOString().split('T')[0]);
    const byPerson = {};
    for (const row of reportData) {
        const key = `${row.ad || ''}|${row.soyad || ''}`;
        if (!byPerson[key]) {
            byPerson[key] = {
                ad: row.ad || '',
                soyad: row.soyad || '',
                ayrilmis: row.ayrilmis,
                byDate: {},
            };
        }
        const dt = row.tarih || '';
        if (dateKeys.includes(dt)) {
            byPerson[key].byDate[dt] = {
                girisSaati: row.girisSaati,
                cikisSaati: row.cikisSaati,
            };
        }
    }
    const persons = Object.values(byPerson).sort((a, b) => (a.ad + a.soyad).localeCompare(b.ad + b.soyad));
    return { dates, persons };
};

export default function GcFarkRaporuIndex() {
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
        const pagination = { PageNumber: 0, PageSize: 500 };
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
           alert("Personel Seçiniz...")
           return 
        }
        setLoading(true);
        setReportData(null);
        try {
            const res = await PostWithToken('GirisCikisRapor/GetReport', {
                sicilIds: ids ?? null,
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
        const { dates: expDates, persons: expPersons } = buildPivotData(reportData, baslangic, bitis);
        if (expPersons.length === 0 || expDates.length === 0) return;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('G-C Fark Raporu');
        const borderStyle = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDEB887' } };
        const row1 = ['ADI SOYADI', 'TARİH', ...expDates.map((d) => HAFTA_GUNLERI[d.getDay()]), 'TOPLAM', 'İMZA'];
        const row2 = ['', '', ...expDates.map((d) => d.getDate()), '', ''];
        sheet.addRow(row1).eachCell((c) => {
            c.font = { bold: true };
            c.fill = headerFill;
            c.alignment = { horizontal: 'center', vertical: 'middle' };
            c.border = borderStyle;
        });
        sheet.addRow(row2).eachCell((c, i) => {
            if (i > 2 && i <= 2 + expDates.length) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7FFFD4' } };
            c.border = borderStyle;
        });
        expPersons.forEach((person) => {
            const adSoyad = `${person.ad} ${person.soyad}`.trim();
            const girisRow = [adSoyad, 'Giriş', ...expDates.map((d) => {
                const dt = d.toISOString().split('T')[0];
                const rec = person.byDate[dt];
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                if (rec) return isWeekend ? 'HT' : isTimeFormat(rec.girisSaati) ? rec.girisSaati : rec.girisSaati || '';
                return '';
            }), 'FM : 0\nEM : 0', ''];
            const cikisRow = ['', 'Çıkış', ...expDates.map((d) => {
                const dt = d.toISOString().split('T')[0];
                const rec = person.byDate[dt];
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                if (rec) return isWeekend ? 'HT' : isTimeFormat(rec.cikisSaati) ? rec.cikisSaati : rec.cikisSaati || '';
                return '';
            }), '', ''];
            const efRow = ['', 'E/F', ...expDates.map((d) => {
                const dt = d.toISOString().split('T')[0];
                const rec = person.byDate[dt];
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                if (rec && !isWeekend && isTimeFormat(rec.girisSaati) && isTimeFormat(rec.cikisSaati)) return calculateEf(rec.girisSaati, rec.cikisSaati) || '';
                return '';
            }), '', ''];
            const r1 = sheet.addRow(girisRow);
            const r2 = sheet.addRow(cikisRow);
            const r3 = sheet.addRow(efRow);
            sheet.mergeCells(r1.number, 1, r3.number, 1);
            sheet.mergeCells(r1.number, 2 + expDates.length, r3.number, 2 + expDates.length);
            sheet.mergeCells(r1.number, 3 + expDates.length, r3.number, 3 + expDates.length);
            [r1, r2, r3].forEach((r) => r.eachCell((c) => { c.border = borderStyle; }));
        });
        sheet.columns.forEach((col, i) => { col.width = i === 0 ? 20 : i === 1 ? 8 : 10; });
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gc-fark-raporu-${baslangic}-${bitis}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const { dates, persons } = reportData ? buildPivotData(reportData, baslangic, bitis) : { dates: [], persons: [] };

    return (
        <Layout>
            <PageHeader
                title="G/C Fark Raporu"
                map={[
                    { url: 'raporlar', name: 'Raporlar' },
                    { url: 'raporlar/gcfarkraporu', name: 'G/C Fark Raporu' },
                ]}
            />
            <div className="content p-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Giriş Çıkış Fark</h5>
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
                            <h5 className="mb-0 fw-semibold">
                                Rapor Sonucu ({persons.length} personel, {dates.length} gün)
                            </h5>
                            <button type="button" className="btn btn-sm btn-success" onClick={exportToExcel} disabled={persons.length === 0}>
                                <i className="icon-file-excel me-1" />
                                Excel
                            </button>
                        </div>
                        <div className="card-body p-0 col-12">
                            <div
                            className='row'
                                style={{
                                    overflowX: 'auto',
                                    overflowY: 'auto',
                                    maxHeight: 'calc(100vh - 380px)',
                                }}
                            >
                                <div className='col-12' style={{overflow: "auto",width: "1px"}}>
                                {persons.length > 0 && dates.length > 0 ? (
                                    <table
                                        id="pdks"
                                        className="table table-bordered table-sm mb-0"
                                        style={{ minWidth: 'max-content', fontSize: '0.85rem', textAlign: 'center' }}
                                    >
                                        <thead>
                                            <tr style={{ backgroundColor: 'bisque' }}>
                                                <th
                                                    rowSpan={2}
                                                    style={{
                                                        minWidth: 108,
                                                        width: 108,
                                                        padding: '8px',
                                                        verticalAlign: 'middle',
                                                        backgroundColor: 'bisque',
                                                        border: '1px solid #dee2e6',
                                                    }}
                                                >
                                                    ADI SOYADI
                                                </th>
                                                <th
                                                    rowSpan={2}
                                                    style={{
                                                        minWidth: 46,
                                                        width: 46,
                                                        padding: '8px',
                                                        verticalAlign: 'middle',
                                                        backgroundColor: 'bisque',
                                                        border: '1px solid #dee2e6',
                                                    }}
                                                >
                                                    TARİH
                                                </th>
                                                {dates.map((d, i) => (
                                                    <th
                                                        key={i}
                                                        style={{
                                                            minWidth: 48,
                                                            width: 64,
                                                            padding: '4px 6px',
                                                            border: '1px solid #dee2e6',
                                                            backgroundColor: 'bisque',
                                                        }}
                                                    >
                                                        {HAFTA_GUNLERI[d.getDay()]}
                                                    </th>
                                                ))}
                                                <th
                                                    rowSpan={2}
                                                    style={{
                                                        minWidth: 100,
                                                        width: 100,
                                                        padding: '8px',
                                                        verticalAlign: 'middle',
                                                        backgroundColor: 'bisque',
                                                        border: '1px solid #dee2e6',
                                                    }}
                                                >
                                                    TOPLAM
                                                </th>
                                                <th
                                                    rowSpan={2}
                                                    style={{
                                                        minWidth: 100,
                                                        width: 150,
                                                        padding: '8px',
                                                        verticalAlign: 'middle',
                                                        backgroundColor: 'bisque',
                                                        border: '1px solid #dee2e6',
                                                    }}
                                                >
                                                    İMZA
                                                </th>
                                            </tr>
                                            <tr style={{ backgroundColor: 'aquamarine' }}>
                                                {dates.map((d, i) => (
                                                    <th
                                                        key={i}
                                                        style={{
                                                            padding: '4px 6px',
                                                            border: '1px solid #dee2e6',
                                                            backgroundColor: 'aquamarine',
                                                        }}
                                                    >
                                                        {d.getDate()}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {persons.map((person, pIdx) => {
                                                const adSoyad = `${person.ad} ${person.soyad}`.trim();
                                                return (
                                                    <React.Fragment key={pIdx}>
                                                        <tr style={person.ayrilmis ? { backgroundColor: '#ffe0e0' } : {}} data-sicil-pasif={person.ayrilmis ? '1' : undefined}>
                                                            <td
                                                                rowSpan={3}
                                                                style={{
                                                                    padding: '8px',
                                                                    verticalAlign: 'middle',
                                                                    minWidth: 108,
                                                                    border: '1px solid #dee2e6',
                                                                    whiteSpace: 'pre-wrap',
                                                                    backgroundColor: person.ayrilmis ? '#ffe0e0' : undefined,
                                                                }}
                                                            >
                                                                {adSoyad}
                                                            </td>
                                                            <td style={{ padding: '4px 6px', border: '1px solid #dee2e6', fontWeight: 500 }}>Giriş</td>
                                                            {dates.map((d, i) => {
                                                                const dt = d.toISOString().split('T')[0];
                                                                const rec = person.byDate[dt];
                                                                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                                                let val = '';
                                                                if (rec) {
                                                                    val = isWeekend ? 'HT' : isTimeFormat(rec.girisSaati) ? rec.girisSaati : rec.girisSaati || '-';
                                                                }
                                                                return (
                                                                    <td key={i} style={{ padding: '4px 6px', border: '1px solid #dee2e6' }}>
                                                                        {val}
                                                                    </td>
                                                                );
                                                            })}
                                                            <td rowSpan={3} style={{ padding: '8px', verticalAlign: 'middle', border: '1px solid #dee2e6' }}>
                                                                FM : 0
                                                                <br />
                                                                EM : 0
                                                            </td>
                                                            <td rowSpan={3} style={{ padding: '8px', verticalAlign: 'middle', border: '1px solid #dee2e6' }} />
                                                        </tr>
                                                        <tr style={person.ayrilmis ? { backgroundColor: '#ffe0e0' } : {}}>
                                                            <td style={{ padding: '4px 6px', border: '1px solid #dee2e6', fontWeight: 500 }}>Çıkış</td>
                                                            {dates.map((d, i) => {
                                                                const dt = d.toISOString().split('T')[0];
                                                                const rec = person.byDate[dt];
                                                                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                                                let val = '';
                                                                if (rec) {
                                                                    val = isWeekend ? 'HT' : isTimeFormat(rec.cikisSaati) ? rec.cikisSaati : rec.cikisSaati || '-';
                                                                }
                                                                return (
                                                                    <td key={i} style={{ padding: '4px 6px', border: '1px solid #dee2e6' }}>
                                                                        {val}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                        <tr style={person.ayrilmis ? { backgroundColor: '#ffe0e0' } : {}}>
                                                            <td style={{ padding: '4px 6px', border: '1px solid #dee2e6', fontWeight: 500 }}>E/F</td>
                                                            {dates.map((d, i) => {
                                                                const dt = d.toISOString().split('T')[0];
                                                                const rec = person.byDate[dt];
                                                                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                                                let val = '';
                                                                if (rec && !isWeekend && isTimeFormat(rec.girisSaati) && isTimeFormat(rec.cikisSaati)) {
                                                                    val = calculateEf(rec.girisSaati, rec.cikisSaati) || ' ';
                                                                } else if (rec && !isWeekend && (rec.girisSaati === 'HT' || rec.cikisSaati === 'HT')) {
                                                                    val = ' ';
                                                                }
                                                                return (
                                                                    <td key={i} style={{ padding: '4px 6px', border: '1px solid #dee2e6' }}>
                                                                        {val || ' '}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    </React.Fragment>
                                                );
                                            })}
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
                        
                    </div>
                )}
            </div>
        </Layout>
    );
}
