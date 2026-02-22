import React, { useEffect, useState } from 'react';
import Layout from '../../layout/layout';
import PageHeader from '../../layout/pageheader';
import DataTable from '../../components/datatable';
import AppModalHeader from '../../components/AppModalHeader';
import { GetWithToken } from '../api/crud';
import { Modal, ModalBody } from 'reactstrap';
import styles from './monitor.module.css';

export default function MonitorIndex() {
    const [refresh, setRefresh] = useState(null);
    const [activeTab, setActiveTab] = useState('instant10');
    const [instantList, setInstantList] = useState([]);
    const [instantLoading, setInstantLoading] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false);

    const toggleDetail = () => setDetailOpen(!detailOpen);
    const togglePhotoPreview = () => setPhotoPreviewOpen(!photoPreviewOpen);

    const formatTarih = (val) => {
        if (!val) return '-';
        try {
            const d = new Date(val);
            return d.toLocaleString('tr-TR');
        } catch {
            return val;
        }
    };

    const openDetail = async (row) => {
        if (!row?.id) return;
        setDetailOpen(true);
        setDetailLoading(true);
        setDetailData(null);
        try {
            const res = await GetWithToken('DahuaAccess/EventDetail', { id: row.id });
            setDetailData(res?.data?.data || null);
        } catch (e) {
            setDetailData(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const loadInstant10 = async () => {
        setInstantLoading(true);
        try {
            const res = await GetWithToken('DahuaAccess/InstantLast10');
            setInstantList(res?.data?.data || []);
        } catch {
            setInstantList([]);
        } finally {
            setInstantLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'instant10') {
            loadInstant10();
        }
    }, [activeTab, refresh]);

    const DetailRow = ({ label, value }) => (
        <div className="col-12 col-md-6 mb-2">
            <div className={styles.detailItem}>
                <div className={styles.detailLabel}>{label}</div>
                <div className={styles.detailValue}>{value || '-'}</div>
            </div>
        </div>
    );

    return (
        <Layout>
            <PageHeader
                title="Monitor"
                map={[{ url: 'monitor', name: 'Monitor' }]}
            />
            <div className="content pr-3 pl-3">
                <div className="card">
                    <div className="card-header bg-transparent border-0 pb-0">
                        <ul className="nav nav-tabs nav-tabs-bottom mb-0">
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${activeTab === 'instant10' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('instant10')}
                                >
                                    Anlık 10 Kayıt
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${activeTab === 'detailed' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('detailed')}
                                >
                                    Anlık Detaylı Tablo
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="card-body pt-2">
                        {activeTab === 'instant10' && (
                            <div className={styles.instantListWrap}>
                                <div className={styles.instantListHeader}>
                                    <h6 className="mb-0">Anlık 10 Kayıt</h6>
                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setRefresh(new Date())}>
                                        Yenile
                                    </button>
                                </div>
                                {instantLoading && (
                                    <div className={styles.loadingWrap}>
                                        <div className="spinner-border text-primary" role="status" />
                                    </div>
                                )}
                                {!instantLoading && instantList.length === 0 && (
                                    <div className="alert alert-light border mb-0">Henüz kayıt yok.</div>
                                )}
                                {!instantLoading && instantList.length > 0 && (
                                    <div className={styles.instantList}>
                                        {instantList.map((item) => (
                                            <div key={item.id} className={styles.instantItem}>
                                                <div className={styles.instantPhoto}>
                                                    {item?.photoBase64 ? (
                                                        <img
                                                            src={`data:image/jpeg;base64,${item.photoBase64}`}
                                                            alt="Personel"
                                                            className={styles.instantPhotoImg}
                                                        />
                                                    ) : (
                                                        <i className="icon-user text-muted" />
                                                    )}
                                                </div>
                                                <div className={styles.instantMeta}>
                                                    <div className={styles.instantName}>{item?.personName || '-'}</div>
                                                    <div className={styles.instantSub}>{formatTarih(item?.eventtime)}</div>
                                                    <div className={styles.instantDesc}>{item?.eventCodeDesc || item?.description || '-'}</div>
                                                </div>
                                                <div className={styles.instantActions}>
                                                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openDetail(item)}>
                                                        İncele
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'detailed' && (
                            <DataTable
                                Refresh={refresh}
                                DataUrl="DahuaAccess/RecentEvents"
                                Data={null}
                                Pagination={{ pageNumber: 1, pageSize: 20 }}
                                UseGetPagination
                                Headers={[
                                    ['terminalName', 'Terminal'],
                                    ['personName', 'Personel'],
                                    ['userId', 'User ID'],
                                    ['eventCode', 'Event Kodu'],
                                    { header: 'Tarih/Saat', dynamicButton: (item) => formatTarih(item.eventtime) },
                                    { header: 'Event Açıklaması', dynamicButton: (item) => item?.eventCodeDesc || item?.description || '-' },
                                    { header: 'İncele', text: 'İncele', onClick: (item) => openDetail(item) },
                                ]}
                                Title="Anlık Detaylı Tablo"
                                Description="Dahua terminallerinden gelen kart okutma olaylarının detaylı görünümü."
                                HeaderButton={{ text: 'Yenile', action: () => setRefresh(new Date()) }}
                                HideButtons
                                NoDataPlaceholder="Henüz kayıt yok."
                            />
                        )}
                    </div>
                </div>
            </div>
            <Modal isOpen={detailOpen} toggle={toggleDetail} size="xl" className={styles.detailModal}>
                <AppModalHeader toggle={toggleDetail}>Kayıt Detayı</AppModalHeader>
                <ModalBody>
                    {detailLoading && (
                        <div className={styles.loadingWrap}>
                            <div className="spinner-border text-primary" role="status" />
                        </div>
                    )}
                    {!detailLoading && !detailData && (
                        <div className="alert alert-warning mb-0">Detay bilgisi alınamadı.</div>
                    )}
                    {!detailLoading && detailData && (
                        <div className={`container-fluid px-0 ${styles.detailContent}`}>
                            <div className={`mb-3 ${styles.heroSection}`}>
                                <div className={styles.heroLayout}>
                                    <div className={styles.avatarColumn}>
                                        <div className={styles.avatarBox}>
                                            {detailData?.person?.photoBase64 ? (
                                                <img
                                                    src={`data:image/jpeg;base64,${detailData.person.photoBase64}`}
                                                    alt="Personel"
                                                    className={styles.avatarImg}
                                                />
                                            ) : (
                                                <i className="icon-user fs-2 text-muted" />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className={styles.photoZoomButton}
                                            onClick={togglePhotoPreview}
                                            disabled={!detailData?.person?.photoBase64}
                                            title="Fotoğrafı büyüt"
                                        >
                                            <i className="icon-search4" />
                                            <span>Büyüt</span>
                                        </button>
                                    </div>
                                    <div className={styles.heroMeta}>
                                        <h5 className="mb-2">Personel Özeti</h5>
                                        <div className={styles.identityGrid}>
                                            <div className={styles.identityItem}>
                                                <span className={styles.identityLabel}>Ad Soyad</span>
                                                <span className={styles.identityValue}>
                                                    {`${detailData?.person?.ad || ''} ${detailData?.person?.soyad || ''}`.trim() || '-'}
                                                </span>
                                            </div>
                                            <div className={styles.identityItem}>
                                                <span className={styles.identityLabel}>Sicil No</span>
                                                <span className={styles.identityValue}>{detailData?.person?.sicilNo || '-'}</span>
                                            </div>
                                            <div className={styles.identityItem}>
                                                <span className={styles.identityLabel}>User ID</span>
                                                <span className={styles.identityValue}>{detailData?.monitoring?.userId || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h6 className={styles.sectionTitle}>Monitoring Bilgileri</h6>
                            <div className="row mb-3">
                                <DetailRow label="Kayıt ID" value={detailData?.monitoring?.id} />
                                <DetailRow label="Event Kodu" value={detailData?.monitoring?.eventCode} />
                                <DetailRow label="Event Açıklaması" value={detailData?.monitoring?.eventCodeDesc || detailData?.monitoring?.description} />
                                <DetailRow label="Tarih/Saat" value={formatTarih(detailData?.monitoring?.eventtime)} />
                            </div>

                            <h6 className={styles.sectionTitle}>Terminal Bilgileri</h6>
                            <div className="row mb-3">
                                <DetailRow label="Terminal Adı" value={detailData?.terminal?.name} />
                                <DetailRow label="Port" value={detailData?.terminal?.port} />
                                <DetailRow label="Model" value={detailData?.terminal?.model} />
                                <DetailRow label="Controller No" value={detailData?.terminal?.controllerNo} />
                                <DetailRow label="IO" value={detailData?.terminal?.io} />
                                <DetailRow label="Function" value={detailData?.terminal?.function} />
                            </div>

                            <h6 className={styles.sectionTitle}>Personel Bilgileri</h6>
                            <div className="row">
                                <DetailRow label="Personel No" value={detailData?.person?.personelNo} />
                                <DetailRow label="Telefon" value={detailData?.person?.telefon1} />
                                <DetailRow label="Cep Telefonu" value={detailData?.person?.cepTelefon} />
                                <DetailRow label="E-posta" value={detailData?.person?.email} />
                                <DetailRow label="Adres" value={detailData?.person?.adres} />
                                <DetailRow label="İl / İlçe" value={`${detailData?.person?.il || '-'} / ${detailData?.person?.ilce || '-'}`} />
                            </div>
                        </div>
                    )}
                </ModalBody>
            </Modal>
            <Modal isOpen={photoPreviewOpen} toggle={togglePhotoPreview} size="xl" centered className={styles.photoPreviewModal}>
                <ModalBody className={styles.photoPreviewBody}>
                    {detailData?.person?.photoBase64 ? (
                        <img
                            src={`data:image/jpeg;base64,${detailData.person.photoBase64}`}
                            alt="Personel büyük önizleme"
                            className={styles.photoPreviewImage}
                        />
                    ) : (
                        <div className="text-muted">Fotoğraf bulunamadı.</div>
                    )}
                </ModalBody>
            </Modal>
        </Layout>
    );
}
