import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Modal, ModalBody, Collapse, Button } from 'reactstrap';
import onScan from 'onscan.js';
import { Formik, Form, Field } from 'formik';
import Select from 'react-select';
import { useDropzone } from 'react-dropzone';
import AlertFunction from '../../../components/alertfunction';
import DataTable from '../../../components/datatable';
import AppModalHeader from '../../../components/AppModalHeader';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import PageLoading from '../../../layout/pageLoading';
import DebisButton from '../../../components/button';
import { GetWithToken, PostWithToken } from '../../api/crud';

const formatDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

const CardNoRefSync = ({ setFieldValue, targetRef }) => {
    useEffect(() => {
        if (targetRef) targetRef.current = setFieldValue;
        return () => { if (targetRef) targetRef.current = null; };
    }, [setFieldValue, targetRef]);
    return null;
};

const FotoDropzone = ({ value, setFieldValue, disabled }) => {
    const onDrop = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setFieldValue('fotoBase64', reader.result);
            reader.readAsDataURL(file);
        },
        [setFieldValue]
    );
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
        maxFiles: 1,
        disabled,
    });
    const removeFoto = () => setFieldValue('fotoBase64', value ? 'remove' : '');
    return (
        <div className="d-flex align-items-start gap-3">
            {value && value !== 'remove' ? (
                <div className="position-relative">
                    <img
                        src={value}
                        alt="Foto"
                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #dee2e6' }}
                    />
                    <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle m-1 p-0"
                        style={{ width: 24, height: 24, lineHeight: 1 }}
                        onClick={removeFoto}
                        title="Fotoğrafı kaldır"
                    >
                        ×
                    </button>
                </div>
            ) : null}
            <div
                {...getRootProps()}
                className={`border rounded-3 p-3 text-center ${isDragActive ? 'border-primary bg-light' : 'border-dashed'}`}
                style={{
                    minWidth: 120,
                    minHeight: 100,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.6 : 1,
                }}
            >
                <input {...getInputProps()} />
                <i className="icon-image2 text-muted" style={{ fontSize: 28 }} />
                <div className="small text-muted mt-1">
                    {isDragActive ? 'Buraya bırak...' : 'Sürükle veya tıkla'}
                </div>
            </div>
        </div>
    );
};

const SIMULATE_CARD_NO = '12345678';

