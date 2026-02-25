import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import { GetWithToken, PostWithToken } from '../../api/crud';
import { toast } from 'react-toastify';
import DataTable from '../../../components/datatable';
import ReactSelect from 'react-select';

const buildMonthGrid = (year, month) => {
    const firstOfMonth = new Date(year, month - 1, 1);
    let start = new Date(firstOfMonth);
    const day = start.getDay(); // 0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi

    if (day !== 1) {
        let daysToSubtract = 0 - day;
        if (day === 0) {
            daysToSubtract = -7;
        }
        start = new Date(start);
        start.setDate(start.getDate() + daysToSubtract + 1);
    }

    const dates = [];
    for (let i = 0; i < 37; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        dates.push(d);
    }
    return dates;
};

const formatGunLabel = (date, mesaiInfo, isInMonth) => {
    const gun = String(date.getDate()).padStart(2, '0');
    if (!isInMonth) {
        return gun;
    }
    const text = mesaiInfo?.kod || mesaiInfo?.aciklama || '';
    return `(${gun})${text ? ' - ' + text : ''}`;
};

export default function MesaiTakvimiIndex() {
    const currentYear = new Date().getFullYear();

    const [yil, setYil] = useState(currentYear);
    const [sicilList, setSicilList] = useState([]);
    const [filterAdSoyad, setFilterAdSoyad] = useState('');
    const [refreshTable, setRefreshTable] = useState(null);
    const [selectedSicilIds, setSelectedSicilIds] = useState(new Set());
    const [selectedSicilId, setSelectedSicilId] = useState(null);
    const [selectedSicilAd, setSelectedSicilAd] = useState('');
    const [takvimLoading, setTakvimLoading] = useState(false);
    const [mesaiMap, setMesaiMap] = useState({}); // key: 'YYYY-MM-DD' -> { kod, aciklama }
    const [modalOpen, setModalOpen] = useState(false);
    const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [periyodOptions, setPeriyodOptions] = useState([]);
    const [grupOptions, setGrupOptions] = useState([]);
    const [birimOptions, setBirimOptions] = useState([]);
    const [selectedPeriyodId, setSelectedPeriyodId] = useState('');
    const [selectedGrupId, setSelectedGrupId] = useState('');
    const [selectedBirimId, setSelectedBirimId] = useState('');
    const [optionsLoading, setOptionsLoading] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);

    useEffect(() => {
        loadOptions();
    }, []);

    useEffect(() => {
        if (selectedSicilId) {
            loadTakvim(selectedSicilId, yil);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [yil, selectedSicilId]);

    const loadTakvim = async (sicilId, year) => {
        setTakvimLoading(true);
        try {
            const baslangic = `${year}-01-01`;
            const bitis = `${year}-12-31`;
            const res = await GetWithToken('Tasnifleme/GetBySicilAndDateRange', {
                sicilId,
                baslangic,
                bitis,
            });
            const payload = res?.data || res?.data?.data || {};
            const list = payload.list || [];
            const map = {};
            list.forEach((row) => {
                const rawDate = row.mesaiTarih || row.giris;
                if (!rawDate) return;
                const d = new Date(rawDate);
                if (Number.isNaN(d.getTime())) return;
                const key = d.toISOString().split('T')[0];
                map[key] = {
                    kod: row.mesaibirimiKod || null,
                    aciklama: row.mesaiAciklama || row.izinTipAd || '',
                };
            });
            setMesaiMap(map);
        } catch (e) {
            console.error('Mesai takvimi yüklenemedi', e);
            setMesaiMap({});
        }
        setTakvimLoading(false);
    };

    const loadOptions = async () => {
        setOptionsLoading(true);
        const pagination = { PageNumber: 1, PageSize: 500 };
        const fetchOpt = (url) =>
            GetWithToken(url, pagination)
                .then((r) => r.data?.data?.list || [])
                .catch(() => []);
        try {
            const [periyod, grup, birim] = await Promise.all([
                fetchOpt('MesaiPeriyodlari/GetAll'),
                fetchOpt('MesaiGruplari/GetAll'),
                fetchOpt('Mesailer/GetAll'),
            ]);
            setPeriyodOptions(periyod);
            setGrupOptions(grup);
            setBirimOptions(birim);
        } finally {
            setOptionsLoading(false);
        }
    };

    const years = useMemo(() => {
        const arr = [];
        for (let y = currentYear - 2; y <= currentYear + 1; y++) {
            arr.push(y);
        }
        return arr;
    }, [currentYear]);

    const periyodSelectOptions = useMemo(
        () =>
            periyodOptions.map((p) => ({
                value: String(p.id),
                label: p.aciklama || `Periyod ${p.id}`,
            })),
        [periyodOptions]
    );

    const grupSelectOptions = useMemo(
        () =>
            grupOptions.map((g) => ({
                value: String(g.id),
                label: g.aciklama || `Grup ${g.id}`,
            })),
        [grupOptions]
    );

    const birimSelectOptions = useMemo(
        () =>
            birimOptions.map((b) => ({
                value: String(b.id),
                label: b.kod || b.aciklama || `Birim ${b.id}`,
            })),
        [birimOptions]
    );

    const handleSelectSicil = (row) => {
        setSelectedSicilId(row.id);
        const adSoyad = `${row.ad || ''} ${row.soyad || ''}`.trim();
        setSelectedSicilAd(adSoyad || row.sicilNo || `Sicil #${row.id}`);
        setModalOpen(true);
    };

    const toggleSicilSelection = (id) => {
        setSelectedSicilIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAllSicil = () => {
        setSelectedSicilIds(new Set(sicilList.map((x) => x.id)));
    };

    const clearSelection = () => {
        setSelectedSicilIds(new Set());
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const selectedCount = selectedSicilIds.size;

    const dataUrl = useMemo(() => {
        const term = filterAdSoyad.trim();
        if (term.length >= 3) {
            const encoded = encodeURIComponent(term);
            return `GirisCikisRapor/GetSicilListPaged?ad=${encoded}`;
        }
        // 0-2 karakter için genel liste
        return 'GirisCikisRapor/GetSicilListPaged';
    }, [filterAdSoyad]);

    useEffect(() => {
        const len = filterAdSoyad.trim().length;
        // 0 karakter (temizleme) veya 3+ karakter olduğunda tabloyu yenile
        if (len === 0 || len >= 3) {
            setRefreshTable(new Date());
        }
    }, [filterAdSoyad]);

    const parseTargetDate = () => {
        if (!targetDate) return null;
        const parts = targetDate.split('-').map((x) => parseInt(x, 10));
        if (parts.length !== 3 || parts.some((x) => Number.isNaN(x))) return null;
        return { yil: parts[0], ay: parts[1], gun: parts[2] };
    };

    const ensureSelection = () => {
        if (selectedCount === 0) {
            toast.warn('Lütfen en az bir personel seçin.');
            return false;
        }
        if (!targetDate) {
            toast.warn('Lütfen bir tarih seçin.');
            return false;
        }
        return true;
    };

    const commonAssignPayload = () => {
        const parsed = parseTargetDate();
        if (!parsed) return null;
        return {
            gun: parsed.gun,
            ay: parsed.ay,
            yil: parsed.yil,
            sicilIds: Array.from(selectedSicilIds),
        };
    };

    const handlePeriyodAta = async () => {
        if (!ensureSelection()) return;
        if (!selectedPeriyodId) {
            toast.warn('Lütfen bir mesai periyodu seçin.');
            return;
        }
        const basePayload = commonAssignPayload();
        if (!basePayload) return;
        setAssignLoading(true);
        try {
            const payload = {
                ...basePayload,
                periyodId: parseInt(selectedPeriyodId, 10),
            };
            const res = await PostWithToken('MesaiTakvim/PeriyodAta', payload);
            const msg = res?.data?.message || res?.data?.Message || 'Periyod atama işlemi tamamlandı.';
            toast.success(msg);
        } catch (e) {
            const errMsg =
                e?.response?.data?.message ||
                e?.response?.data?.Message ||
                'Periyod atama işlemi başarısız.';
            toast.error(errMsg);
        }
        setAssignLoading(false);
    };

    const handleGrupAta = async () => {
        if (!ensureSelection()) return;
        if (!selectedGrupId) {
            toast.warn('Lütfen bir mesai grubu seçin.');
            return;
        }
        const basePayload = commonAssignPayload();
        if (!basePayload) return;
        setAssignLoading(true);
        try {
            const payload = {
                ...basePayload,
                grupId: parseInt(selectedGrupId, 10),
            };
            const res = await PostWithToken('MesaiTakvim/GrupAta', payload);
            const msg = res?.data?.message || res?.data?.Message || 'Grup atama işlemi tamamlandı.';
            toast.success(msg);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Grup atama işlemi başarısız.');
        }
        setAssignLoading(false);
    };

    const handleBirimAta = async () => {
        if (!ensureSelection()) return;
        if (!selectedBirimId) {
            toast.warn('Lütfen bir mesai birimi seçin.');
            return;
        }
        const basePayload = commonAssignPayload();
        if (!basePayload) return;
        setAssignLoading(true);
        try {
            const payload = {
                ...basePayload,
                birimId: parseInt(selectedBirimId, 10),
            };
            const res = await PostWithToken('MesaiTakvim/BirimAta', payload);
            const msg = res?.data?.message || res?.data?.Message || 'Birim atama işlemi tamamlandı.';
            toast.success(msg);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Birim atama işlemi başarısız.');
        }
        setAssignLoading(false);
    };

    return (
        <Layout>
            <PageHeader
                title="Mesai Takvimi"
                map={[
                    { url: 'personel-takibi', name: 'Personel Takibi' },
                    { url: 'personel-takibi/mesai-takvimi', name: 'Mesai Takvimi' },
                ]}
            />
            <div className="content p-4">
                <div className="row g-3">
                    <div className="col-12">
                        <div className="card h-100 shadow-sm">
                            <div className="card-header border-0 pb-2">
                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                    <div>
                                        <h5 className="mb-1">Personel Listesi</h5>
                                        <small className="text-muted">
                                            Ad / Soyad ile arama yapın, personel seçin ve üst panelden toplu atama alın.
                                        </small>
                                    </div>
                                    <div className="d-flex flex-column align-items-end gap-1">
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text">
                                                <i className="icon-search4" />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Ad / Soyad ara..."
                                                value={filterAdSoyad}
                                                onChange={(e) => setFilterAdSoyad(e.target.value)}
                                            />
                                        </div>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <span className="badge bg-primary">
                                                Seçili: {selectedCount}
                                            </span>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={selectAllSicil}
                                                disabled={sicilList.length === 0}
                                            >
                                                Tümünü Seç
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={clearSelection}
                                                disabled={selectedCount === 0}
                                            >
                                                Temizle
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <div className="bg-light border-bottom px-3 py-3">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap mb-3 gap-2">
                                        <div>
                                            <h6 className="mb-1">Toplu Atama Paneli</h6>
                                            <small className="text-muted">
                                                Tarih seçin, periyod / grup / birim belirleyip seçili personellere uygulayın.
                                            </small>
                                        </div>
                                        <div className="text-muted small">
                                            {selectedCount === 0
                                                ? 'Seçili personel yok'
                                                : `${selectedCount} personel seçili`}
                                        </div>
                                    </div>
                                    <div className="row g-3 align-items-end">
                                        <div className="col-12 col-md-3">
                                            <label className="form-label fw-semibold">Tarih</label>
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={targetDate}
                                                onChange={(e) => setTargetDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <label className="form-label fw-semibold">Periyod</label>
                                            <ReactSelect
                                                classNamePrefix="react-select"
                                                isClearable
                                                isDisabled={optionsLoading}
                                                options={periyodSelectOptions}
                                                value={
                                                    periyodSelectOptions.find((o) => o.value === selectedPeriyodId) ||
                                                    null
                                                }
                                                onChange={(opt) => setSelectedPeriyodId(opt?.value ?? '')}
                                            />
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <label className="form-label fw-semibold">Grup</label>
                                            <ReactSelect
                                                classNamePrefix="react-select"
                                                isClearable
                                                isDisabled={optionsLoading}
                                                options={grupSelectOptions}
                                                value={
                                                    grupSelectOptions.find((o) => o.value === selectedGrupId) || null
                                                }
                                                onChange={(opt) => setSelectedGrupId(opt?.value ?? '')}
                                            />
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <label className="form-label fw-semibold">Birim</label>
                                            <ReactSelect
                                                classNamePrefix="react-select"
                                                isClearable
                                                isDisabled={optionsLoading}
                                                options={birimSelectOptions}
                                                value={
                                                    birimSelectOptions.find((o) => o.value === selectedBirimId) || null
                                                }
                                                onChange={(opt) => setSelectedBirimId(opt?.value ?? '')}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 d-flex flex-wrap justify-content-end">
                                        <button
                                            type="button"
                                            className="btn btn-success btn-sm"
                                            onClick={handlePeriyodAta}
                                            disabled={assignLoading || selectedCount === 0}
                                        >
                                            {assignLoading ? (
                                                <span className="spinner-border spinner-border-sm me-1" />
                                            ) : (
                                                <i className="icon-clock2 me-1" />
                                            )}
                                            Periyod Ata
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-warning btn-sm text-dark"
                                            style={{ marginLeft: 5 }}
                                            onClick={handleGrupAta}
                                            disabled={assignLoading || selectedCount === 0}
                                        >
                                            {assignLoading ? (
                                                <span className="spinner-border spinner-border-sm me-1" />
                                            ) : (
                                                <i className="icon-grid5 me-1" />
                                            )}
                                            Grup Ata
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            style={{ marginLeft: 5 }}
                                            onClick={handleBirimAta}
                                            disabled={assignLoading || selectedCount === 0}
                                        >
                                            {assignLoading ? (
                                                <span className="spinner-border spinner-border-sm me-1" />
                                            ) : (
                                                <i className="icon-equalizer me-1" />
                                            )}
                                            Birim Ata
                                        </button>
                                    </div>
                                </div>
                                <style>{`
                                    .mesai-takvimi-datatable .datatable-table tbody td {
                                        text-align: left !important;
                                    }
                                    .mesai-takvimi-datatable .datatable-table tbody td:first-child {
                                        text-align: center !important;
                                    }
                                `}</style>
                                <div className="mesai-takvimi-datatable">
                                    <DataTable
                                        DataUrl={dataUrl}
                                        Refresh={refreshTable}
                                        Pagination={{ pageNumber: 1, pageSize: 20 }}
                                        UseGetPagination
                                        Headers={[
                                            {
                                                header: 'Seç',
                                                dynamicButton: (item) => (
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={selectedSicilIds.has(item.id)}
                                                        onChange={() => toggleSicilSelection(item.id)}
                                                    />
                                                ),
                                            },
                                            {
                                                header: 'Ad Soyad',
                                                dynamicButton: (item) => {
                                                    const fullName = `${item.ad || ''} ${item.soyad || ''}`.trim();
                                                    return fullName || '-';
                                                },
                                            },
                                            ['sicilNo', 'Sicil No'],
                                            {
                                                header: 'Firma',
                                                dynamicButton: (item) => item.firma || '-',
                                            },
                                            {
                                                header: 'Bölüm',
                                                dynamicButton: (item) => item.bolum || '-',
                                            },
                                            {
                                                header: 'Takvim',
                                                dynamicButton: (item) => (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm py-0 px-1"
                                                        onClick={() => handleSelectSicil(item)}
                                                    >
                                                        <i className="icon-calendar2" />
                                                    </button>
                                                ),
                                            },
                                        ]}
                                        HideButtons={true}
                                        GetAllData={(list) => setSicilList(list || [])}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Modal isOpen={modalOpen} toggle={closeModal} size="xl">
                <ModalHeader toggle={closeModal}>
                    Yıllık Mesai Takvimi
                    {selectedSicilAd ? ` - ${selectedSicilAd}` : ''}
                </ModalHeader>
                <ModalBody>
                    {!selectedSicilId ? (
                        <div className="p-4 text-center text-muted">
                            <i className="icon-user-check d-block fs-1 mb-2" />
                            Sol taraftan bir personel seçin.
                        </div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-end mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <label className="form-label mb-0 me-2">Yıl</label>
                                    <select
                                        className="form-select"
                                        style={{ width: 120 }}
                                        value={yil}
                                        onChange={(e) => setYil(Number(e.target.value))}
                                    >
                                        {years.map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {takvimLoading ? (
                                <div className="p-4 text-center">
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Mesai takvimi yükleniyor...
                                </div>
                            ) : (
                                <div className="row g-3">
                                    {monthNames.map((name, idx) => {
                                        const month = idx + 1;
                                        const dates = buildMonthGrid(yil, month);
                                        return (
                                            <div key={month} className="col-12 col-md-6">
                                                <div className="border rounded mb-2">
                                                    <div className="bg-light text-center py-1 fw-semibold">
                                                        {name.toUpperCase()}
                                                    </div>
                                                    <table className="table table-sm mb-0">
                                                        <tbody>
                                                            {Array.from({
                                                                length: Math.ceil(dates.length / 7),
                                                            }).map((_, weekIndex) => (
                                                                <tr key={weekIndex}>
                                                                    {dates
                                                                        .slice(
                                                                            weekIndex * 7,
                                                                            weekIndex * 7 + 7
                                                                        )
                                                                        .map((date, i) => {
                                                                            const isInMonth =
                                                                                date.getMonth() === month - 1 &&
                                                                                date.getFullYear() === yil;
                                                                            const key = date
                                                                                .toISOString()
                                                                                .split('T')[0];
                                                                            const mesaiInfo = mesaiMap[key];

                                                                            const isPast =
                                                                                date < new Date() && isInMonth;
                                                                            const isWeekend =
                                                                                date.getDay() === 0 ||
                                                                                date.getDay() === 6;

                                                                            let cellStyle = {
                                                                                fontSize: '0.75rem',
                                                                                padding: '0.2rem 0.3rem',
                                                                                minWidth: 40,
                                                                                maxWidth: 80,
                                                                            };
                                                                            if (!isInMonth) {
                                                                                cellStyle.color = '#adb5bd';
                                                                            }
                                                                            if (isPast && isInMonth) {
                                                                                cellStyle.backgroundColor = '#f8f9fa';
                                                                            }
                                                                            if (isWeekend) {
                                                                                cellStyle.backgroundColor = '#e7f3ff';
                                                                            }
                                                                            if (mesaiInfo?.kod || mesaiInfo?.aciklama) {
                                                                                cellStyle.fontWeight = '500';
                                                                            }

                                                                            return (
                                                                                <td key={i} style={cellStyle}>
                                                                                    {formatGunLabel(
                                                                                        date,
                                                                                        mesaiInfo,
                                                                                        isInMonth
                                                                                    )}
                                                                                </td>
                                                                            );
                                                                        })}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </ModalBody>
            </Modal>
        </Layout>
    );
}

