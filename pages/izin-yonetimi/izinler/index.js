import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import { GetWithToken, PostWithToken } from '../../api/crud';
import { toast } from 'react-toastify';
import ReactSelect from 'react-select';
import DataTable from '../../../components/datatable';
import IzinTakvimModal from '../../personel-takibi/pdks/IzinTakvimModal';

export default function IzinlerPage() {
    const currentYear = new Date().getFullYear();
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
    const [izinTipId, setIzinTipId] = useState('');
    const [yil, setYil] = useState(currentYear);
    const [izinTipleri, setIzinTipleri] = useState([]);
    const [selectedSicilIds, setSelectedSicilIds] = useState(new Set());
    const [currentPageData, setCurrentPageData] = useState([]);
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const [actionLoading, setActionLoading] = useState(false);
    const [izinTakvimOpen, setIzinTakvimOpen] = useState(false);
    const [izinTakvimSicilId, setIzinTakvimSicilId] = useState(null);
    const [izinTakvimAdSoyad, setIzinTakvimAdSoyad] = useState('');
    const izinEkleSubmittingRef = useRef(false);

    const dataUrl = 'Sicil/GetAll?SonDurum=true';

    useEffect(() => {
        GetWithToken('IzinTipleri/GetAll', { PageNumber: 1, PageSize: 500 })
            .then((res) => {
                const list = res?.data?.data?.list ?? res?.data?.list ?? [];
                setIzinTipleri(Array.isArray(list) ? list : []);
            })
            .catch(() => setIzinTipleri([]));
    }, []);

    const toggleSicil = useCallback((id) => {
        setSelectedSicilIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const getSicilId = useCallback((x) => x?.id ?? x?.Id, []);

    const selectAllOnPage = useCallback(() => {
        setSelectedSicilIds(new Set(currentPageData.map(getSicilId).filter(Boolean)));
    }, [currentPageData, getSicilId]);

    const unselectAll = useCallback(() => {
        setSelectedSicilIds(new Set());
    }, []);

    const unselectPageOnly = useCallback(() => {
        const pageIds = new Set(currentPageData.map(getSicilId).filter(Boolean));
        setSelectedSicilIds((prev) => {
            const next = new Set(prev);
            pageIds.forEach((id) => next.delete(id));
            return next;
        });
    }, [currentPageData, getSicilId]);

    const selectAll = useCallback(async () => {
        setActionLoading(true);
        try {
            const res = await GetWithToken('Sicil/GetAll', { PageNumber: 1, PageSize: 5000, SonDurum: 'true' });
            const list = res?.data?.data?.list ?? res?.data?.list ?? [];
            const ids = (Array.isArray(list) ? list : []).map((x) => x?.id ?? x?.Id).filter(Boolean);
            setSelectedSicilIds(new Set(ids));
            toast.success(`${ids.length} personel seçildi.`);
        } catch (e) {
            toast.error('Tüm personeller yüklenemedi.');
        } finally {
            setActionLoading(false);
        }
    }, []);

    const handleIzinEkle = useCallback(async () => {
        if (izinEkleSubmittingRef.current) return;
        if (selectedSicilIds.size === 0) {
            toast.warning('Lütfen personel seçiniz.');
            return;
        }
        const tipId = parseInt(izinTipId, 10);
        if (!tipId) {
            toast.warning('Lütfen izin tipi seçiniz.');
            return;
        }
        if (!baslangic || !bitis) {
            toast.warning('Başlangıç ve bitiş tarihi giriniz.');
            return;
        }
        const bas = new Date(baslangic);
        const bit = new Date(bitis);
        if (bit < bas) {
            toast.warning('Başlangıç tarihi bitiş tarihinden büyük olamaz.');
            return;
        }
        const dates = [];
        for (let d = new Date(bas); d <= bit; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
        }
        izinEkleSubmittingRef.current = true;
        setActionLoading(true);
        let ok = 0;
        try {
            for (const tarihStr of dates) {
                const res = await PostWithToken('Izinler/TopluEkle', {
                    sicilIds: Array.from(selectedSicilIds),
                    izinTarihi: tarihStr,
                    baslangicSaati: '08:00',
                    bitisSaati: '18:00',
                    tipId,
                    aciklama: '',
                });
                const n = res?.data?.data ?? 0;
                ok += typeof n === 'number' ? n : 0;
            }
            toast.success(`İzin eklendi. Toplam ${ok} kayıt.`);
            setRefreshKey(Date.now());
        } catch (e) {
            toast.error(e?.response?.data?.message ?? 'İzin eklenemedi.');
        } finally {
            setActionLoading(false);
            izinEkleSubmittingRef.current = false;
        }
    }, [selectedSicilIds, izinTipId, baslangic, bitis]);

    const handleSicilGoruntule = useCallback((sicilId, adSoyad) => {
        setIzinTakvimSicilId(sicilId);
        setIzinTakvimAdSoyad(adSoyad ?? '');
        setIzinTakvimOpen(true);
    }, []);

    const izinTipOptions = useMemo(
        () => [
            { value: '', label: 'Lütfen Seçiniz..' },
            ...izinTipleri.map((iz) => ({
                value: iz.id,
                label: iz.aciklama || iz.Ad || iz.ad || `İzin ${iz.id}`,
            })),
        ],
        [izinTipleri]
    );

    const yearOptions = useMemo(() => {
        const arr = [];
        for (let y = currentYear - 5; y <= currentYear + 2; y++) arr.push({ value: y, label: String(y) });
        return arr;
    }, [currentYear]);

    const pdksHeaders = useMemo(
        () => [
            {
                header: '\u00A0',
                dynamicButton: (item) => {
                    const sid = item?.id ?? item?.Id;
                    return (
                        <input
                            type="checkbox"
                            checked={sid && selectedSicilIds.has(sid)}
                            onChange={() => sid && toggleSicil(sid)}
                        />
                    );
                },
            },
            ['ad', 'Ad'],
            ['soyad', 'Soyad'],
            ['sicilNo', 'Sicil No'],
            ['firmaAd', 'Firma Adı'],
            ['altFirmaAd', 'Alt Firma'],
            ['bolumAd', 'Bölümü'],
            ['pozisyonAd', 'Pozisyon'],
            ['yakaAd', 'Yaka'],
            {
                header: 'GRN',
                dynamicButton: (item) => {
                    const sid = item?.id ?? item?.Id;
                    return (
                        <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleSicilGoruntule(sid, [item?.ad ?? item?.Ad, item?.soyad ?? item?.Soyad].filter(Boolean).join(' '))}
                            title="Sicil Görüntüle"
                        >
                            <i className="fa fa-eye" />
                        </button>
                    );
                },
            },
        ],
        [selectedSicilIds, toggleSicil, handleSicilGoruntule]
    );

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
                            <span className="visually-hidden" />
                        </div>
                        <p className="mt-2 text-muted">İşlem yapılıyor, lütfen bekleyin...</p>
                    </div>
                </div>
            )}
            <PageHeader
                title="İzin Yönetimi"
                map={[
                    { url: 'izin-yonetimi', name: 'İzin Yönetimi' },
                    { url: 'izin-yonetimi/izinler', name: 'Personel Listesi' },
                ]}
            />
            <div className="content p-4">
                <div className="card">
                    <header className="card-header">
                        <span className="widget-icon">
                            <i className="fa fa-edit" />
                        </span>
                        <h2 className="mb-0">Personel Listesi</h2>
                    </header>
                    <div className="card-body">
                        <div className="row g-3 mb-4">
                            <div className="col-md-3">
                                <label className="form-label">Başlangıç Tarihi</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={baslangic}
                                    onChange={(e) => setBaslangic(e.target.value)}
                                    placeholder="Başlangıç Tarihi"
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Bitiş Tarihi</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={bitis}
                                    onChange={(e) => setBitis(e.target.value)}
                                    placeholder="Bitiş Tarihi"
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">İzin Tipi</label>
                                <ReactSelect
                                    classNamePrefix="react-select"
                                    options={izinTipOptions}
                                    value={izinTipOptions.find((x) => x.value === izinTipId || x.value === Number(izinTipId)) ?? izinTipOptions[0]}
                                    onChange={(o) => setIzinTipId(o?.value ?? '')}
                                    isClearable
                                    placeholder="Lütfen Seçiniz.."
                                />
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    onClick={handleIzinEkle}
                                    disabled={actionLoading}
                                >
                                    <i className="fa fa-floppy-o me-1" />
                                    İzin Ekle
                                </button>
                            </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 mb-3">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={selectAll}
                                disabled={actionLoading}
                            >
                                Tümünü Seç
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={unselectAll}
                                disabled={actionLoading}
                            >
                                Tüm Seçimleri Kaldır
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={selectAllOnPage}
                                disabled={actionLoading}
                            >
                                Tüm Sayfayı Seç
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={unselectPageOnly}
                                disabled={actionLoading}
                            >
                                Sayfadaki Seçimleri Kaldır
                            </button>
                            <div className="ms-auto d-flex align-items-center gap-2">
                                <label className="mb-0 small">Yıl:</label>
                                <ReactSelect
                                    classNamePrefix="react-select"
                                    options={yearOptions}
                                    value={yearOptions.find((x) => x.value === yil) ?? yearOptions.find((x) => x.value === currentYear)}
                                    onChange={(o) => setYil(o?.value ?? currentYear)}
                                    styles={{ control: (base) => ({ ...base, minWidth: 90 }) }}
                                />
                            </div>
                        </div>

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

                <IzinTakvimModal
                    isOpen={izinTakvimOpen}
                    toggle={() => setIzinTakvimOpen(false)}
                    sicilId={izinTakvimSicilId}
                    adSoyad={izinTakvimAdSoyad}
                    initialYil={yil}
                />
            </div>
        </Layout>
    );
}
