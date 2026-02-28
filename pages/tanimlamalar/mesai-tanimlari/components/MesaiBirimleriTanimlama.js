import React, { useEffect, useState } from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import AlertFunction from '../../../../components/alertfunction';
import PageLoading from '../../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../../api/crud';
import { confirmAlert } from 'react-confirm-alert';

const dakikayiSaateCevir = (dakika) => {
    if (dakika == null || dakika === undefined) return '';
    let d = Number(dakika);
    if (d > 1440) d = d - 1440;
    const saat = Math.floor(d / 60);
    const dk = d % 60;
    return `${String(saat).padStart(2, '0')}:${String(dk).padStart(2, '0')}`;
};

const saatiDakikayaCevir = (str) => {
    if (!str || typeof str !== 'string') return 0;
    const p = str.trim().split(':');
    if (p.length >= 2) return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
    return 0;
};

export default function MesaiBirimleriTanimlama() {
    const [loading, setLoading] = useState(true);
    const [mesaiList, setMesaiList] = useState([]);
    const [dinlenmeList, setDinlenmeList] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [secilenId, setSecilenId] = useState(-1);
    const [formSubTab, setFormSubTab] = useState('parametreler');

    const [form, setForm] = useState({
        aciklama: '',
        kod: '',
        baslamaSaati: '',
        bitisSaati: '',
        normalCalismaSuresi: '',
        encokCalismaSuresi: '',
        fazlaMesaiYuzdesi: '',
        eksikMesaiYuzdesi: '',
        eksikGunYuzdesi: '',
        fazlaMesaiYuvarlama: '',
        enAzCalismaSuresi: '',
        enAzFazlaMSuresi: '',
        fazlaMesaiHassasiyeti: '',
        serbestMesaiHassasiyeti: '',
        enCokFazlaMSuresi: '',
        fazlaMesaiDegisimSaat1: '',
        fazlaMesaiDegisimSaat2: '',
        yuzde1: '',
        fazlaMesaiDegisimSaat3: '',
        fazlaMesaiDegisimSaat4: '',
        yuzde2: '',
        mesaiBaslangicDuzlemiArti: '',
        mesaiBaslangicDuzlemiEksi: '',
        yemekHakki: '',
    });

    const [yuvarlamalar, setYuvarlamalar] = useState([]);
    const [yuvarlamaSaat1, setYuvarlamaSaat1] = useState('');
    const [yuvarlamaSaat2, setYuvarlamaSaat2] = useState('');
    const [yuvarlamaSaat3, setYuvarlamaSaat3] = useState('');
    const [yuvarlamaHedef, setYuvarlamaHedef] = useState(0);

    const [dinlenmeAtamalari, setDinlenmeAtamalari] = useState([]);
    const [selectedDinlenmeId, setSelectedDinlenmeId] = useState('');

    const [saving, setSaving] = useState(false);

    const yukleListe = async () => {
        try {
            const [mesaiRes, dinlenmeRes] = await Promise.all([
                GetWithToken('Mesailer/GetAll', { PageNumber: 0, PageSize: 500 }),
                GetWithToken('Dinlenmeler/GetAll', { PageNumber: 0, PageSize: 500 }),
            ]);
            setMesaiList(mesaiRes?.data?.data?.list || mesaiRes?.data?.data || []);
            setDinlenmeList(dinlenmeRes?.data?.data?.list || dinlenmeRes?.data?.data || []);
        } catch (e) {
            setMesaiList([]);
            setDinlenmeList([]);
        }
    };

    useEffect(() => {
        setLoading(true);
        yukleListe().finally(() => setLoading(false));
    }, [refreshKey]);

    const detayGetir = async (id) => {
        setLoading(true);
        try {
            const res = await GetWithToken('Mesailer/GetDetay', { id });
            const d = res?.data?.data;
            if (!d) {
                AlertFunction('Hata', 'Detay yüklenemedi');
                return;
            }
            setSecilenId(id);
            setForm({
                aciklama: d.aciklama ?? d.Aciklama ?? '',
                kod: d.kod ?? d.Kod ?? '',
                baslamaSaati: dakikayiSaateCevir(d.mesaiBas ?? d.MesaiBas),
                bitisSaati: dakikayiSaateCevir(d.mesaiBit ?? d.MesaiBit),
                normalCalismaSuresi: dakikayiSaateCevir(d.normalSure ?? d.NormalSure),
                encokCalismaSuresi: dakikayiSaateCevir(d.encokSure ?? d.EncokSure),
                fazlaMesaiYuzdesi: d.fazlaMesaiYuzde ?? d.FazlaMesaiYuzde ?? '',
                eksikMesaiYuzdesi: d.eksikMesaiYuzde ?? d.EksikMesaiYuzde ?? '',
                eksikGunYuzdesi: d.eksikGunYuzde ?? d.EksikGunYuzde ?? '',
                fazlaMesaiYuvarlama: d.yarimGunSaat ?? d.YarimGunSaat ?? '',
                enAzCalismaSuresi: d.enAzSure ?? d.EnAzSure ?? '',
                enAzFazlaMSuresi: d.enAzFazlaMesai ?? d.EnAzFazlaMesai ?? '',
                fazlaMesaiHassasiyeti: d.fazlaMesaiHassasiyeti ?? d.FazlaMesaiHassasiyeti ?? '',
                serbestMesaiHassasiyeti: d.serbestMesaiHassasiyeti ?? d.SerbestMesaiHassasiyeti ?? '',
                enCokFazlaMSuresi: d.enCokFazlaMesai ?? d.EnCokFazlaMesai ?? '',
                fazlaMesaiDegisimSaat1: dakikayiSaateCevir(d.xfm1basi ?? d.Xfm1basi),
                fazlaMesaiDegisimSaat2: dakikayiSaateCevir(d.xfm1sonu ?? d.Xfm1sonu),
                yuzde1: d.xfm1oran ?? d.Xfm1oran ?? '',
                fazlaMesaiDegisimSaat3: dakikayiSaateCevir(d.xfm2basi ?? d.Xfm2basi),
                fazlaMesaiDegisimSaat4: dakikayiSaateCevir(d.xfm2sonu ?? d.Xfm2sonu),
                yuzde2: d.xfm2oran ?? d.Xfm2oran ?? '',
                mesaiBaslangicDuzlemiArti: d.artiek ?? d.Artiek ?? '',
                mesaiBaslangicDuzlemiEksi: d.eksiek ?? d.Eksiek ?? '',
                yemekHakki: d.yemekHakki ?? d.YemekHakki ?? '',
            });
            const yuv = (d.yuvarlamalar ?? d.Yuvarlamalar ?? []).map((y) => ({
                id: y.id ?? y.Id,
                saat1: y.saat1 ?? y.Saat1 ?? '',
                saat2: y.saat2 ?? y.Saat2 ?? '',
                saat3: y.saat3 ?? y.Saat3 ?? '',
                hedef: y.hedef ?? y.Hedef ?? 0,
            }));
            setYuvarlamalar(yuv);
            const din = (d.dinlenmeAtamalari ?? d.DinlenmeAtamalari ?? []).map((x) => ({
                id: x.id ?? x.Id,
                dinlenmeId: x.dinlenmeId ?? x.DinlenmeId,
                aciklama: x.aciklama ?? x.Aciklama ?? '',
            }));
            setDinlenmeAtamalari(din);
        } catch (e) {
            AlertFunction('Hata', 'Detay yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const temizle = () => {
        setSecilenId(-1);
        setForm({
            aciklama: '', kod: '', baslamaSaati: '', bitisSaati: '', normalCalismaSuresi: '',
            encokCalismaSuresi: '', fazlaMesaiYuzdesi: '', eksikMesaiYuzdesi: '', eksikGunYuzdesi: '',
            fazlaMesaiYuvarlama: '', enAzCalismaSuresi: '', enAzFazlaMSuresi: '', fazlaMesaiHassasiyeti: '',
            serbestMesaiHassasiyeti: '', enCokFazlaMSuresi: '', fazlaMesaiDegisimSaat1: '',
            fazlaMesaiDegisimSaat2: '', yuzde1: '', fazlaMesaiDegisimSaat3: '', fazlaMesaiDegisimSaat4: '',
            yuzde2: '', mesaiBaslangicDuzlemiArti: '', mesaiBaslangicDuzlemiEksi: '', yemekHakki: '',
        });
        setYuvarlamalar([]);
        setDinlenmeAtamalari([]);
        setSelectedDinlenmeId('');
    };

    useEffect(() => {
        const bas = saatiDakikayaCevir(form.baslamaSaati);
        let bit = saatiDakikayaCevir(form.bitisSaati);
        if (form.baslamaSaati || form.bitisSaati) {
            if (bas > bit) bit += 1440;
            const sure = dakikayiSaateCevir(bit - bas);
            setForm((f) => (f.normalCalismaSuresi === sure ? f : { ...f, normalCalismaSuresi: sure }));
        }
    }, [form.baslamaSaati, form.bitisSaati]);

    const yuvarlamaEkle = () => {
        if (!yuvarlamaSaat1 || !yuvarlamaSaat2 || !yuvarlamaSaat3) {
            AlertFunction('Hata', 'Yuvarlama saatleri eksik');
            return;
        }
        const varMi = yuvarlamalar.some(
            (y) => y.saat1 === yuvarlamaSaat1 && y.saat2 === yuvarlamaSaat2 && y.hedef === yuvarlamaHedef
        );
        if (varMi) {
            AlertFunction('Hata', 'Aynı yuvarlama zaten ekli');
            return;
        }
        setYuvarlamalar([
            ...yuvarlamalar,
            { id: -1, saat1: yuvarlamaSaat1, saat2: yuvarlamaSaat2, saat3: yuvarlamaSaat3, hedef: yuvarlamaHedef },
        ]);
        setYuvarlamaSaat1('');
        setYuvarlamaSaat2('');
        setYuvarlamaSaat3('');
    };

    const yuvarlamaSil = (idx) => {
        setYuvarlamalar(yuvarlamalar.filter((_, i) => i !== idx));
    };

    const dinlenmeEkle = () => {
        const dinId = parseInt(selectedDinlenmeId, 10);
        if (!dinId || dinId < 0) {
            AlertFunction('Hata', 'Geçerli dinlenme seçin');
            return;
        }
        const din = dinlenmeList.find((d) => (d.id ?? d.Id) === dinId);
        const aciklama = din?.aciklama ?? din?.Aciklama ?? '';
        const varMi = dinlenmeAtamalari.some((d) => (d.dinlenmeId ?? d.DinlenmeId) === dinId);
        if (varMi) {
            AlertFunction('Hata', 'Aynı dinlenme zaten ekli');
            return;
        }
        setDinlenmeAtamalari([...dinlenmeAtamalari, { id: -1, dinlenmeId: dinId, aciklama }]);
        setSelectedDinlenmeId('');
    };

    const dinlenmeSil = (idx) => {
        setDinlenmeAtamalari(dinlenmeAtamalari.filter((_, i) => i !== idx));
    };

    const kaydet = async () => {
        if (!form.aciklama?.trim()) {
            AlertFunction('Uyarı', 'Mesai birimi adı giriniz');
            return;
        }
        let mesaiBit = saatiDakikayaCevir(form.bitisSaati);
        let mesaiBas = saatiDakikayaCevir(form.baslamaSaati);
        if (mesaiBas > mesaiBit) mesaiBit += 1440;

        const mesaiBirim = {
            ID: secilenId > 0 ? secilenId : 0,
            Aciklama: form.aciklama.trim(),
            Kod: form.kod?.trim() ?? '',
            MesaiBas: mesaiBas,
            MesaiBit: mesaiBit,
            NormalSure: saatiDakikayaCevir(form.normalCalismaSuresi) || 0,
            EncokSure: saatiDakikayaCevir(form.encokCalismaSuresi) || 0,
            EnAzSure: Number(form.enAzCalismaSuresi) || 0,
            EnAzFazlaMesai: Number(form.enAzFazlaMSuresi) || 0,
            FazlaMesaiHassasiyeti: Number(form.fazlaMesaiHassasiyeti) || 0,
            FazlaMesaiYuzde: Number(form.fazlaMesaiYuzdesi) || 0,
            EksikMesaiYuzde: Number(form.eksikMesaiYuzdesi) || 0,
            EksikGunYuzde: Number(form.eksikGunYuzdesi) || 0,
            YarimGunSaat: Number(form.fazlaMesaiYuvarlama) || 0,
            SerbestMesaiHassasiyeti: Number(form.serbestMesaiHassasiyeti) || 0,
            EnCokFazlaMesai: Number(form.enCokFazlaMSuresi) || 0,
            XFM1Basi: saatiDakikayaCevir(form.fazlaMesaiDegisimSaat1) || null,
            XFM1Sonu: saatiDakikayaCevir(form.fazlaMesaiDegisimSaat2) || null,
            XFM2Basi: saatiDakikayaCevir(form.fazlaMesaiDegisimSaat3) || null,
            XFM2Sonu: saatiDakikayaCevir(form.fazlaMesaiDegisimSaat4) || null,
            XFM1Oran: Number(form.yuzde1) || null,
            XFM2Oran: Number(form.yuzde2) || null,
            Artiek: Number(form.mesaiBaslangicDuzlemiArti) || null,
            Eksiek: Number(form.mesaiBaslangicDuzlemiEksi) || null,
            YemekHakki: Number(form.yemekHakki) || null,
        };

        const yuvarlama = yuvarlamalar.map((y) => ({
            Id: y.id,
            StrSaat1: y.saat1,
            StrSaat2: y.saat2,
            StrSaat3: y.saat3,
            Hedef: y.hedef ?? 0,
            MesaiID: secilenId > 0 ? secilenId : 0,
        }));

        const dinlenme = dinlenmeAtamalari.map((d) => ({
            Id: d.id,
            DinlenmeID: d.dinlenmeId ?? d.DinlenmeId,
            MesaiID: secilenId > 0 ? secilenId : 0,
            Aciklama: d.aciklama ?? d.Aciklama ?? '',
        }));

        setSaving(true);
        try {
            const res = await PostWithToken('Mesailer/Kaydet', {
                mesaiBirim,
                yuvarlama,
                dinlenme,
            });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            const newId = res?.data?.data;
            if (newId && secilenId <= 0) {
                setSecilenId(newId);
            }
            setRefreshKey((k) => k + 1);
            AlertFunction('Başarılı', 'İşlem başarılı');
        } catch (e) {
            AlertFunction('Başarısız', e?.response?.data?.message || 'Kaydetme hatası');
        } finally {
            setSaving(false);
        }
    };

    const sil = (id, aciklama) => {
        confirmAlert({
            title: 'Uyarı',
            message: `"${aciklama}" mesai birimini silmek istediğinizden emin misiniz?`,
            buttons: [
                { label: 'Hayır', onClick: () => {} },
                {
                    label: 'Evet',
                    onClick: async () => {
                        try {
                            const res = await PostWithToken('Mesailer/Delete', { Id: id });
                            if (res?.data?.isError) {
                                AlertFunction('Hata', res.data.message);
                                return;
                            }
                            if (secilenId === id) temizle();
                            setRefreshKey((k) => k + 1);
                            AlertFunction('Başarılı', 'Silindi');
                        } catch (e) {
                            AlertFunction('Başarısız', e?.response?.data?.message || 'Silme hatası');
                        }
                    },
                },
            ],
        });
    };

    const timeControl = (e) => {
        const v = e.target.value;
        const last = v.slice(-1);
        if (v.length >= 1 && !/[\d:]/.test(last)) {
            e.target.value = v.slice(0, -1);
        }
    };

    if (loading && mesaiList.length === 0) return <PageLoading />;

    return (
        <div className="row">
            <div className="col-md-3">
                <div className="card">
                    <div className="card-header">
                        <h6 className="mb-0">Mesai Birimleri</h6>
                    </div>
                    <div className="card-body p-0" style={{ maxHeight: 500, overflow: 'auto' }}>
                        <table className="table table-sm table-striped table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Açıklama</th>
                                    <th>Kod</th>
                                    <th style={{ width: 58 }}>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mesaiList.map((m) => {
                                    const mid = m.id ?? m.Id;
                                    const ad = m.aciklama ?? m.Aciklama ?? '-';
                                    const kod = m.kod ?? m.Kod ?? '';
                                    return (
                                        <tr key={mid}>
                                            <td>{ad}</td>
                                            <td>{kod}</td>
                                            <td>
                                                <span className="d-inline-flex align-items-center" style={{ gap: 4 }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-success py-0 px-1"
                                                        style={{ fontSize: '0.7rem', minWidth: 24 }}
                                                        title="Detay"
                                                        onClick={() => detayGetir(mid)}
                                                    >
                                                        <i className="icon-eye"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger py-0 px-1"
                                                        style={{ fontSize: '0.7rem', minWidth: 24 }}
                                                        title="Sil"
                                                        onClick={() => sil(mid, ad)}
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

            <div className="col-md-9">
                <div className="card">
                    <div className="card-body">
                        <Nav tabs className="nav-tabs nav-tabs-highlight mb-3">
                            <NavItem>
                                <NavLink
                                    className={formSubTab === 'parametreler' ? 'active' : ''}
                                    onClick={() => setFormSubTab('parametreler')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Parametreler
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={formSubTab === 'yuvarlama' ? 'active' : ''}
                                    onClick={() => setFormSubTab('yuvarlama')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Yuvarlamalar & Dinlenmeler
                                </NavLink>
                            </NavItem>
                        </Nav>

                        <TabContent activeTab={formSubTab}>
                            <TabPane tabId="parametreler">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="row mb-2">
                                            <div className="col-6">
                                                <label className="form-label">Mesai Birimi Adı</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    maxLength={20}
                                                    value={form.aciklama}
                                                    onChange={(e) => setForm((f) => ({ ...f, aciklama: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label">Mesai Birimi Kodu</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    maxLength={3}
                                                    value={form.kod}
                                                    onChange={(e) => setForm((f) => ({ ...f, kod: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-6">
                                                <label className="form-label">Mesai Başlama Saati</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="08:00"
                                                    maxLength={5}
                                                    value={form.baslamaSaati}
                                                    onChange={(e) => setForm((f) => ({ ...f, baslamaSaati: e.target.value }))}
                                                    onKeyUp={timeControl}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label">Mesai Bitiş Saati</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="17:00"
                                                    maxLength={5}
                                                    value={form.bitisSaati}
                                                    onChange={(e) => setForm((f) => ({ ...f, bitisSaati: e.target.value }))}
                                                    onKeyUp={timeControl}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-6">
                                                <label className="form-label">Normal Çalışma Süresi</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    readOnly
                                                    value={form.normalCalismaSuresi}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label">En Çok Çalışma Süresi</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="HH:mm"
                                                    maxLength={5}
                                                    value={form.encokCalismaSuresi}
                                                    onChange={(e) => setForm((f) => ({ ...f, encokCalismaSuresi: e.target.value }))}
                                                    onKeyUp={timeControl}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-4">
                                                <label className="form-label">FM Yüzdesi %</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={form.fazlaMesaiYuzdesi}
                                                    onChange={(e) => setForm((f) => ({ ...f, fazlaMesaiYuzdesi: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-4">
                                                <label className="form-label">EM Yüzdesi %</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={form.eksikMesaiYuzdesi}
                                                    onChange={(e) => setForm((f) => ({ ...f, eksikMesaiYuzdesi: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-4">
                                                <label className="form-label">EG Yüzdesi %</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={form.eksikGunYuzdesi}
                                                    onChange={(e) => setForm((f) => ({ ...f, eksikGunYuzdesi: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-4">
                                                <label className="form-label">FM Yuvarlama</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={form.fazlaMesaiYuvarlama}
                                                    onChange={(e) => setForm((f) => ({ ...f, fazlaMesaiYuvarlama: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-4">
                                                <label className="form-label">En Az Çalışma Süresi</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={form.enAzCalismaSuresi}
                                                    onChange={(e) => setForm((f) => ({ ...f, enAzCalismaSuresi: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-4">
                                                <label className="form-label">En Az FM Süresi</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={form.enAzFazlaMSuresi}
                                                    onChange={(e) => setForm((f) => ({ ...f, enAzFazlaMSuresi: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mb-2">
                                            <div className="col-4">
                                                <label className="form-label">FM Hassasiyeti</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={form.fazlaMesaiHassasiyeti}
                                                    onChange={(e) => setForm((f) => ({ ...f, fazlaMesaiHassasiyeti: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-4">
                                                <label className="form-label">SM Hassasiyeti</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={form.serbestMesaiHassasiyeti}
                                                    onChange={(e) => setForm((f) => ({ ...f, serbestMesaiHassasiyeti: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-4">
                                                <label className="form-label">En Çok FM Süresi</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={form.enCokFazlaMSuresi}
                                                    onChange={(e) => setForm((f) => ({ ...f, enCokFazlaMSuresi: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <fieldset className="border p-3 rounded">
                                            <legend className="w-auto px-2" style={{ fontSize: '0.9rem' }}>
                                                Fazla Mesai Değişimleri
                                            </legend>
                                            <div className="row mb-2">
                                                <div className="col-4">
                                                    <label className="form-label small">Saat 1</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="HH:mm"
                                                        maxLength={5}
                                                        value={form.fazlaMesaiDegisimSaat1}
                                                        onChange={(e) => setForm((f) => ({ ...f, fazlaMesaiDegisimSaat1: e.target.value }))}
                                                        onKeyUp={timeControl}
                                                    />
                                                </div>
                                                <div className="col-4">
                                                    <label className="form-label small">Saat 2</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="HH:mm"
                                                        maxLength={5}
                                                        value={form.fazlaMesaiDegisimSaat2}
                                                        onChange={(e) => setForm((f) => ({ ...f, fazlaMesaiDegisimSaat2: e.target.value }))}
                                                        onKeyUp={timeControl}
                                                    />
                                                </div>
                                                <div className="col-4">
                                                    <label className="form-label small">Yüzde %</label>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        value={form.yuzde1}
                                                        onChange={(e) => setForm((f) => ({ ...f, yuzde1: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="row mb-2">
                                                <div className="col-4">
                                                    <label className="form-label small">Saat 1</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="HH:mm"
                                                        maxLength={5}
                                                        value={form.fazlaMesaiDegisimSaat3}
                                                        onChange={(e) => setForm((f) => ({ ...f, fazlaMesaiDegisimSaat3: e.target.value }))}
                                                        onKeyUp={timeControl}
                                                    />
                                                </div>
                                                <div className="col-4">
                                                    <label className="form-label small">Saat 2</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="HH:mm"
                                                        maxLength={5}
                                                        value={form.fazlaMesaiDegisimSaat4}
                                                        onChange={(e) => setForm((f) => ({ ...f, fazlaMesaiDegisimSaat4: e.target.value }))}
                                                        onKeyUp={timeControl}
                                                    />
                                                </div>
                                                <div className="col-4">
                                                    <label className="form-label small">Yüzde %</label>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        value={form.yuzde2}
                                                        onChange={(e) => setForm((f) => ({ ...f, yuzde2: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        </fieldset>
                                        <div className="row mt-2">
                                            <div className="col-6">
                                                <label className="form-label">+ Mesai Başlangıç Düzlemi</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={form.mesaiBaslangicDuzlemiArti}
                                                    onChange={(e) => setForm((f) => ({ ...f, mesaiBaslangicDuzlemiArti: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label">- Mesai Başlangıç Düzlemi</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={form.mesaiBaslangicDuzlemiEksi}
                                                    onChange={(e) => setForm((f) => ({ ...f, mesaiBaslangicDuzlemiEksi: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6">
                                                <label className="form-label">Yemek Hakkı</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={form.yemekHakki}
                                                    onChange={(e) => setForm((f) => ({ ...f, yemekHakki: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPane>

                            <TabPane tabId="yuvarlama">
                                <div className="row">
                                    <div className="col-md-6">
                                        <fieldset className="border p-3 rounded">
                                            <legend className="w-auto px-2" style={{ fontSize: '0.9rem' }}>
                                                Yuvarlamalar
                                            </legend>
                                            <div className="row mb-2 align-items-end">
                                                <div className="col-12 mb-2">
                                                    <label className="form-check-inline">
                                                        <input
                                                            type="radio"
                                                            name="yuvHedef"
                                                            checked={yuvarlamaHedef === 0}
                                                            onChange={() => setYuvarlamaHedef(0)}
                                                        />{' '}
                                                        Giriş
                                                    </label>
                                                    <label className="form-check-inline ms-3">
                                                        <input
                                                            type="radio"
                                                            name="yuvHedef"
                                                            checked={yuvarlamaHedef === 1}
                                                            onChange={() => setYuvarlamaHedef(1)}
                                                        />{' '}
                                                        Çıkış
                                                    </label>
                                                </div>
                                                <div className="col-3">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="HH:mm"
                                                        maxLength={5}
                                                        value={yuvarlamaSaat1}
                                                        onChange={(e) => setYuvarlamaSaat1(e.target.value)}
                                                        onKeyUp={timeControl}
                                                    />
                                                </div>
                                                <div className="col-3">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="HH:mm"
                                                        maxLength={5}
                                                        value={yuvarlamaSaat2}
                                                        onChange={(e) => setYuvarlamaSaat2(e.target.value)}
                                                        onKeyUp={timeControl}
                                                    />
                                                </div>
                                                <div className="col-3">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="HH:mm"
                                                        maxLength={5}
                                                        value={yuvarlamaSaat3}
                                                        onChange={(e) => setYuvarlamaSaat3(e.target.value)}
                                                        onKeyUp={timeControl}
                                                    />
                                                </div>
                                                <div className="col-3">
                                                    <button type="button" className="btn btn-sm btn-success" onClick={yuvarlamaEkle}>
                                                        <i className="icon-plus3"></i> Ekle
                                                    </button>
                                                </div>
                                            </div>
                                            {yuvarlamalar.length > 0 && (
                                                <table className="table table-sm table-bordered mt-2">
                                                    <thead>
                                                        <tr>
                                                            <th>Saat 1</th>
                                                            <th>Saat 2</th>
                                                            <th>Saat 3</th>
                                                            <th>Durum</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {yuvarlamalar.map((y, i) => (
                                                            <tr key={i}>
                                                                <td>{y.saat1}</td>
                                                                <td>{y.saat2}</td>
                                                                <td>{y.saat3}</td>
                                                                <td>{y.hedef === 1 ? 'Çıkış' : 'Giriş'}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-xs btn-danger"
                                                                        onClick={() => yuvarlamaSil(i)}
                                                                    >
                                                                        <i className="icon-trash"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </fieldset>
                                    </div>
                                    <div className="col-md-6">
                                        <fieldset className="border p-3 rounded">
                                            <legend className="w-auto px-2" style={{ fontSize: '0.9rem' }}>
                                                Dinlenmeler
                                            </legend>
                                            <div className="input-group mb-2">
                                                <select
                                                    className="form-control form-control-sm"
                                                    value={selectedDinlenmeId}
                                                    onChange={(e) => setSelectedDinlenmeId(e.target.value)}
                                                >
                                                    <option value="">SEÇİNİZ</option>
                                                    {dinlenmeList.map((d) => {
                                                        const did = d.id ?? d.Id;
                                                        const ad = d.aciklama ?? d.Aciklama ?? '';
                                                        return (
                                                            <option key={did} value={did}>
                                                                {ad}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <button type="button" className="btn btn-sm btn-success" onClick={dinlenmeEkle}>
                                                    <i className="icon-plus3"></i>
                                                </button>
                                            </div>
                                            {dinlenmeAtamalari.length > 0 && (
                                                <table className="table table-sm table-bordered mt-2">
                                                    <thead>
                                                        <tr>
                                                            <th>Dinlenme Adı</th>
                                                            <th style={{ width: 60 }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {dinlenmeAtamalari.map((d, i) => (
                                                            <tr key={i}>
                                                                <td>{d.aciklama ?? d.Aciklama ?? '-'}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-xs btn-danger"
                                                                        onClick={() => dinlenmeSil(i)}
                                                                    >
                                                                        <i className="icon-trash"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </fieldset>
                                    </div>
                                </div>
                            </TabPane>
                        </TabContent>

                        <hr />
                        <div>
                            <button
                                type="button"
                                className="btn btn-success me-2"
                                onClick={kaydet}
                                disabled={saving}
                            >
                                <i className="icon-floppy-disk"></i> Kaydet
                            </button>
                            <button type="button" className="btn btn-info" onClick={temizle}>
                                <i className="icon-plus3"></i> Yeni Ekle
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
