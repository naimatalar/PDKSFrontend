import React, { useEffect, useState } from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import AlertFunction from '../../../components/alertfunction';
import PageLoading from '../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../api/crud';
import { confirmAlert } from 'react-confirm-alert';

export default function TerminalGrubuIndex() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('grup');
    const [refreshKey, setRefreshKey] = useState(0);
    const [saving, setSaving] = useState(false);

    const [grupListe, setGrupListe] = useState([]);
    const [terminalListe, setTerminalListe] = useState([]);
    const [detayListe, setDetayListe] = useState([]);
    const [grupAd, setGrupAd] = useState('');
    const [seciliGrupId, setSeciliGrupId] = useState('');
    const [seciliTerminalId, setSeciliTerminalId] = useState('');

    const yukleGruplar = async () => {
        try {
            const res = await GetWithToken('TerminalGroup/GetAll', { PageNumber: 1, PageSize: 500 });
            const d = res?.data?.data;
            const list = Array.isArray(d?.list) ? d.list : Array.isArray(d?.List) ? d.List : Array.isArray(d) ? d : [];
            setGrupListe(list);
            if (list.length > 0 && !seciliGrupId) {
                const firstId = list[0].id ?? list[0].Id ?? '';
                if (firstId !== '' && firstId != null) setSeciliGrupId(String(firstId));
            }
        } catch (e) {
            setGrupListe([]);
        }
    };

    const yukleTerminaller = async () => {
        try {
            const res = await GetWithToken('Terminaller/GetAll', { PageNumber: 1, PageSize: 1000 });
            const d = res?.data?.data;
            const list = Array.isArray(d?.list) ? d.list : Array.isArray(d?.List) ? d.List : Array.isArray(d) ? d : [];
            setTerminalListe(list);
            if (list.length > 0 && !seciliTerminalId) {
                const firstId = list[0].id ?? list[0].Id ?? '';
                if (firstId !== '' && firstId != null) setSeciliTerminalId(String(firstId));
            }
        } catch (e) {
            setTerminalListe([]);
        }
    };

    const yukleDetay = async () => {
        try {
            const res = await GetWithToken('TerminalRelation/GetAll', { PageNumber: 1, PageSize: 500 });
            const d = res?.data?.data;
            const list = Array.isArray(d?.list) ? d.list : Array.isArray(d?.List) ? d.List : Array.isArray(d) ? d : [];
            setDetayListe(list);
        } catch (e) {
            setDetayListe([]);
        }
    };

    const yukle = async () => {
        setLoading(true);
        await Promise.all([yukleGruplar(), yukleTerminaller(), yukleDetay()]);
        setLoading(false);
    };

    useEffect(() => {
        yukle();
    }, [refreshKey]);

    const grupEkle = async () => {
        if (!grupAd?.trim()) {
            AlertFunction('Hata', 'Grup Adı giriniz');
            return;
        }
        setSaving(true);
        try {
            const res = await PostWithToken('TerminalGroup/Create', { Ad: grupAd.trim() });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setRefreshKey((k) => k + 1);
            setGrupAd('');
            AlertFunction('Başarılı', 'Terminal grup kaydı başarıyla gerçekleştirildi');
        } catch (e) {
            AlertFunction('Hata', e?.response?.data?.message || 'Kaydetme hatası');
        } finally {
            setSaving(false);
        }
    };

    const grupSil = (id, ad) => {
        confirmAlert({
            title: 'Emin misiniz?',
            message: `"${ad}" terminal grubu silindiğinde geri alınamaz!`,
            buttons: [
                { label: 'Hayır', onClick: () => {} },
                {
                    label: 'Evet, sil',
                    onClick: async () => {
                        try {
                            const res = await PostWithToken('TerminalGroup/Delete', { Id: id });
                            if (res?.data?.isError) {
                                AlertFunction('Hata', res.data.message);
                                return;
                            }
                            setRefreshKey((k) => k + 1);
                            AlertFunction('Başarılı', 'Terminal grubu silindi');
                        } catch (e) {
                            AlertFunction('Hata', e?.response?.data?.message || 'Silme hatası');
                        }
                    },
                },
            ],
        });
    };

    const detayEkle = async () => {
        const grupId = parseInt(seciliGrupId, 10);
        const terminalId = parseInt(seciliTerminalId, 10);
        if (!seciliGrupId || !seciliTerminalId || seciliGrupId === '0' || seciliTerminalId === '0' ||
            isNaN(grupId) || isNaN(terminalId) || grupId <= 0 || terminalId <= 0) {
            AlertFunction('Hata', 'Grup ve Terminal seçiniz');
            return;
        }
        setSaving(true);
        try {
            const res = await PostWithToken('TerminalRelation/Create', {
                TerminalGrubu: grupId,
                Terminal: terminalId,
            });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setRefreshKey((k) => k + 1);
            AlertFunction('Başarılı', 'Kayıt başarıyla gerçekleştirildi');
        } catch (e) {
            AlertFunction('Hata', e?.response?.data?.message || 'Kaydetme hatası');
        } finally {
            setSaving(false);
        }
    };

    const detaySil = (id) => {
        confirmAlert({
            title: 'Emin misiniz?',
            message: 'Terminal grubu bağlantısı silindiğinde geri alınamaz!',
            buttons: [
                { label: 'Hayır', onClick: () => {} },
                {
                    label: 'Evet, sil',
                    onClick: async () => {
                        try {
                            const res = await PostWithToken('TerminalRelation/Delete', { Id: id });
                            if (res?.data?.isError) {
                                AlertFunction('Hata', res.data.message);
                                return;
                            }
                            setRefreshKey((k) => k + 1);
                            AlertFunction('Başarılı', 'Terminal grubu bağlantısı silindi');
                        } catch (e) {
                            AlertFunction('Hata', e?.response?.data?.message || 'Silme hatası');
                        }
                    },
                },
            ],
        });
    };

    if (loading && grupListe.length === 0) return <PageLoading />;

    return (
        <Layout>
            <PageHeader
                title="Terminal Grubu"
                map={[
                    { url: 'yonetimsel-araclar', name: 'Yönetimsel Araçlar' },
                    { url: 'yonetimsel-araclar/tanimlamalar', name: 'Tanımlamalar' },
                    { url: 'tanimlamalar/terminal-grubu', name: 'Terminal Grubu' },
                ]}
            />
            <div className="content pr-3 pl-3">
                <div className="card">
                    <div className="card-header border-0 p-0">
                        <Nav tabs className="nav-tabs">
                            <NavItem>
                                <NavLink
                                    className={activeTab === 'grup' ? 'active' : ''}
                                    onClick={() => setActiveTab('grup')}
                                >
                                    <i className="fa fa-users me-1"></i> Grup
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={activeTab === 'detay' ? 'active' : ''}
                                    onClick={() => setActiveTab('detay')}
                                >
                                    <i className="fa fa-list me-1"></i> Detay
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </div>
                    <div className="card-body">
                        <TabContent activeTab={activeTab}>
                            <TabPane tabId="grup" className="p-3">
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label">Grup Adı</label>
                                        <div className="d-flex gap-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Grup Adı"
                                                maxLength={49}
                                                value={grupAd}
                                                onChange={(e) => setGrupAd(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && grupEkle()}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={grupEkle}
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
                                                <th>ID</th>
                                                <th>Grup Adı</th>
                                                <th style={{ width: 80 }}>İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {grupListe.map((item) => {
                                                const iid = item.id ?? item.Id;
                                                const ad = item.ad ?? item.Ad ?? '-';
                                                return (
                                                    <tr key={iid}>
                                                        <td>{iid}</td>
                                                        <td>{ad}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-danger py-0 px-1"
                                                                title="Sil"
                                                                onClick={() => grupSil(iid, ad)}
                                                            >
                                                                <i className="icon-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </TabPane>
                            <TabPane tabId="detay" className="p-3">
                                <div className="row mb-4">
                                    <div className="col-md-4">
                                        <label className="form-label">Grup Adı</label>
                                        <select
                                            className="form-control"
                                            value={seciliGrupId}
                                            onChange={(e) => setSeciliGrupId(e.target.value)}
                                        >
                                            <option value="">Seçiniz</option>
                                            {grupListe.map((g) => {
                                                const gid = g.id ?? g.Id ?? '';
                                                return (
                                                    <option key={gid} value={String(gid)}>
                                                        {g.ad ?? g.Ad ?? '-'}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Terminal Adı</label>
                                        <select
                                            className="form-control"
                                            value={seciliTerminalId}
                                            onChange={(e) => setSeciliTerminalId(e.target.value)}
                                        >
                                            <option value="">Seçiniz</option>
                                            {terminalListe.map((t) => {
                                                const tid = t.id ?? t.Id ?? '';
                                                return (
                                                    <option key={tid} value={String(tid)}>
                                                        {t.name ?? t.Name ?? '-'}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="col-md-4 d-flex align-items-end">
                                        <button
                                            type="button"
                                            className="btn btn-success"
                                            onClick={detayEkle}
                                            disabled={saving || !seciliGrupId || !seciliTerminalId}
                                        >
                                            <i className="icon-floppy-disk"></i> Kaydet
                                        </button>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-sm table-striped">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Grup Adı</th>
                                                <th>Terminal Adı</th>
                                                <th style={{ width: 80 }}>İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detayListe.map((item) => {
                                                const iid = item.id ?? item.Id;
                                                const grupAd2 = item.terminalGrubuAd ?? item.TerminalGrubuAd ?? '-';
                                                const termAd = item.terminalAd ?? item.TerminalAd ?? '-';
                                                return (
                                                    <tr key={iid}>
                                                        <td>{iid}</td>
                                                        <td>{grupAd2}</td>
                                                        <td>{termAd}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-danger py-0 px-1"
                                                                title="Sil"
                                                                onClick={() => detaySil(iid)}
                                                            >
                                                                <i className="icon-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </TabPane>
                        </TabContent>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
