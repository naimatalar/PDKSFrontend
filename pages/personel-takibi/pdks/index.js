import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import { GetWithToken, PostWithToken } from '../../api/crud';
import ExcelJS from 'exceljs';
import { toast } from 'react-toastify';
import DataTable from '../../../components/datatable';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import ReactSelect from 'react-select';
import MesaiTakvimModal from './MesaiTakvimModal';
import IzinTakvimModal from './IzinTakvimModal';
import CalismaKayitlariModal from './CalismaKayitlariModal';

const normTime = (v) => (v && v !== '00:00' ? v : '00:00');

export default function PdksIndex() {
    const router = useRouter();
    const [baslangic, setBaslangic] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [bitis, setBitis] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        d.setDate(0);
        return d.toISOString().split('T')[0];
    });
    const [islemTarihi, setIslemTarihi] = useState(() => new Date().toISOString().split('T')[0]);
    const [firmaId, setFirmaId] = useState(0);
    const [altFirmaId, setAltFirmaId] = useState(0);
    const [bolumId, setBolumId] = useState(0);
    const [pozisyonId, setPozisyonId] = useState(0);
    const [gorevId, setGorevId] = useState(0);
    const [yakaId, setYakaId] = useState(0);
    const [firmaList, setFirmaList] = useState([]);
    const [altFirmaList, setAltFirmaList] = useState([]);
    const [bolumList, setBolumList] = useState([]);
    const [pozisyonList, setPozisyonList] = useState([]);
    const [gorevList, setGorevList] = useState([]);
    const [yakaList, setYakaList] = useState([]);
    const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

    const [isimAra, setIsimAra] = useState('');
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const [selectedSicilIds, setSelectedSicilIds] = useState(new Set());
    const [actionLoading, setActionLoading] = useState(false);
    const [currentPageData, setCurrentPageData] = useState([]);
    const [kayitEkleModal, setKayitEkleModal] = useState(false);
    const [izinEkleModal, setIzinEkleModal] = useState(false);
    const [mesaiTakvimModalOpen, setMesaiTakvimModalOpen] = useState(false);
    const [mesaiTakvimSicilId, setMesaiTakvimSicilId] = useState(null);
    const [mesaiTakvimAdSoyad, setMesaiTakvimAdSoyad] = useState('');
    const [izinTakvimModalOpen, setIzinTakvimModalOpen] = useState(false);
    const [izinTakvimSicilId, setIzinTakvimSicilId] = useState(null);
    const [izinTakvimAdSoyad, setIzinTakvimAdSoyad] = useState('');
    const [calismaKayitlariModalOpen, setCalismaKayitlariModalOpen] = useState(false);
    const [calismaKayitlariSicilId, setCalismaKayitlariSicilId] = useState(null);
    const [calismaKayitlariAdSoyad, setCalismaKayitlariAdSoyad] = useState('');
    const [terminalList, setTerminalList] = useState([]);
    const [izinTipleri, setIzinTipleri] = useState([]);

    useEffect(() => {
        const loadOptions = async () => {
            setFilterOptionsLoading(true);
            const pagination = { PageNumber: 1, PageSize: 500 };
            const fetchOpt = (url) =>
                GetWithToken(url, pagination)
                    .then((r) => r.data?.data?.list ?? [])
                    .catch(() => []);
            try {
                const [termRes, izinRes, firma, altFirma, bolum, pozisyon, gorev, yaka] = await Promise.all([
                    GetWithToken('Terminaller/GetAll', pagination),
                    GetWithToken('IzinTipleri/GetAll', pagination),
                    fetchOpt('CboFirma/GetAll'),
                    fetchOpt('CboAltFirma/GetAll'),
                    fetchOpt('CboBolum/GetAll'),
                    fetchOpt('CboPozisyon/GetAll'),
                    fetchOpt('CboGorev/GetAll'),
                    fetchOpt('CboYaka/GetAll'),
                ]);
                setTerminalList(termRes?.data?.data?.list ?? []);
                setIzinTipleri(izinRes?.data?.data?.list ?? []);
                setFirmaList([{ value: 0, label: '- - - - - - - - - - -' }, ...firma.map((x) => ({ value: x.id, label: x.ad || x.Ad || '' }))]);
                setAltFirmaList([{ value: 0, label: '- - - - - - -' }, ...altFirma.map((x) => ({ value: x.id, label: x.ad || x.Ad || '' }))]);
                setBolumList([{ value: 0, label: '-----' }, ...bolum.map((x) => ({ value: x.id, label: x.ad || x.Ad || '' }))]);
                setPozisyonList([{ value: 0, label: '- - - - - - - - - - -' }, ...pozisyon.map((x) => ({ value: x.id, label: x.ad || x.Ad || '' }))]);
                setGorevList([{ value: 0, label: '- - - - - - -' }, ...gorev.map((x) => ({ value: x.id, label: x.ad || x.Ad || '' }))]);
                setYakaList([{ value: 0, label: '- - - - - - -' }, ...yaka.map((x) => ({ value: x.id, label: x.ad || x.Ad || '' }))]);
            } catch (e) {
                console.error('Options yüklenemedi', e);
            } finally {
                setFilterOptionsLoading(false);
            }
        };
        loadOptions();
    }, []);

    const dataUrl = useMemo(() => {
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
        if (isimAra?.trim()) params.set('adSoyadAra', isimAra.trim());
        return `ToplamSure/GetReport?${params}`;
    }, [baslangic, bitis, isimAra, firmaId, altFirmaId, bolumId, pozisyonId, gorevId, yakaId]);

    const handleAra = () => {
        setRefreshKey(Date.now());
    };

    const exportToExcel = async () => {
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
            if (isimAra?.trim()) params.set('adSoyadAra', isimAra.trim());
            const res = await GetWithToken(`ToplamSure/GetReport?${params}`);
            const reportData = res?.data?.data;
            const list = reportData?.list ?? [];
            if (!list.length) {
                toast.warning('Dışa aktarılacak kayıt yok.');
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('PDKS', { views: [{ state: 'frozen', ySplit: 2, activeCell: 'A2' }] });

            const titleRow = sheet.addRow([
                `PDKS Raporu - ${reportData.baslangicTarihi} / ${reportData.bitisTarihi} (${list.length} Kişi)`,
            ]);
            titleRow.font = { bold: true, size: 14 };
            titleRow.alignment = { horizontal: 'center' };
            sheet.mergeCells(1, 1, 1, 12);
            titleRow.height = 24;

            const colHeaders = [
                'Ad Soyad', 'Sicil No', 'Firma', 'Mesai Süresi', 'Normal Mesai', 'Fazla Mesai',
                'İzin Süre', 'Hakediş', 'Onaylı FM', 'Resmi Tatil', 'Eksik Mesai', 'Devamsızlık',
            ];
            const headerRow = sheet.addRow(colHeaders);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            headerRow.height = 22;
            headerRow.eachCell((cell) => {
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            });

            list.forEach((row) => {
                const em = normTime(row.eksikMesai);
                const izn = normTime(row.izinSure);
                const dataRow = sheet.addRow([
                    row.adSoyad ?? '', row.sicilNo ?? '', row.firmaAd ?? '', row.mesaiSuresi ?? '',
                    row.normalMesai ?? '', row.fazlaMesai ?? '', row.izinSure ?? '', row.hakedis ?? '',
                    row.oFazlaMesai ?? '', row.resmiTatil ?? '', row.eksikMesai ?? '', row.devamsizlik ?? '',
                ]);
                dataRow.eachCell((cell, colNumber) => {
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                    if (colNumber === 7 && izn !== '00:00') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
                        cell.font = { color: { argb: 'FF000000' } };
                    }
                    if (colNumber === 11 && em !== '00:00') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                        cell.font = { color: { argb: 'FFFFFFFF' } };
                    }
                });
            });

            sheet.columns = [
                { width: 22 }, { width: 12 }, { width: 18 }, { width: 14 }, { width: 14 }, { width: 14 },
                { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 14 }, { width: 14 },
            ];

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pdks-${reportData.baslangicTarihi}-${reportData.bitisTarihi}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Excel indirildi.');
        } catch (e) {
            console.error(e);
            toast.error('Excel oluşturulamadı.');
        }
    };

    const toggleSicil = (id) => {
        setSelectedSicilIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAllOnPage = () => {
        setSelectedSicilIds(new Set(currentPageData.map((x) => x.sicilId)));
    };

    const unselectAllSicil = () => {
        setSelectedSicilIds(new Set());
    };

    const unselectPageOnly = () => {
        const pageIds = new Set(currentPageData.map((x) => x.sicilId));
        setSelectedSicilIds((prev) => {
            const next = new Set(prev);
            pageIds.forEach((id) => next.delete(id));
            return next;
        });
    };

    const handleHizliHesapla = async () => {
        if (selectedSicilIds.size === 0) {
            toast.warning('Lütfen listeden kayıt seçiniz.');
            return;
        }
        setActionLoading(true);
        try {
            const res = await PostWithToken('TerminalKayit/TopluYenidenHesapla', {
                sicilIds: Array.from(selectedSicilIds),
                baslangicTarihi: baslangic,
                bitisTarihi: bitis,
            });
            const n = res?.data?.data ?? 0;
            toast.success(`Hızlı hesapla tamamlandı. ${typeof n === 'number' ? n : 0} tasnifleme kaydı oluşturuldu.`);
            setRefreshKey(Date.now());
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Hızlı hesapla işlemi başarısız.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleYenidenHesapla = async () => {
        if (selectedSicilIds.size === 0) {
            toast.warning('Lütfen listeden kayıt seçiniz.');
            return;
        }
        if (!window.confirm('Bu işlem uzun sürebilir. Devam etmek istediğinize emin misiniz? Onaylıyor musunuz?')) return;
        setActionLoading(true);
        try {
            let toplam = 0;
            for (const sicilId of selectedSicilIds) {
                const res = await PostWithToken('TerminalKayit/YenidenHesapla', {
                    sicilId,
                    baslangicTarihi: baslangic,
                    bitisTarihi: bitis,
                });
                const n = res?.data?.data ?? 0;
                toplam += typeof n === 'number' ? n : 0;
            }
            toast.success(`Yeniden hesapla tamamlandı. ${toplam} işlem yapıldı.`);
            setRefreshKey(Date.now());
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Yeniden hesapla işlemi başarısız.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCalismaKaydiSil = async () => {
        if (selectedSicilIds.size === 0) {
            toast.warning('Lütfen listeden kayıt seçiniz.');
            return;
        }
        if (!window.confirm('Seçili personellerin bu tarih aralığındaki tüm çalışma kayıtları silinecek. Emin misiniz?')) return;
        setActionLoading(true);
        try {
            const res = await PostWithToken('Tasnifleme/TopluSil', {
                sicilIds: Array.from(selectedSicilIds),
                baslangicTarihi: baslangic,
                bitisTarihi: bitis,
            });
            const n = res?.data?.data ?? 0;
            toast.success(`${typeof n === 'number' ? n : 0} çalışma kaydı silindi.`);
            setRefreshKey(Date.now());
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Çalışma kaydı silme işlemi başarısız.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleKayitEkle = () => {
        if (selectedSicilIds.size === 0) {
            toast.warning('Lütfen listeden kayıt seçiniz.');
            return;
        }
        setKayitEkleModal(true);
    };

    const handleIzinEkle = () => {
        if (selectedSicilIds.size === 0) {
            toast.warning('Lütfen listeden kayıt seçiniz.');
            return;
        }
        setIzinEkleModal(true);
    };

    const handleMesaiTakvim = (sicilId, adSoyad) => {
        setMesaiTakvimSicilId(sicilId);
        setMesaiTakvimAdSoyad(adSoyad ?? '');
        setMesaiTakvimModalOpen(true);
    };

    const handleIzinTakvim = (sicilId, adSoyad) => {
        setIzinTakvimSicilId(sicilId);
        setIzinTakvimAdSoyad(adSoyad ?? '');
        setIzinTakvimModalOpen(true);
    };

    const handleCalismaKayitlari = (sicilId, adSoyad) => {
        setCalismaKayitlariSicilId(sicilId);
        setCalismaKayitlariAdSoyad(adSoyad ?? '');
        setCalismaKayitlariModalOpen(true);
    };

    const handleYenidenHesaplaRow = async (sicilId) => {
        if (!window.confirm('Bu işlem uzun sürebilir. Devam etmek istediğinize emin misiniz? Onaylıyor musunuz?')) return;
        setActionLoading(true);
        try {
            const res = await PostWithToken('TerminalKayit/YenidenHesapla', {
                sicilId,
                baslangicTarihi: baslangic,
                bitisTarihi: bitis,
            });
            const n = res?.data?.data ?? 0;
            toast.success(`Yeniden hesapla tamamlandı. ${typeof n === 'number' ? n : 0} işlem yapıldı.`);
            setRefreshKey(Date.now());
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Yeniden hesapla işlemi başarısız.');
        } finally {
            setActionLoading(false);
        }
    };

    const pdksHeaders = useMemo(() => [
        {
            header: '\u00A0',
            dynamicButton: (item) => (
                <input
                    type="checkbox"
                    checked={selectedSicilIds.has(item.sicilId)}
                    onChange={() => toggleSicil(item.sicilId)}
                />
            ),
        },
        { header: 'Ad Soyad', dynamicButton: (item) => <strong>{item.adSoyad ?? '-'}</strong> },
        ['sicilNo', 'Sicil No'],
        ['firmaAd', 'Firma'],
        ['mesaiSuresi', 'Mesai'],
        ['normalMesai', 'Normal'],
        ['fazlaMesai', 'FM'],
        {
            header: 'İzin Süre',
            dynamicButton: (item) => {
                const izn = normTime(item.izinSure);
                return (
                    <span
                        style={izn !== '00:00' ? { backgroundColor: '#90EE90', color: '#000', padding: '2px 6px', display: 'inline-block' } : {}}
                    >
                        {item.izinSure ?? '-'}
                    </span>
                );
            },
        },
        ['hakedis', 'Hakediş'],
        ['oFazlaMesai', 'OFM'],
        ['resmiTatil', 'Res.Tatil'],
        {
            header: 'Eksik Mesai',
            dynamicButton: (item) => {
                const em = normTime(item.eksikMesai);
                return (
                    <span
                        style={em !== '00:00' ? { backgroundColor: '#FF0000', color: '#FFF', padding: '2px 6px', display: 'inline-block' } : {}}
                    >
                        {item.eksikMesai ?? '-'}
                    </span>
                );
            },
        },
        ['devamsizlik', 'Devam'],
        {
            header: 'İşlem',
            dynamicButton: (item) => (
                <div className="d-flex gap-1 flex-wrap justify-content-center">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleMesaiTakvim(item.sicilId, item.adSoyad)}
                        title="Mesai Takvimi Görüntüle"
                    >
                        <i className="fa fa-eye" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleIzinTakvim(item.sicilId, item.adSoyad)}
                        title="İzin Takvimi Görüntüle"
                    >
                        <i className="fa fa-eye" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleCalismaKayitlari(item.sicilId, item.adSoyad)}
                        title="Çalışma Kayıtlarını Gör"
                    >
                        <i className="fa fa-building" />
                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => handleYenidenHesaplaRow(item.sicilId)}
                                        title="Yeniden Hesapla"
                                        disabled={actionLoading}
                                    >
                                        <i className="icon-loop" />
                                    </button>
                </div>
            ),
        },
    ], [selectedSicilIds, router, baslangic, bitis]);

    return (
        <Layout>
            {actionLoading && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                    }}
                >
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden"></span>
                        </div>
                        <p className="mt-2 text-muted">İşlem yapılıyor, lütfen bekleyin...</p>
                    </div>
                </div>
            )}
            <PageHeader
                title="PDKS"
                map={[
                    { url: 'personel-takibi', name: 'Personel Takibi' },
                    { url: 'personel-takibi/pdks', name: 'PDKS' },
                ]}
            />
            <div className="content p-4 ">
                <div className="card">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-12 col-md-4 col-lg-2">
                                <label className="form-label">Firma</label>
                                <ReactSelect
                                    classNamePrefix="react-select"
                                    isClearable
                                    placeholder="- - - - - - -"
                                    options={firmaList}
                                    value={firmaList.find((x) => x.value === firmaId) || { value: 0, label: '- - - - - - - - - - -' }}
                                    onChange={(o) => setFirmaId(o?.value ?? 0)}
                                    isDisabled={filterOptionsLoading}
                                />
                            </div>
                            <div className="col-12 col-md-4 col-lg-2">
                                <label className="form-label">Alt Firma</label>
                                <ReactSelect
                                    classNamePrefix="react-select"
                                    isClearable
                                    placeholder="- - - - - - -"
                                    options={altFirmaList}
                                    value={altFirmaList.find((x) => x.value === altFirmaId) || { value: 0, label: '- - - - - - -' }}
                                    onChange={(o) => setAltFirmaId(o?.value ?? 0)}
                                    isDisabled={filterOptionsLoading}
                                />
                            </div>
                            <div className="col-12 col-md-4 col-lg-2">
                                <label className="form-label">Bölüm</label>
                                <ReactSelect
                                    classNamePrefix="react-select"
                                    isClearable
                                    placeholder="-----"
                                    options={bolumList}
                                    value={bolumList.find((x) => x.value === bolumId) || { value: 0, label: '-----' }}
                                    onChange={(o) => setBolumId(o?.value ?? 0)}
                                    isDisabled={filterOptionsLoading}
                                />
                            </div>
                            <div className="col-12 col-md-4 col-lg-2">
                                <label className="form-label">Pozisyon</label>
                                <ReactSelect
                                    classNamePrefix="react-select"
                                    isClearable
                                    placeholder="- - - - - - -"
                                    options={pozisyonList}
                                    value={pozisyonList.find((x) => x.value === pozisyonId) || { value: 0, label: '- - - - - - - - - - -' }}
                                    onChange={(o) => setPozisyonId(o?.value ?? 0)}
                                    isDisabled={filterOptionsLoading}
                                />
                            </div>
                            <div className="col-12 col-md-4 col-lg-2">
                                <label className="form-label">Görev</label>
                                <ReactSelect
                                    classNamePrefix="react-select"
                                    isClearable
                                    placeholder="- - - - - - -"
                                    options={gorevList}
                                    value={gorevList.find((x) => x.value === gorevId) || { value: 0, label: '- - - - - - -' }}
                                    onChange={(o) => setGorevId(o?.value ?? 0)}
                                    isDisabled={filterOptionsLoading}
                                />
                            </div>
                            <div className="col-12 col-md-4 col-lg-2">
                                <label className="form-label">Yaka</label>
                                <ReactSelect
                                    classNamePrefix="react-select"
                                    isClearable
                                    placeholder="- - - - - - -"
                                    options={yakaList}
                                    value={yakaList.find((x) => x.value === yakaId) || { value: 0, label: '- - - - - - -' }}
                                    onChange={(o) => setYakaId(o?.value ?? 0)}
                                    isDisabled={filterOptionsLoading}
                                />
                            </div>
                            <div className="col-12 col-md-4 col-lg-2">
                                <label className="form-label">İşlem Tarihi</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={islemTarihi}
                                    onChange={(e) => setIslemTarihi(e.target.value)}
                                    placeholder="İşlem Tarihi"
                                />
                            </div>
                            <div className="col-12 col-md-4 col-lg-2">
                                <label className="form-label">Başlangıç Tarihi</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={baslangic}
                                    onChange={(e) => setBaslangic(e.target.value)}
                                    placeholder="Başlangıç Tarihi"
                                />
                            </div>
                            <div className="col-12 col-md-4 col-lg-2">
                                <label className="form-label">Bitiş Tarihi</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={bitis}
                                    onChange={(e) => setBitis(e.target.value)}
                                    placeholder="Bitiş Tarihi"
                                />
                            </div>
                            <div className="col-12 col-md-4 col-lg-2">
                                <label className="form-label">İsim ile ara</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ad veya soyad yazın..."
                                    value={isimAra}
                                    onChange={(e) => setIsimAra(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAra()}
                                />
                            </div>
                            <div className="col-12 col-md-4 col-lg-2 d-flex align-items-end gap-2">
                                <button type="button" className="btn btn-primary" onClick={handleAra}>
                                    <i className="icon-search4 me-1" />
                                    Ara
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={exportToExcel}
                                    title="Excel olarak indir (tüm kayıtlar)"
                                >
                                    <i className="icon-file-excel me-1" />
                                    Excel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card mt-3">
                    <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                        {/* <h5 className="mb-0">PDKS: {baslangic} - {bitis}</h5> */}
                        <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap" style={{ flex: 1, minWidth: 0 }}>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span className="badge bg-secondary">Seçili: {selectedSicilIds.size}</span>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={selectAllOnPage}
                                    disabled={!currentPageData.length}
                                    title="Tümünü Seç"
                                >
                                    Tümünü Seç
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={unselectAllSicil}
                                    disabled={selectedSicilIds.size === 0}
                                >
                                    Tüm Seçimleri Kaldır
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={selectAllOnPage}
                                    disabled={!currentPageData.length}
                                >
                                    Tüm Sayfayı Seç
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={unselectPageOnly}
                                    disabled={selectedSicilIds.size === 0}
                                >
                                    Sayfadaki Seçimleri Kaldır
                                </button>
                            </div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className="btn btn-outline-warning btn-sm"
                                    onClick={handleHizliHesapla}
                                    disabled={actionLoading || selectedSicilIds.size === 0}
                                >
                                    <i className="fa fa-spinner me-1" />
                                    Hızlı Hesapla
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-info btn-sm"
                                    onClick={handleYenidenHesapla}
                                    disabled={actionLoading || selectedSicilIds.size === 0}
                                >
                                    <i className="fa fa-adjust me-1" />
                                    Yeniden Hesapla
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={handleCalismaKaydiSil}
                                    disabled={actionLoading || selectedSicilIds.size === 0}
                                >
                                    <i className="fa fa-adjust me-1" />
                                    Çalışma Kaydı Sil
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm"
                                    onClick={handleKayitEkle}
                                    disabled={actionLoading || selectedSicilIds.size === 0}
                                >
                                    <i className="fa fa-save me-1" />
                                    Kayıt Ekle
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm"
                                    onClick={handleIzinEkle}
                                    disabled={actionLoading || selectedSicilIds.size === 0}
                                >
                                    <i className="fa fa-save me-1" />
                                    İzin Ekle
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <DataTable
                            Refresh={refreshKey}
                            DataUrl={dataUrl}
                            Pagination={{ pageNumber: 1, pageSize: 20 }}
                            UseGetPagination
                            Headers={pdksHeaders}
                            HideButtons
                            NoDataPlaceholder="Kayıt bulunamadı."
                            GetAllData={(list) => setCurrentPageData(list || [])}
                        />
                    </div>
                </div>

                <Modal isOpen={kayitEkleModal} toggle={() => setKayitEkleModal(false)} size="lg">
                    <ModalHeader toggle={() => setKayitEkleModal(false)}>Kayıt Ekle</ModalHeader>
                    <ModalBody>
                        <Formik
                            initialValues={{
                                girisTarihi: islemTarihi,
                                girisSaati: '08:00',
                                cikisTarihi: islemTarihi,
                                cikisSaati: '18:00',
                                girisCihaz: null,
                                cikisCihaz: null,
                            }}
                            onSubmit={async (values) => {
                                setActionLoading(true);
                                try {
                                    const res = await PostWithToken('Tasnifleme/ManuelEkle', {
                                        sicilIds: Array.from(selectedSicilIds),
                                        girisTarihi: values.girisTarihi,
                                        girisSaati: values.girisSaati,
                                        cikisTarihi: values.cikisTarihi,
                                        cikisSaati: values.cikisSaati,
                                        girisTerminalId: values.girisCihaz || null,
                                        cikisTerminalId: values.cikisCihaz || null,
                                    });
                                    const n = res?.data?.data ?? 0;
                                    toast.success(`${typeof n === 'number' ? n : 0} kayıt oluşturuldu.`);
                                    setKayitEkleModal(false);
                                    setRefreshKey(Date.now());
                                } catch (e) {
                                    toast.error(e?.response?.data?.message ?? 'Kayıt ekleme başarısız.');
                                } finally {
                                    setActionLoading(false);
                                }
                            }}
                            enableReinitialize
                        >
                            {({ values, setFieldValue }) => (
                                <Form>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Giriş Tarihi</label>
                                            <Field name="girisTarihi" type="date" className="form-control" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Giriş Saati</label>
                                            <Field name="girisSaati" type="time" className="form-control" />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Giriş Cihazı</label>
                                            <ReactSelect
                                                options={terminalList.map((t) => ({ value: t.id, label: (t.name || t.Name || t.ad) || `Terminal ${t.id}` }))}
                                                value={values.girisCihaz ? { value: values.girisCihaz, label: (terminalList.find((t) => t.id === values.girisCihaz)?.name || terminalList.find((t) => t.id === values.girisCihaz)?.Name || terminalList.find((t) => t.id === values.girisCihaz)?.ad) || `Terminal ${values.girisCihaz}` } : null}
                                                onChange={(opt) => setFieldValue('girisCihaz', opt?.value)}
                                                placeholder="Seçiniz..."
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Çıkış Tarihi</label>
                                            <Field name="cikisTarihi" type="date" className="form-control" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Çıkış Saati</label>
                                            <Field name="cikisSaati" type="time" className="form-control" />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Çıkış Cihazı</label>
                                            <ReactSelect
                                                options={terminalList.map((t) => ({ value: t.id, label: (t.name || t.Name || t.ad) || `Terminal ${t.id}` }))}
                                                value={values.cikisCihaz ? { value: values.cikisCihaz, label: (terminalList.find((t) => t.id === values.cikisCihaz)?.name || terminalList.find((t) => t.id === values.cikisCihaz)?.Name || terminalList.find((t) => t.id === values.cikisCihaz)?.ad) || `Terminal ${values.cikisCihaz}` } : null}
                                                onChange={(opt) => setFieldValue('cikisCihaz', opt?.value)}
                                                placeholder="Seçiniz..."
                                            />
                                        </div>
                                        <div className="col-12">
                                            <button type="submit" className="btn btn-primary">
                                                <i className="fa fa-floppy-o me-1" />
                                                Kaydet
                                            </button>
                                            <button type="button" className="btn btn-secondary ms-2" onClick={() => setKayitEkleModal(false)}>
                                                İptal
                                            </button>
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </ModalBody>
                </Modal>

                <Modal isOpen={izinEkleModal} toggle={() => setIzinEkleModal(false)} size="lg">
                    <ModalHeader toggle={() => setIzinEkleModal(false)}>İzin Ekle</ModalHeader>
                    <ModalBody>
                        <Formik
                            initialValues={{
                                izinTarihi: islemTarihi,
                                baslangicSaati: '08:00',
                                bitisSaati: '18:00',
                                izinTipId: 0,
                                aciklama: '',
                            }}
                            onSubmit={async (values) => {
                                if (!values.izinTipId) {
                                    toast.warning('İzin tipi seçiniz.');
                                    return;
                                }
                                setActionLoading(true);
                                try {
                                    const res = await PostWithToken('Izinler/TopluEkle', {
                                        sicilIds: Array.from(selectedSicilIds),
                                        izinTarihi: values.izinTarihi,
                                        baslangicSaati: values.baslangicSaati,
                                        bitisSaati: values.bitisSaati,
                                        tipId: values.izinTipId,
                                        aciklama: values.aciklama || '',
                                    });
                                    const n = res?.data?.data ?? 0;
                                    toast.success(`${typeof n === 'number' ? n : 0} izin kaydı oluşturuldu.`);
                                    setIzinEkleModal(false);
                                    setRefreshKey(Date.now());
                                } catch (e) {
                                    toast.error(e?.response?.data?.message ?? 'İzin ekleme başarısız.');
                                } finally {
                                    setActionLoading(false);
                                }
                            }}
                            enableReinitialize
                        >
                            {({ values, setFieldValue }) => (
                                <Form>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label">İzin Tarihi</label>
                                            <Field name="izinTarihi" type="date" className="form-control" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Başlangıç Saati</label>
                                            <Field name="baslangicSaati" type="time" className="form-control" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Bitiş Saati</label>
                                            <Field name="bitisSaati" type="time" className="form-control" />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">İzin Tipi</label>
                                            <select
                                                name="izinTipId"
                                                className="form-select"
                                                value={values.izinTipId}
                                                onChange={(e) => setFieldValue('izinTipId', parseInt(e.target.value, 10))}
                                            >
                                                <option value={0}>Lütfen Seçiniz...</option>
                                                {izinTipleri.map((iz) => (
                                                    <option key={iz.id} value={iz.id}>
                                                        {iz.aciklama || iz.Ad || iz.ad || `İzin ${iz.id}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Açıklama</label>
                                            <Field name="aciklama" type="text" className="form-control" placeholder="Açıklama" maxLength={100} />
                                        </div>
                                        <div className="col-12">
                                            <button type="submit" className="btn btn-primary">
                                                <i className="fa fa-plus me-1" />
                                                Ekle
                                            </button>
                                            <button type="button" className="btn btn-secondary ms-2" onClick={() => setIzinEkleModal(false)}>
                                                İptal
                                            </button>
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </ModalBody>
                </Modal>

                <MesaiTakvimModal
                    isOpen={mesaiTakvimModalOpen}
                    toggle={() => setMesaiTakvimModalOpen(false)}
                    sicilId={mesaiTakvimSicilId}
                    adSoyad={mesaiTakvimAdSoyad}
                />
                <IzinTakvimModal
                    isOpen={izinTakvimModalOpen}
                    toggle={() => setIzinTakvimModalOpen(false)}
                    sicilId={izinTakvimSicilId}
                    adSoyad={izinTakvimAdSoyad}
                />
                <CalismaKayitlariModal
                    isOpen={calismaKayitlariModalOpen}
                    toggle={() => setCalismaKayitlariModalOpen(false)}
                    sicilId={calismaKayitlariSicilId}
                    adSoyad={calismaKayitlariAdSoyad}
                    baslangic={baslangic}
                    bitis={bitis}
                />
            </div>
        </Layout>
    );
}
