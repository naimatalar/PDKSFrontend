import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import AlertFunction from '../../../components/alertfunction';
import DataTable from '../../../components/datatable';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import PageLoading from '../../../layout/pageLoading';
import DebisButton from '../../../components/button';
import { GetWithToken, PostWithToken } from '../../api/crud';

const formatDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

export default function SicilIndex() {
    const [modalOpen, setModalOpen] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [refreshDatatable, setRefreshDatatable] = useState(null);
    const [loading, setLoading] = useState(true);

    const [firmaList, setFirmaList] = useState([]);
    const [bolumList, setBolumList] = useState([]);
    const [direktorlukList, setDirektorlukList] = useState([]);
    const [gorevList, setGorevList] = useState([]);
    const [pozisyonList, setPozisyonList] = useState([]);
    const [puantajList, setPuantajList] = useState([]);
    const [yakaList, setYakaList] = useState([]);
    const [altFirmaList, setAltFirmaList] = useState([]);
    const [terminalGrupList, setTerminalGrupList] = useState([]);
    const [mesaiPeriyodList, setMesaiPeriyodList] = useState([]);

    useEffect(() => {
        start();
    }, []);

    const start = async () => {
        const pagination = { PageNumber: 1, PageSize: 500 };
        const fetchOptions = (url) =>
            GetWithToken(url, pagination)
                .then((x) => x.data?.data?.list || [])
                .catch(() => []);

        const [firma, bolum, direktorluk, gorev, pozisyon, puantaj, yaka, altFirma, terminalGrup, mesaiPeriyod] =
            await Promise.all([
                fetchOptions('CboFirma/GetAll'),
                fetchOptions('CboBolum/GetAll'),
                fetchOptions('CboDirektorluk/GetAll'),
                fetchOptions('CboGorev/GetAll'),
                fetchOptions('CboPozisyon/GetAll'),
                fetchOptions('CboPuantaj/GetAll'),
                fetchOptions('CboYaka/GetAll'),
                fetchOptions('CboAltFirma/GetAll'),
                fetchOptions('TerminalGroup/GetAll'),
                fetchOptions('MesaiPeriyodlari/GetAll'),
            ]);

        setFirmaList(firma.map((x) => ({ id: x.id, text: x.ad || x.Ad })));
        setBolumList(bolum.map((x) => ({ id: x.id, text: x.ad || x.Ad })));
        setDirektorlukList(direktorluk.map((x) => ({ id: x.id, text: x.ad || x.Ad })));
        setGorevList(gorev.map((x) => ({ id: x.id, text: x.ad || x.Ad })));
        setPozisyonList(pozisyon.map((x) => ({ id: x.id, text: x.ad || x.Ad })));
        setPuantajList(puantaj.map((x) => ({ id: x.id, text: x.ad || x.Ad })));
        setYakaList(yaka.map((x) => ({ id: x.id, text: x.ad || x.Ad })));
        setAltFirmaList(altFirma.map((x) => ({ id: x.id, text: x.ad || x.Ad })));
        setTerminalGrupList(terminalGrup.map((x) => ({ id: x.id, text: x.ad || x.Ad })));
        setMesaiPeriyodList(mesaiPeriyod.map((x) => ({ id: x.id, text: x.aciklama || x.Aciklama || `${x.id}` })));

        setLoading(false);
    };

    const toggle = () => setModalOpen(!modalOpen);

    const submit = async (v) => {
        try {
            if (!v.id) {
                const createData = {
                    ad: v.ad,
                    soyad: v.soyad,
                    personelNo: v.personelNo,
                    sicilNo: v.sicilNo,
                    firma: parseInt(v.firma) || 0,
                    bolum: parseInt(v.bolum) || 0,
                    pozisyon: parseInt(v.pozisyon) || 0,
                    gorev: parseInt(v.gorev) || 0,
                    direktorluk: parseInt(v.direktorluk) || 0,
                    yaka: parseInt(v.yaka) || 0,
                    puantaj: parseInt(v.puantaj) || 0,
                    altFirma: parseInt(v.altFirma) || 0,
                    terminalGrubu: v.terminalGrubu ? parseInt(v.terminalGrubu) : null,
                    mesaiPeriyodu: parseInt(v.mesaiPeriyodu) || 0,
                    telefon1: v.telefon1,
                    telefon2: v.telefon2,
                    cepTelefon: v.cepTelefon,
                    adres: v.adres,
                    il: v.il,
                    ilce: v.ilce,
                    email: v.email,
                    girisTarih: v.girisTarih || null,
                    cikisTarih: v.cikisTarih || null,
                    dogumTarih: v.dogumTarih || null,
                    sonDurum: v.sonDurum === 'true' || v.sonDurum === true,
                    maas: parseInt(v.maas) || 0,
                    maasTipi: parseInt(v.maasTipi) || 0,
                };
                const res = await PostWithToken('Sicil/Create', createData);
                if (res?.data?.isError) {
                    AlertFunction('Hata', res.data.message);
                    return;
                }
            } else {
                const updateData = {
                    id: parseInt(v.id),
                    ad: v.ad,
                    soyad: v.soyad,
                    personelNo: v.personelNo,
                    sicilNo: v.sicilNo,
                    firma: v.firma ? parseInt(v.firma) : null,
                    bolum: v.bolum ? parseInt(v.bolum) : null,
                    pozisyon: v.pozisyon ? parseInt(v.pozisyon) : null,
                    gorev: v.gorev ? parseInt(v.gorev) : null,
                    direktorluk: v.direktorluk ? parseInt(v.direktorluk) : null,
                    yaka: v.yaka ? parseInt(v.yaka) : null,
                    puantaj: v.puantaj ? parseInt(v.puantaj) : null,
                    altFirma: v.altFirma ? parseInt(v.altFirma) : null,
                    telefon1: v.telefon1,
                    telefon2: v.telefon2,
                    cepTelefon: v.cepTelefon,
                    adres: v.adres,
                    il: v.il,
                    ilce: v.ilce,
                    email: v.email,
                    girisTarih: v.girisTarih || null,
                    cikisTarih: v.cikisTarih || null,
                    dogumTarih: v.dogumTarih || null,
                    sonDurum: v.sonDurum === 'true' || v.sonDurum === true,
                    maas: v.maas ? parseInt(v.maas) : null,
                    maasTipi: v.maasTipi ? parseInt(v.maasTipi) : null,
                };
                const res = await PostWithToken('Sicil/Update', updateData);
                if (res?.data?.isError) {
                    AlertFunction('Hata', res.data.message);
                    return;
                }
            }
            setRefreshDatatable(new Date());
            setModalOpen(false);
        } catch (e) {
            AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu');
        }
    };

    const deleteData = async (data) => {
        try {
            const res = await PostWithToken('Sicil/Delete', { Id: data.id });
            if (res?.data?.isError) {
                AlertFunction('Hata', res.data.message);
                return;
            }
            setRefreshDatatable(new Date());
        } catch (e) {
            AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu');
        }
    };

    const editData = async (data) => {
        try {
            const res = await GetWithToken('Sicil/GetById', { id: data.id });
            const d = res?.data?.data;
            if (!d) {
                AlertFunction('Hata', 'Sicil bulunamadı');
                return;
            }
            setInitialData({
                id: d.id,
                ad: d.ad,
                soyad: d.soyad,
                personelNo: d.personelNo,
                sicilNo: d.sicilNo,
                firma: d.firma?.toString() || '',
                bolum: d.bolum?.toString() || '',
                pozisyon: d.pozisyon?.toString() || '',
                gorev: d.gorev?.toString() || '',
                direktorluk: d.direktorluk?.toString() || '',
                yaka: d.yaka?.toString() || '',
                puantaj: d.puantaj?.toString() || '',
                altFirma: d.altFirma?.toString() || '',
                terminalGrubu: d.terminalGrubu?.toString() || '',
                mesaiPeriyodu: d.mesaiPeriyodu?.toString() || '',
                telefon1: d.telefon1 || '',
                telefon2: d.telefon2 || '',
                cepTelefon: d.cepTelefon || '',
                adres: d.adres || '',
                il: d.il || '',
                ilce: d.ilce || '',
                email: d.email || '',
                girisTarih: formatDate(d.girisTarih),
                cikisTarih: formatDate(d.cikisTarih),
                dogumTarih: formatDate(d.dogumTarih),
                sonDurum: d.sonDurum === true ? 'true' : 'false',
                maas: d.maas || 0,
                maasTipi: d.maasTipi || 0,
            });
            setModalOpen(true);
        } catch (e) {
            AlertFunction('Hata', e?.response?.data || 'Sicil yüklenemedi');
        }
    };

    const emptyInitial = {
        id: null,
        ad: '',
        soyad: '',
        personelNo: '',
        sicilNo: '',
        firma: '',
        bolum: '',
        pozisyon: '',
        gorev: '',
        direktorluk: '',
        yaka: '',
        puantaj: '',
        altFirma: '',
        terminalGrubu: '',
        mesaiPeriyodu: mesaiPeriyodList[0]?.id?.toString() || '',
        telefon1: '',
        telefon2: '',
        cepTelefon: '',
        adres: '',
        il: '',
        ilce: '',
        email: '',
        girisTarih: '',
        cikisTarih: '',
        dogumTarih: '',
        sonDurum: 'true',
        maas: 0,
        maasTipi: 0,
    };

    const formInitial = initialData || emptyInitial;

    const SelectField = ({ name, options }) => (
        <Field as="select" name={name} className="form-control">
            <option value="">Seçiniz</option>
            {options.map((o) => (
                <option key={o.id} value={o.id}>{o.text}</option>
            ))}
        </Field>
    );

    return (
        <>
            {loading && <PageLoading />}
            <Modal isOpen={modalOpen} toggle={toggle} size="xl">
                <ModalHeader toggle={toggle}>{formInitial.id ? 'Sicil Düzenle' : 'Sicil Ekle'}</ModalHeader>
                <ModalBody>
                    <Formik initialValues={formInitial} onSubmit={submit} enableReinitialize>
                        {({ handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className="row">
                                <Field type="hidden" name="id" />
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Ad</label>
                                    <Field name="ad" type="text" className="form-control" required />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Soyad</label>
                                    <Field name="soyad" type="text" className="form-control" required />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Personel No</label>
                                    <Field name="personelNo" type="text" className="form-control" />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Sicil No</label>
                                    <Field name="sicilNo" type="text" className="form-control" />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Firma</label>
                                    <SelectField name="firma" options={firmaList} />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Bölüm</label>
                                    <SelectField name="bolum" options={bolumList} />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Pozisyon</label>
                                    <SelectField name="pozisyon" options={pozisyonList} />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Görev</label>
                                    <SelectField name="gorev" options={gorevList} />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Direktörlük</label>
                                    <SelectField name="direktorluk" options={direktorlukList} />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Yaka</label>
                                    <SelectField name="yaka" options={yakaList} />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Puantaj</label>
                                    <SelectField name="puantaj" options={puantajList} />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Alt Firma</label>
                                    <SelectField name="altFirma" options={altFirmaList} />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Terminal Grubu</label>
                                    <SelectField name="terminalGrubu" options={terminalGrupList} />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Mesai Periyodu</label>
                                    <SelectField name="mesaiPeriyodu" options={mesaiPeriyodList} />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Telefon 1</label>
                                    <Field name="telefon1" type="text" className="form-control" />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Telefon 2</label>
                                    <Field name="telefon2" type="text" className="form-control" />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Cep Telefon</label>
                                    <Field name="cepTelefon" type="text" className="form-control" />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">E-posta</label>
                                    <Field name="email" type="email" className="form-control" />
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label">Adres</label>
                                    <Field as="textarea" name="adres" className="form-control" />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">İl</label>
                                    <Field name="il" type="text" className="form-control" />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">İlçe</label>
                                    <Field name="ilce" type="text" className="form-control" />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Giriş Tarihi</label>
                                    <Field name="girisTarih" type="date" className="form-control" />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Çıkış Tarihi</label>
                                    <Field name="cikisTarih" type="date" className="form-control" />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Doğum Tarihi</label>
                                    <Field name="dogumTarih" type="date" className="form-control" />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Son Durum</label>
                                    <Field as="select" name="sonDurum" className="form-control">
                                        <option value="true">Aktif</option>
                                        <option value="false">Pasif</option>
                                    </Field>
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Maaş</label>
                                    <Field name="maas" type="number" className="form-control" />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Maaş Tipi</label>
                                    <Field name="maasTipi" type="number" className="form-control" />
                                </div>
                                <div className="col-12">
                                    <DebisButton type="submit" className="me-2">Kaydet</DebisButton>
                                    <button type="button" className="btn btn-outline-secondary" onClick={toggle}>İptal</button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>
            <Layout>
                <PageHeader
                    title="Sicil Yönetimi"
                    map={[
                        { url: '', name: 'PDKS' },
                        { url: '', name: 'Sicil Yönetimi' },
                    ]}
                />
                <div className="content pr-3 pl-3">
                    <div className="card">
                        <DataTable
                            Refresh={refreshDatatable}
                            DataUrl="Sicil/GetAll"
                            Pagination={{ pageNumber: 1, pageSize: 20 }}
                            UseGetPagination
                            Headers={[
                                ['ad', 'Ad'],
                                ['soyad', 'Soyad'],
                                ['personelNo', 'Personel No'],
                                ['sicilNo', 'Sicil No'],
                                ['firmaAd', 'Firma'],
                                ['bolumAd', 'Bölüm'],
                                ['pozisyonAd', 'Pozisyon'],
                                ['email', 'E-posta'],
                            ]}
                            Title="Sicil Listesi"
                            Description="Personel sicil kayıtlarını listeleyebilir, ekleyebilir ve düzenleyebilirsiniz."
                            HeaderButton={{ text: 'Sicil Ekle', action: () => { setInitialData(null); setModalOpen(true); } }}
                            EditButton={editData}
                            DeleteButton={deleteData}
                        />
                    </div>
                </div>
            </Layout>
        </>
    );
}
