import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import { GetWithToken, PostWithToken } from '../../api/crud';
import ReactSelect from 'react-select';
import ExcelJS from 'exceljs';
import { Modal, ModalBody, Nav, NavItem, NavLink } from 'reactstrap';
import AppModalHeader from '../../../components/AppModalHeader';
import styles from './plan-gerceklesen-modal-tabs.module.css';

const TimePicker = dynamic(() => import('react-time-picker'), { ssr: false });

const formatTarih = (val) => {
    if (!val) return '-';
    try {
        return new Date(val).toLocaleDateString('tr-TR');
    } catch {
        return val;
    }
};

export default function PlanGerceklesenIndex() {
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
    const [modalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('kayit');
    const [selectedCell, setSelectedCell] = useState(null);
    const [tasnifDetail, setTasnifDetail] = useState(null);
    const [saving, setSaving] = useState(false);
    const [modalTitle, setModalTitle] = useState('');

    const [editGirisTarih, setEditGirisTarih] = useState('');
    const [editGirisSaat, setEditGirisSaat] = useState('');
    const [editCikisTarih, setEditCikisTarih] = useState('');
    const [editCikisSaat, setEditCikisSaat] = useState('');

    const [girisMazeret, setGirisMazeret] = useState('');
    const [cikisMazeret, setCikisMazeret] = useState('');

    const [izinTipleri, setIzinTipleri] = useState([]);
    const [izinTipId, setIzinTipId] = useState(0);
    const [izinUcretli, setIzinUcretli] = useState(true);
    const [izinBasSaat, setIzinBasSaat] = useState('08:00');
    const [izinBitSaat, setIzinBitSaat] = useState('09:00');
    const [izinAciklama, setIzinAciklama] = useState('');

    useEffect(() => {
        loadOptions();
        loadIzinTipleri();
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

    const loadIzinTipleri = async () => {
        try {
            const res = await GetWithToken('IzinTipleri/GetAll', { PageNumber: 0, PageSize: 500 });
            const list = res?.data?.data?.list || [];
            setIzinTipleri(list);
        } catch {
            setIzinTipleri([]);
        }
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
            console.error('Plan / Gerçekleşen raporu alınamadı', e);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = async () => {
        if (!reportData?.rows) return;
        const gunler = reportData.gunler || [];
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Plan-Gerçekleşen', {
            views: [{ state: 'frozen', ySplit: 3, activeCell: 'A4' }],
        });

        const titleRow = sheet.addRow([
            `Planlanan & Gerçekleşen - ${reportData.baslangicTarihi} / ${reportData.bitisTarihi} (${reportData.toplamKisi} Kişi)`,
        ]);
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
            const gunlerData = row.gunler || [];
            const rowData = [
                `${row.ad || ''} ${row.soyad || ''}`.trim(),
                ...gunlerData.map((g) => {
                    const plan = g?.plan || '-';
                    const gercek = g?.gercek || '-';
                    const fark = g?.fark || '-';
                    return `${plan}\n${gercek}\n${fark}`;
                }),
                `${row.toplamFazlaMesai || 0} Dak / ${row.fazlaMesaiGun || 0} Gün`,
                `${row.toplamEksikMesai || 0} Dak / ${row.eksikMesaiGun || 0} Gün`,
                `${row.sonuc || 0} Dak / ${row.sonucSaat || '00:00'} Saat`,
            ];

            const dataRow = sheet.addRow(rowData);
            dataRow.height = 30;

            dataRow.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
                cell.alignment = { vertical: 'top', wrapText: true };

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
            ...gunler.map(() => ({ width: 16 })),
            { width: 22 },
            { width: 22 },
            { width: 22 },
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plan-gerceklesen-${reportData.baslangicTarihi}-${reportData.bitisTarihi}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    /** Hücredeki "08:00-18:00" formatını [girisSaat, cikisSaat] olarak parse eder */
    const parsePlanGercekSaat = (str) => {
        if (!str || typeof str !== 'string') return { giris: '', cikis: '' };
        const parts = str.trim().split(/\s*-\s*/);
        if (parts.length >= 2) {
            const g = parts[0].trim();
            const c = parts[1].trim();
            if (/^\d{1,2}:\d{2}$/.test(g) && /^\d{1,2}:\d{2}$/.test(c)) return { giris: g, cikis: c };
            if (/^\d{1,2}:\d{2}$/.test(g)) return { giris: g, cikis: '' };
        }
        if (parts.length === 1 && /^\d{1,2}:\d{2}$/.test(parts[0].trim())) return { giris: parts[0].trim(), cikis: '' };
        return { giris: '', cikis: '' };
    };

    const openCellModal = async (row, gun) => {
        if (!gun?.raporId) return;
        setSelectedCell({
            raporId: gun.raporId,
            sicilId: row.sicilId,
            tarih: gun.tarih,
            plan: gun.plan,
            gercek: gun.gercek,
            fark: gun.fark,
        });
        const titlePerson = `${row.ad || ''} ${row.soyad || ''}`.trim();
        const titleDate = formatTarih(gun.tarih);
        setModalTitle(`${titlePerson} - ${titleDate}`);
        setActiveTab('kayit');
        setSaving(false);
        setTasnifDetail(null);

        const tarihStr = gun.tarih || ''; // yyyy-MM-dd
        const fromGercek = parsePlanGercekSaat(gun.gercek);
        const saatler = fromGercek.giris || fromGercek.cikis ? fromGercek : parsePlanGercekSaat(gun.plan);
        setEditGirisTarih(tarihStr);
        setEditGirisSaat(saatler.giris || '');
        setEditCikisTarih(tarihStr);
        setEditCikisSaat(saatler.cikis || '');

        try {
            const res = await GetWithToken('Tasnifleme/GetById', { id: gun.raporId });
            const data = res?.data?.data;
            setTasnifDetail(data || null);

            if (data?.giris) {
                const d = new Date(data.giris);
                setEditGirisTarih(d.toISOString().split('T')[0]);
                setEditGirisSaat(d.toTimeString().slice(0, 5));
            }

            if (data?.cikis) {
                const c = new Date(data.cikis);
                setEditCikisTarih(c.toISOString().split('T')[0]);
                setEditCikisSaat(c.toTimeString().slice(0, 5));
            }

            setGirisMazeret(data?.girisaciklama || '');
            setCikisMazeret(data?.cikisaciklama || '');
        } catch (e) {
            console.error('Tasnifleme detayı alınamadı', e);
        }

        setModalOpen(true);
    };

    const handleKayitDuzenleKaydet = async () => {
        if (!selectedCell?.raporId || !editGirisTarih || !editGirisSaat) return;
        setSaving(true);
        try {
            const girisIso = `${editGirisTarih}T${editGirisSaat}:00`;
            const payload = {
                Id: selectedCell.raporId,
                Giris: girisIso,
            };

            if (editCikisTarih && editCikisSaat) {
                payload.Cikis = `${editCikisTarih}T${editCikisSaat}:00`;
            }

            await PostWithToken('Tasnifleme/Update', payload);
            setModalOpen(false);
            await runReport();
        } catch (e) {
            console.error('Kayıt düzenlenemedi', e);
        } finally {
            setSaving(false);
        }
    };

    const handleGirisMazeretKaydet = async () => {
        if (!selectedCell?.raporId) return;
        setSaving(true);
        try {
            await PostWithToken('Tasnifleme/Update', {
                Id: selectedCell.raporId,
                Girisaciklama: girisMazeret,
            });
            setModalOpen(false);
            await runReport();
        } catch (e) {
            console.error('Giriş mazereti kaydedilemedi', e);
        } finally {
            setSaving(false);
        }
    };

    const handleCikisMazeretKaydet = async () => {
        if (!selectedCell?.raporId) return;
        setSaving(true);
        try {
            await PostWithToken('Tasnifleme/Update', {
                Id: selectedCell.raporId,
                Cikisaciklama: cikisMazeret,
            });
            setModalOpen(false);
            await runReport();
        } catch (e) {
            console.error('Çıkış mazereti kaydedilemedi', e);
        } finally {
            setSaving(false);
        }
    };

    const saatToDakika = (saatStr) => {
        if (!saatStr) return 0;
        const [h, m] = saatStr.split(':');
        const hh = parseInt(h || '0', 10);
        const mm = parseInt(m || '0', 10);
        return hh * 60 + mm;
    };

    const handleSaatlikIzinKaydet = async () => {
        if (!selectedCell?.sicilId || !selectedCell?.tarih || !izinTipId) return;
        setSaving(true);
        try {
            const tarih = selectedCell.tarih; // yyyy-MM-dd
            const basDakika = saatToDakika(izinBasSaat);
            const bitDakika = saatToDakika(izinBitSaat);
            if (bitDakika <= basDakika) {
                setSaving(false);
                return;
            }
            const sure = bitDakika - basDakika;

            const basDate = new Date(`${tarih}T00:00:00`);
            const bitDate = new Date(`${tarih}T00:00:00`);
            basDate.setMinutes(basDakika);
            bitDate.setMinutes(bitDakika);

            const payload = {
                SicilId: selectedCell.sicilId,
                TipId: izinTipId,
                Tarih: tarih,
                Saatlikizin: true,
                Aciklama: izinAciklama,
                Sure: sure,
                Baslangic: basDakika,
                Bitis: bitDakika,
                Ucretli: izinUcretli,
                SaatlikUcret: 0,
                MailSended: 0,
                BasTarih: basDate.toISOString(),
                BitTarih: bitDate.toISOString(),
            };

            await PostWithToken('Izinler/Create', payload);
            setModalOpen(false);
            await runReport();
        } catch (e) {
            console.error('Saatlik izin kaydedilemedi', e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <PageHeader
                title="Planlanan & Gerçekleşen"
                map={[
                    { url: 'personel-takibi', name: 'Personel Takibi' },
                    { url: 'personel-takibi/plan-gerceklesen', name: 'Planlanan & Gerçekleşen' },
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
                                    {''} Raporu Getir
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success ml-1"
                                    onClick={exportToExcel}
                                    disabled={!reportData?.rows?.length || loading || optionsLoading}
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
                                Planlanan &amp; Gerçekleşen: {reportData.baslangicTarihi} - {reportData.bitisTarihi}
                            </h5>
                            <span className="badge bg-primary">Kişi Sayısı: {reportData.toplamKisi}</span>
                        </div>
                        <div className="card-body p-0 col-12">
                            <div className="row">
                                <div className="col-12" style={{ overflow: 'auto', width: '1px' }}>
                                    <table className="table table-bordered table-sm mb-0  hovertd-table">
                                        <thead className="table-light">
                                            <tr>
                                                <th
                                                    style={{
                                                        minWidth: 140,
                                                        position: 'sticky',
                                                        left: 0,
                                                        backgroundColor: '#f8f9fa',
                                                        zIndex: 2,
                                                    }}
                                                >
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
                                                    <td
                                                        style={{
                                                            position: 'sticky',
                                                            left: 0,
                                                            backgroundColor: '#fff',
                                                            zIndex: 1,
                                                        }}
                                                    >
                                                        <strong>
                                                            {row.ad} {row.soyad}
                                                        </strong>
                                                    </td>
                                                    {row.gunler?.map((gun, idx) => {
                                                        const style =
                                                            gun.cssClass === 'is-girmedi'
                                                                ? { backgroundColor: '#90EE90' }
                                                                : gun.cssClass === 'gec'
                                                                ? { color: '#dc3545' }
                                                                : gun.cssClass === 'haftalik_izin'
                                                                ? { backgroundColor: '#e7f3ff' }
                                                                : gun.cssClass === 'izin'
                                                                ? { backgroundColor: '#fff3cd' }
                                                                : {};
                                                        return (
                                                            <td
                                                                key={`${row.sicilId}-${idx}`}
                                                                className={gun.cssClass}
                                                                style={{ cursor: gun.raporId ? 'pointer' : 'default', ...style }}
                                                                onClick={() => openCellModal(row, gun)}
                                                            >
                                                                <div>{gun.plan || '-'}</div>
                                                                <div>{gun.gercek || '-'}</div>
                                                                <div>{gun.fark || '-'}</div>
                                                            </td>
                                                        );
                                                    })}
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

                <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg">
                    <AppModalHeader toggle={() => setModalOpen(false)}>
                        {modalTitle || 'Plan / Gerçekleşen Kayıt İşlemleri'}
                    </AppModalHeader>
                    <ModalBody>
                        {selectedCell && (
                            <>
                                <div className="mb-3 small text-muted">
                                    <strong>Tarih:</strong> {formatTarih(selectedCell.tarih)}{' '}
                                    <strong className="ms-3">Plan:</strong> {selectedCell.plan || '-'}{' '}
                                    <strong className="ms-3">Gerçek:</strong> {selectedCell.gercek || '-'}{' '}
                                    <strong className="ms-3">Fark:</strong> {selectedCell.fark || '-'}
                                </div>

                                <div className={styles.wrapper}>
                                    <Nav tabs className={`nav-tabs ${styles.tabsNav}`}>
                                        <NavItem>
                                            <NavLink
                                                className={activeTab === 'kayit' ? 'active' : ''}
                                                onClick={() => setActiveTab('kayit')}
                                            >
                                                <i className="icon-pencil4" />
                                                <span>Kayıt / Giriş Düzeltme</span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                className={activeTab === 'giris' ? 'active' : ''}
                                                onClick={() => setActiveTab('giris')}
                                            >
                                                <i className="icon-enter" />
                                                <span>Giriş Mazereti</span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                className={activeTab === 'cikis' ? 'active' : ''}
                                                onClick={() => setActiveTab('cikis')}
                                            >
                                                <i className="icon-exit" />
                                                <span>Çıkış Mazereti</span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                className={activeTab === 'saatlik' ? 'active' : ''}
                                                onClick={() => setActiveTab('saatlik')}
                                            >
                                                <i className="icon-alarm" />
                                                <span>Saatlik İzin</span>
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                </div>

                                {activeTab === 'kayit' && (
                                    <div>
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-3">
                                                <label className="form-label">Giriş Tarihi</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={editGirisTarih}
                                                    onChange={(e) => setEditGirisTarih(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">Giriş Saati</label>
                                                <TimePicker
                                                    format="HH:mm"
                                                    value={editGirisSaat || null}
                                                    onChange={(v) => setEditGirisSaat(v || '')}
                                                    className="form-control react-time-picker-custom"
                                                    clockIcon={null}
                                                    clearIcon={null}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">Çıkış Tarihi</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={editCikisTarih}
                                                    onChange={(e) => setEditCikisTarih(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">Çıkış Saati</label>
                                                <TimePicker
                                                    format="HH:mm"
                                                    value={editCikisSaat || null}
                                                    onChange={(v) => setEditCikisSaat(v || '')}
                                                    className="form-control react-time-picker-custom"
                                                    clockIcon={null}
                                                    clearIcon={null}
                                                />
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setModalOpen(false)}
                                                disabled={saving}
                                            >
                                                Kapat
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleKayitDuzenleKaydet}
                                                disabled={saving}
                                            >
                                                {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                                                Kaydet
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'giris' && (
                                    <div>
                                        <div className="mb-3">
                                            <label className="form-label">Giriş Mazereti</label>
                                            <textarea
                                                className="form-control"
                                                rows={4}
                                                value={girisMazeret}
                                                onChange={(e) => setGirisMazeret(e.target.value)}
                                            />
                                        </div>
                                        <div className="d-flex justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setModalOpen(false)}
                                                disabled={saving}
                                            >
                                                Kapat
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleGirisMazeretKaydet}
                                                disabled={saving}
                                            >
                                                {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                                                Kaydet
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'cikis' && (
                                    <div>
                                        <div className="mb-3">
                                            <label className="form-label">Çıkış Mazereti</label>
                                            <textarea
                                                className="form-control"
                                                rows={4}
                                                value={cikisMazeret}
                                                onChange={(e) => setCikisMazeret(e.target.value)}
                                            />
                                        </div>
                                        <div className="d-flex justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setModalOpen(false)}
                                                disabled={saving}
                                            >
                                                Kapat
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleCikisMazeretKaydet}
                                                disabled={saving}
                                            >
                                                {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                                                Kaydet
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'saatlik' && (
                                    <div>
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-4">
                                                <label className="form-label">İzin Tipi</label>
                                                <ReactSelect
                                                    options={[
                                                        { value: 0, label: 'Seçiniz' },
                                                        ...izinTipleri.map((x) => ({
                                                            value: x.id,
                                                            label: x.aciklama || x.Aciklama || `İzin ${x.id}`,
                                                        })),
                                                    ]}
                                                    value={[
                                                        { value: 0, label: 'Seçiniz' },
                                                        ...izinTipleri.map((x) => ({
                                                            value: x.id,
                                                            label: x.aciklama || x.Aciklama || `İzin ${x.id}`,
                                                        })),
                                                    ].find((o) => o.value === izinTipId) ?? { value: 0, label: 'Seçiniz' }}
                                                    onChange={(opt) => setIzinTipId(opt?.value ?? 0)}
                                                    isClearable={false}
                                                    placeholder="İzin tipi seçin..."
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label">Başlangıç Saati</label>
                                                <TimePicker
                                                    format="HH:mm"
                                                    value={izinBasSaat || null}
                                                    onChange={(v) => setIzinBasSaat(v || '')}
                                                    className="form-control react-time-picker-custom"
                                                    clockIcon={null}
                                                    clearIcon={null}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label">Bitiş Saati</label>
                                                <TimePicker
                                                    format="HH:mm"
                                                    value={izinBitSaat || null}
                                                    onChange={(v) => setIzinBitSaat(v || '')}
                                                    className="form-control react-time-picker-custom"
                                                    clockIcon={null}
                                                    clearIcon={null}
                                                />
                                            </div>
                                            <div className="col-md-2 d-flex align-items-center">
                                                <div className="form-check mt-3">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="izinUcretli"
                                                        checked={izinUcretli}
                                                        onChange={(e) => setIzinUcretli(e.target.checked)}
                                                    />
                                                    <label className="form-check-label" htmlFor="izinUcretli">
                                                        Ücretli
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Açıklama</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                value={izinAciklama}
                                                onChange={(e) => setIzinAciklama(e.target.value)}
                                            />
                                        </div>
                                        <div className="d-flex justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setModalOpen(false)}
                                                disabled={saving}
                                            >
                                                Kapat
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleSaatlikIzinKaydet}
                                                disabled={saving}
                                            >
                                                {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                                                Kaydet
                                            </button>
                                        </div>
                                         
                                    </div>
                                  
                                )}
                            </>
                        )}
                    </ModalBody>
                </Modal>
            </div>
        </Layout>
    );
}

