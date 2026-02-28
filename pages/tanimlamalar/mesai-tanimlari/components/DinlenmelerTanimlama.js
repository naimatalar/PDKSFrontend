import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import AlertFunction from '../../../../components/alertfunction';
import PageLoading from '../../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../../api/crud';
import { confirmAlert } from 'react-confirm-alert';

const dakikayiSaateCevir = (dakika) => {
    if (dakika == null || dakika === undefined) return '00:00';
    let d = Number(dakika);
    if (d > 1440) d = d - 1440;
    if (d < 0) d = 0;
    const saat = Math.floor(d / 60);
    const dk = d % 60;
    return `${String(saat).padStart(2, '0')}:${String(dk).padStart(2, '0')}`;
};

const saatiDakikayaCevir = (str) => {
    if (!str || typeof str !== 'string') return 0;
    const p = str.trim().split(':');
    if (p.length >= 2) return parseInt(p[0], 10) * 60 + (parseInt(p[1], 10) || 0);
    return parseInt(str, 10) || 0;
};

const timeControl = (e) => {
    const v = e.target.value;
    const last = v.slice(-1);
    if (v.length >= 1 && !/[\d:]/.test(last)) {
        e.target.value = v.slice(0, -1);
    }
};

export default function DinlenmelerTanimlama() {
    const [loading, setLoading] = useState(true);
    const [liste, setListe] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [saving, setSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [modalSaving, setModalSaving] = useState(false);

    const [form, setForm] = useState({
        aciklama: '',
        duzensiz: false,
        fazlaMesai: false,
        sure: 0,
        limit: 0,
        baslangic: '00:00',
        bitis: '00:00',
    });

    const yukle = async () => {
        try {
            const res = await GetWithToken('Dinlenmeler/GetAll', { PageNumber: 0, PageSize: 500 });
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
            duzensiz: false,
            fazlaMesai: false,
            sure: 0,
            limit: 0,
            baslangic: '00:00',
            bitis: '00:00',
        });
    };

    const kaydet = async () => {
        if (!form.aciklama?.trim()) {
            AlertFunction('Hata', 'Dinlenme Adı giriniz');
            return;
        }
        const baslama = saatiDakikayaCevir(form.baslangic);
        const bitis = saatiDakikayaCevir(form.bitis);
        const sure = form.duzensiz
            ? (Number(form.sure) || 0)
            : Math.max(0, bitis - baslama);
        setSaving(true);
        try {
            const res = await PostWithToken('Dinlenmeler/Create', {
                Aciklama: form.aciklama.trim(),
                Duzensiz: form.duzensiz,
                FazlaMesai: form.fazlaMesai,
                Sure: sure,
                Limit: Number(form.limit) || 0,
                Baslama: baslama,
                Bitis: bitis,
                Bastolerans: 0,
                Bittolerans: 0,
            });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setRefreshKey((k) => k + 1);
            temizle();
            AlertFunction('Başarılı', 'Dinlenme kaydı başarıyla gerçekleştirildi');
        } catch (e) {
            AlertFunction('Hata', e?.response?.data?.message || 'Kaydetme hatası');
        } finally {
            setSaving(false);
        }
    };

    const detayAc = async (id) => {
        try {
            const res = await GetWithToken('Dinlenmeler/GetById', { id });
            const d = res?.data?.data;
            if (!d) {
                AlertFunction('Hata', 'Detay yüklenemedi');
                return;
            }
            setEditId(id);
            setForm({
                aciklama: d.aciklama ?? d.Aciklama ?? '',
                duzensiz: d.duzensiz ?? d.Duzensiz ?? false,
                fazlaMesai: d.fazlaMesai ?? d.FazlaMesai ?? false,
                sure: d.sure ?? d.Sure ?? 0,
                limit: d.limit ?? d.Limit ?? 0,
                baslangic: dakikayiSaateCevir(d.baslama ?? d.Baslama),
                bitis: dakikayiSaateCevir(d.bitis ?? d.Bitis),
            });
            setModalOpen(true);
        } catch (e) {
            AlertFunction('Hata', 'Detay yüklenemedi');
        }
    };

    const modalGuncelle = async () => {
        if (!editId) return;
        if (!form.aciklama?.trim()) {
            AlertFunction('Hata', 'Dinlenme Adı giriniz');
            return;
        }
        const baslama = saatiDakikayaCevir(form.baslangic);
        const bitis = saatiDakikayaCevir(form.bitis);
        const sure = form.duzensiz
            ? (Number(form.sure) || 0)
            : Math.max(0, bitis - baslama);
        setModalSaving(true);
        try {
            const res = await PostWithToken('Dinlenmeler/Update', {
                Id: editId,
                Aciklama: form.aciklama.trim(),
                Duzensiz: form.duzensiz,
                FazlaMesai: form.fazlaMesai,
                Sure: sure,
                Limit: Number(form.limit) || 0,
                Baslama: baslama,
                Bitis: bitis,
                Bastolerans: 0,
                Bittolerans: 0,
            });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setRefreshKey((k) => k + 1);
            setModalOpen(false);
            AlertFunction('Başarılı', 'Dinlenme kaydı başarıyla güncellendi');
        } catch (e) {
            AlertFunction('Hata', e?.response?.data?.message || 'Güncelleme hatası');
        } finally {
            setModalSaving(false);
        }
    };

    const sil = (id, aciklama) => {
        confirmAlert({
            title: 'Uyarı',
            message: `"${aciklama}" dinlenmesini silmek istediğinizden emin misiniz?`,
            buttons: [
                { label: 'Hayır', onClick: () => {} },
                {
                    label: 'Evet',
                    onClick: async () => {
                        try {
                            const res = await PostWithToken('Dinlenmeler/Delete', { Id: id });
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
        <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h6 className="mb-0">Dinlenmeler</h6>
                    </div>
                    <div className="card-body">
                        <div className="smart-form">
                            <fieldset>
                                <div className="row">
                                    <section className="col-md-4">
                                        <label className="form-label">Dinlenme Adı</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Dinlenme Adı"
                                            maxLength={50}
                                            value={form.aciklama}
                                            onChange={(e) => setForm((f) => ({ ...f, aciklama: e.target.value }))}
                                        />
                                    </section>
                                    <section className="col-md-4">
                                        <label className="form-label">Dinlenme Türü</label>
                                        <select
                                            className="form-control"
                                            value={form.duzensiz ? 'true' : 'false'}
                                            onChange={(e) =>
                                                setForm((f) => ({ ...f, duzensiz: e.target.value === 'true' }))
                                            }
                                        >
                                            <option value="false">Düzenli</option>
                                            <option value="true">Düzensiz</option>
                                        </select>
                                    </section>
                                    <section className="col-md-4">
                                        <label className="form-label">Mesai Türü</label>
                                        <select
                                            className="form-control"
                                            value={form.fazlaMesai ? 'true' : 'false'}
                                            onChange={(e) =>
                                                setForm((f) => ({ ...f, fazlaMesai: e.target.value === 'true' }))
                                            }
                                        >
                                            <option value="false">Normal Mesai</option>
                                            <option value="true">Fazla Mesai</option>
                                        </select>
                                    </section>
                                    {form.duzensiz ? (
                                        <>
                                            <section className="col-md-6 mt-2">
                                                <label className="form-label">Süre (dk)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Süre dk."
                                                    value={form.sure}
                                                    onChange={(e) => {
                                                        const v = e.target.value.replace(/\D/g, '');
                                                        setForm((f) => ({ ...f, sure: v }));
                                                    }}
                                                />
                                            </section>
                                            <section className="col-md-6 mt-2">
                                                <label className="form-label">Limit (dk)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Limit dk."
                                                    value={form.limit}
                                                    onChange={(e) => {
                                                        const v = e.target.value.replace(/\D/g, '');
                                                        setForm((f) => ({ ...f, limit: v }));
                                                    }}
                                                />
                                            </section>
                                        </>
                                    ) : (
                                        <>
                                            <section className="col-md-6 mt-2">
                                                <label className="form-label">Başlangıç Saati</label>
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
                                            <section className="col-md-6 mt-2">
                                                <label className="form-label">Bitiş Saati</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="00:00"
                                                    maxLength={5}
                                                    value={form.bitis}
                                                    onChange={(e) =>
                                                        setForm((f) => ({ ...f, bitis: e.target.value }))
                                                    }
                                                    onKeyUp={timeControl}
                                                />
                                            </section>
                                        </>
                                    )}
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
                        <h6 className="mb-0">Kayıtlı Dinlenmeler</h6>
                    </div>
                    <div className="card-body p-0">
                        <div style={{ maxHeight: 400, overflow: 'auto' }}>
                            <table className="table table-sm table-striped mb-0">
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Aciklama</th>
                                        <th>Tür</th>
                                        <th style={{ width: 90 }}>İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {liste.map((item) => {
                                        const iid = item.id ?? item.Id;
                                        const acik = item.aciklama ?? item.Aciklama ?? '-';
                                        const duz = item.duzensiz ?? item.Duzensiz ? 'Düzensiz' : 'Düzenli';
                                        const fm = item.fazlaMesai ?? item.FazlaMesai ? 'FM' : 'NM';
                                        return (
                                            <tr key={iid}>
                                                <td>{iid}</td>
                                                <td>{acik}</td>
                                                <td>
                                                    {duz} / {fm}
                                                </td>
                                                <td>
                                                    <span className="d-inline-flex align-items-center" style={{ gap: 4 }}>
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

            <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg">
                <ModalHeader toggle={() => setModalOpen(false)}>
                    <i className="icon-edit me-2"></i>
                    Dinlenme Düzenle
                </ModalHeader>
                <ModalBody>
                    <div className="smart-form">
                        <fieldset>
                            <div className="row">
                                <section className="col-md-4">
                                    <label className="form-label">Dinlenme Adı</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Dinlenme Adı"
                                        maxLength={50}
                                        value={form.aciklama}
                                        onChange={(e) => setForm((f) => ({ ...f, aciklama: e.target.value }))}
                                    />
                                </section>
                                <section className="col-md-4">
                                    <label className="form-label">Dinlenme Türü</label>
                                    <select
                                        className="form-control"
                                        value={form.duzensiz ? 'true' : 'false'}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, duzensiz: e.target.value === 'true' }))
                                        }
                                    >
                                        <option value="false">Düzenli</option>
                                        <option value="true">Düzensiz</option>
                                    </select>
                                </section>
                                <section className="col-md-4">
                                    <label className="form-label">Mesai Türü</label>
                                    <select
                                        className="form-control"
                                        value={form.fazlaMesai ? 'true' : 'false'}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, fazlaMesai: e.target.value === 'true' }))
                                        }
                                    >
                                        <option value="false">Normal Mesai</option>
                                        <option value="true">Fazla Mesai</option>
                                    </select>
                                </section>
                                {form.duzensiz ? (
                                    <>
                                        <section className="col-md-6 mt-2">
                                            <label className="form-label">Süre (dk)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Süre dk."
                                                value={form.sure}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(/\D/g, '');
                                                    setForm((f) => ({ ...f, sure: v }));
                                                }}
                                            />
                                        </section>
                                        <section className="col-md-6 mt-2">
                                            <label className="form-label">Limit (dk)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Limit dk."
                                                value={form.limit}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(/\D/g, '');
                                                    setForm((f) => ({ ...f, limit: v }));
                                                }}
                                            />
                                        </section>
                                    </>
                                ) : (
                                    <>
                                        <section className="col-md-6 mt-2">
                                            <label className="form-label">Başlangıç Saati</label>
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
                                        <section className="col-md-6 mt-2">
                                            <label className="form-label">Bitiş Saati</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="00:00"
                                                maxLength={5}
                                                value={form.bitis}
                                                onChange={(e) =>
                                                    setForm((f) => ({ ...f, bitis: e.target.value }))
                                                }
                                                onKeyUp={timeControl}
                                            />
                                        </section>
                                    </>
                                )}
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
        </div>
    );
}
