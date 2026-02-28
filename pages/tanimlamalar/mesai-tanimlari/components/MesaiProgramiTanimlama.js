import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import AlertFunction from '../../../../components/alertfunction';
import PageLoading from '../../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../../api/crud';
import { confirmAlert } from 'react-confirm-alert';

export default function MesaiProgramiTanimlama() {
    const [loading, setLoading] = useState(true);
    const [mesaiList, setMesaiList] = useState([]);
    const [grupList, setGrupList] = useState([]);
    const [secilenMesailer, setSecilenMesailer] = useState([]);
    const [oncelikId, setOncelikId] = useState(-1);
    const [grupAdi, setGrupAdi] = useState('');
    const [saving, setSaving] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [modalGrupAdi, setModalGrupAdi] = useState('');
    const [modalSecilenMesailer, setModalSecilenMesailer] = useState([]);
    const [modalOncelikId, setModalOncelikId] = useState(-1);
    const [modalSaving, setModalSaving] = useState(false);

    const yukle = async () => {
        try {
            const [mesaiRes, grupRes] = await Promise.all([
                GetWithToken('Mesailer/GetAll', { PageNumber: 0, PageSize: 500 }),
                GetWithToken('MesaiGruplari/GetAll', { PageNumber: 0, PageSize: 500 }),
            ]);
            setMesaiList(mesaiRes?.data?.data?.list || mesaiRes?.data?.data || []);
            setGrupList(grupRes?.data?.data?.list || grupRes?.data?.data || []);
        } catch (e) {
            setMesaiList([]);
            setGrupList([]);
        }
    };

    useEffect(() => {
        setLoading(true);
        yukle().finally(() => setLoading(false));
    }, [refreshKey]);

    const tabloyaEkle = (mesai) => {
        const mid = mesai.id ?? mesai.Id;
        const varMi = secilenMesailer.some((m) => (m.id ?? m.Id) === mid);
        if (varMi) {
            AlertFunction('Hata', 'Eklemeye çalıştığınız mesai listeye ekli.');
            return;
        }
        const ad = mesai.aciklama ?? mesai.Aciklama ?? '-';
        setSecilenMesailer((prev) => [...prev, { id: mid, aciklama: ad }]);
    };

    const tablodanSil = (idx) => {
        const silinen = secilenMesailer[idx];
        setSecilenMesailer((prev) => prev.filter((_, i) => i !== idx));
        if ((oncelikId ?? -1) === (silinen?.id ?? silinen?.Id)) {
            setOncelikId(-1);
        }
    };

    const oncelikVer = (idx) => {
        const item = secilenMesailer[idx];
        const mid = item?.id ?? item?.Id ?? -1;
        setOncelikId((prev) => (prev === mid ? -1 : mid));
    };

    const temizle = () => {
        setGrupAdi('');
        setSecilenMesailer([]);
        setOncelikId(-1);
    };

    const kaydet = async () => {
        if (!grupAdi?.trim()) {
            AlertFunction('Hata', 'Lütfen Grup Adı Giriniz');
            return;
        }
        if (secilenMesailer.length === 0) {
            AlertFunction('Hata', 'Lütfen eklemek istediğiniz mesailerin kenarındaki + işaretini tıklayınız.');
            return;
        }
        const idler = secilenMesailer.map((m) => m.id ?? m.Id);
        setSaving(true);
        try {
            const res = await PostWithToken('MesaiGruplari/Kaydet', {
                GrupAdi: grupAdi.trim(),
                Idler: idler,
                OncelikIdsi: oncelikId > 0 ? oncelikId : -1,
            });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setRefreshKey((k) => k + 1);
            temizle();
            AlertFunction('Başarılı', 'Kayıt işlemi başarılı bir şekilde gerçekleşti.');
        } catch (e) {
            AlertFunction('Hata', e?.response?.data?.message || 'Kaydetme hatası');
        } finally {
            setSaving(false);
        }
    };

    const detayAc = async (id) => {
        try {
            const res = await GetWithToken('MesaiGruplari/GetDetay', { id });
            const d = res?.data?.data;
            if (!d) {
                AlertFunction('Hata', 'Detay yüklenemedi');
                return;
            }
            setDetailData(d);
            const uyeler = d.uyeler ?? d.Uyeler ?? [];
            setModalGrupAdi(d.aciklama ?? d.Aciklama ?? '');
            setModalSecilenMesailer(
                uyeler.map((u) => ({
                    id: u.mesaiId ?? u.MesaiId,
                    aciklama: u.mesaiAciklama ?? u.MesaiAciklama ?? '-',
                }))
            );
            const oncelikli = uyeler.find((u) => u.oncelikliBirim ?? u.OncelikliBirim);
            setModalOncelikId(oncelikli ? (oncelikli.mesaiId ?? oncelikli.MesaiId) : -1);
            setDetailModalOpen(true);
        } catch (e) {
            AlertFunction('Hata', 'Detay yüklenemedi');
        }
    };

    const modalTabloyaEkle = (mesai) => {
        const mid = mesai.id ?? mesai.Id;
        const varMi = modalSecilenMesailer.some((m) => (m.id ?? m.Id) === mid);
        if (varMi) {
            AlertFunction('Hata', 'Eklemeye çalıştığınız mesai listeye ekli.');
            return;
        }
        const ad = mesai.aciklama ?? mesai.Aciklama ?? '-';
        setModalSecilenMesailer((prev) => [...prev, { id: mid, aciklama: ad }]);
    };

    const modalTablodanSil = (idx) => {
        const silinen = modalSecilenMesailer[idx];
        setModalSecilenMesailer((prev) => prev.filter((_, i) => i !== idx));
        if ((modalOncelikId ?? -1) === (silinen?.id ?? silinen?.Id)) {
            setModalOncelikId(-1);
        }
    };

    const modalOncelikVer = (idx) => {
        const item = modalSecilenMesailer[idx];
        const mid = item?.id ?? item?.Id ?? -1;
        setModalOncelikId((prev) => (prev === mid ? -1 : mid));
    };

    const modalGuncelle = async () => {
        if (!detailData?.id && !detailData?.Id) return;
        const grupId = detailData.id ?? detailData.Id;
        if (!modalGrupAdi?.trim()) {
            AlertFunction('Hata', 'Lütfen Grup Adı Giriniz');
            return;
        }
        if (modalSecilenMesailer.length === 0) {
            AlertFunction('Hata', 'Lütfen eklemek istediğiniz mesailerin kenarındaki + işaretini tıklayınız.');
            return;
        }
        const idler = modalSecilenMesailer.map((m) => m.id ?? m.Id);
        setModalSaving(true);
        try {
            const res = await PostWithToken('MesaiGruplari/Guncelle', {
                GrupId: grupId,
                GrupAdi: modalGrupAdi.trim(),
                Idler: idler,
                OncelikIdsi: modalOncelikId > 0 ? modalOncelikId : -1,
            });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setRefreshKey((k) => k + 1);
            setDetailModalOpen(false);
            AlertFunction('Başarılı', 'Kayıt işlemi başarılı bir şekilde gerçekleşti.');
        } catch (e) {
            AlertFunction('Hata', e?.response?.data?.message || 'Güncelleme hatası');
        } finally {
            setModalSaving(false);
        }
    };

    const sil = (id, aciklama) => {
        confirmAlert({
            title: 'Uyarı',
            message: `"${aciklama}" mesai programını silmek istediğinizden emin misiniz?`,
            buttons: [
                { label: 'Hayır', onClick: () => {} },
                {
                    label: 'Evet',
                    onClick: async () => {
                        try {
                            const res = await PostWithToken('MesaiGruplari/Delete', { Id: id });
                            if (res?.data?.isError) {
                                AlertFunction('Hata', res.data.message);
                                return;
                            }
                            setRefreshKey((k) => k + 1);
                            if (detailModalOpen && detailData?.id === id) setDetailModalOpen(false);
                            AlertFunction('Başarılı', 'Silindi');
                        } catch (e) {
                            AlertFunction('Başarısız', e?.response?.data?.message || 'Silme hatası');
                        }
                    },
                },
            ],
        });
    };

    if (loading && mesaiList.length === 0) return <PageLoading />;

    return (
        <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h6 className="mb-0">Mesai Programı</h6>
                    </div>
                    <div className="card-body">
                        <div className="row mb-3">
                            <div className="col-md-12">
                                <label className="form-label">Grup Adı</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Grup Adı"
                                    maxLength={59}
                                    value={grupAdi}
                                    onChange={(e) => setGrupAdi(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <label className="form-label">Mesai Birimleri</label>
                                <div className="border rounded" style={{ maxHeight: 400, overflow: 'auto' }}>
                                    <table className="table table-sm table-striped mb-0">
                                        <thead>
                                            <tr>
                                                <th>Grup Adı</th>
                                                <th style={{ width: 50 }}>İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mesaiList.map((m) => {
                                                const mid = m.id ?? m.Id;
                                                const ad = m.aciklama ?? m.Aciklama ?? '-';
                                                return (
                                                    <tr key={mid}>
                                                        <td>{ad}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-success py-0 px-1"
                                                                title="Ekle"
                                                                onClick={() => tabloyaEkle(m)}
                                                            >
                                                                <i className="icon-plus3"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Eklenen Mesailer</label>
                                <div className="border rounded" style={{ maxHeight: 400, overflow: 'auto' }}>
                                    {secilenMesailer.length === 0 ? (
                                        <div className="p-3 text-muted small">+ ile mesai ekleyin</div>
                                    ) : (
                                        <table className="table table-sm mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Açıklama</th>
                                                    <th style={{ width: 90 }}>İşlem</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {secilenMesailer.map((m, idx) => {
                                                    const mid = m.id ?? m.Id;
                                                    const isOncelik = oncelikId === mid;
                                                    return (
                                                        <tr
                                                            key={idx}
                                                            style={
                                                                isOncelik
                                                                    ? { backgroundColor: '#b8e6b8' }
                                                                    : undefined
                                                            }
                                                        >
                                                            <td>{m.aciklama ?? m.Aciklama ?? '-'}</td>
                                                            <td>
                                                                <span
                                                                    className="d-inline-flex align-items-center"
                                                                    style={{ gap: 4 }}
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-danger py-0 px-1"
                                                                        title="Sil"
                                                                        onClick={() => tablodanSil(idx)}
                                                                    >
                                                                        <i className="icon-trash"></i>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-success py-0 px-1"
                                                                        title="Öncelikli Sırası"
                                                                        onClick={() => oncelikVer(idx)}
                                                                    >
                                                                        <i className="icon-arrow-up8"></i>
                                                                    </button>
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr />
                        <div>
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={kaydet}
                                disabled={saving}
                            >
                                <i className="icon-floppy-disk"></i> Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 mt-3">
                <div className="card">
                    <div className="card-header">
                        <h6 className="mb-0">Kayıtlı Mesai Programları</h6>
                    </div>
                    <div className="card-body p-0">
                        <div style={{ maxHeight: 400, overflow: 'auto' }}>
                            <table className="table table-sm table-striped mb-0">
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Aciklama</th>
                                        <th>Öncelikli Birim</th>
                                        <th style={{ width: 80 }}>İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grupList.map((g) => {
                                        const gid = g.id ?? g.Id;
                                        const acik = g.aciklama ?? g.Aciklama ?? '-';
                                        const oncelik = g.oncelikliBirimAdi ?? g.OncelikliBirimAdi ?? '-';
                                        return (
                                            <tr key={gid}>
                                                <td>{gid}</td>
                                                <td>{acik}</td>
                                                <td>{oncelik}</td>
                                                <td>
                                                    <span
                                                        className="d-inline-flex align-items-center"
                                                        style={{ gap: 4 }}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-primary py-0 px-1"
                                                            title="Görüntüle"
                                                            onClick={() => detayAc(gid)}
                                                        >
                                                            <i className="icon-eye"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-danger py-0 px-1"
                                                            title="Sil"
                                                            onClick={() => sil(gid, acik)}
                                                        >
                                                            <i className="icon-trash"></i>
                                                        </button>
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={detailModalOpen}
                toggle={() => setDetailModalOpen(!detailModalOpen)}
                size="lg"
            >
                <ModalHeader toggle={() => setDetailModalOpen(false)}>
                    <i className="icon-edit me-2"></i>
                    Mesai Grup Detay
                </ModalHeader>
                <ModalBody>
                    {detailData && (
                        <div className="smart-form">
                            <fieldset>
                                <div className="row">
                                    <section className="col-md-12">
                                        <label className="form-label">Grup Adı</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Grup Adı"
                                            maxLength={59}
                                            value={modalGrupAdi}
                                            onChange={(e) => setModalGrupAdi(e.target.value)}
                                        />
                                    </section>
                                </div>
                            </fieldset>
                            <fieldset>
                                <div className="row">
                                    <div className="col-md-6">
                                        <label className="form-label">Mesai Birimleri (Grup Adı)</label>
                                        <div className="border rounded" style={{ maxHeight: 300, overflow: 'auto' }}>
                                            <table className="table table-sm table-striped mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Grup Adı</th>
                                                        <th style={{ width: 50 }}>İşlem</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mesaiList.map((m) => {
                                                        const mid = m.id ?? m.Id;
                                                        const ad = m.aciklama ?? m.Aciklama ?? '-';
                                                        return (
                                                            <tr key={mid}>
                                                                <td>{ad}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-xs btn-success py-0 px-1"
                                                                        title="Ekle"
                                                                        onClick={() => modalTabloyaEkle(m)}
                                                                    >
                                                                        <i className="icon-plus3"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="col-md-6" style={{ maxHeight: 360, overflow: 'auto' }}>
                                        <label className="form-label">Mesai Adı</label>
                                        <table className="table table-sm table-responsive mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Mesai Adı</th>
                                                    <th style={{ width: 100 }}>İşlem</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {modalSecilenMesailer.map((m, idx) => {
                                                    const mid = m.id ?? m.Id;
                                                    const isOncelik = modalOncelikId === mid;
                                                    return (
                                                        <tr
                                                            key={idx}
                                                            style={
                                                                isOncelik
                                                                    ? { backgroundColor: 'aquamarine' }
                                                                    : undefined
                                                            }
                                                        >
                                                            <td>{m.aciklama ?? m.Aciklama ?? '-'}</td>
                                                            <td>
                                                                <span
                                                                    className="d-inline-flex align-items-center"
                                                                    style={{ gap: 4 }}
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-xs btn-danger py-0 px-1"
                                                                        title="Sil"
                                                                        onClick={() => modalTablodanSil(idx)}
                                                                    >
                                                                        <i className="icon-trash"></i>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-xs btn-success py-0 px-1"
                                                                        title="Öncelikli Sırası"
                                                                        onClick={() => modalOncelikVer(idx)}
                                                                    >
                                                                        <i className="icon-arrow-up8"></i>
                                                                    </button>
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </fieldset>
                            <footer className="mt-3">
                                <button
                                    type="button"
                                    className="btn btn-labeled btn-success"
                                    onClick={modalGuncelle}
                                    disabled={modalSaving}
                                >
                                    <span className="btn-label">
                                        <i className="fa fa-edit"></i>
                                    </span>
                                    Güncelle
                                </button>
                            </footer>
                        </div>
                    )}
                </ModalBody>
            </Modal>
        </div>
    );
}
