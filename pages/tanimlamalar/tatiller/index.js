import React, { useEffect, useState } from 'react';
import { Modal, ModalBody } from 'reactstrap';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import AlertFunction from '../../../components/alertfunction';
import PageLoading from '../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../api/crud';
import { confirmAlert } from 'react-confirm-alert';
import AppModalHeader from '../../../components/AppModalHeader';

const saatiDakikayaCevir = (str) => {
    if (!str || typeof str !== 'string') return 0;
    const p = str.trim().split(':');
    if (p.length >= 2) return parseInt(p[0], 10) * 60 + (parseInt(p[1], 10) || 0);
    return parseInt(str, 10) || 0;
};

const dakikayiSaateCevir = (dakika) => {
    if (dakika == null || dakika === undefined) return '00:00';
    let d = Number(dakika);
    if (d < 0) d = 0;
    if (d >= 1440) d = d % 1440;
    const saat = Math.floor(d / 60);
    const dk = d % 60;
    return `${String(saat).padStart(2, '0')}:${String(dk).padStart(2, '0')}`;
};

const timeControl = (e) => {
    const v = e.target.value;
    const last = v.slice(-1);
    if (v.length >= 1 && !/[\d:]/.test(last)) {
        e.target.value = v.slice(0, -1);
    }
};

