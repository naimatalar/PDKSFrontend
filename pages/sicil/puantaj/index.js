import React, { useEffect, useState } from 'react';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import ReactSelect from 'react-select';
import { GetWithToken } from '../../api/crud';

const formatTarih = (val) => {
    if (!val) return '-';
    try {
        const d = new Date(val);
        return d.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
        return val;
    }
};

const formatSaat = (val) => {
    if (!val) return '-';
    try {
        const d = new Date(val);
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return val;
    }
};

const formatSure = (dakika) => {
    if (dakika == null || dakika === undefined) return '-';
    const h = Math.floor(dakika / 60);
    const m = dakika % 60;
    if (h > 0) return `${h} sa ${m} dk`;
    return `${m} dk`;
};

export default function PuantajIndex() {
    const [sicilList, setSicilList] = useState([]);
    const [selectedSicil, setSelectedSicil] = useState(null);
    const [baslangic, setBaslangic] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [bitis, setBitis] = useState(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSicilList();
    }, []);

    const loadSicilList = async () => {
        try {
            const res = await GetWithToken('Sicil/GetAll', { PageNumber: 1, PageSize: 2000 });
            const list = res?.data?.data?.list || [];
            setSicilList(list.map((x) => ({ value: x.id, label: `${x.ad || ''} ${x.soyad || ''} (${x.personelNo || x.sicilNo || x.id})`.trim() })));
        } catch (e) {
            console.error('Sicil listesi yüklenemedi', e);
        }
    };

    const sorgula = async () => {
        if (!selectedSicil?.value) return;
        setLoading(true);
        try {
            const res = await GetWithToken('Tasnifleme/GetBySicilAndDateRange', {
                sicilId: selectedSicil.value,
                baslangic,
                bitis
            });
            setData(res?.data || null);
        } catch (e) {
            console.error('Puantaj yüklenemedi', e);
            setData(null);
        }
        setLoading(false);
    };

    const list = data?.list || [];

    return (
        <Layout>
            <PageHeader
                title="Puantaj - Giriş Çıkış Detay"
                map={[
                    { url: 'sicil', name: 'Sicil' },
                    { url: 'sicil/puantaj', name: 'Puantaj' }
                ]}
            />
            <div className="content p-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Giriş Çıkış Detay Sorgulama</h5>
                    </div>
                    <div className="card-body">
                        <div className="row align-items-end mb-4">
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Personel (Sicil)</label>
                                <ReactSelect
                                    options={sicilList}
                                    value={selectedSicil}
                                    onChange={setSelectedSicil}
                                    placeholder="Personel seçin..."
                                    isClearable
                                    isSearchable
                                />
                            </div>
                            <div className="col-md-2 mb-2">
                                <label className="form-label">Başlangıç Tarihi</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={baslangic}
                                    onChange={(e) => setBaslangic(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2 mb-2">
                                <label className="form-label">Bitiş Tarihi</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={bitis}
                                    onChange={(e) => setBitis(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2 mb-2">
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={sorgula}
                                    disabled={!selectedSicil?.value || loading}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        <i className="icon-search4" />
                                    )}{' '}
                                    Sorgula
                                </button>
                            </div>
                        </div>

                        {data && (
                            <>
                                <div className="mb-3">
                                    <strong>Personel:</strong> {data.sicilAd} |{' '}
                                    <strong>Tarih Aralığı:</strong> {data.baslangic} - {data.bitis} |{' '}
                                    <strong>Kayıt:</strong> {list.length} adet
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Tarih</th>
                                                <th>Giriş Saati</th>
                                                <th>Çıkış Saati</th>
                                                <th>İçeride Kalma</th>
                                                <th>Normal Mesai</th>
                                                <th>Fazla Mesai</th>
                                                <th>Açıklama</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {list.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center">
                                                        Kayıt bulunamadı.
                                                    </td>
                                                </tr>
                                            ) : (
                                                list.map((row) => (
                                                    <tr key={row.id}>
                                                        <td>
                                                            {row.mesaiTarih
                                                                ? new Date(row.mesaiTarih).toLocaleDateString('tr-TR')
                                                                : new Date(row.giris).toLocaleDateString('tr-TR')}
                                                        </td>
                                                        <td>{formatSaat(row.giris)}</td>
                                                        <td>{formatSaat(row.cikis)}</td>
                                                        <td>{formatSure(row.mesaiSuresi)}</td>
                                                        <td>{formatSure(row.normalMesai)}</td>
                                                        <td>{formatSure(row.fazlaMesai)}</td>
                                                        <td>{row.mesaiAciklama || row.izinTipAd || '-'}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
