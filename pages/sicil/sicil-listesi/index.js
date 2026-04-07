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
                    flex: 1,
                    width: '100%',
                    minWidth: 0,
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
const MM_TO_PX = 4;

const DEFAULT_CARD_DESIGN = {
    boyutId: 'std',
    genislik: 85,
    yukseklik: 54,
    background: '#ffffff',
    designImage: null,
    designImagePrint: false,
    designImageOpacity: 0.95,
    elements: [],
};

const FotoThumb = ({ src, alt, onClick }) => {
    if (!src) {
        return (
            <div
                className="d-flex align-items-center justify-content-center bg-light rounded border"
                style={{ width: 30, height: 50, minWidth: 30, margin: "0 auto" }}
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
    const [kartModalOpen, setKartModalOpen] = useState(false);
    const [kartPerson, setKartPerson] = useState(null);
    const [kartDesign, setKartDesign] = useState(DEFAULT_CARD_DESIGN);
    const [kartDesignLoading, setKartDesignLoading] = useState(false);

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
    const [yetkiList, setYetkiList] = useState([]);
    const [kanGrubuList, setKanGrubuList] = useState([]);
    const [cinsiyetList, setCinsiyetList] = useState([]);
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
                if (fn) fn('cardId', scannedCode);
            },
        });
        return () => {
            if (onScan.detachFrom) onScan.detachFrom(document);
        };
    }, [modalOpen, initialData?.id]);

    const start = async () => {
        const pagination = { PageNumber: 0, PageSize: 500 };
        const fetchOptions = (url) =>
            GetWithToken(url, pagination)
                .then((x) => x.data?.data?.list || [])
                .catch(() => []);

        const fetchYetki = () =>
            GetWithToken('Yetki/GetAll')
                .then((r) => {
                    const data = r?.data?.data ?? r?.data;
                    return Array.isArray(data) ? data : [];
                })
                .catch(() => []);

        const [firma, bolum, direktorluk, gorev, pozisyon, puantaj, yaka, altFirma, terminalGrup, mesaiPeriyod, yetki, kanGrubu, cinsiyet] =
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
                fetchYetki(),
                fetchOptions('CboKanGrubu/GetAll'),
                fetchOptions('CboCinsiyet/GetAll'),
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
        setYetkiList(
            (yetki || []).map((x) => ({
                id: x?.id ?? x?.Id,
                text: x?.aciklama ?? x?.Aciklama ?? '',
            })).filter((x) => x.id != null)
        );
        setKanGrubuList(
            (kanGrubu || []).map((x) => ({
                id: x?.id ?? x?.Id,
                text: x?.ad ?? x?.Ad ?? '',
            })).filter((x) => x.id != null)
        );
        setCinsiyetList(
            (cinsiyet || []).map((x) => ({
                id: x?.id ?? x?.Id,
                text: x?.ad ?? x?.Ad ?? '',
            })).filter((x) => x.id != null)
        );

        setLoading(false);
    };

    const toggle = () => setModalOpen(!modalOpen);

    const submit = async (v) => {
        try {
            if (!v.id) {
                const requiredCreateFields = [
                    { key: 'ad', label: 'Ad' },
                    { key: 'soyad', label: 'Soyad' },
                    { key: 'cardId', label: 'Kart No' },
                    { key: 'firma', label: 'Firma' },
                    { key: 'bolum', label: 'Bolüm' },
                    { key: 'gorev', label: 'Görev' },
                    { key: 'yaka', label: 'Yaka' },
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
                    cardId: v.cardId,
                    sicilNo: v.sicilNo,
                    firma: v.firma ? parseInt(v.firma, 10) : null,
                    bolum: v.bolum ? parseInt(v.bolum, 10) : null,
                    gorev: v.gorev ? parseInt(v.gorev, 10) : null,
                    yaka: v.yaka ? parseInt(v.yaka, 10) : null,
                    tanim: v.tanim || 'sicil',
                    kanGrubu: (() => {
                        const parsed = parseInt(v.kanGrubu, 10);
                        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
                    })(),
                    cinsiyet: (() => {
                        const parsed = parseInt(v.cinsiyet, 10);
                        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
                    })(),
                    yetkiId: (() => {
                        const parsed = parseInt(v.yetkiId, 10);
                        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
                    })(),
                    girisTarih: v.girisTarih || null,
                    cikisTarih: v.cikisTarih || null,
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
                    sicilNo: v.sicilNo,
                    cardId: v.cardId,
                    firma: v.firma ? parseInt(v.firma) : null,
                    bolum: v.bolum ? parseInt(v.bolum) : null,
                    gorev: v.gorev ? parseInt(v.gorev) : null,
                    yaka: v.yaka ? parseInt(v.yaka) : null,
                    tanim: v.tanim || 'sicil',
                    kanGrubu: (() => {
                        const parsed = parseInt(v.kanGrubu, 10);
                        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
                    })(),
                    cinsiyet: (() => {
                        const parsed = parseInt(v.cinsiyet, 10);
                        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
                    })(),
                    yetkiId: (() => {
                        const parsed = parseInt(v.yetkiId, 10);
                        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
                    })(),
                    girisTarih: v.girisTarih || null,
                    cikisTarih: v.cikisTarih || null,
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
                cardId: `${d.cardId ?? d.CardId ?? ''}`,
                sicilNo: d.sicilNo,
                firma: d.firma?.toString() || '',
                bolum: d.bolum?.toString() || '',
                gorev: d.gorev?.toString() || '',
                yaka: d.yaka?.toString() || '',
                tanim: d.tanim || d.Tanim || 'sicil',
                yetkiId: (() => {
                    const direct = d.yetkiId ?? d.YetkiId;
                    if (direct != null) return `${direct}`;
                    const yetkiStr = d.yetkistr ?? d.Yetkistr ?? '';
                    const firstToken = `${yetkiStr}`.split(',').map((x) => x.trim()).find((x) => /^\d+$/.test(x));
                    return firstToken || '';
                })(),
                kanGrubu: (() => {
                    const kg = d.kanGrubu ?? d.KanGrubu;
                    if (kg == null || kg === '') return '';
                    return `${kg}`;
                })(),
                cinsiyet: (() => {
                    const c = d.cinsiyet ?? d.Cinsiyet;
                    if (c == null || c === '') return '';
                    return `${c}`;
                })(),
                girisTarih: formatDate(d.girisTarih),
                cikisTarih: formatDate(d.cikisTarih),
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
        cardId: '',
        sicilNo: '',
        firma: '',
        bolum: '',
        gorev: '',
        yaka: '',
        tanim: 'sicil',
        yetkiId: '',
        kanGrubu: '',
        cinsiyet: '',
        girisTarih: '',
        cikisTarih: '',
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

    const getPersonFieldValue = (person, key) => {
        if (!person) return '-';
        const ad = person.ad ?? person.Ad ?? '';
        const soyad = person.soyad ?? person.Soyad ?? '';
        const adSoyad = `${ad} ${soyad}`.trim();
        const map = {
            adSoyad,
            ad,
            soyad,
            sicilNo: person.sicilNo ?? person.SicilNo ?? '-',
            personelNo: person.personelNo ?? person.PersonelNo ?? '-',
            kartNo: person.cardId ?? person.CardId ?? '-',
            bolum: person.bolumAd ?? person.BolumAd ?? '-',
            bolumAd: person.bolumAd ?? person.BolumAd ?? '-',
            departman: person.direktorlukAd ?? person.DirektorlukAd ?? '-',
            direktorlukAd: person.direktorlukAd ?? person.DirektorlukAd ?? '-',
            unvan: person.pozisyonAd ?? person.PozisyonAd ?? person.gorevAd ?? person.GorevAd ?? '-',
            pozisyonAd: person.pozisyonAd ?? person.PozisyonAd ?? '-',
            gorevAd: person.gorevAd ?? person.GorevAd ?? '-',
            firma: person.firmaAd ?? person.FirmaAd ?? '-',
            firmaAd: person.firmaAd ?? person.FirmaAd ?? '-',
            email: person.email ?? person.Email ?? '-',
            telefon1: person.telefon1 ?? person.Telefon1 ?? '-',
            cepTelefon: person.cepTelefon ?? person.CepTelefon ?? '-',
        };
        return map[key] ?? '-';
    };

    const getPersonPhotoSrc = (person) =>
        person?.fotoBase64 ??
        person?.FotoBase64 ??
        person?.foto ??
        person?.Foto ??
        person?.image ??
        person?.Image ??
        null;

    const loadCardDesign = async () => {
        if (kartDesignLoading) return;
        setKartDesignLoading(true);
        try {
            const listRes = await GetWithToken('CardDesign/GetAll');
            const listData = listRes?.data?.data;
            const list = Array.isArray(listData) ? listData : [];
            if (list.length === 0) {
                setKartDesign(DEFAULT_CARD_DESIGN);
                return;
            }
            const firstId = list[0]?.id ?? list[0]?.Id;
            const detailRes = await GetWithToken('CardDesign/GetById', { id: firstId });
            const d = detailRes?.data?.data;
            const designJson = d?.designJson ?? d?.DesignJson;
            if (!designJson) {
                setKartDesign(DEFAULT_CARD_DESIGN);
                return;
            }
            const parsed = JSON.parse(designJson);
            setKartDesign({ ...DEFAULT_CARD_DESIGN, ...parsed });
        } catch (_) {
            setKartDesign(DEFAULT_CARD_DESIGN);
        } finally {
            setKartDesignLoading(false);
        }
    };

    const openKartModal = (item) => {
        setKartPerson(item || null);
        setKartModalOpen(true);
        loadCardDesign();
    };

    const yazdirKart = () => {
        if (!kartPerson) return;
        const design = kartDesign || DEFAULT_CARD_DESIGN;
        const widthMm = design.boyutId === 'custom' ? (design.genislik || 85) : (design.genislik || 85);
        const heightMm = design.boyutId === 'custom' ? (design.yukseklik || 54) : (design.yukseklik || 54);

        const escapeHtml = (value) =>
            String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

        const elementsHtml = (Array.isArray(design.elements) ? design.elements : []).map((el) => {
            const x = (el.x || 0) / MM_TO_PX;
            const y = (el.y || 0) / MM_TO_PX;
            const w = (el.width || 20) / MM_TO_PX;
            const h = (el.height || 10) / MM_TO_PX;
            const color = el.color || '#111111';
            const bgColor = el.type === 'line' ? 'transparent' : (el.bgColor || 'transparent');
            const border = el.type === 'line' ? 'none' : `1px solid ${el.borderColor || 'transparent'}`;
            const textAlign = el.textAlign || 'left';
            const fontWeight = el.fontWeight === 'bold' ? '700' : '400';
            const fontSizePt = Math.max(6, Number(el.fontSize) || 11);

            let content = '';
            if (el.type === 'field') content = escapeHtml(getPersonFieldValue(kartPerson, el.fieldKey));
            if (el.type === 'text') content = escapeHtml(el.text || 'Metin');
            if (el.type === 'barcode') content = escapeHtml(el.text || '|||| ||| ||||');
            if (el.type === 'photo') {
                const photoSrc = getPersonPhotoSrc(kartPerson);
                content = photoSrc
                    ? `<img src="${escapeHtml(photoSrc)}" alt="Personel Fotoğrafı" style="width:100%;height:100%;object-fit:cover;" />`
                    : 'Fotoğraf';
            }

            if (el.type === 'line') {
                return `<div style="position:absolute;left:${x}mm;top:${y}mm;width:${w}mm;height:0;border-top:0.35mm solid ${el.bgColor || '#111111'};"></div>`;
            }

            return `<div style="position:absolute;left:${x}mm;top:${y}mm;width:${w}mm;height:${h}mm;color:${color};background:${bgColor};border:${border};text-align:${textAlign};font-size:${fontSizePt}pt;font-weight:${fontWeight};display:flex;align-items:center;justify-content:${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'};padding:0.4mm;box-sizing:border-box;overflow:hidden;">${content}</div>`;
        }).join('');
        const printDesignImageHtml = design.designImage && design.designImagePrint
            ? `<img src="${escapeHtml(design.designImage)}" alt="Kart Tasarım Görseli" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${design.designImageOpacity ?? 0.95};pointer-events:none;z-index:0;" />`
            : '';

        const printHtml = `<!doctype html>
<html><head><meta charset="utf-8" />
<title>Personel Kartı</title>
<style>
@page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }
html, body { margin:0; padding:0; width:${widthMm}mm; height:${heightMm}mm; }
</style>
</head>
<body>
<div style="position:relative;width:${widthMm}mm;height:${heightMm}mm;background:${design.background || '#ffffff'};overflow:hidden;">
${printDesignImageHtml}
${elementsHtml}
</div>
</body></html>`;

        const w = window.open('', '_blank', 'width=900,height=700');
        if (!w) {
            AlertFunction('Hata', 'Yazdırma penceresi açılamadı.');
            return;
        }
        w.document.open();
        w.document.write(printHtml);
        w.document.close();
        w.focus();
        setTimeout(() => {
            w.print();
            w.close();
        }, 250);
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
                                        <h6 className="mb-3">Sicil Bilgileri</h6>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label className="form-label">Fotoğraf</label>
                                                <FotoDropzone value={values.fotoBase64} setFieldValue={setFieldValue} />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Ad</label>
                                                <Field name="ad" type="text" className="form-control" required />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Soyad</label>
                                                <Field name="soyad" type="text" className="form-control" required />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Sicil No</label>
                                                <Field name="sicilNo" type="text" className="form-control" />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Kart No</label>
                                                <Field
                                                    name="cardId"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Kart okuyucudan okutun"
                                                    required
                                                // disabled={!!formInitial.id}
                                                />
                                                {!formInitial.id && (
                                                    <small className="text-muted">Kartı okutun, ID otomatik gelecektir.</small>
                                                )}
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Firma</label>
                                                <ReactSelectField name="firma" options={firmaList} value={values.firma} setFieldValue={setFieldValue} />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Bölüm</label>
                                                <ReactSelectField name="bolum" options={bolumList} value={values.bolum} setFieldValue={setFieldValue} />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Görev</label>
                                                <ReactSelectField name="gorev" options={gorevList} value={values.gorev} setFieldValue={setFieldValue} />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Yaka</label>
                                                <ReactSelectField name="yaka" options={yakaList} value={values.yaka} setFieldValue={setFieldValue} />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">İşe Giriş Tarihi</label>
                                                <Field name="girisTarih" type="date" className="form-control" />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Çıkış Tarihi</label>
                                                <Field name="cikisTarih" type="date" className="form-control" title="Dolu ise işten ayrılmış (Pasif) sayılır" />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Tanım</label>
                                                <Field as="select" name="tanim" className="form-control">
                                                    <option value="sicil">Sicil</option>
                                                    <option value="ziyaretci">Ziyaretçi</option>
                                                </Field>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Yetki</label>
                                                <ReactSelectField name="yetkiId" options={yetkiList} value={values.yetkiId} setFieldValue={setFieldValue} />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Kan Grubu</label>
                                                <ReactSelectField name="kanGrubu" options={kanGrubuList} value={values.kanGrubu} setFieldValue={setFieldValue} placeholder="Seçiniz" />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label">Cinsiyet</label>
                                                <ReactSelectField name="cinsiyet" options={cinsiyetList} value={values.cinsiyet} setFieldValue={setFieldValue} placeholder="Seçiniz" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 p-3 border rounded-3 bg-white shadow-sm">
                                        <h6 className="mb-3">Kart Talimatları</h6>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <div className="row g-2">
                                                    <div className="col-12 col-md-6">
                                                        <div className="border rounded-3 p-3 h-100 bg-light">
                                                            <div className="fw-semibold mb-2">Ön Yüz</div>
                                                            <ul className="mb-0 small text-muted ps-3">
                                                                <li>Kartı okuyucuya okutarak kart numarasını otomatik doldurun.</li>
                                                                <li>Okutma sonrası yetki seçimini kontrol edin.</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-md-6">
                                                        <div className="border rounded-3 p-3 h-100 bg-light">
                                                            <div className="fw-semibold mb-2">Arka Yüz</div>
                                                            <ul className="mb-0 small text-muted ps-3">
                                                                <li>Kartı personel ile eşleştirmek için Card No alanı dolu olmalıdır.</li>
                                                                <li>Gerekirse kartı tekrar okutun.</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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
            <Modal isOpen={kartModalOpen} toggle={() => setKartModalOpen(false)} size="lg" centered>
                <AppModalHeader toggle={() => setKartModalOpen(false)}>
                    <h5 className="mb-0 fw-semibold">Personel Kartı</h5>
                </AppModalHeader>
                <ModalBody>
                    <div className="d-flex justify-content-center mb-3">
                        <div
                            style={{
                                width: `${(kartDesign?.genislik || 85)}mm`,
                                height: `${(kartDesign?.yukseklik || 54)}mm`,
                                position: 'relative',
                                border: '0.2mm solid #cfd4da',
                                background: kartDesign?.background || '#fff',
                                overflow: 'hidden',
                            }}
                        >
                            {kartDesign?.designImage && (
                                <img
                                    src={kartDesign.designImage}
                                    alt="Tasarım arkaplan"
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        opacity: kartDesign.designImageOpacity ?? 0.95,
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                        zIndex: 0,
                                    }}
                                />
                            )}
                            {(Array.isArray(kartDesign?.elements) ? kartDesign.elements : []).map((el, index) => {
                                const xMm = (el.x || 0) / MM_TO_PX;
                                const yMm = (el.y || 0) / MM_TO_PX;
                                const wMm = (el.width || 20) / MM_TO_PX;
                                const hMm = (el.height || 10) / MM_TO_PX;
                                const fontPt = Math.max(6, Number(el.fontSize) || 11);
                                const personPhotoSrc = getPersonPhotoSrc(kartPerson);
                                let text = '';
                                if (el.type === 'field') text = getPersonFieldValue(kartPerson, el.fieldKey);
                                if (el.type === 'text') text = el.text || 'Metin';
                                if (el.type === 'barcode') text = el.text || '|||| ||| ||||';
                                if (el.type === 'photo') text = 'Fotoğraf';

                                if (el.type === 'line') {
                                    return (
                                        <div
                                            key={el.id || `${index}-line`}
                                            style={{
                                                position: 'absolute',
                                                left: `${xMm}mm`,
                                                top: `${yMm}mm`,
                                                width: `${wMm}mm`,
                                                height: 0,
                                                borderTop: `0.35mm solid ${el.bgColor || '#111111'}`,
                                                zIndex: index + 1,
                                            }}
                                        />
                                    );
                                }
                                return (
                                    <div
                                        key={el.id || `${index}-el`}
                                        style={{
                                            position: 'absolute',
                                            left: `${xMm}mm`,
                                            top: `${yMm}mm`,
                                            width: `${wMm}mm`,
                                            height: `${hMm}mm`,
                                            color: el.color || '#111111',
                                            background: el.bgColor || 'transparent',
                                            border: `1px solid ${el.borderColor || 'transparent'}`,
                                            textAlign: el.textAlign || 'left',
                                            fontSize: `${fontPt}pt`,
                                            fontWeight: el.fontWeight || 'normal',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                                            padding: '0.4mm',
                                            boxSizing: 'border-box',
                                            overflow: 'hidden',
                                            zIndex: index + 1,
                                        }}
                                    >
                                        {el.type === 'photo' && personPhotoSrc ? (
                                            <img src={personPhotoSrc} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span className="text-truncate w-100">{text}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-light" onClick={() => setKartModalOpen(false)}>Kapat</button>
                        <button type="button" className="btn btn-primary" onClick={yazdirKart}>
                            <i className="icon-printer me-1" /> Yazdır
                        </button>
                    </div>
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
                                        <div className="col-12 col-md-6 col-lg" style={{ position: "inherit" }}>
                                            <div style={{ position: "absolute", width: 200 }}>


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
                                        <div className="col-12 col-md-6 col-lg" style={{ position: "inherit" }}>
                                            <div style={{ position: "absolute", width: 200 }}>
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
                            Pagination={{ PageNumber: 0, pageSize: 20 }}
                            UseGetPagination
                            Headers={[
                                {
                                    header: 'Foto', dynamicButton: (item) => (
                                        <FotoThumb
                                            src={item.fotoBase64}
                                            alt={`${item.ad || ''} ${item.soyad || ''}`.trim()}
                                            onClick={() => { setFotoModalSrc(item.fotoBase64); setFotoModalOpen(true); }}
                                        />
                                    )
                                },
                                { header: '\u00A0', dynamicButton: (item) => (item.cikisTarih != null && item.cikisTarih !== '') ? <span data-sicil-pasif="1" aria-hidden style={{ display: 'none' }} /> : <span aria-hidden style={{ display: 'none' }} /> },
                                ['ad', 'Ad'],
                                ['soyad', 'Soyad'],
                                ['cardId', 'Kart No'],
                                ['sicilNo', 'Sicil No'],
                                ['firmaAd', 'Firma'],
                                ['bolumAd', 'Bölüm'],
                                ['pozisyonAd', 'Pozisyon'],
                                ['yakaAd', 'Yaka'],
                                ['email', 'E-posta'],
                                {
                                    header: 'Kart',
                                    dynamicButton: (item) => (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={() => openKartModal(item)}
                                        >
                                            <i className='fa fa-eye'></i>
                                        </button>
                                    ),
                                },
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
