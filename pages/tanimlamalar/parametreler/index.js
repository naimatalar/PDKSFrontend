import React, { useEffect, useState } from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane, Collapse, Card, CardBody, CardHeader } from 'reactstrap';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import AlertFunction from '../../../components/alertfunction';
import PageLoading from '../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../api/crud';

const timeControl = (e) => {
    const v = e.target.value;
    const last = v.slice(-1);
    if (v.length >= 1 && !/[\d:.]/.test(last)) {
        e.target.value = v.slice(0, -1);
    }
};

const numberOnly = (e) => {
    const v = e.target.value;
    if (v.length >= 1 && !/^\d*\.?\d*$/.test(v)) {
        e.target.value = v.replace(/\D/g, '');
    }
};

const PARAM_KEYS = {
    geceZammiBaslangic: 'GeceZammiBaslangic',
    geceZammiSonu: 'GeceZammiSonu',
    vardiyaDuzeltmesi: 'VardiyaDuzeltmesi',
    otomatikYuvarlamaModu: 'OtomatikYuvarlamaModu',
    mukerrer: 'Mukerrer',
    maxErkenGiris: 'MaxErkenGiris',
    araYilSonundaIzin: 'AraYilSonundaIzin',
    arakayitIptal: 'ArakayitIptal',
    erkenGiris: 'ErkenGiris',
    gecGiris: 'GecGiris',
    erkenCikis: 'ErkenCikis',
    gecCikis: 'GecCikis',
    sinirlama: 'Sinirlama',
    esZamanliIslem: 'EsZamanliIslem',
    agKesintiErteleme: 'AgKesintiErteleme',
    veriCekme: 'VeriCekme',
    gecisGrubuTime: 'GecisGrubuTime',
    hesaplamaPeriyor: 'HesaplamaPeriyor',
    hesaplamaAktif: 'HesaplamaAktif',
    entegrasyonPeriyot: 'EntegrasyonPeriyot',
    entegrasyonAktif: 'EntegrasyonAktif',
    mailSunucu: 'MailSunucu',
    mailPort: 'MailPort',
    kullaniciAdi: 'KullaniciAdi',
    sifre: 'Sifre',
    cihazErisimMailiSuresi: 'CihazErisimMailiSuresi',
    cihazErisimMaili: 'CihazErisimMaili',
    cekeg: 'CEKEG',
    bolumAmirBasinda: 'BolumAmirBasinda',
    bavbsm: 'BAVBSM',
    bolumAmirSonunda: 'BolumAmirSonunda',
    bavssm: 'BAVSSM',
    mailGonderimi: 'MailGonderimi',
};

const DEFAULT_VALUES = {
    geceZammiBaslangic: '20:00:00',
    geceZammiSonu: '06:00:00',
    vardiyaDuzeltmesi: '23:00',
    otomatikYuvarlamaModu: '1',
    mukerrer: '300',
    maxErkenGiris: '0',
    araYilSonundaIzin: true,
    arakayitIptal: true,
    erkenGiris: '30',
    gecGiris: '30',
    erkenCikis: '30',
    gecCikis: '30',
    sinirlama: '30',
    esZamanliIslem: '1000',
    agKesintiErteleme: '5',
    veriCekme: true,
    gecisGrubuTime: true,
    hesaplamaPeriyor: '1000',
    hesaplamaAktif: true,
    entegrasyonPeriyot: '1000',
    entegrasyonAktif: true,
    mailSunucu: 'mail.varnost.com.tr',
    mailPort: '587',
    kullaniciAdi: 'bilgi@varnost.com.tr',
    sifre: '',
    cihazErisimMailiSuresi: '30',
    cihazErisimMaili: 'destek@varnost.com.tr',
    cekeg: true,
    bolumAmirBasinda: '1000',
    bavbsm: false,
    bolumAmirSonunda: '1000',
    bavssm: false,
    mailGonderimi: true,
};

const parseBool = (v) => v === 'true' || v === '1' || v === true;

