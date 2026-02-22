import React, { useEffect, useState } from 'react';
import { Modal, ModalBody } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import Select from 'react-select';
import AlertFunction from '../../../components/alertfunction';
import DataTable from '../../../components/datatable';
import AppModalHeader from '../../../components/AppModalHeader';
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
                const requiredCreateFields = [
                    { key: 'ad', label: 'Ad' },
                    { key: 'soyad', label: 'Soyad' },
                    { key: 'cardNo', label: 'Card No' },
                    { key: 'firma', label: 'Firma' },
                    { key: 'bolum', label: 'Bolüm' },
                    { key: 'pozisyon', label: 'Pozisyon' },
                    { key: 'gorev', label: 'Görev' },
                    { key: 'direktorluk', label: 'Direktörlük' },
                    { key: 'yaka', label: 'Yaka' },
                    { key: 'puantaj', label: 'Puantaj' },
                    { key: 'altFirma', label: 'Alt Firma' },
                ];

                const missingFields = requiredCreateFields
                    .filter((x) => !v[x.key] && v[x.key] !== 0)
                    .map((x) => x.label);

                if (missingFields.length > 0) {
                    AlertFunction('Eksik alan', `${missingFields.join(', ')} alan(lar)ı zorunludur.`);
                    return;
                }

                const createData = {
                    ad: v.ad,
                    soyad: v.soyad,
                    personelNo: v.personelNo,
                    cardNo: v.cardNo,
                    sicilNo: v.sicilNo,
                    firma: parseInt(v.firma, 10),
                    bolum: parseInt(v.bolum, 10),
                    pozisyon: parseInt(v.pozisyon, 10),
                    gorev: parseInt(v.gorev, 10),
                    direktorluk: parseInt(v.direktorluk, 10),
                    yaka: parseInt(v.yaka, 10),
                    puantaj: parseInt(v.puantaj, 10),
                    altFirma: parseInt(v.altFirma, 10),
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
                cardNo: '',
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
        cardNo: '',
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

    const toSelectOptions = (options) => options.map((o) => ({ value: `${o.id}`, label: o.text }));

    const ReactSelectField = ({ name, options, value, setFieldValue, placeholder = 'Seçiniz' }) => {
        const mappedOptions = toSelectOptions(options);
        const selected = mappedOptions.find((x) => x.value === `${value ?? ''}`) || null;

        return (
            <Select
                classNamePrefix="react-select"
                options={mappedOptions}
                value={selected}
                placeholder={placeholder}
                isClearable
                onChange={(selectedOption) => setFieldValue(name, selectedOption ? selectedOption.value : '')}
                styles={{
                    control: (base, state) => ({
                        ...base,
                        minHeight: 40,
                        borderRadius: 10,
                        borderColor: state.isFocused ? '#7c3aed' : '#d0d5dd',
                        boxShadow: state.isFocused ? '0 0 0 2px rgba(124, 58, 237, 0.15)' : 'none',
                    }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
            />
        );
    };

    const modalTitle = formInitial.id ? 'Sicil Düzenle' : 'Sicil Ekle';

    return (
        <>
            {loading && <PageLoading />}
            <Modal isOpen={modalOpen} toggle={toggle} size="xl" centered scrollable>
                <AppModalHeader toggle={toggle} className="border-0 pb-2">
                    <div>
                        <h5 className="mb-0 fw-semibold">{modalTitle}</h5>
                        <small className="text-muted">Personel bilgilerini eksiksiz ve doğru giriniz.</small>
                    </div>
                </AppModalHeader>
                <ModalBody>
                    <Formik initialValues={formInitial} onSubmit={submit} enableReinitialize>
                        {({ handleSubmit, values, setFieldValue }) => (
                            <Form onSubmit={handleSubmit} className="row g-2">
                                <Field type="hidden" name="id" />
                                <div className="col-12 p-3 border rounded-3 bg-light shadow-sm">
                                    <h6 className="mb-3">Temel Bilgiler</h6>
                                    <div className="row g-2">
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">Ad</label>
                                            <Field name="ad" type="text" className="form-control" required />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">Soyad</label>
                                            <Field name="soyad" type="text" className="form-control" required />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">Personel No</label>
                                            <Field name="personelNo" type="text" className="form-control" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">Sicil No</label>
                                            <Field name="sicilNo" type="text" className="form-control" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">Card No</label>
                                            <Field name="cardNo" type="text" className="form-control" required />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 p-3 border rounded-3 bg-white shadow-sm">
                                    <h6 className="mb-3">Organizasyon Bilgileri</h6>
                                    <div className="row g-2">
                                        <div className="col-12 col-md-6"><label className="form-label">Firma</label><ReactSelectField name="firma" options={firmaList} value={values.firma} setFieldValue={setFieldValue} /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Bölüm</label><ReactSelectField name="bolum" options={bolumList} value={values.bolum} setFieldValue={setFieldValue} /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Pozisyon</label><ReactSelectField name="pozisyon" options={pozisyonList} value={values.pozisyon} setFieldValue={setFieldValue} /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Görev</label><ReactSelectField name="gorev" options={gorevList} value={values.gorev} setFieldValue={setFieldValue} /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Direktörlük</label><ReactSelectField name="direktorluk" options={direktorlukList} value={values.direktorluk} setFieldValue={setFieldValue} /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Yaka</label><ReactSelectField name="yaka" options={yakaList} value={values.yaka} setFieldValue={setFieldValue} /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Puantaj</label><ReactSelectField name="puantaj" options={puantajList} value={values.puantaj} setFieldValue={setFieldValue} /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Alt Firma</label><ReactSelectField name="altFirma" options={altFirmaList} value={values.altFirma} setFieldValue={setFieldValue} /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Terminal Grubu</label><ReactSelectField name="terminalGrubu" options={terminalGrupList} value={values.terminalGrubu} setFieldValue={setFieldValue} /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Mesai Periyodu</label><ReactSelectField name="mesaiPeriyodu" options={mesaiPeriyodList} value={values.mesaiPeriyodu} setFieldValue={setFieldValue} /></div>
                                    </div>
                                </div>
                                <div className="col-12 p-3 border rounded-3 bg-white shadow-sm">
                                    <h6 className="mb-3">İletişim</h6>
                                    <div className="row g-2">
                                        <div className="col-12 col-md-6"><label className="form-label">Telefon 1</label><Field name="telefon1" type="text" className="form-control" /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Telefon 2</label><Field name="telefon2" type="text" className="form-control" /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Cep Telefon</label><Field name="cepTelefon" type="text" className="form-control" /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">E-posta</label><Field name="email" type="email" className="form-control" /></div>
                                        <div className="col-12"><label className="form-label">Adres</label><Field as="textarea" name="adres" className="form-control" rows="2" /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">İl</label><Field name="il" type="text" className="form-control" /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">İlçe</label><Field name="ilce" type="text" className="form-control" /></div>
                                    </div>
                                </div>
                                <div className="col-12 p-3 border rounded-3 bg-white shadow-sm">
                                    <h6 className="mb-3">Tarih ve Finans</h6>
                                    <div className="row g-2">
                                        <div className="col-12 col-md-6"><label className="form-label">Giriş Tarihi</label><Field name="girisTarih" type="date" className="form-control" /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Çıkış Tarihi</label><Field name="cikisTarih" type="date" className="form-control" /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Doğum Tarihi</label><Field name="dogumTarih" type="date" className="form-control" /></div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">Son Durum</label>
                                            <ReactSelectField
                                                name="sonDurum"
                                                options={[{ id: 'true', text: 'Aktif' }, { id: 'false', text: 'Pasif' }]}
                                                value={values.sonDurum}
                                                setFieldValue={setFieldValue}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6"><label className="form-label">Maaş</label><Field name="maas" type="number" className="form-control" /></div>
                                        <div className="col-12 col-md-6"><label className="form-label">Maaş Tipi</label><Field name="maasTipi" type="number" className="form-control" /></div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <DebisButton type="submit" className="me-2 px-4">Kaydet</DebisButton>
                                    <button type="button" className="btn btn-outline-secondary px-4" onClick={toggle}>İptal</button>
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
