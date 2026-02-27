import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import AlertFunction from '../../../components/alertfunction';
import PageLoading from '../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../api/crud';

export default function YetkiTipleriIndex() {
    const [loading, setLoading] = useState(true);
    const [liste, setListe] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [saving, setSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [modalSaving, setModalSaving] = useState(false);
    const [yetkiAdi, setYetkiAdi] = useState('');
    const [editYetkiAdi, setEditYetkiAdi] = useState('');

    const yukle = async () => {
        try {
            const res = await GetWithToken('Yetki/GetAll');
            const d = res?.data?.data;
            const list = Array.isArray(d) ? d : Array.isArray(d?.list) ? d.list : Array.isArray(d?.List) ? d.List : [];
            setListe(list);
        } catch (e) {
            setListe([]);
        }
    };

    useEffect(() => {
        setLoading(true);
        yukle().finally(() => setLoading(false));
    }, [refreshKey]);

    const kaydet = async () => {
        if (!yetkiAdi?.trim()) {
            AlertFunction('Hata', 'Yetki adı boş geçilemez.');
            return;
        }
        setSaving(true);
        try {
            const res = await PostWithToken('Yetki/Create', { Aciklama: yetkiAdi.trim() });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setRefreshKey((k) => k + 1);
            setYetkiAdi('');
            AlertFunction('Başarılı', 'Yetki tipi başarıyla kaydedildi.');
        } catch (e) {
            AlertFunction('Hata', e?.response?.data?.message || 'Kaydetme hatası');
        } finally {
            setSaving(false);
        }
    };

    const detayAc = async (id) => {
        try {
            const res = await GetWithToken('Yetki/GetById', { id });
            const d = res?.data?.data;
            if (!d) {
                AlertFunction('Hata', 'Kayıt bulunamadı. Lütfen tekrar deneyiniz.');
                return;
            }
            setEditId(id);
            setEditYetkiAdi(d.aciklama ?? d.Aciklama ?? '');
            setModalOpen(true);
        } catch (e) {
            AlertFunction('Hata', 'Kayıt yüklenemedi.');
        }
    };

    const modalGuncelle = async () => {
        if (!editId) return;
        if (!editYetkiAdi?.trim()) {
            AlertFunction('Hata', 'Yetki adı boş geçilemez.');
            return;
        }
        setModalSaving(true);
        try {
            const res = await PostWithToken('Yetki/Update', {
                Id: editId,
                Aciklama: editYetkiAdi.trim(),
            });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setRefreshKey((k) => k + 1);
            setModalOpen(false);
            AlertFunction('Başarılı', 'Yetki tipi başarıyla güncellendi.');
        } catch (e) {
            AlertFunction('Hata', e?.response?.data?.message || 'Güncelleme hatası');
        } finally {
            setModalSaving(false);
        }
    };

    const modalKapat = () => {
        setModalOpen(false);
        setEditId(null);
        setEditYetkiAdi('');
    };

    if (loading && liste.length === 0) return <PageLoading />;

    return (
        <Layout>
            <PageHeader
                title="Yetki Tipleri"
                map={[
                    { url: 'yonetimsel-araclar', name: 'Yönetimsel Araçlar' },
                    { url: 'yonetimsel-araclar/tanimlamalar', name: 'Tanımlamalar' },
                    { url: 'tanimlamalar/yetki-tipleri', name: 'Yetki Tipleri' },
                ]}
            />
            <div className="content pr-3 pl-3">
                <div className="card">
                    <div className="card-header">
                        <h6 className="mb-0">Yetkiler</h6>
                    </div>
                    <div className="card-body">
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <label className="form-label">Yetki</label>
                                <div className="d-flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Yetki adı"
                                        maxLength={90}
                                        value={yetkiAdi}
                                        onChange={(e) => setYetkiAdi(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && kaydet()}
                                    />
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
                        <div className="table-responsive">
                            <table className="table table-sm table-striped">
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Açıklama</th>
                                        <th style={{ width: 80 }}>İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {liste.map((item) => {
                                        const iid = item.id ?? item.Id;
                                        const aciklama = item.aciklama ?? item.Aciklama ?? '-';
                                        return (
                                            <tr key={iid}>
                                                <td>{iid}</td>
                                                <td>{aciklama}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-info py-0 px-1"
                                                        title="Yetki Görüntüle"
                                                        onClick={() => detayAc(iid)}
                                                    >
                                                        <i className="icon-eye"></i>
                                                    </button>
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

            <Modal isOpen={modalOpen} toggle={modalKapat} size="md">
                <ModalHeader toggle={modalKapat}>Yetki Tipi Güncelle</ModalHeader>
                <ModalBody>
                    <div className="mb-3">
                        <label className="form-label">Yetki</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Yetki adı"
                            maxLength={90}
                            value={editYetkiAdi}
                            onChange={(e) => setEditYetkiAdi(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={modalGuncelle}
                        disabled={modalSaving}
                    >
                        <i className="icon-floppy-disk"></i> Güncelle
                    </button>
                </ModalBody>
            </Modal>
        </Layout>
    );
}
