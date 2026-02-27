import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import AlertFunction from '../../../components/alertfunction';
import PageLoading from '../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../api/crud';
import { confirmAlert } from 'react-confirm-alert';

export default function IzinlerIndex() {
    const [loading, setLoading] = useState(true);
    const [liste, setListe] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [saving, setSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [modalSaving, setModalSaving] = useState(false);

    const [form, setForm] = useState({
        aciklama: '',
        kod: '',
        ucretli: true,
    });

    const yukle = async () => {
        try {
            const res = await GetWithToken('Izinler/GetIzinTipleri', { PageNumber: 1, PageSize: 500 });
            setListe(res?.data?.data?.list || res?.data?.data || []);
        } catch (e) {
            setListe([]);
        }
    };

    useEffect(() => {
        setLoading(true);
        yukle().finally(() => setLoading(false));
    }, [refreshKey]);

    const temizle = () => {
        setForm({
            aciklama: '',
            kod: '',
            ucretli: true,
        });
    };

    const kaydet = async () => {
        if (!form.aciklama?.trim()) {
            AlertFunction('Hata', 'İzin Tipi giriniz');
            return;
        }
        if (!form.kod?.trim()) {
            AlertFunction('Hata', 'İzin Tipi Kodu giriniz');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                Aciklama: form.aciklama.trim(),
                Kod: form.kod.trim().toUpperCase().slice(0, 3),
                Lieu: null,
                Yillikizin: null,
                Sgk: null,
                Ucretli: Boolean(form.ucretli),
                VarsayilanSure: 0,
                Saatlikizin: false,
            };
            const res = await PostWithToken('Izinler/CreateIzinTipi', payload);
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setRefreshKey((k) => k + 1);
            temizle();
            AlertFunction('Başarılı', 'İzin tipi kaydı başarıyla gerçekleştirildi');
        } catch (e) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.title ||
                JSON.stringify(e?.response?.data) ||
                'Kaydetme hatası';
            AlertFunction('Hata', msg);
        } finally {
            setSaving(false);
        }
    };

    const detayAc = async (id) => {
        try {
            const res = await GetWithToken('Izinler/GetIzinTipiById', { id });
            const d = res?.data?.data;
            if (!d) {
                AlertFunction('Hata', 'Detay yüklenemedi');
                return;
            }
            setEditId(id);
            setForm({
                aciklama: d.aciklama ?? d.Aciklama ?? '',
                kod: d.kod ?? d.Kod ?? '',
                ucretli: d.ucretli ?? d.Ucretli ?? true,
            });
            setModalOpen(true);
        } catch (e) {
            AlertFunction('Hata', 'Detay yüklenemedi');
        }
    };

    const modalGuncelle = async () => {
        if (!editId) return;
        if (!form.aciklama?.trim()) {
            AlertFunction('Hata', 'İzin Tipi giriniz');
            return;
        }
        if (!form.kod?.trim()) {
            AlertFunction('Hata', 'İzin Tipi Kodu giriniz');
            return;
        }
        setModalSaving(true);
        try {
            const res = await PostWithToken('Izinler/UpdateIzinTipi', {
                Id: editId,
                Aciklama: form.aciklama.trim(),
                Kod: form.kod.trim().toUpperCase().slice(0, 3),
                Ucretli: form.ucretli,
            });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setRefreshKey((k) => k + 1);
            setModalOpen(false);
            AlertFunction('Başarılı', 'İzin tipi kaydı başarıyla güncellendi');
        } catch (e) {
            AlertFunction('Hata', e?.response?.data?.message || 'Güncelleme hatası');
        } finally {
            setModalSaving(false);
        }
    };

    const sil = (id, aciklama) => {
        confirmAlert({
            title: 'Uyarı',
            message: `"${aciklama}" izin tipini silmek istediğinizden emin misiniz? Bu izin tipine ait izin kayıtları varsa silme işlemi yapılamaz.`,
            buttons: [
                { label: 'Hayır', onClick: () => {} },
                {
                    label: 'Evet',
                    onClick: async () => {
                        try {
                            const res = await PostWithToken('Izinler/DeleteIzinTipi', { Id: id });
                            if (res?.data?.isError) {
                                AlertFunction('Hata', res.data.message);
                                return;
                            }
                            setRefreshKey((k) => k + 1);
                            if (editId === id) setModalOpen(false);
                            AlertFunction('Başarılı', 'Silindi');
                        } catch (e) {
                            AlertFunction('Başarısız', e?.response?.data?.message || 'Silme hatası');
                        }
                    },
                },
            ],
        });
    };

    if (loading && liste.length === 0) return <PageLoading />;

    return (
        <Layout>
            <PageHeader
                title="İzin Tipleri"
                map={[
                    { url: 'yonetimsel-araclar', name: 'Yönetimsel Araçlar' },
                    { url: 'yonetimsel-araclar/tanimlamalar', name: 'Tanımlamalar' },
                    { url: 'tanimlamalar/izinler', name: 'İzinler' },
                ]}
            />
            <div className="content pr-3 pl-3">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0">İzin Tipleri</h6>
                            </div>
                            <div className="card-body">
                                <div className="smart-form">
                                    <fieldset>
                                        <div className="row">
                                            <section className="col-md-4">
                                                <label className="form-label">İzin Tipi</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="İzin Tipi"
                                                    maxLength={50}
                                                    value={form.aciklama}
                                                    onChange={(e) =>
                                                        setForm((f) => ({ ...f, aciklama: e.target.value }))
                                                    }
                                                />
                                            </section>
                                            <section className="col-md-4">
                                                <label className="form-label">İzin Tipi Kodu</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="İzin Tipi Kodu (max 3 karakter)"
                                                    maxLength={3}
                                                    value={form.kod}
                                                    onChange={(e) =>
                                                        setForm((f) => ({
                                                            ...f,
                                                            kod: e.target.value.toUpperCase(),
                                                        }))
                                                    }
                                                />
                                            </section>
                                            <section className="col-md-4">
                                                <label className="form-label">İzin Türü</label>
                                                <select
                                                    className="form-control"
                                                    value={form.ucretli ? 'true' : 'false'}
                                                    onChange={(e) =>
                                                        setForm((f) => ({
                                                            ...f,
                                                            ucretli: e.target.value === 'true',
                                                        }))
                                                    }
                                                >
                                                    <option value="true">Ücretli</option>
                                                    <option value="false">Ücretsiz</option>
                                                </select>
                                            </section>
                                        </div>
                                    </fieldset>
                                    <footer className="mt-3">
                                        <button
                                            type="button"
                                            className="btn btn-success"
                                            onClick={kaydet}
                                            disabled={saving}
                                        >
                                            <i className="icon-floppy-disk"></i> Kaydet
                                        </button>
                                    </footer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 mt-3">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0">Kayıtlı İzin Tipleri</h6>
                            </div>
                            <div className="card-body p-0">
                                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                                    <table className="table table-sm table-striped mb-0">
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Aciklama</th>
                                                <th>Kod</th>
                                                <th>Ücretli</th>
                                                <th style={{ width: 90 }}>İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {liste.map((item) => {
                                                const iid = item.id ?? item.Id;
                                                const acik = item.aciklama ?? item.Aciklama ?? '-';
                                                const kod = item.kod ?? item.Kod ?? '-';
                                                const ucr =
                                                    item.ucretli ?? item.Ucretli ? 'Evet' : 'Hayır';
                                                return (
                                                    <tr key={iid}>
                                                        <td>{iid}</td>
                                                        <td>{acik}</td>
                                                        <td>{kod}</td>
                                                        <td>{ucr}</td>
                                                        <td>
                                                            <span
                                                                className="d-inline-flex align-items-center"
                                                                style={{ gap: 4 }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-primary py-0 px-1"
                                                                    title="Görüntüle"
                                                                    onClick={() => detayAc(iid)}
                                                                >
                                                                    <i className="icon-eye"></i>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-danger py-0 px-1"
                                                                    title="Sil"
                                                                    onClick={() => sil(iid, acik)}
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
                </div>
            </div>

            <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg">
                <ModalHeader toggle={() => setModalOpen(false)}>
                    <i className="icon-edit me-2"></i>
                    İzin Tipi Düzenle
                </ModalHeader>
                <ModalBody>
                    <div className="smart-form">
                        <fieldset>
                            <div className="row">
                                <section className="col-md-12">
                                    <label className="form-label">İzin Tipi</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="İzin Tipi"
                                        maxLength={50}
                                        value={form.aciklama}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, aciklama: e.target.value }))
                                        }
                                    />
                                </section>
                                <section className="col-md-12 mt-2">
                                    <label className="form-label">İzin Tipi Kodu</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="İzin Tipi Kodu (max 3 karakter)"
                                        maxLength={3}
                                        value={form.kod}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                kod: e.target.value.toUpperCase(),
                                            }))
                                        }
                                    />
                                </section>
                                <section className="col-md-12 mt-2">
                                    <label className="form-label">Türü</label>
                                    <select
                                        className="form-control"
                                        value={form.ucretli ? 'true' : 'false'}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                ucretli: e.target.value === 'true',
                                            }))
                                        }
                                    >
                                        <option value="true">Ücretli</option>
                                        <option value="false">Ücretsiz</option>
                                    </select>
                                </section>
                            </div>
                        </fieldset>
                        <footer className="mt-3">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={modalGuncelle}
                                disabled={modalSaving}
                            >
                                <i className="icon-floppy-disk"></i> Güncelle
                            </button>
                        </footer>
                    </div>
                </ModalBody>
            </Modal>
        </Layout>
    );
}
