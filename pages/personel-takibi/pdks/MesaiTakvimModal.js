import React, { useEffect, useState, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { GetWithToken, PostWithToken } from '../../api/crud';
import { toast } from 'react-toastify';

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
const WEEKDAY_NAMES = ['PZR', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'];

export default function MesaiTakvimModal({ isOpen, toggle, sicilId, adSoyad }) {
    const currentYear = new Date().getFullYear();
    const [yil, setYil] = useState(currentYear);
    const [mesaiMap, setMesaiMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [periyodOptions, setPeriyodOptions] = useState([]);
    const [grupOptions, setGrupOptions] = useState([]);
    const [birimOptions, setBirimOptions] = useState([]);
    const [selectedPeriyodId, setSelectedPeriyodId] = useState('');
    const [selectedGrupId, setSelectedGrupId] = useState('');
    const [selectedBirimId, setSelectedBirimId] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        const load = async () => {
            const pagination = { PageNumber: 1, PageSize: 500 };
            try {
                const [periyod, grup, birim] = await Promise.all([
                    GetWithToken('MesaiPeriyodlari/GetAll', pagination),
                    GetWithToken('MesaiGruplari/GetAll', pagination),
                    GetWithToken('Mesailer/GetAll', pagination),
                ]);
                setPeriyodOptions(periyod?.data?.data?.list ?? []);
                setGrupOptions(grup?.data?.data?.list ?? []);
                setBirimOptions(birim?.data?.data?.list ?? []);
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
        GetWithToken('Tasnifleme/GetBySicilAndDateRange', { sicilId, baslangic, bitis })
            .then((res) => {
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
            })
            .catch((e) => {
                console.error('Takvim yüklenemedi', e);
                setMesaiMap({});
            })
            .finally(() => setLoading(false));
    }, [isOpen, sicilId, yil]);

    const assignPayload = useMemo(() => {
        if (!selectedCell || !sicilId) return null;
        return {
            gun: selectedCell.gun,
            ay: selectedCell.ay,
            yil: selectedCell.yil,
            sicilIds: [sicilId],
        };
    }, [selectedCell, sicilId]);

    const handlePeriyodAta = async () => {
        if (!assignPayload || !selectedPeriyodId) {
            toast.warning(selectedPeriyodId ? 'Lütfen takvimden bir gün seçin.' : 'Lütfen periyod seçin.');
            return;
        }
        setAssignLoading(true);
        try {
            await PostWithToken('MesaiTakvim/PeriyodAta', {
                ...assignPayload,
                periyodId: parseInt(selectedPeriyodId, 10),
            });
            toast.success('Periyod ataması yapıldı.');
            setSelectedCell(null);
            setSelectedPeriyodId('');
            await refreshTakvim();
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Periyod ataması başarısız.');
        }
        setAssignLoading(false);
    };

    const refreshTakvim = async () => {
        if (!sicilId || !yil) return;
        try {
            const baslangic = `${yil}-01-01`;
            const bitis = `${yil}-12-31`;
            const res = await GetWithToken('Tasnifleme/GetBySicilAndDateRange', { sicilId, baslangic, bitis });
            const list = res?.data?.list ?? res?.data?.data?.list ?? [];
            const map = {};
            list.forEach((row) => {
                const rawDate = row.mesaiTarih || row.giris;
                if (!rawDate) return;
                const d = new Date(rawDate);
                if (Number.isNaN(d.getTime())) return;
                const key = d.toISOString().split('T')[0];
                map[key] = { kod: row.mesaibirimiKod || null, aciklama: row.mesaiAciklama || row.izinTipAd || '' };
            });
            setMesaiMap(map);
        } catch (e) {
            console.error('Takvim yenilenemedi', e);
        }
    };

    const handleGrupAta = async () => {
        if (!assignPayload || !selectedGrupId) {
            toast.warning(selectedGrupId ? 'Lütfen takvimden bir gün seçin.' : 'Lütfen mesai grubu seçin.');
            return;
        }
        setAssignLoading(true);
        try {
            await PostWithToken('MesaiTakvim/GrupAta', {
                ...assignPayload,
                grupId: parseInt(selectedGrupId, 10),
            });
            toast.success('Grup ataması yapıldı.');
            setSelectedCell(null);
            setSelectedGrupId('');
            await refreshTakvim();
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Grup ataması başarısız.');
        }
        setAssignLoading(false);
    };

    const handleBirimAta = async () => {
        if (!assignPayload || !selectedBirimId) {
            toast.warning(selectedBirimId ? 'Lütfen takvimden bir gün seçin.' : 'Lütfen mesai birimi seçin.');
            return;
        }
        setAssignLoading(true);
        try {
            await PostWithToken('MesaiTakvim/BirimAta', {
                ...assignPayload,
                birimId: parseInt(selectedBirimId, 10),
            });
            toast.success('Birim ataması yapıldı.');
            setSelectedCell(null);
            setSelectedBirimId('');
            await refreshTakvim();
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Birim ataması başarısız.');
        }
        setAssignLoading(false);
    };

    const years = useMemo(() => {
        const arr = [];
        for (let y = currentYear - 2; y <= currentYear + 1; y++) arr.push(y);
        return arr;
    }, [currentYear]);

    if (!isOpen) return null;

    return (
        <div className='PDKSPG'> 
<style jsx global>{`
  .PDKSPG .modal-dialog {
    width: 90% !important;
    max-width: 300000px;
  }
`}</style>
        
        <Modal isOpen={isOpen} toggle={toggle} size="xl" scrollable className="mesai-takvim-modal mesai-takvim-modal-90">
            <ModalHeader toggle={toggle}>
                Mesai Takvimi {adSoyad ? ` - ${adSoyad}` : ''}
            </ModalHeader>
            <ModalBody>
                {!sicilId ? (
                    <div className="text-center text-muted py-4">Personel bilgisi yok.</div>
                ) : (
                    <>
                        <div className="mb-3">
                            <span className="fw-bold me-2" style={{ fontSize: '1.1rem' }}>
                                {adSoyad || `Sicil #${sicilId}`}
                            </span>
                            <select
                                className="form-select form-select-sm d-inline-block ms-2"
                                style={{ width: 100 }}
                                value={yil}
                                onChange={(e) => setYil(Number(e.target.value))}
                            >
                                {years.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <div className="row g-2 mb-3">
                            <div className="col-md-4">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text">Periyod</span>
                                    <select
                                        className="form-select"
                                        value={selectedPeriyodId}
                                        onChange={(e) => setSelectedPeriyodId(e.target.value)}
                                    >
                                        <option value="">Periyod seçiniz</option>
                                        {periyodOptions.map((p) => (
                                            <option key={p.id} value={p.id}>{p.aciklama || p.Ad || `Periyod ${p.id}`}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={handlePeriyodAta}
                                        disabled={assignLoading}
                                        title="Periyod Ata"
                                    >
                                        <i className="fa fa-save" />
                                    </button>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text">Mesai Grubu</span>
                                    <select
                                        className="form-select"
                                        value={selectedGrupId}
                                        onChange={(e) => setSelectedGrupId(e.target.value)}
                                    >
                                        <option value="">Grup seçiniz</option>
                                        {grupOptions.map((g) => (
                                            <option key={g.id} value={g.id}>{g.aciklama || g.Ad || `Grup ${g.id}`}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={handleGrupAta}
                                        disabled={assignLoading}
                                        title="Grup Ata"
                                    >
                                        <i className="fa fa-save" />
                                    </button>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text">Birim</span>
                                    <select
                                        className="form-select"
                                        value={selectedBirimId}
                                        onChange={(e) => setSelectedBirimId(e.target.value)}
                                    >
                                        <option value="">Birim seçiniz</option>
                                        {birimOptions.map((b) => (
                                            <option key={b.id} value={b.id}>{b.kod || b.aciklama || b.Ad || `Birim ${b.id}`}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={handleBirimAta}
                                        disabled={assignLoading}
                                        title="Birim Ata"
                                    >
                                        <i className="fa fa-save" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {selectedCell && (
                            <div className="alert alert-info py-2 small mb-2">
                                Seçili tarih: {selectedCell.gun}.{selectedCell.ay}.{selectedCell.yil}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-5">
                                <span className="spinner-border spinner-border-sm me-2" />
                                Yükleniyor...
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped table-sm mesai-takvim-table">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: 40 }}>{yil}</th>
                                            {Array.from({ length: 37 }).map((_, i) => (
                                                <th key={i} className="text-center" style={{ fontSize: 10, padding: '4px 2px', minWidth: 28 }}>
                                                    {WEEKDAY_NAMES[i % 7]}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {MONTH_NAMES.map((monthName, monthIndex) => {
                                            const month = monthIndex + 1;
                                            const dates = buildMonthGrid(yil, month);
                                            const isSelected = selectedCell && selectedCell.ay === month;
                                            return (
                                                <tr key={month}>
                                                    <td className="month fw-semibold align-middle" style={{ fontSize: 10 }}>
                                                        {monthName}
                                                    </td>
                                                    {dates.map((date, i) => {
                                                        const isInMonth = date.getMonth() === monthIndex && date.getFullYear() === yil;
                                                        const key = date.toISOString().split('T')[0];
                                                        const mesaiInfo = mesaiMap[key];
                                                        const isPast = date < new Date() && isInMonth;
                                                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                                        const gun = date.getDate();
                                                        const ay = date.getMonth() + 1;
                                                        const dateYil = date.getFullYear();
                                                        const selected = selectedCell && selectedCell.gun === gun && selectedCell.ay === ay && selectedCell.yil === dateYil;

                                                        let className = '';
                                                        if (isWeekend) className += ' weekend';
                                                        if (isPast && isInMonth) className += ' gecengri';
                                                        if (isInMonth) className += ' cmtkvm';
                                                        if (selected) className += ' selected';

                                                        return (
                                                            <td
                                                                key={i}
                                                                className={className.trim()}
                                                                data-gun={gun}
                                                                data-ay={ay}
                                                                data-yil={dateYil}
                                                                onClick={() => isInMonth && setSelectedCell({ gun, ay, yil: dateYil })}
                                                                style={{ fontSize: 9, padding: '6px 2px', cursor: isInMonth ? 'pointer' : 'default' }}
                                                            >
                                                                {isInMonth ? (
                                                                    <>({String(gun).padStart(2, '0')}){mesaiInfo?.kod || mesaiInfo?.aciklama ? ` - ${(mesaiInfo.kod || mesaiInfo.aciklama || '').trim()}` : ' - '}</>
                                                                ) : (
                                                                    <span>{String(gun).padStart(2, '0')}</span>
                                                                )}
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
                    </>
                )}
            </ModalBody>
            <style dangerouslySetInnerHTML={{ __html: `
                .mesai-takvim-modal-90 .modal-dialog { max-width: 90%; width: 90%; }
                .mesai-takvim-table thead th,
                .mesai-takvim-table td { font-size: 10px !important; text-align: center; padding: 6px 3px !important; }
                .mesai-takvim-table .weekend { background-color: #B671AD; color: white; }
                .mesai-takvim-table .weekend a, .mesai-takvim-table .weekend span { color: white; }
                .mesai-takvim-table .selected { background: #8EF !important; }
                .mesai-takvim-table .cmtkvm { cursor: pointer; }
                .mesai-takvim-table .gecengri { background-color: #e16a6a; color: #333; }
            `}} />
        </Modal>
        </div>
    );
}