export default function ParametrelerIndex() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('AA');
    const [accordion, setAccordion] = useState({ veriCekme: true });
    const [form, setForm] = useState({ ...DEFAULT_VALUES });

    const yukle = async () => {
        try {
            const res = await GetWithToken('Parameter/GetAll', { PageNumber: 1, PageSize: 500 });
            const list = res?.data?.data?.list || res?.data?.data || [];
            const map = {};
            list.forEach((p) => {
                const ad = p.ad ?? p.Ad;
                const deger = p.deger ?? p.Deger ?? '';
                if (ad) {
                    map[ad] = deger;
                    map[ad.toLowerCase()] = deger; // Büyük/küçük harf farkı için
                }
            });
            const next = { ...DEFAULT_VALUES };
            Object.keys(PARAM_KEYS).forEach((k) => {
                const ad = PARAM_KEYS[k];
                const val = map[ad] ?? map[ad.toLowerCase()];
                if (val !== undefined && val !== null) {
                    if (['araYilSonundaIzin', 'arakayitIptal', 'veriCekme', 'gecisGrubuTime', 'hesaplamaAktif', 'entegrasyonAktif', 'cekeg', 'bavbsm', 'bavssm', 'mailGonderimi'].includes(k)) {
                        next[k] = parseBool(val);
                    } else {
                        next[k] = typeof val === 'number' ? String(val) : val; // Sayıyı string yap (0 dahil)
                    }
                }
            });
            setForm(next);
        } catch (e) {
            setForm({ ...DEFAULT_VALUES });
        }
    };

    useEffect(() => {
        setLoading(true);
        yukle().finally(() => setLoading(false));
    }, []);

    const toggleAccordion = (id) => {
        setAccordion((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toDeger = (k, v) => {
        if (typeof v === 'boolean') return v ? 'true' : 'false';
        if (v === 0 || v === '0') return '0'; // 0 değerinin kaybolmaması için
        if (v === null || v === undefined) return '';
        return String(v);
    };

    const guncelle = async () => {
        setSaving(true);
        try {
            const items = Object.keys(PARAM_KEYS)
                .filter((k) => k !== 'sifre' || (form[k] && String(form[k]).trim() !== '')) // Boş şifre gönderme (mevcut şifreyi silmemek için)
                .map((k) => ({
                    Ad: PARAM_KEYS[k],
                    Deger: toDeger(k, form[k]),
                }));
            const res = await PostWithToken('Parameter/UpdateBatch', { Items: items });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            AlertFunction('Başarılı', 'Parametre kaydı başarıyla güncellendi');
            yukle(); // Veritabanındaki güncel değerleri tekrar yükle
        } catch (e) {
            AlertFunction('Hata', e?.response?.data?.message || 'Güncelleme hatası');
        } finally {
            setSaving(false);
        }
    };

    const setVal = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    if (loading) return <PageLoading />;

    return (
        <Layout>
            <PageHeader
                title="Parametreler"
                map={[
                    { url: 'yonetimsel-araclar', name: 'Yönetimsel Araçlar' },
                    { url: 'yonetimsel-araclar/tanimlamalar', name: 'Tanımlamalar' },
                    { url: 'tanimlamalar/parametreler', name: 'Parametreler' },
                ]}
            />
            <div className="content pr-3 pl-3">
                <div className="card">
                    <div className="card-header border-0 p-0">
                        <Nav tabs className="nav-tabs">
                            <NavItem>
                                <NavLink className={activeTab === 'AA' ? 'active' : ''} onClick={() => setActiveTab('AA')}>
                                    Program Parametreleri
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={activeTab === 'BB' ? 'active' : ''} onClick={() => setActiveTab('BB')}>
                                    Web Parametreleri
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className={activeTab === 'CC' ? 'active' : ''} onClick={() => setActiveTab('CC')}>
                                    Diğer Parametreler
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </div>
                    <div className="card-body">
                        <TabContent activeTab={activeTab}>
                            <TabPane tabId="AA" className="p-3">
                                <div className="row">
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Gece Zammı Başlangıcı</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="20:00:00"
                                            value={form.geceZammiBaslangic}
                                            onChange={(e) => setVal('geceZammiBaslangic', e.target.value)}
                                            onKeyUp={timeControl}
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Gece Zammı Sonu</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="06:00:00"
                                            value={form.geceZammiSonu}
                                            onChange={(e) => setVal('geceZammiSonu', e.target.value)}
                                            onKeyUp={timeControl}
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">24 Vardiya Düzeltmesi</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="23:00"
                                            value={form.vardiyaDuzeltmesi}
                                            onChange={(e) => setVal('vardiyaDuzeltmesi', e.target.value)}
                                            onKeyUp={timeControl}
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Otomatik Yuvarlama Modu</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={form.otomatikYuvarlamaModu}
                                            onChange={(e) => setVal('otomatikYuvarlamaModu', e.target.value)}
                                            onKeyUp={numberOnly}
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Mükerrer</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={form.mukerrer}
                                            onChange={(e) => setVal('mukerrer', e.target.value)}
                                            onKeyUp={numberOnly}
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Max Erken Giriş</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="form-control"
                                            value={form.maxErkenGiris ?? ''}
                                            onChange={(e) => setVal('maxErkenGiris', e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3 d-flex align-items-end">
                                        <label className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={form.araYilSonundaIzin}
                                                onChange={(e) => setVal('araYilSonundaIzin', e.target.checked)}
                                            />
                                            <span className="form-check-label">Yıl Sonunda İzin Devret</span>
                                        </label>
                                    </div>
                                    <div className="col-md-3 mb-3 d-flex align-items-end">
                                        <label className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={form.arakayitIptal}
                                                onChange={(e) => setVal('arakayitIptal', e.target.checked)}
                                            />
                                            <span className="form-check-label">Ara Kayıtları İptal Et</span>
                                        </label>
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane tabId="BB" className="p-3">
                                <div className="row">
                                    {['erkenGiris', 'gecGiris', 'erkenCikis', 'gecCikis', 'sinirlama'].map((k, i) => (
                                        <div key={k} className="col-md-3 mb-3">
                                            <label className="form-label">
                                                {k === 'erkenGiris' && 'Erken Giriş'}
                                                {k === 'gecGiris' && 'Geç Giriş'}
                                                {k === 'erkenCikis' && 'Erken Çıkış'}
                                                {k === 'gecCikis' && 'Geç Çıkış'}
                                                {k === 'sinirlama' && 'Sınırlama'}
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={form[k]}
                                                onChange={(e) => setVal(k, e.target.value)}
                                                onKeyUp={numberOnly}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </TabPane>
                            <TabPane tabId="CC" className="p-3">
                                {[
                                    { id: 'veriCekme', title: 'Veri Çekme', fields: [
                                        { k: 'esZamanliIslem', label: 'Eş Zamanlı İşlem Sayısı' },
                                        { k: 'agKesintiErteleme', label: 'Ağ Kesintisi Ertelemesi' },
                                        { k: 'veriCekme', label: 'Veri Çekme Aktif', type: 'checkbox' },
                                        { k: 'gecisGrubuTime', label: 'Geçiş Grubu TimeZone Kullan', type: 'checkbox' },
                                    ]},
                                    { id: 'hesaplama', title: 'Hesaplama', fields: [
                                        { k: 'hesaplamaPeriyor', label: 'Hesaplama Periyodu' },
                                        { k: 'hesaplamaAktif', label: 'Hesaplama Aktif', type: 'checkbox' },
                                    ]},
                                    { id: 'entegrasyon', title: 'Entegrasyon', fields: [
                                        { k: 'entegrasyonPeriyot', label: 'Entegrasyon Periyodu' },
                                        { k: 'entegrasyonAktif', label: 'Entegrasyon Aktif', type: 'checkbox' },
                                    ]},
                                    { id: 'mail', title: 'Mail Gönderimi', fields: [
                                        { k: 'mailSunucu', label: 'Mail Sunucu' },
                                        { k: 'mailPort', label: 'Mail Port' },
                                        { k: 'kullaniciAdi', label: 'Kullanıcı Adı' },
                                        { k: 'sifre', label: 'Şifre', type: 'password' },
                                        { k: 'cihazErisimMailiSuresi', label: 'Cihaz Erişim Maili Süresi (dk)' },
                                        { k: 'cihazErisimMaili', label: 'Cihaz Erişimi Kesildiğinde Mail Adresi' },
                                        { k: 'cekeg', label: 'Cihaz Erişimi Kesildiğinde Mail Gönder (Aktif)', type: 'checkbox' },
                                        { k: 'bolumAmirBasinda', label: 'Bölüm Amirine Vardiya Başında Süre (dk)' },
                                        { k: 'bavbsm', label: 'Bölüm Amirine Vardiya Başında Mail Aktif', type: 'checkbox' },
                                        { k: 'bolumAmirSonunda', label: 'Bölüm Amirine Vardiya Sonunda Süre (dk)' },
                                        { k: 'bavssm', label: 'Bölüm Amirine Vardiya Sonunda Mail Aktif', type: 'checkbox' },
                                        { k: 'mailGonderimi', label: 'Mail Gönderimi Aktif', type: 'checkbox' },
                                    ]},
                                ].map((acc) => (
                                    <Card key={acc.id} className="mb-2">
                                        <CardHeader
                                            tag="button"
                                            onClick={() => toggleAccordion(acc.id)}
                                            className="d-flex justify-content-between align-items-center"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <span>
                                                <i className={`fa fa-${accordion[acc.id] ? 'minus' : 'plus'}-circle me-2`}></i>
                                                {acc.title}
                                            </span>
                                            <i className={`fa fa-chevron-${accordion[acc.id] ? 'up' : 'down'}`}></i>
                                        </CardHeader>
                                        <Collapse isOpen={accordion[acc.id]}>
                                            <CardBody>
                                                <div className="row">
                                                    {acc.fields.map((f) => (
                                                        <div key={f.k} className="col-md-3 mb-3">
                                                            {f.type === 'checkbox' ? (
                                                                <label className="form-check d-block mt-4">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input"
                                                                        checked={form[f.k]}
                                                                        onChange={(e) => setVal(f.k, e.target.checked)}
                                                                    />
                                                                    <span className="form-check-label">{f.label}</span>
                                                                </label>
                                                            ) : (
                                                                <>
                                                                    <label className="form-label">{f.label}</label>
                                                                    <input
                                                                        type={f.type || 'text'}
                                                                        className="form-control"
                                                                        value={form[f.k] ?? ''}
                                                                        onChange={(e) => setVal(f.k, e.target.value)}
                                                                        onKeyUp={['esZamanliIslem','agKesintiErteleme','hesaplamaPeriyor','entegrasyonPeriyot','cihazErisimMailiSuresi','bolumAmirBasinda','bolumAmirSonunda','mailPort'].includes(f.k) ? numberOnly : undefined}
                                                                        placeholder={f.label}
                                                                    />
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardBody>
                                        </Collapse>
                                    </Card>
                                ))}
                            </TabPane>
                        </TabContent>
                        <footer className="mt-3">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={guncelle}
                                disabled={saving}
                            >
                                <i className="icon-floppy-disk"></i> Güncelle
                            </button>
                        </footer>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
