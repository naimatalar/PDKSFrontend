import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import DataTable from '../../../components/datatable';
import { Modal, ModalBody } from 'reactstrap';
import AppModalHeader from '../../../components/AppModalHeader';
import { GetWithToken } from '../../api/crud';
import { toast } from 'react-toastify';

const formatTarihSaat = (val) => {
    if (!val) return '-';
    try {
        return new Date(val).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
        return val;
    }
};

export default function IcerdekiZiyaretcilerPage() {
    const [refreshKey, setRefreshKey] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailItem, setDetailItem] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const loadDetail = useCallback(async (id) => {
        const ziyaretciId = (typeof id === 'object' && id !== null) ? (id?.id ?? id?.Id) : id;
        // if (!ziyaretciId) {
        //     toast.warning('Ziyaretçi ID bulunamadı.');
        //     return;
        // }
        setDetailLoading(true);
        setDetailItem(null);
        setDetailModalOpen(true);
        try {
            const res = await GetWithToken('Ziyaretci/GetById', { id: ziyaretciId });
            if (!res?.data) {
                toast.error('Ziyaretçi bilgisi alınamadı.');
                setDetailModalOpen(false);
                return;
            }
            const data = res.data.data ?? res.data;
            setDetailItem(data);
        } catch (e) {
            toast.error('Ziyaretçi bilgisi yüklenemedi.');
            setDetailModalOpen(false);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const handleCloseDetail = () => {
        setDetailModalOpen(false);
        setDetailItem(null);
    };

    const headers = [
        ['id', 'ID'],
        ['kimlikNo', 'Kimlik No'],
        ['ad', 'Ad'],
        ['soyad', 'Soyad'],
        ['kimlikTuru', 'Kimlik Türü'],
        ['firma', 'Firma'],
        ['geldigiBolum', 'Geldiği Bölüm'],
        ['geldigiKisi', 'Geldiği Kişi'],
        ['telefon', 'Telefon'],
        {
            header: 'Giriş Zamanı',
            dynamicButton: (item) => formatTarihSaat(item?.giris),
        },
        ['girisSaat', 'Giriş Saat'],
        ['kartAdi', 'Kart Adı'],
        {
            header: 'GRN',
            dynamicButton: (item) => {
                const id = item?.id ?? item?.Id;
                return (
                    <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); loadDetail(id); }}
                        title="Ziyaretçi Görüntüle"
                    >
                        <span className="fa fa-eye" />
                    </button>
                );
            },
        },
    ];

    return (
        <Layout>
            <PageHeader
                title="Ziyaretçi Yönetimi"
                map={[
                    { url: 'ziyaret-yonetimi', name: 'Ziyaretçi Yönetimi' },
                    { url: 'ziyaret-yonetimi/icerdeki-ziyaretciler', name: 'İçerideki Ziyaretçiler' },
                ]}
            />
            <div className="content p-4">
                <div className="mb-3 d-flex gap-2">
                    <Link href="/ziyaret-yonetimi/tum-ziyaretciler">
                        <a className="btn btn-outline-primary btn-sm">
                            <i className="fa fa-users me-1" /> Tüm Ziyaretçiler
                        </a>
                    </Link>
                </div>
                <div className="card">
                    <div className="card-body p-0">
                        <DataTable
                            Refresh={refreshKey}
                            DataUrl="Ziyaretci/GetIceridekiZiyaretciler"
                            Headers={headers}
                            Title="İçerideki Ziyaretçiler"
                            Description="Şu an içeride olan (çıkış yapmamış) ziyaretçileri listeler."
                            HeaderButton={{ text: 'Yeni Ziyaretçi Ekle', action: () => (window.location.href = '/ziyaret-yonetimi/yeni-ziyaretci') }}
                            HideButtons
                            NoDataPlaceholder="İçeride ziyaretçi bulunmuyor."
                        />
                    </div>
                </div>
            </div>

            <Modal isOpen={detailModalOpen} toggle={handleCloseDetail} size="lg" centered>
                <AppModalHeader toggle={handleCloseDetail}>Ziyaretçi Görüntüle</AppModalHeader>
                <ModalBody>
                    {detailLoading && (
                        <div className="text-center py-4">
                            <span className="spinner-border text-primary" />
                        </div>
                    )}
                    {!detailLoading && detailItem && (
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label text-muted small">Ad Soyad</label>
                                <p className="mb-0 fw-semibold">
                                    {[detailItem.ad, detailItem.soyad].filter(Boolean).join(' ') || '-'}
                                </p>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label text-muted small">Kimlik No</label>
                                <p className="mb-0">{detailItem.kimlikNo || '-'}</p>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label text-muted small">Kimlik Türü</label>
                                <p className="mb-0">{detailItem.kimlikTuru || '-'}</p>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label text-muted small">Telefon</label>
                                <p className="mb-0">{detailItem.telefon || '-'}</p>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label text-muted small">Firma</label>
                                <p className="mb-0">{detailItem.firma || '-'}</p>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label text-muted small">Geldiği Kişi</label>
                                <p className="mb-0">{detailItem.kime || '-'}</p>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label text-muted small">Giriş</label>
                                <p className="mb-0">{formatTarihSaat(detailItem.giris)}</p>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label text-muted small">Çıkış</label>
                                <p className="mb-0">{formatTarihSaat(detailItem.cikis)}</p>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label text-muted small">Plaka</label>
                                <p className="mb-0">{detailItem.plaka || '-'}</p>
                            </div>
                            <div className="col-12">
                                <label className="form-label text-muted small">Ziyaret Nedeni</label>
                                <p className="mb-0">{detailItem.ziyaretNedeni || '-'}</p>
                            </div>
                        </div>
                    )}
                </ModalBody>
            </Modal>
        </Layout>
    );
}