export default function TatillerIndex() {
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
        sabitTatil: true,
        tamgun: true,
        baslangic: '00:00',
        mesaiYuzdesi: '',
    });

    const yukle = async () => {
        try {
            const res = await GetWithToken('TatilTipleri/GetAll', { PageNumber: 0, PageSize: 500 });
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
            sabitTatil: true,
            tamgun: true,
            baslangic: '00:00',
            mesaiYuzdesi: '',
        });
    };

    const kaydet = async () => {
        if (!form.aciklama?.trim()) {
            AlertFunction('Hata', 'Tatil Tipi giriniz');
            return;
        }
        if (!form.kod?.trim()) {
            AlertFunction('Hata', 'Tatil Tipi Kodu giriniz');
            return;
        }
        const bassaat = saatiDakikayaCevir(form.baslangic);
        setSaving(true);
        try {
            const payload = {
                Aciklama: form.aciklama.trim(),
                Kod: form.kod.trim(),
                SabitTatil: form.sabitTatil,
                Tamgun: form.tamgun,
                Bassaat: bassaat,
                TatilYuzdesi: parseInt(form.mesaiYuzdesi, 10) || 0,
            };
            const res = await PostWithToken('TatilTipleri/Create', payload);
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setRefreshKey((k) => k + 1);
            temizle();
            AlertFunction('Başarılı', 'Tatil tipi kaydı başarıyla gerçekleştirildi');
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
            const res = await GetWithToken('TatilTipleri/GetById', { id });
            const d = res?.data?.data;
            if (!d) {
                AlertFunction('Hata', 'Detay yüklenemedi');
                return;
            }
            setEditId(id);
            setForm({
                aciklama: d.aciklama ?? d.Aciklama ?? '',
                kod: d.kod ?? d.Kod ?? '',
                sabitTatil: d.sabitTatil ?? d.SabitTatil ?? true,
                tamgun: d.tamgun ?? d.Tamgun ?? true,
                baslangic: dakikayiSaateCevir(d.bassaat ?? d.Bassaat),
                mesaiYuzdesi: String(d.tatilYuzdesi ?? d.TatilYuzdesi ?? ''),
            });
            setModalOpen(true);
        } catch (e) {
            AlertFunction('Hata', 'Detay yüklenemedi');
        }
    };

    const modalGuncelle = async () => {
        if (!editId) return;
        if (!form.aciklama?.trim()) {
            AlertFunction('Hata', 'Tatil Tipi giriniz');
            return;
        }
        if (!form.kod?.trim()) {
            AlertFunction('Hata', 'Tatil Tipi Kodu giriniz');
            return;
        }
        const bassaat = saatiDakikayaCevir(form.baslangic);
        setModalSaving(true);
        try {
            const res = await PostWithToken('TatilTipleri/Update', {
                Id: editId,
                Aciklama: form.aciklama.trim(),
                Kod: form.kod.trim(),
                SabitTatil: form.sabitTatil,
                Tamgun: form.tamgun,
                Bassaat: bassaat,
                TatilYuzdesi: parseInt(form.mesaiYuzdesi, 10) || 0,
            });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setRefreshKey((k) => k + 1);
            setModalOpen(false);
            AlertFunction('Başarılı', 'Tatil tipi kaydı başarıyla güncellendi');
        } catch (e) {
            AlertFunction('Hata', e?.response?.data?.message || 'Güncelleme hatası');
        } finally {
            setModalSaving(false);
        }
    };

    const sil = (id, aciklama) => {
        confirmAlert({
            title: 'Uyarı',
            message: `"${aciklama}" tatil tipini silmek istediğinizden emin misiniz? Bu tatil tipine ait tatil kayıtları varsa silme işlemi yapılamaz.`,
            buttons: [
                { label: 'Hayır', onClick: () => {} },
                {
                    label: 'Evet',
                    onClick: async () => {
                        try {
                            const res = await PostWithToken('TatilTipleri/Delete', { Id: id });
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
                title="Tatil Tipleri"
                map={[
                    { url: 'yonetimsel-araclar', name: 'Yönetimsel Araçlar' },
                    { url: 'yonetimsel-araclar/tanimlamalar', name: 'Tanımlamalar' },
                    { url: 'tanimlamalar/tatiller', name: 'Tatiller' },
                ]}
            />
            <div className="content pr-3 pl-3">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0">Tatil Tipleri</h6>
                            </div>
                            <div className="card-body">
                                <div className="smart-form">
                                    <fieldset>
                                        <div className="row">
                                            <section className="col-md-6">
                                                <label className="form-label">Tatil Tipi</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Tatil Tipi"
                                                    maxLength={50}
                                                    value={form.aciklama}
                                                    onChange={(e) =>
                                                        setForm((f) => ({ ...f, aciklama: e.target.value }))
                                                    }
                                                />
                                            </section>
                                            <section className="col-md-6">
                                                <label className="form-label">Tatil Tipi Kodu</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Tatil Tipi Kodu"
                                                    maxLength={50}
                                                    value={form.kod}
                                                    onChange={(e) =>
                                                        setForm((f) => ({ ...f, kod: e.target.value }))
                                                    }
                                                />
                                            </section>
                                            <section className="col-md-6">
                                                <label className="form-label">Tatil Türü</label>
                                                <select
                                                    className="form-control"
                                                    value={form.sabitTatil ? '1' : '0'}
                                                    onChange={(e) =>
                                                        setForm((f) => ({
                                                            ...f,
                                                            sabitTatil: e.target.value === '1',
                                                        }))
                                                    }
                                                >
                                                    <option value="1">Sabit Tatil</option>
                                                    <option value="0">Değişken Tatil</option>
                                                </select>
                                            </section>
                                            <section className="col-md-6">
                                                <label className="form-label">Tatil Gün Türü</label>
                                                <select
                                                    className="form-control"
                                                    value={form.tamgun ? '1' : '0'}
                                                    onChange={(e) =>
                                                        setForm((f) => ({
                                                            ...f,
                                                            tamgun: e.target.value === '1',
                                                        }))
                                                    }
                                                >
                                                    <option value="1">Tam Gün</option>
                                                    <option value="0">Yarım Gün</option>
                                                </select>
                                            </section>
                                            <section className="col-md-6">
                                                <label className="form-label">Tatil Başlangıcı</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="00:00"
                                                    maxLength={5}
                                                    value={form.baslangic}
                                                    onChange={(e) =>
                                                        setForm((f) => ({ ...f, baslangic: e.target.value }))
                                                    }
                                                    onKeyUp={timeControl}
                                                />
                                            </section>
                                            <section className="col-md-6">
                                                <label className="form-label">Mesai Yüzdesi %</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Mesai Yüzdesi %"
                                                    maxLength={3}
                                                    value={form.mesaiYuzdesi}
                                                    onChange={(e) => {
                                                        const v = e.target.value.replace(/\D/g, '');
                                                        setForm((f) => ({ ...f, mesaiYuzdesi: v }));
                                                    }}
                                                />
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
                                <h6 className="mb-0">Kayıtlı Tatil Tipleri</h6>
                            </div>
                            <div className="card-body p-0">
                                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                                    <table className="table table-sm table-striped mb-0">
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Aciklama</th>
                                                <th>Kod</th>
                                                <th style={{ width: 90 }}>İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {liste.map((item) => {
                                                const iid = item.id ?? item.Id;
                                                const acik = item.aciklama ?? item.Aciklama ?? '-';
                                                const kod = item.kod ?? item.Kod ?? '-';
                                                return (
                                                    <tr key={iid}>
                                                        <td>{iid}</td>
                                                        <td>{acik}</td>
                                                        <td>{kod}</td>
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
                <AppModalHeader toggle={() => setModalOpen(false)}>
                    <i className="icon-edit me-2"></i>
                    Tatil Tipi Düzenle
                </AppModalHeader>
                <ModalBody>
                    <div className="smart-form">
                        <fieldset>
                            <div className="row">
                                <section className="col-md-6">
                                    <label className="form-label">Tatil Tipi</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tatil Tipi"
                                        maxLength={50}
                                        value={form.aciklama}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, aciklama: e.target.value }))
                                        }
                                    />
                                </section>
                                <section className="col-md-6">
                                    <label className="form-label">Tatil Tipi Kodu</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tatil Tipi Kodu"
                                        maxLength={50}
                                        value={form.kod}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, kod: e.target.value }))
                                        }
                                    />
                                </section>
                                <section className="col-md-6">
                                    <label className="form-label">Tatil Türü</label>
                                    <select
                                        className="form-control"
                                        value={form.sabitTatil ? '1' : '0'}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                sabitTatil: e.target.value === '1',
                                            }))
                                        }
                                    >
                                        <option value="1">Sabit Tatil</option>
                                        <option value="0">Değişken Tatil</option>
                                    </select>
                                </section>
                                <section className="col-md-6">
                                    <label className="form-label">Tatil Gün Türü</label>
                                    <select
                                        className="form-control"
                                        value={form.tamgun ? '1' : '0'}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                tamgun: e.target.value === '1',
                                            }))
                                        }
                                    >
                                        <option value="1">Tam Gün</option>
                                        <option value="0">Yarım Gün</option>
                                    </select>
                                </section>
                                <section className="col-md-6">
                                    <label className="form-label">Tatil Başlangıcı</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="00:00"
                                        maxLength={5}
                                        value={form.baslangic}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, baslangic: e.target.value }))
                                        }
                                        onKeyUp={timeControl}
                                    />
                                </section>
                                <section className="col-md-6">
                                    <label className="form-label">Mesai Yüzdesi %</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Mesai Yüzdesi %"
                                        maxLength={3}
                                        value={form.mesaiYuzdesi}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/\D/g, '');
                                            setForm((f) => ({ ...f, mesaiYuzdesi: v }));
                                        }}
                                    />
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
