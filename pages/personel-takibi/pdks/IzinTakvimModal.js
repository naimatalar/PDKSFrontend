import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { GetWithToken, PostWithToken } from '../../api/crud';
import { toast } from 'react-toastify';
import { Formik, Form, Field } from 'formik';
import ReactSelect from 'react-select';

const buildMonthGrid = (year, month) => {
    const firstOfMonth = new Date(year, month - 1, 1);
    let start = new Date(firstOfMonth);
    const day = start.getDay();
    if (day !== 1) {
        let daysToSubtract = day === 0 ? -6 : 1 - day;
        start.setDate(start.getDate() + daysToSubtract);
    }
    const dates = [];
    for (let i = 0; i < 37; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        dates.push(d);
    }
    return dates;
};

const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const WEEKDAY_NAMES = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PZR', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PZR', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PZR', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PZR', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PZR', 'PZT', 'SAL'];

const toKey = (gun, ay, yil) => `${gun}.${ay}.${yil}`;
const fromKey = (key) => {
    const [g, a, y] = key.split('.').map(Number);
    return { gun: g, ay: a, yil: y };
};

const minsFromMidnight = (hhmm) => {
    if (!hhmm) return 0;
    const [h, m] = String(hhmm).split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
};

export default function IzinTakvimModal({ isOpen, toggle, sicilId, adSoyad, initialYil }) {
    const currentYear = new Date().getFullYear();
    const [yil, setYil] = useState(initialYil ?? currentYear);
    useEffect(() => {
        if (isOpen && initialYil != null) setYil(initialYil);
    }, [isOpen, initialYil]);
    const [izinList, setIzinList] = useState([]);
    const [izinTipleri, setIzinTipleri] = useState([]);
    const [tatilTipleri, setTatilTipleri] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState(new Set());
    const [lastClicked, setLastClicked] = useState(null);
    const [izinDetaylari, setIzinDetaylari] = useState([]);
    const [kidemYil, setKidemYil] = useState('-');
    const [izinKredisi, setIzinKredisi] = useState('-');

    const izinMap = useMemo(() => {
        const m = {};
        izinList.forEach((iz) => {
            const d = iz.tarih ? new Date(iz.tarih) : null;
            if (d && !Number.isNaN(d.getTime())) {
                const key = d.toISOString().split('T')[0];
                if (!m[key]) m[key] = [];
                m[key].push(iz);
            }
        });
        return m;
    }, [izinList]);

    useEffect(() => {
        if (!isOpen) return;
        const load = async () => {
            try {
                const [izinRes, tatilRes] = await Promise.all([
                    GetWithToken('IzinTipleri/GetAll', { PageNumber: 1, PageSize: 500 }),
                    GetWithToken('TatilTipleri/GetAll', { PageNumber: 1, PageSize: 500 }),
                ]);
                setIzinTipleri(izinRes?.data?.data?.list ?? []);
                setTatilTipleri(tatilRes?.data?.data?.list ?? []);
            } catch (e) {
                console.error('Options yüklenemedi', e);
            }
        };
        load();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !sicilId || !yil) return;
        setLoading(true);
        const baslangic = `${yil}-01-01`;
        const bitis = `${yil}-12-31`;
        GetWithToken('Izinler/GetBySicilAndDateRange', { sicilId, baslangic, bitis })
            .then((res) => {
                const list = res?.data?.data ?? res?.data ?? [];
                setIzinList(Array.isArray(list) ? list : []);
            })
            .catch((e) => {
                console.error('İzin listesi yüklenemedi', e);
                setIzinList([]);
            })
            .finally(() => setLoading(false));
    }, [isOpen, sicilId, yil]);

    const refreshTakvim = useCallback(async () => {
        if (!sicilId || !yil) return;
        try {
            const res = await GetWithToken('Izinler/GetBySicilAndDateRange', {
                sicilId,
                baslangic: `${yil}-01-01`,
                bitis: `${yil}-12-31`,
            });
            const list = res?.data?.data ?? res?.data ?? [];
            setIzinList(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error('İzin listesi yenilenemedi', e);
        }
    }, [sicilId, yil]);

    const years = useMemo(() => {
        const arr = [];
        for (let y = currentYear - 2; y <= currentYear + 2; y++) arr.push(y);
        return arr;
    }, [currentYear]);

    const handleCellClick = useCallback(
        (e, { gun, ay, yil: dateYil }, isInMonth) => {
            if (!isInMonth) return;
            const key = toKey(gun, ay, dateYil);

            if (e.ctrlKey || e.metaKey) {
                setSelectedKeys((prev) => {
                    const next = new Set(prev);
                    if (next.has(key)) next.delete(key);
                    else next.add(key);
                    return next;
                });
                setLastClicked(key);
            } else if (e.shiftKey && lastClicked) {
                const a = fromKey(lastClicked);
                const minIdx = Math.min(
                    a.yil * 10000 + a.ay * 100 + a.gun,
                    dateYil * 10000 + ay * 100 + gun
                );
                const maxIdx = Math.max(
                    a.yil * 10000 + a.ay * 100 + a.gun,
                    dateYil * 10000 + ay * 100 + gun
                );
                setSelectedKeys((prev) => {
                    const next = new Set(prev);
                    for (let m = 1; m <= 12; m++) {
                        const dates = buildMonthGrid(yil, m);
                        dates.forEach((d) => {
                            if (d.getMonth() !== m - 1 || d.getFullYear() !== yil) return;
                            const idx = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
                            if (idx >= minIdx && idx <= maxIdx) {
                                next.add(toKey(d.getDate(), d.getMonth() + 1, d.getFullYear()));
                            }
                        });
                    }
                    return next;
                });
            } else {
                setSelectedKeys(new Set([key]));
                setLastClicked(key);
            }
        },
        [lastClicked, yil]
    );

    const handleCellClickForDetay = useCallback(
        (gun, ay, dateYil, isInMonth) => {
            if (!isInMonth) return;
            const d = new Date(dateYil, ay - 1, gun);
            const key = d.toISOString().split('T')[0];
            const detaylar = izinMap[key] || [];
            setIzinDetaylari(detaylar);
        },
        [izinMap]
    );

    const selectedTarihForForm = useMemo(() => {
        if (selectedKeys.size === 0) return '';
        const first = [...selectedKeys][0];
        const { gun, ay, yil: y } = fromKey(first);
        return `${y}-${String(ay).padStart(2, '0')}-${String(gun).padStart(2, '0')}`;
    }, [selectedKeys]);

    const handleIzinEkle = async (values) => {
        if (!sicilId) {
            toast.warning('Personel bilgisi yok.');
            return;
        }
        const tipId = parseInt(values.izinTipId, 10);
        if (!tipId) {
            toast.warning('Lütfen İzin Tipi seçiniz.');
            return;
        }
        const basaat = values.baslangicSaati || '';
        const bisaat = values.bitisSaati || '';
        const isSaatlik = basaat && bisaat;

        if (isSaatlik) {
            const tarihStr = values.izinTarihi;
            if (!tarihStr) {
                toast.warning('İzin tarihi giriniz veya takvimden seçiniz.');
                return;
            }
            const basMins = minsFromMidnight(basaat || '00:00');
            const bitMins = minsFromMidnight(bisaat || '23:59');
            const sure = Math.max(0, bitMins - basMins);
            setActionLoading(true);
            try {
                await PostWithToken('Izinler/Create', {
                    sicilId,
                    tipId,
                    tarih: tarihStr,
                    saatlikizin: true,
                    aciklama: values.aciklama || '',
                    sure: sure,
                    baslangic: basMins,
                    bitis: bitMins,
                    ucretli: true,
                    saatlikUcret: 0,
                    mailSended: 0,
                });
                toast.success('Saatlik izin eklendi.');
                await refreshTakvim();
            } catch (e) {
                toast.error(e?.response?.data?.message || 'İzin eklenemedi.');
            }
            setActionLoading(false);
        } else {
            if (selectedKeys.size === 0) {
                toast.warning('Lütfen izin eklemek istediğiniz gün veya günleri seçiniz.');
                return;
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (const key of selectedKeys) {
                const { gun, ay, yil: y } = fromKey(key);
                const d = new Date(y, ay - 1, gun);
                if (d < today) {
                    toast.warning('Geçmişe yönelik izin ekleyemezsiniz.');
                    return;
                }
            }
            setActionLoading(true);
            let ok = 0;
            for (const key of selectedKeys) {
                const { gun, ay, yil: y } = fromKey(key);
                const tarihStr = `${y}-${String(ay).padStart(2, '0')}-${String(gun).padStart(2, '0')}`;
                try {
                    await PostWithToken('Izinler/Create', {
                        sicilId,
                        tipId,
                        tarih: tarihStr,
                        saatlikizin: false,
                        aciklama: values.aciklama || '',
                        sure: 480,
                        baslangic: 0,
                        bitis: 0,
                        ucretli: true,
                        saatlikUcret: 0,
                        mailSended: 0,
                    });
                    ok++;
                } catch (err) {
                    toast.error(err?.response?.data?.message || 'İzin eklenemedi.');
                }
            }
            setActionLoading(false);
            if (ok > 0) {
                toast.success(`${ok} izin kaydı eklendi.`);
                setSelectedKeys(new Set());
                await refreshTakvim();
            }
        }
    };

    const handleIzinSil = async () => {
        if (selectedKeys.size === 0) {
            toast.warning('Silmek istediğiniz kayıt veya kayıtları seçiniz.');
            return;
        }
        const toDelete = [];
        for (const key of selectedKeys) {
            const { gun, ay, yil: y } = fromKey(key);
            const d = new Date(y, ay - 1, gun);
            const dateKey = d.toISOString().split('T')[0];
            const list = izinMap[dateKey] || [];
            list.forEach((iz) => toDelete.push(iz.id));
        }
        if (toDelete.length === 0) {
            toast.warning('Seçilen günlerde silinecek izin kaydı bulunamadı.');
            return;
        }
        setActionLoading(true);
        let ok = 0;
        for (const id of toDelete) {
            try {
                await PostWithToken('Izinler/Delete', { id });
                ok++;
            } catch (e) {
                toast.error(e?.response?.data?.message || 'İzin silinemedi.');
            }
        }
        setActionLoading(false);
        if (ok > 0) {
            toast.success(`${ok} izin kaydı silindi.`);
            setSelectedKeys(new Set());
            await refreshTakvim();
        }
    };

    const handleTatilEkle = () => {
        toast.info('Tatil ekleme özelliği yakında eklenecek.');
    };

    const handleTatilSil = () => {
        toast.info('Tatil silme özelliği yakında eklenecek.');
    };

    const formatIzinTarih = (t) => {
        if (!t) return '-';
        const d = new Date(t);
        return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('tr-TR');
    };

    const formatSaat = (mins) => {
        if (mins == null) return '-';
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="PDKSPG">
            <style jsx global>{`
                .PDKSPG .modal-dialog {
                    width: 90% !important;
                    max-width: 300000px;
                }
            `}</style>
            <Modal isOpen={isOpen} toggle={toggle} size="xl" scrollable className="izin-takvim-modal">
                <ModalHeader toggle={toggle}>
                    İzin Takvimi {adSoyad ? ` - ${adSoyad}` : ''}
                </ModalHeader>
                <ModalBody>
                    {!sicilId ? (
                        <div className="text-center text-muted py-4">Personel bilgisi yok.</div>
                    ) : (
                        <>
                            <Formik
                                initialValues={{
                                    izinTarihi: selectedTarihForForm || '',
                                    baslangicSaati: '08:00',
                                    bitisSaati: '18:00',
                                    izinTipId: '',
                                    tatilTipId: '',
                                    aciklama: '',
                                }}
                                enableReinitialize
                                onSubmit={handleIzinEkle}
                            >
                                {({ values, setFieldValue, handleSubmit }) => (
                                    <Form>
                                        <div className="row g-2 mb-3">
                                            <div className="col-md-2">
                                                <label className="form-label small">Saatlik İzin Tarihi</label>
                                                <Field
                                                    name="izinTarihi"
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    placeholder="Başlangıç Tarihi"
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label small">Başlangıç Saati</label>
                                                <Field
                                                    name="baslangicSaati"
                                                    type="time"
                                                    className="form-control form-control-sm"
                                                    placeholder="Başlangıç Saati"
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label small">Bitiş Saati</label>
                                                <Field
                                                    name="bitisSaati"
                                                    type="time"
                                                    className="form-control form-control-sm"
                                                    placeholder="Bitiş Saati"
                                                />
                                            </div>
                                            <div className="col-md-1">
                                                <label className="form-label small">Kıdem</label>
                                                <div className="form-control form-control-sm bg-light">{kidemYil}</div>
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label small">Yıllık İzin Kredisi</label>
                                                <div className="form-control form-control-sm bg-light">{izinKredisi}</div>
                                            </div>
                                        </div>
                                        <div className="row g-2 mb-3">
                                            <div className="col-md-3">
                                                <label className="form-label small">İzin Tipi</label>
                                                <ReactSelect
                                                    classNamePrefix="react-select"
                                                    isClearable
                                                    placeholder="- - - - - - -"
                                                    options={izinTipleri.map((iz) => ({
                                                        value: iz.id,
                                                        label: iz.aciklama || iz.Ad || iz.ad || `İzin ${iz.id}`,
                                                    }))}
                                                    value={
                                                        values.izinTipId
                                                            ? (() => {
                                                                  const iz = izinTipleri.find((i) => i.id === values.izinTipId);
                                                                  return {
                                                                      value: values.izinTipId,
                                                                      label: iz?.aciklama || iz?.Ad || iz?.ad || `İzin ${values.izinTipId}`,
                                                                  };
                                                              })()
                                                            : null
                                                    }
                                                    onChange={(opt) => setFieldValue('izinTipId', opt?.value ?? '')}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small">Tatil Tipi</label>
                                                <ReactSelect
                                                    classNamePrefix="react-select"
                                                    isClearable
                                                    placeholder="- - - - - - -"
                                                    options={tatilTipleri.map((t) => ({
                                                        value: t.id,
                                                        label: t.aciklama || t.Ad || t.ad || `Tatil ${t.id}`,
                                                    }))}
                                                    value={
                                                        values.tatilTipId
                                                            ? (() => {
                                                                  const t = tatilTipleri.find((x) => x.id === values.tatilTipId);
                                                                  return {
                                                                      value: values.tatilTipId,
                                                                      label: t?.aciklama || t?.Ad || t?.ad || `Tatil ${values.tatilTipId}`,
                                                                  };
                                                              })()
                                                            : null
                                                    }
                                                    onChange={(opt) => setFieldValue('tatilTipId', opt?.value ?? '')}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small">Açıklama</label>
                                                <Field
                                                    name="aciklama"
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="Açıklama"
                                                    maxLength={50}
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap" style={{ gap: 5 }}>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleSubmit()}
                                                disabled={actionLoading}
                                            >
                                                <i className="fa fa-floppy-o me-1" />
                                                İzin Ekle
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger"
                                                onClick={handleIzinSil}
                                                disabled={actionLoading}
                                            >
                                                <i className="fa fa-trash me-1" />
                                                İzin Sil
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-info"
                                                onClick={handleTatilEkle}
                                                disabled={actionLoading}
                                            >
                                                <i className="fa fa-plus me-1" />
                                                Tatil Ekle
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-warning"
                                                onClick={handleTatilSil}
                                                disabled={actionLoading}
                                            >
                                                <i className="fa fa-trash me-1" />
                                                Tatil Sil
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>

                            <div className="mb-2">
                                <span className="fw-bold me-2">{adSoyad || `Sicil #${sicilId}`}</span>
                                <select
                                    className="form-select form-select-sm d-inline-block"
                                    style={{ width: 100 }}
                                    value={yil}
                                    onChange={(e) => setYil(Number(e.target.value))}
                                >
                                    {years.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                                <span className="ms-2 small text-muted">
                                    (Ctrl basılı tutarak  çoklu seçim)
                                </span>
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Yükleniyor...
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped table-sm izin-takvim-table">
                                        <thead>
                                            <tr>
                                                <th style={{ minWidth: 40 }}>{yil}</th>
                                                {Array.from({ length: 37 }).map((_, i) => (
                                                    <th
                                                        key={i}
                                                        className="text-center"
                                                        style={{ fontSize: 10, padding: '4px 2px', minWidth: 28 }}
                                                    >
                                                        {WEEKDAY_NAMES[i]}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MONTH_NAMES.map((monthName, monthIndex) => {
                                                const month = monthIndex + 1;
                                                const dates = buildMonthGrid(yil, month);
                                                return (
                                                    <tr key={month}>
                                                        <td
                                                            className="month fw-semibold align-middle"
                                                            style={{ fontSize: 10 }}
                                                        >
                                                            {monthName}
                                                        </td>
                                                        {dates.map((date, i) => {
                                                            const isInMonth =
                                                                date.getMonth() === monthIndex &&
                                                                date.getFullYear() === yil;
                                                            const gun = date.getDate();
                                                            const ay = date.getMonth() + 1;
                                                            const dateYil = date.getFullYear();
                                                            const key = toKey(gun, ay, dateYil);
                                                            const keyDate = date.toISOString().split('T')[0];
                                                            const hasIzin = (izinMap[keyDate] || []).length > 0;
                                                            const isPast =
                                                                date < new Date() && isInMonth;
                                                            const isWeekend =
                                                                date.getDay() === 0 || date.getDay() === 6;
                                                            const selected = selectedKeys.has(key);

                                                            let className = '';
                                                            if (isWeekend) className += ' weekend';
                                                            if (isPast && isInMonth) className += ' gecengri';
                                                            if (isInMonth) className += ' cmtkvm';
                                                            if (selected) className += ' selected';
                                                            if (hasIzin && isInMonth) className += ' calismavar';

                                                            return (
                                                                <td
                                                                    key={i}
                                                                    className={className.trim()}
                                                                    data-gun={gun}
                                                                    data-ay={ay}
                                                                    data-yil={dateYil}
                                                                    onClick={(e) => {
                                                                        handleCellClick(e, {
                                                                            gun,
                                                                            ay,
                                                                            yil: dateYil,
                                                                        }, isInMonth);
                                                                        handleCellClickForDetay(
                                                                            gun,
                                                                            ay,
                                                                            dateYil,
                                                                            isInMonth
                                                                        );
                                                                    }}
                                                                    style={{
                                                                        fontSize: 9,
                                                                        padding: '6px 2px',
                                                                        cursor: isInMonth ? 'pointer' : 'default',
                                                                    }}
                                                                >
                                                                    {isInMonth ? gun : <span>{String(gun).padStart(2, '0')}</span>}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {izinDetaylari.length > 0 && (
                                <div className="mt-3">
                                    <h6 className="mb-2">İzin Detayları</h6>
                                    <table className="table table-striped table-sm">
                                        <thead>
                                            <tr>
                                                <th>İzin Tipi</th>
                                                <th>Tarih</th>
                                                <th>Başlangıç</th>
                                                <th>Bitiş</th>
                                                <th>Süre (dk)</th>
                                                <th>Ücret Tipi</th>
                                                <th>Açıklama</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {izinDetaylari.map((iz) => (
                                                <tr key={iz.id}>
                                                    <td>{iz.tipAciklama || '-'}</td>
                                                    <td>{formatIzinTarih(iz.tarih)}</td>
                                                    <td>{iz.saatlikizin ? formatSaat(iz.baslangic) : '-'}</td>
                                                    <td>{iz.saatlikizin ? formatSaat(iz.bitis) : '-'}</td>
                                                    <td>{iz.sure ?? '-'}</td>
                                                    <td>{iz.ucretli ? 'Ücretli' : 'Ücretsiz'}</td>
                                                    <td>{iz.aciklama || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </ModalBody>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                .izin-takvim-modal .modal-dialog { max-width: 90%; width: 90%; }
                .izin-takvim-table thead th,
                .izin-takvim-table td { font-size: 10px !important; text-align: center; padding: 6px 3px !important; }
                .izin-takvim-table .weekend { background-color: #B671AD; color: white; }
                .izin-takvim-table .weekend a, .izin-takvim-table .weekend span { color: white; }
                .izin-takvim-table .selected { background: #88EEFF !important; }
                .izin-takvim-table .cmtkvm { cursor: pointer; }
                .izin-takvim-table .gecengri { background-color: #e16a6a; color: #333; }
                .izin-takvim-table .calismavar { background-color: #00ff21; }
            `,
                    }}
                />
            </Modal>
        </div>
    );
}