const FotoThumb = ({ src, alt, onClick }) => {
    if (!src) {
        return (
            <div
                className="d-flex align-items-center justify-content-center bg-light rounded border"
                style={{ width: 30, height: 50, minWidth: 30,    margin: "0 auto" }}
            >
                <i className="icon-user text-muted" style={{ fontSize: 28 }} />
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={alt || 'Foto'}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
            style={{
                width: 50,
                height: 30,
                objectFit: 'cover',
                borderRadius: 6,
                border: '1px solid #dee2e6',
                cursor: onClick ? 'pointer' : 'default',
            }}
        />
    );
};

export default function SicilIndex() {
    const [modalOpen, setModalOpen] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [refreshDatatable, setRefreshDatatable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(true);

    const [filterAd, setFilterAd] = useState('');
    const [filterSoyad, setFilterSoyad] = useState('');
    const [filterSicilNo, setFilterSicilNo] = useState('');
    const [filterFirma, setFilterFirma] = useState('');
    const [filterBolum, setFilterBolum] = useState('');
    const [filterSonDurum, setFilterSonDurum] = useState('');
    const [fotoModalOpen, setFotoModalOpen] = useState(false);
    const [fotoModalSrc, setFotoModalSrc] = useState(null);

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
    const cardNoSetFieldRef = useRef(null);

    useEffect(() => {
        start();
    }, []);

    useEffect(() => {
        if (!modalOpen || initialData?.id) return;
        if (typeof onScan?.isAttachedTo === 'function' && onScan.isAttachedTo(document)) onScan.detachFrom(document);
        onScan.attachTo(document, {
            timeBeforeScanTest: 200,
            avgTimeByChar: 40,
            minLength: 4,
            suffixKeyCodes: [9, 13],
            onScan: (scannedCode) => {
                const fn = cardNoSetFieldRef.current;
                if (fn) fn('cardNo', scannedCode);
            },
        });
        return () => {
            if (onScan.detachFrom) onScan.detachFrom(document);
        };
    }, [modalOpen, initialData?.id]);

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
                    fotoBase64: (v.fotoBase64 && v.fotoBase64 !== 'remove') ? v.fotoBase64 : null,
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
                    fotoBase64: v.fotoBase64 === 'remove' ? 'remove' : (v.fotoBase64 || null),
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
                fotoBase64: d.fotoBase64 || '',
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
        fotoBase64: '',
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

    const filterParams = useMemo(() => {
        const p = {};
        if (filterAd?.trim()) p.Ad = filterAd.trim();
        if (filterSoyad?.trim()) p.Soyad = filterSoyad.trim();
        if (filterSicilNo?.trim()) p.SicilNo = filterSicilNo.trim();
        if (filterFirma && filterFirma !== '0') p.Firma = filterFirma;
        if (filterBolum && filterBolum !== '0') p.Bolum = filterBolum;
        if (filterSonDurum === 'true') p.SonDurum = true;
        if (filterSonDurum === 'false') p.SonDurum = false;
        return p;
    }, [filterAd, filterSoyad, filterSicilNo, filterFirma, filterBolum, filterSonDurum]);

    const dataUrlWithFilters = useMemo(() => {
        const qs = new URLSearchParams(filterParams).toString();
        return `Sicil/GetAll${qs ? '?' + qs : ''}`;
    }, [filterParams]);

    const activeFilterCount = Object.keys(filterParams).length;

    const applyFilters = () => {
        setRefreshDatatable(new Date());
    };

    const clearFilters = () => {
        setFilterAd('');
        setFilterSoyad('');
        setFilterSicilNo('');
        setFilterFirma('');
        setFilterBolum('');
        setFilterSonDurum('');
        setRefreshDatatable(new Date());
    };

    const firmaFilterOptions = useMemo(
        () => [{ value: '', label: 'Tümü' }, ...toSelectOptions(firmaList)],
        [firmaList]
    );
    const bolumFilterOptions = useMemo(
        () => [{ value: '', label: 'Tümü' }, ...toSelectOptions(bolumList)],
        [bolumList]
    );
    const sonDurumFilterOptions = [
        { value: '', label: 'Tümü' },
        { value: 'true', label: 'Aktif' },
        { value: 'false', label: 'Pasif' },
    ];

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
                            <>
                                {!formInitial.id && (
                                    <CardNoRefSync setFieldValue={setFieldValue} targetRef={cardNoSetFieldRef} />
                                )}
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
                                                <div className="d-flex gap-2 align-items-center">
                                                    <Field
                                                        name="cardNo"
                                                        type="text"
                                                        className="form-control flex-grow-1"
                                                        placeholder="Kart okuyucudan okutun veya simüle edin"
                                                        required
                                                    />
                                                    {/* {!formInitial.id && (
                                                    <Button
                                                        type="button"
                                                        color="outline-secondary"
                                                        size="sm"
                                                        title="Kart okutmayı simüle et (test)"
                                                        onClick={() => setFieldValue('cardNo', SIMULATE_CARD_NO)}
                                                    >
                                                        <i className="icon-barcode2 me-1" /> Simüle
                                                    </Button>
                                                )} */}
                                                </div>
                                                {!formInitial.id && (
                                                    <small className="text-muted">Keyboard wedge okuyucu: Kartı okutun, ID otomatik gelecektir.</small>
                                                )}
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Fotoğraf</label>
                                                <FotoDropzone value={values.fotoBase64} setFieldValue={setFieldValue} />
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
                                            <div className="col-12 col-md-6"><label className="form-label">Çıkış Tarihi</label><Field name="cikisTarih" type="date" className="form-control" title="Dolu ise işten ayrılmış (Pasif) sayılır" /></div>
                                            <div className="col-12 col-md-6"><label className="form-label">Doğum Tarihi</label><Field name="dogumTarih" type="date" className="form-control" /></div>
                                            <div className="col-12 col-md-6"><label className="form-label">Maaş</label><Field name="maas" type="number" className="form-control" /></div>
                                            <div className="col-12 col-md-6"><label className="form-label">Maaş Tipi</label><Field name="maasTipi" type="number" className="form-control" /></div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <DebisButton type="submit" className="me-2 px-4">Kaydet</DebisButton>
                                        <button type="button" className="btn btn-outline-secondary px-4" onClick={toggle}>İptal</button>
                                    </div>
                                </Form>
                            </>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>
            <Modal isOpen={fotoModalOpen} toggle={() => setFotoModalOpen(false)} size="lg" centered>
                <AppModalHeader toggle={() => setFotoModalOpen(false)}>
                    <h5 className="mb-0 fw-semibold">Fotoğraf</h5>
                </AppModalHeader>
                <ModalBody className="text-center p-4">
                    {fotoModalSrc ? (
                        <img
                            src={fotoModalSrc}
                            alt="Büyük görünüm"
                            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                        />
                    ) : null}
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
                        <div
                            className="card-body p-0"
                            style={{
                                borderRadius: 10,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                marginBottom: 15,
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                className="border-bottom"
                                style={{
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    background: filterOpen ? 'rgba(124, 58, 237, 0.08)' : '#f8f9fa',
                                }}
                                onClick={() => setFilterOpen(!filterOpen)}
                                onKeyDown={(e) => e.key === 'Enter' && setFilterOpen(!filterOpen)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = filterOpen ? 'rgba(124, 58, 237, 0.12)' : '#e9ecef';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = filterOpen ? 'rgba(124, 58, 237, 0.08)' : '#f8f9fa';
                                }}
                                role="button"
                                tabIndex={0}
                                title={filterOpen ? 'Filtreleri gizle' : 'Filtreleri göster'}
                            >
                                <div
                                    className="d-flex align-items-center justify-content-between px-4 py-3"
                                    style={{ borderLeft: '4px solid #7c3aed' }}
                                >
                                    <span className="d-flex align-items-center gap-2">
                                        <i className="icon-filter4 text-primary" style={{ fontSize: '1.1rem' }} />
                                        <span className="fw-semibold">Filtreler</span>
                                        <span className="text-muted small">
                                            ({filterOpen ? 'gizlemek için tıklayın' : 'görmek için tıklayın'})
                                        </span>
                                        {activeFilterCount > 0 && (
                                            <span className="badge bg-primary rounded-pill">{activeFilterCount} aktif</span>
                                        )}
                                    </span>
                                    <span className="d-flex align-items-center gap-2 text-muted small">
                                        <span>{filterOpen ? 'Daralt' : 'Genişlet'}</span>
                                        <i
                                            className="icon-arrow-down8"
                                            style={{
                                                transform: filterOpen ? 'rotate(180deg)' : 'none',
                                                transition: 'transform 0.25s',
                                                fontSize: '1.25rem',
                                            }}
                                        />
                                    </span>
                                </div>
                            </div>
                            <Collapse isOpen={filterOpen}>
                                <div className="px-4 pb-4 pt-0">
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6 col-lg">
                                            <label className="form-label small text-muted mb-1">Ad (İçerir)</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Ad ile ara..."
                                                value={filterAd}
                                                onChange={(e) => setFilterAd(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyFilters(); } }}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6 col-lg">
                                            <label className="form-label small text-muted mb-1">Soyad (İçerir)</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Soyad ile ara..."
                                                value={filterSoyad}
                                                onChange={(e) => setFilterSoyad(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyFilters(); } }}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6 col-lg">
                                            <label className="form-label small text-muted mb-1">Sicil No (Eşittir)</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Sicil No"
                                                value={filterSicilNo}
                                                onChange={(e) => setFilterSicilNo(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyFilters(); } }}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6 col-lg" style={{position:"inherit"}}>
                                            <div style={{position:"absolute",width:200}}>


                                                <label className="form-label small text-muted mb-1">Firma</label>

                                                <Select
                                                    classNamePrefix="react-select"
                                                    options={firmaFilterOptions}
                                                    value={firmaFilterOptions.find((x) => x.value === filterFirma) || firmaFilterOptions[0]}
                                                    placeholder="Tümü"
                                                    isClearable={false}
                                                    onChange={(o) => setFilterFirma(o?.value ?? '')}
                                                    styles={{
                                                        control: (base, state) => ({
                                                            ...base,
                                                            minHeight: 32,
                                                            fontSize: '0.875rem',
                                                            borderRadius: 6,
                                                            borderColor: state.isFocused ? '#7c3aed' : '#dee2e6',
                                                        }),
                                                        menu: (base) => ({ ...base, zIndex: 9999 }),
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6 col-lg" style={{position:"inherit"}}>
                                             <div style={{position:"absolute",width:200}}>
                                            <label className="form-label small text-muted mb-1">Bölüm</label>
                                            <Select
                                                classNamePrefix="react-select"
                                                options={bolumFilterOptions}
                                                value={bolumFilterOptions.find((x) => x.value === filterBolum) || bolumFilterOptions[0]}
                                                placeholder="Tümü"
                                                isClearable={false}
                                                onChange={(o) => setFilterBolum(o?.value ?? '')}
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: 32,
                                                        fontSize: '0.875rem',
                                                        borderRadius: 6,
                                                        borderColor: state.isFocused ? '#7c3aed' : '#dee2e6',
                                                    }),
                                                    menu: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                            />
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6 col-lg" style={{ position: 'inherit' }}>
                                            <div style={{ position: 'absolute', width: 200 }}>
                                                <label className="form-label small text-muted mb-1">Durum</label>
                                                <Select
                                                    classNamePrefix="react-select"
                                                    options={sonDurumFilterOptions}
                                                    value={sonDurumFilterOptions.find((x) => x.value === filterSonDurum) || sonDurumFilterOptions[0]}
                                                    placeholder="Tümü"
                                                    isClearable={false}
                                                    onChange={(o) => setFilterSonDurum(o?.value ?? '')}
                                                    styles={{
                                                        control: (base, state) => ({
                                                            ...base,
                                                            minHeight: 32,
                                                            fontSize: '0.875rem',
                                                            borderRadius: 6,
                                                            borderColor: state.isFocused ? '#7c3aed' : '#dee2e6',
                                                        }),
                                                        menu: (base) => ({ ...base, zIndex: 9999 }),
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-auto d-flex align-items-end gap-2">
                                            <Button color="primary" size="sm" onClick={applyFilters}>
                                                <i className="icon-search4 me-1" /> Filtrele
                                            </Button>
                                            <Button color="light" size="sm" outline onClick={clearFilters}>
                                                Temizle
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Collapse>
                        </div>
                        <style>{`
                            .datatable-pro .datatable-table tbody tr:has(td [data-sicil-pasif="1"]) {
                                background-color: #ffe0e0;
                            }
                        `}</style>
                        <DataTable
                            Refresh={refreshDatatable}
                            DataUrl={dataUrlWithFilters}
                            Pagination={{ pageNumber: 1, pageSize: 20 }}
                            UseGetPagination
                            Headers={[
                                { header: 'Foto', dynamicButton: (item) => (
                                    <FotoThumb
                                        src={item.fotoBase64}
                                        alt={`${item.ad || ''} ${item.soyad || ''}`.trim()}
                                        onClick={() => { setFotoModalSrc(item.fotoBase64); setFotoModalOpen(true); }}
                                    />
                                ) },
                                { header: '\u00A0', dynamicButton: (item) => (item.cikisTarih != null && item.cikisTarih !== '') ? <span data-sicil-pasif="1" aria-hidden style={{ display: 'none' }} /> : <span aria-hidden style={{ display: 'none' }} /> },
                                ['ad', 'Ad'],
                                ['soyad', 'Soyad'],
                           
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
