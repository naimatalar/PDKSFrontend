import React, { useEffect, useMemo, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import AsyncSelect from 'react-select/async';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import AlertFunction from '../../../components/alertfunction';
import { GetWithToken, PostWithToken } from '../../api/crud';
import styles from './kart-duzenle.module.css';

const KART_BOYUTLARI = [
    { id: 'std', label: 'Standart (85 x 54 mm)', width: 85, height: 54 },
    { id: 'a7', label: 'A7 (74 x 105 mm)', width: 74, height: 105 },
    { id: 'custom', label: 'Özel Boyut', width: 85, height: 54 },
];

const FIELD_OPTIONS = [
    { key: 'adSoyad', label: 'Ad Soyad', sample: 'Ahmet Yılmaz' },
    { key: 'ad', label: 'Ad', sample: 'Ahmet' },
    { key: 'soyad', label: 'Soyad', sample: 'Yılmaz' },
    { key: 'sicilNo', label: 'Sicil No', sample: '12345' },
    { key: 'personelNo', label: 'Personel No', sample: 'P-001' },
    { key: 'userId', label: 'Kullanıcı ID', sample: '1001' },
    { key: 'kartNo', label: 'Kart No', sample: 'A0009876' },
    { key: 'email', label: 'E-Posta', sample: 'ornek@firma.com' },
    { key: 'telefon1', label: 'Telefon 1', sample: '0212 000 00 00' },
    { key: 'telefon2', label: 'Telefon 2', sample: '0212 000 00 01' },
    { key: 'cepTelefon', label: 'Cep Telefon', sample: '0555 000 00 00' },
    { key: 'adres', label: 'Adres', sample: 'Örnek Mahallesi' },
    { key: 'il', label: 'İl', sample: 'İstanbul' },
    { key: 'ilce', label: 'İlçe', sample: 'Kadıköy' },
    { key: 'bolum', label: 'Bölüm', sample: 'Bilgi İşlem' },
    { key: 'bolumAd', label: 'Bölüm Adı', sample: 'Bilgi İşlem' },
    { key: 'departman', label: 'Departman', sample: 'IT' },
    { key: 'direktorlukAd', label: 'Direktörlük', sample: 'Teknoloji' },
    { key: 'unvan', label: 'Ünvan', sample: 'Uzman' },
    { key: 'pozisyonAd', label: 'Pozisyon', sample: 'Uzman' },
    { key: 'gorevAd', label: 'Görev', sample: 'Yazılım Uzmanı' },
    { key: 'yakaAd', label: 'Yaka', sample: 'Beyaz Yaka' },
    { key: 'puantajAd', label: 'Puantaj', sample: 'Standart' },
    { key: 'terminalGrubuAd', label: 'Terminal Grubu', sample: 'Merkez' },
    { key: 'firma', label: 'Firma', sample: 'Labote' },
    { key: 'firmaAd', label: 'Firma Adı', sample: 'Labote' },
    { key: 'altFirmaAd', label: 'Alt Firma', sample: 'Alt Labote' },
    { key: 'kanGrubu', label: 'Kan Grubu', sample: 'A Rh+' },
    { key: 'dogumTarih', label: 'Doğum Tarihi', sample: '1990-01-01' },
    { key: 'girisTarih', label: 'Giriş Tarihi', sample: '2020-01-01' },
    { key: 'cikisTarih', label: 'Çıkış Tarihi', sample: '-' },
    { key: 'periyodBaslangici', label: 'Periyod Başlangıcı', sample: '2024-01-01' },
    { key: 'mesaiPeriyodu', label: 'Mesai Periyodu', sample: 'Aylık' },
    { key: 'sonDurum', label: 'Son Durum', sample: 'Aktif' },
    { key: 'expireDate', label: 'Geçerlilik Tarihi', sample: '2026-12-31' },
    { key: 'fazlaMesai', label: 'Fazla Mesai', sample: '0' },
    { key: 'eksikMesai', label: 'Eksik Mesai', sample: '0' },
    { key: 'eksikMesaiFm', label: 'Eksik Mesai FM', sample: '0' },
    { key: 'erkenMesai', label: 'Erken Mesai', sample: '0' },
    { key: 'eksikGun', label: 'Eksik Gün', sample: '0' },
    { key: 'maasTipi', label: 'Maaş Tipi', sample: 'Aylık' },
    { key: 'maas', label: 'Maaş', sample: '0' },
    { key: 'aylikCalismaSaati', label: 'Aylık Çalışma Saati', sample: '225' },
    { key: 'bilgi', label: 'Bilgi', sample: '-' },
];

const ELEMENT_LIBRARY = [
    { type: 'text', label: 'Serbest Metin' },
    { type: 'field', label: 'Veri Alanı' },
    { type: 'photo', label: 'Fotoğraf' },
    { type: 'barcode', label: 'Barkod' },
    { type: 'line', label: 'Çizgi' },
    { type: 'box', label: 'Kutu' },
];

const MM_TO_PX = 4;
const DEFAULT_DESIGN = {
    boyutId: 'std',
    genislik: 85,
    yukseklik: 54,
    background: '#ffffff',
    designImage: null,
    designImagePrint: false,
    designImageOpacity: 0.95,
    elements: [
        {
            id: 'el-photo-1',
            type: 'photo',
            x: 8,
            y: 8,
            width: 56,
            height: 68,
            text: 'Foto',
            fontSize: 10,
            fontWeight: 'normal',
            color: '#ffffff',
            bgColor: '#6c757d',
            borderColor: '#cccccc',
            textAlign: 'center',
            fieldKey: '',
        },
        {
            id: 'el-field-1',
            type: 'field',
            x: 74,
            y: 10,
            width: 210,
            height: 20,
            text: '',
            fontSize: 12,
            fontWeight: 'normal',
            color: '#111111',
            bgColor: 'transparent',
            borderColor: 'transparent',
            textAlign: 'left',
            fieldKey: 'adSoyad',
        },
    ],
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const makeId = (type) => `el-${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const getFieldSample = (key) => FIELD_OPTIONS.find((x) => x.key === key)?.sample || 'Alan';

const getPersonFieldValue = (person, key) => {
    if (!person) return getFieldSample(key);
    const ad = person.ad ?? person.Ad ?? '';
    const soyad = person.soyad ?? person.Soyad ?? '';
    const adSoyad = person.adSoyad ?? person.AdSoyad ?? `${ad} ${soyad}`.trim();
    const toText = (v) => {
        if (v === null || v === undefined || v === '') return '-';
        if (typeof v === 'boolean') return v ? 'Evet' : 'Hayır';
        return String(v);
    };
    const readAny = (...names) => {
        for (const name of names) {
            if (person[name] !== undefined && person[name] !== null && person[name] !== '') return person[name];
        }
        return null;
    };
    const fieldMap = {
        adSoyad,
        ad: toText(readAny('ad', 'Ad')),
        soyad: toText(readAny('soyad', 'Soyad')),
        sicilNo: toText(readAny('sicilNo', 'SicilNo', 'personelNo', 'PersonelNo')),
        personelNo: toText(readAny('personelNo', 'PersonelNo')),
        userId: toText(readAny('userId', 'UserId')),
        kartNo: toText(readAny('cardId', 'CardId', 'kartNo', 'KartNo')),
        bolum: toText(readAny('bolumAd', 'BolumAd', 'bolum', 'Bolum')),
        bolumAd: toText(readAny('bolumAd', 'BolumAd')),
        departman: toText(readAny('direktorlukAd', 'DirektorlukAd', 'departman', 'Departman')),
        direktorlukAd: toText(readAny('direktorlukAd', 'DirektorlukAd')),
        unvan: toText(readAny('pozisyonAd', 'PozisyonAd', 'gorevAd', 'GorevAd', 'unvan', 'Unvan')),
        pozisyonAd: toText(readAny('pozisyonAd', 'PozisyonAd')),
        gorevAd: toText(readAny('gorevAd', 'GorevAd')),
        yakaAd: toText(readAny('yakaAd', 'YakaAd')),
        puantajAd: toText(readAny('puantajAd', 'PuantajAd')),
        terminalGrubuAd: toText(readAny('terminalGrubuAd', 'TerminalGrubuAd')),
        firma: toText(readAny('firmaAd', 'FirmaAd', 'firma', 'Firma')),
        firmaAd: toText(readAny('firmaAd', 'FirmaAd')),
        altFirmaAd: toText(readAny('altFirmaAd', 'AltFirmaAd')),
        email: toText(readAny('email', 'Email')),
        telefon1: toText(readAny('telefon1', 'Telefon1')),
        telefon2: toText(readAny('telefon2', 'Telefon2')),
        cepTelefon: toText(readAny('cepTelefon', 'CepTelefon')),
        adres: toText(readAny('adres', 'Adres')),
        il: toText(readAny('il', 'Il')),
        ilce: toText(readAny('ilce', 'Ilce')),
        kanGrubu: toText(readAny('kanGrubu', 'KanGrubu')),
        dogumTarih: toText(readAny('dogumTarih', 'DogumTarih')),
        girisTarih: toText(readAny('girisTarih', 'GirisTarih')),
        cikisTarih: toText(readAny('cikisTarih', 'CikisTarih')),
        periyodBaslangici: toText(readAny('periyodBaslangici', 'PeriyodBaslangici')),
        mesaiPeriyodu: toText(readAny('mesaiPeriyodu', 'MesaiPeriyodu')),
        sonDurum: toText(readAny('sonDurum', 'SonDurum')),
        expireDate: toText(readAny('expireDate', 'ExpireDate')),
        fazlaMesai: toText(readAny('fazlaMesai', 'FazlaMesai')),
        eksikMesai: toText(readAny('eksikMesai', 'EksikMesai')),
        eksikMesaiFm: toText(readAny('eksikMesaiFm', 'EksikMesaiFm')),
        erkenMesai: toText(readAny('erkenMesai', 'ErkenMesai')),
        eksikGun: toText(readAny('eksikGun', 'EksikGun')),
        maasTipi: toText(readAny('maasTipi', 'MaasTipi')),
        maas: toText(readAny('maas', 'Maas')),
        aylikCalismaSaati: toText(readAny('aylikCalismaSaati', 'AylikCalismaSaati')),
        bilgi: toText(readAny('bilgi', 'Bilgi')),
    };
    if (fieldMap[key] !== undefined) return fieldMap[key];
    return toText(readAny(key, key.charAt(0).toUpperCase() + key.slice(1)));
};

const getPersonPhotoSrc = (person) =>
    person?.fotoBase64 ??
    person?.FotoBase64 ??
    person?.foto ??
    person?.Foto ??
    person?.image ??
    person?.Image ??
    null;

const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

const createElementByType = (type, x = 16, y = 16) => {
    if (type === 'photo') {
        return {
            id: makeId(type),
            type,
            x,
            y,
            width: 56,
            height: 68,
            text: 'Foto',
            fontSize: 10,
            fontWeight: 'normal',
            color: '#ffffff',
            bgColor: '#6c757d',
            borderColor: '#cccccc',
            textAlign: 'center',
            fieldKey: '',
        };
    }

    if (type === 'barcode') {
        return {
            id: makeId(type),
            type,
            x,
            y,
            width: 148,
            height: 40,
            text: '|||| ||| |||| | |||',
            fontSize: 10,
            fontWeight: 'normal',
            color: '#111111',
            bgColor: '#ffffff',
            borderColor: '#111111',
            textAlign: 'center',
            fieldKey: '',
        };
    }

    if (type === 'line') {
        return {
            id: makeId(type),
            type,
            x,
            y,
            width: 180,
            height: 2,
            text: '',
            fontSize: 10,
            fontWeight: 'normal',
            color: '#111111',
            bgColor: '#111111',
            borderColor: 'transparent',
            textAlign: 'left',
            fieldKey: '',
        };
    }

    if (type === 'box') {
        return {
            id: makeId(type),
            type,
            x,
            y,
            width: 80,
            height: 40,
            text: '',
            fontSize: 10,
            fontWeight: 'normal',
            color: '#111111',
            bgColor: 'transparent',
            borderColor: '#111111',
            textAlign: 'left',
            fieldKey: '',
        };
    }

    if (type === 'field') {
        return {
            id: makeId(type),
            type,
            x,
            y,
            width: 130,
            height: 20,
            text: '',
            fontSize: 11,
            fontWeight: 'normal',
            color: '#111111',
            bgColor: 'transparent',
            borderColor: 'transparent',
            textAlign: 'left',
            fieldKey: 'sicilNo',
        };
    }

    return {
        id: makeId('text'),
        type: 'text',
        x,
        y,
        width: 120,
        height: 24,
        text: 'Metin',
        fontSize: 11,
        fontWeight: 'normal',
        color: '#111111',
        bgColor: 'transparent',
        borderColor: 'transparent',
        textAlign: 'left',
        fieldKey: '',
    };
};

export default function KartDuzenleIndex() {
    const [design, setDesign] = useState(DEFAULT_DESIGN);
    const [selectedId, setSelectedId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [ozelGenislik, setOzelGenislik] = useState(85);
    const [ozelYukseklik, setOzelYukseklik] = useState(54);
    const [resizeState, setResizeState] = useState(null);
    const [savedDesigns, setSavedDesigns] = useState([]);
    const [selectedSavedDesignId, setSelectedSavedDesignId] = useState('');
    const [designName, setDesignName] = useState('Yeni Kart Tasarımı');
    const [designImageFileName, setDesignImageFileName] = useState('');
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [personList, setPersonList] = useState([]);
    const [personDefaultOptions, setPersonDefaultOptions] = useState([]);
    const [personLoading, setPersonLoading] = useState(false);
    const [selectedPrintPersonId, setSelectedPrintPersonId] = useState('');
    const [selectedPrintPersonCache, setSelectedPrintPersonCache] = useState(null);
    const canvasRef = useRef(null);
    const personRequestRef = useRef(0);

    const loadCardDesigns = async () => {
        try {
            const res = await GetWithToken('CardDesign/GetAll');
            const d = res?.data?.data;
            const list = Array.isArray(d) ? d : Array.isArray(d?.list) ? d.list : Array.isArray(d?.List) ? d.List : [];
            setSavedDesigns(list);
            if (list.length === 0) {
                setSelectedSavedDesignId('');
                setDesignName('Yeni Kart Tasarımı');
                setDesign(DEFAULT_DESIGN);
                setDesignImageFileName('');
                return;
            }

            if (!selectedSavedDesignId) {
                const firstId = String(list[0].id ?? list[0].Id);
                const firstName = list[0].name ?? list[0].Name ?? 'Kart Tasarımı';
                setSelectedSavedDesignId(firstId);
                setDesignName(firstName);
                await loadCardDesignById(firstId, true);
            }
        } catch (e) {
            setSavedDesigns([]);
            AlertFunction('Hata', e?.response?.data?.message || 'Kart tasarımları alınamadı.');
        }
    };

    useEffect(() => {
        loadCardDesigns();
    }, []);

    const selectedElement = useMemo(
        () => design.elements.find((x) => x.id === selectedId) || null,
        [design.elements, selectedId]
    );
    const selectedPrintPerson = useMemo(
        () =>
            personList.find((x) => String(x.id ?? x.Id) === String(selectedPrintPersonId))
            || (selectedPrintPersonCache && String(selectedPrintPersonCache.id ?? selectedPrintPersonCache.Id) === String(selectedPrintPersonId)
                ? selectedPrintPersonCache
                : null),
        [personList, selectedPrintPersonId, selectedPrintPersonCache]
    );
    const selectedPrintPersonOption = useMemo(() => {
        if (!selectedPrintPersonId) return null;
        const person = selectedPrintPerson
            || personList.find((x) => String(x.id ?? x.Id) === String(selectedPrintPersonId));
        if (!person) return null;
        const id = person.id ?? person.Id;
        const ad = person.ad ?? person.Ad ?? '';
        const soyad = person.soyad ?? person.Soyad ?? '';
        const sicilNo = person.sicilNo ?? person.SicilNo ?? person.personelNo ?? person.PersonelNo ?? '';
        return {
            value: String(id),
            label: `${`${ad} ${soyad}`.trim()}${sicilNo ? ` (${sicilNo})` : ''}`,
            person,
        };
    }, [selectedPrintPersonId, selectedPrintPerson, personList]);

    useEffect(() => {
        if (!resizeState) return undefined;

        const onMove = (event) => {
            const dx = event.clientX - resizeState.startClientX;
            const dy = event.clientY - resizeState.startClientY;
            const nextWidth = clamp(resizeState.startWidth + dx, 20, 600);
            const nextHeight = clamp(resizeState.startHeight + dy, 10, 300);
            setDesign((prev) => ({
                ...prev,
                elements: prev.elements.map((el) =>
                    el.id === resizeState.id ? { ...el, width: nextWidth, height: nextHeight } : el
                ),
            }));
        };

        const onUp = () => setResizeState(null);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [resizeState]);

    useEffect(() => {
        if (!selectedId) return undefined;

        const widthPx = Math.round((design.boyutId === 'custom' ? ozelGenislik : design.genislik) * MM_TO_PX);
        const heightPx = Math.round((design.boyutId === 'custom' ? ozelYukseklik : design.yukseklik) * MM_TO_PX);

        const onKeyDown = (event) => {
            const tagName = event.target?.tagName?.toLowerCase();
            const isTypingTarget =
                tagName === 'input' ||
                tagName === 'textarea' ||
                tagName === 'select' ||
                event.target?.isContentEditable;
            if (isTypingTarget) return;

            const movement = {
                ArrowLeft: { dx: -1, dy: 0 },
                ArrowRight: { dx: 1, dy: 0 },
                ArrowUp: { dx: 0, dy: -1 },
                ArrowDown: { dx: 0, dy: 1 },
            }[event.key];

            if (!movement) return;
            event.preventDefault();

            setDesign((prev) => ({
                ...prev,
                elements: prev.elements.map((el) => {
                    if (el.id !== selectedId) return el;
                    const maxX = Math.max(0, widthPx - (el.width || 0));
                    const maxY = Math.max(0, heightPx - (el.height || 0));
                    return {
                        ...el,
                        x: clamp((el.x || 0) + movement.dx, 0, maxX),
                        y: clamp((el.y || 0) + movement.dy, 0, maxY),
                    };
                }),
            }));
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedId, design.boyutId, design.genislik, design.yukseklik, ozelGenislik, ozelYukseklik]);

    const boyutSecildi = (boyut) => {
        const secilen = KART_BOYUTLARI.find((b) => b.id === boyut) || KART_BOYUTLARI[0];
        setDesign((prev) => ({
            ...prev,
            boyutId: boyut,
            genislik: boyut === 'custom' ? ozelGenislik : secilen.width,
            yukseklik: boyut === 'custom' ? ozelYukseklik : secilen.height,
        }));
    };

    const updateSelected = (patch) => {
        if (!selectedId) return;
        setDesign((prev) => ({
            ...prev,
            elements: prev.elements.map((el) => (el.id === selectedId ? { ...el, ...patch } : el)),
        }));
    };

    const addElement = (type, x = 16, y = 16) => {
        const next = createElementByType(type, x, y);
        setDesign((prev) => ({ ...prev, elements: [...prev.elements, next] }));
        setSelectedId(next.id);
    };

    const removeSelected = () => {
        if (!selectedId) return;
        setDesign((prev) => ({ ...prev, elements: prev.elements.filter((el) => el.id !== selectedId) }));
        setSelectedId(null);
    };

    const bringToFront = () => {
        if (!selectedId) return;
        setDesign((prev) => {
            const target = prev.elements.find((x) => x.id === selectedId);
            if (!target) return prev;
            const rest = prev.elements.filter((x) => x.id !== selectedId);
            return { ...prev, elements: [...rest, target] };
        });
    };

    const sendToBack = () => {
        if (!selectedId) return;
        setDesign((prev) => {
            const target = prev.elements.find((x) => x.id === selectedId);
            if (!target) return prev;
            const rest = prev.elements.filter((x) => x.id !== selectedId);
            return { ...prev, elements: [target, ...rest] };
        });
    };

    const duplicateSelected = () => {
        if (!selectedElement) return;
        const copy = { ...selectedElement, id: makeId(selectedElement.type), x: selectedElement.x + 12, y: selectedElement.y + 12 };
        setDesign((prev) => ({ ...prev, elements: [...prev.elements, copy] }));
        setSelectedId(copy.id);
    };

    const onElementDragStop = (id, data) => {
        setDesign((prev) => ({
            ...prev,
            elements: prev.elements.map((el) => (el.id === id ? { ...el, x: data.x, y: data.y } : el)),
        }));
    };

    const startResize = (event, element) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedId(element.id);
        setResizeState({
            id: element.id,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startWidth: element.width,
            startHeight: element.height,
        });
    };

    const onCanvasDrop = (event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('text/pdks-element');
        if (!type || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = clamp(Math.round(event.clientX - rect.left - 40), 0, rect.width - 20);
        const y = clamp(Math.round(event.clientY - rect.top - 10), 0, rect.height - 10);
        addElement(type, x, y);
    };

    const kaydet = async () => {
        const guncelTasarim = {
            ...design,
            genislik: design.boyutId === 'custom' ? ozelGenislik : design.genislik,
            yukseklik: design.boyutId === 'custom' ? ozelYukseklik : design.yukseklik,
        };

        const temizAd = (designName || '').trim();
        const kayitAdi = temizAd || `Kart Tasarımı ${new Date().toLocaleString('tr-TR')}`;
        const designJson = JSON.stringify(guncelTasarim);

        setSaving(true);
        try {
            setDesign(guncelTasarim);

            let resultId = selectedSavedDesignId;
            if (selectedSavedDesignId) {
                const res = await PostWithToken('CardDesign/Update', {
                    Id: parseInt(selectedSavedDesignId, 10),
                    Name: kayitAdi,
                    DesignJson: designJson,
                });
                if (res?.data?.isError) {
                    AlertFunction('Hata', res.data.message || 'Kart tasarımı güncellenemedi.');
                    return;
                }
            } else {
                const res = await PostWithToken('CardDesign/Create', {
                    Name: kayitAdi,
                    DesignJson: designJson,
                });
                if (res?.data?.isError) {
                    AlertFunction('Hata', res.data.message || 'Kart tasarımı kaydedilemedi.');
                    return;
                }
                const createdId = res?.data?.data?.id ?? res?.data?.data?.Id;
                if (createdId != null) resultId = String(createdId);
            }

            await loadCardDesigns();
            if (resultId) setSelectedSavedDesignId(String(resultId));
            setDesignName(kayitAdi);
            AlertFunction('Başarılı', 'Kart tasarımı veritabanına kaydedildi.');
        } catch (e) {
            AlertFunction('Hata', e?.response?.data?.message || 'Kaydetme hatası');
        } finally {
            setSaving(false);
        }
    };

    const loadCardDesignById = async (id, silent = false) => {
        try {
            const res = await GetWithToken('CardDesign/GetById', { id: parseInt(id, 10) });
            const d = res?.data?.data;
            const designJson = d?.designJson ?? d?.DesignJson;
            if (!designJson) {
                if (!silent) AlertFunction('Hata', 'Seçilen tasarımın json verisi bulunamadı.');
                return;
            }
            const parsedDesign = JSON.parse(designJson);
            const yuklenecek = { ...DEFAULT_DESIGN, ...parsedDesign };
            if (!Array.isArray(yuklenecek.elements) || yuklenecek.elements.length === 0) {
                yuklenecek.elements = DEFAULT_DESIGN.elements;
            }
            setDesign(yuklenecek);
            setDesignImageFileName(yuklenecek.designImage ? 'Yüklü Görsel' : '');
            setDesignName(d?.name ?? d?.Name ?? 'Kart Tasarımı');
            setSelectedId(null);
            if (yuklenecek.boyutId === 'custom') {
                setOzelGenislik(yuklenecek.genislik || 85);
                setOzelYukseklik(yuklenecek.yukseklik || 54);
            }
            if (!silent) AlertFunction('Başarılı', 'Kayıtlı kart tasarımı yüklendi.');
        } catch (e) {
            if (!silent) AlertFunction('Hata', e?.response?.data?.message || 'Tasarım yüklenemedi.');
        }
    };

    const kayitliTasariGetir = () => {
        if (!selectedSavedDesignId) {
            AlertFunction('Bilgi', 'Önce kayıtlı bir tasarım seçiniz.');
            return;
        }
        loadCardDesignById(selectedSavedDesignId, false);
    };

    const kayitliTasariSil = () => {
        if (!selectedSavedDesignId) {
            AlertFunction('Bilgi', 'Silmek için bir tasarım seçiniz.');
            return;
        }
        (async () => {
            try {
                const res = await PostWithToken('CardDesign/Delete', { Id: parseInt(selectedSavedDesignId, 10) });
                if (res?.data?.isError) {
                    AlertFunction('Hata', res.data.message || 'Silme hatası');
                    return;
                }
                await loadCardDesigns();
                setSelectedSavedDesignId('');
                setDesignName('Yeni Kart Tasarımı');
                AlertFunction('Başarılı', 'Kayıtlı tasarım silindi.');
            } catch (e) {
                AlertFunction('Hata', e?.response?.data?.message || 'Silme hatası');
            }
        })();
    };

    const onDesignImageSelect = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type?.startsWith('image/')) {
            AlertFunction('Hata', 'Lütfen geçerli bir görsel dosyası seçiniz.');
            event.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = typeof reader.result === 'string' ? reader.result : null;
            if (!dataUrl) return;
            setDesign((prev) => ({ ...prev, designImage: dataUrl }));
            setDesignImageFileName(file.name || '');
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const temizleDesignImage = () => {
        setDesign((prev) => ({ ...prev, designImage: null }));
        setDesignImageFileName('');
    };

    const mapPersonToOption = (person) => {
        const id = person.id ?? person.Id;
        const ad = person.ad ?? person.Ad ?? '';
        const soyad = person.soyad ?? person.Soyad ?? '';
        const sicilNo = person.sicilNo ?? person.SicilNo ?? person.personelNo ?? person.PersonelNo ?? '';
        return {
            value: String(id),
            label: `${`${ad} ${soyad}`.trim()}${sicilNo ? ` (${sicilNo})` : ''}`,
            person,
        };
    };

    const loadPersonList = async (searchText = '', autoSelectFirst = false) => {
        const requestNo = personRequestRef.current + 1;
        personRequestRef.current = requestNo;
        setPersonLoading(true);
        try {
            const res = await GetWithToken('Sicil/GetForSelect', {
                Search: (searchText || '').trim(),
                PageSize: 20,
                SonDurum: true,
            });
            if (requestNo !== personRequestRef.current) return;
            const d = res?.data?.data;
            const list = Array.isArray(d?.list) ? d.list : Array.isArray(d?.List) ? d.List : Array.isArray(d) ? d : [];
            setPersonList(list);
            const options = list.map(mapPersonToOption);
            if (!searchText?.trim()) setPersonDefaultOptions(options);

            if (autoSelectFirst && !selectedPrintPersonId && list.length > 0) {
                const first = list[0];
                const firstId = first.id ?? first.Id;
                if (firstId != null) {
                    setSelectedPrintPersonId(String(firstId));
                    setSelectedPrintPersonCache(first);
                }
            }
            return options;
        } catch (e) {
            if (requestNo !== personRequestRef.current) return;
            setPersonList([]);
            if (!searchText?.trim()) setPersonDefaultOptions([]);
            AlertFunction('Hata', e?.response?.data?.message || 'Personel listesi alınamadı.');
            return [];
        } finally {
            if (requestNo === personRequestRef.current) setPersonLoading(false);
        }
    };

    const openPrintModal = () => {
        setPrintModalOpen(true);
        loadPersonList('', true);
    };

    const buildPrintHtml = (person) => {
        const widthMm = design.boyutId === 'custom' ? ozelGenislik : design.genislik;
        const heightMm = design.boyutId === 'custom' ? ozelYukseklik : design.yukseklik;
        const printDesignImageHtml = design.designImage && design.designImagePrint
            ? `<img src="${escapeHtml(design.designImage)}" alt="Kart Tasarım Görseli" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${design.designImageOpacity ?? 0.95};pointer-events:none;z-index:0;" />`
            : '';
        const elementsHtml = design.elements.map((el) => {
            const x = (el.x || 0) / MM_TO_PX;
            const y = (el.y || 0) / MM_TO_PX;
            const w = (el.width || 20) / MM_TO_PX;
            const h = (el.height || 10) / MM_TO_PX;
            const color = el.color || '#111111';
            const bgColor = el.type === 'line' ? 'transparent' : (el.bgColor || 'transparent');
            const border = el.type === 'line' ? 'none' : `1px solid ${el.borderColor || 'transparent'}`;
            const textAlign = el.textAlign || 'left';
            const fontSizePt = Math.max(6, Number(el.fontSize) || 11);
            const fontWeight = el.fontWeight === 'bold' ? '700' : '400';

            let content = '';
            if (el.type === 'field') content = escapeHtml(getPersonFieldValue(person, el.fieldKey));
            if (el.type === 'text') content = escapeHtml(el.text || 'Metin');
            if (el.type === 'barcode') content = escapeHtml(el.text || '|||| ||| ||||');
            if (el.type === 'photo') {
                const photoSrc = getPersonPhotoSrc(person);
                if (photoSrc) {
                    content = `<img src="${escapeHtml(photoSrc)}" alt="Personel Fotoğrafı" style="width:100%;height:100%;object-fit:cover;" />`;
                } else {
                    content = 'Fotoğraf';
                }
            }

            if (el.type === 'line') {
                return `<div style="position:absolute;left:${x}mm;top:${y}mm;width:${w}mm;height:0;border-top:0.35mm solid ${el.bgColor || '#111111'};"></div>`;
            }

            return `<div style="position:absolute;left:${x}mm;top:${y}mm;width:${w}mm;height:${h}mm;color:${color};background:${bgColor};border:${border};text-align:${textAlign};font-size:${fontSizePt}pt;font-weight:${fontWeight};display:flex;align-items:center;justify-content:${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'};padding:0.4mm;box-sizing:border-box;overflow:hidden;">${content}</div>`;
        }).join('');

        return `<!doctype html>
<html><head><meta charset="utf-8" />
<title>Kart Yazdır</title>
<style>
@page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }
html, body { margin:0; padding:0; }
body { width:${widthMm}mm; height:${heightMm}mm; }
</style>
</head>
<body>
<div style="position:relative;width:${widthMm}mm;height:${heightMm}mm;background:${design.background || '#ffffff'};overflow:hidden;">
${printDesignImageHtml}
${elementsHtml}
</div>
</body></html>`;
    };

    const yazdir = () => {
        if (!selectedPrintPerson) {
            AlertFunction('Bilgi', 'Yazdırmadan önce personel seçiniz.');
            return;
        }
        const html = buildPrintHtml(selectedPrintPerson);
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            AlertFunction('Hata', 'Yazdırma penceresi açılamadı. Tarayıcı popup engelliyor olabilir.');
            return;
        }
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
        setPrintModalOpen(false);
    };

    const sifirla = () => {
        setDesign(DEFAULT_DESIGN);
        setDesignImageFileName('');
        setSelectedId(null);
        setOzelGenislik(85);
        setOzelYukseklik(54);
        AlertFunction('Bilgi', 'Kart tasarımı varsayılan hale getirildi.');
    };

    const genislik = design.boyutId === 'custom' ? ozelGenislik : design.genislik;
    const yukseklik = design.boyutId === 'custom' ? ozelYukseklik : design.yukseklik;
    const canvasWidth = Math.round(genislik * MM_TO_PX);
    const canvasHeight = Math.round(yukseklik * MM_TO_PX);
    const modalPreviewWidthMm = 85;
    const modalPreviewHeightMm = 54;
    const yatayCetvel = useMemo(
        () => Array.from({ length: Math.max(0, Math.floor(genislik)) + 1 }, (_, mm) => ({ mm, px: mm * MM_TO_PX })),
        [genislik]
    );
    const dikeyCetvel = useMemo(
        () => Array.from({ length: Math.max(0, Math.floor(yukseklik)) + 1 }, (_, mm) => ({ mm, px: mm * MM_TO_PX })),
        [yukseklik]
    );

    return (
        <Layout>
            <PageHeader
                title="Kart Düzenle"
                map={[
                    { url: 'yonetimsel-araclar', name: 'Yönetimsel Araçlar' },
                    { url: 'yonetimsel-araclar/tanimlamalar', name: 'Tanımlamalar' },
                    { url: 'tanimlamalar/kart-duzenle', name: 'Kart Düzenle' },
                ]}
            />
            <div className={`content pr-3 pl-3 ${styles.pageArea}`}>
                <div className={`card ${styles.mainCard}`}>
                    <div className={`card-header d-flex justify-content-between align-items-center ${styles.mainHeader}`}>
                        <div>
                            <h6 className="mb-0">Kart Tasarım Editörü</h6>
                            <small className="text-muted">Sürükle-bırak ile profesyonel kart dizaynı oluşturun</small>
                        </div>
                        <div className={`d-flex gap-2 ${styles.toolbarButtons}`}>
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={duplicateSelected} disabled={!selectedElement}>
                                <i className="icon-copy"></i> Çoğalt
                            </button>
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={removeSelected} disabled={!selectedElement}>
                                <i className="icon-trash"></i> Sil
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={sifirla}
                            >
                                <i className="icon-undo2"></i> Sıfırla
                            </button>
                            <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={kaydet}
                                disabled={saving}
                            >
                                <i className="icon-floppy-disk"></i> Kaydet
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={openPrintModal}
                            >
                                <i className="icon-printer"></i> Yazdır
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-xl-3 col-md-4">
                                <div className={`${styles.panelCard} ${styles.softBluePanel}`}>
                                <h6 className={styles.sectionTitle}>Kart Boyutu</h6>
                                {KART_BOYUTLARI.map((b) => (
                                    <div key={b.id} className="form-check mb-2">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id={`boyut_${b.id}`}
                                            name="boyut"
                                            checked={design.boyutId === b.id}
                                            onChange={() => boyutSecildi(b.id)}
                                        />
                                        <label className="form-check-label" htmlFor={`boyut_${b.id}`}>
                                            {b.label}
                                        </label>
                                    </div>
                                ))}
                                {design.boyutId === 'custom' && (
                                    <div className="row mt-2">
                                        <div className="col-6">
                                            <label className="form-label">Genişlik (mm)</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                min={30}
                                                max={200}
                                                value={ozelGenislik}
                                                onChange={(e) => {
                                                    const v = parseInt(e.target.value, 10);
                                                    if (!isNaN(v)) setOzelGenislik(v);
                                                }}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label">Yükseklik (mm)</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                min={30}
                                                max={300}
                                                value={ozelYukseklik}
                                                onChange={(e) => {
                                                    const v = parseInt(e.target.value, 10);
                                                    if (!isNaN(v)) setOzelYukseklik(v);
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <h6 className="mb-3 mt-4">Elementler (Sürükle/Bırak)</h6>
                                <div className="d-flex flex-column gap-2">
                                    {ELEMENT_LIBRARY.map((item) => (
                                        <button
                                            key={item.type}
                                            type="button"
                                            draggable
                                            onDragStart={(event) => event.dataTransfer.setData('text/pdks-element', item.type)}
                                            onClick={() => addElement(item.type)}
                                            className="btn btn-light btn-sm text-start border"
                                        >
                                            <i className="icon-plus2 me-1"></i>{item.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-3">
                                    <label className="form-label">Kart Arka Planı</label>
                                    <input
                                        type="color"
                                        className="form-control form-control-color"
                                        value={design.background || '#ffffff'}
                                        onChange={(e) => setDesign((prev) => ({ ...prev, background: e.target.value }))}
                                    />
                                </div>

                                <div className="mt-3">
                                    <label className="form-label">Tasarım Resmi Ekle (Sadece Tasarımda)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="form-control form-control-sm"
                                        onChange={onDesignImageSelect}
                                    />
                                    <small className="text-muted d-block mt-1">
                                        "Basılsın" seçili değilse görsel sadece önizlemede görünür.
                                    </small>
                                    <div className="form-check mt-2">
                                        <input
                                            id="design-image-print"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={!!design.designImagePrint}
                                            onChange={(e) => setDesign((prev) => ({ ...prev, designImagePrint: e.target.checked }))}
                                        />
                                        <label className="form-check-label" htmlFor="design-image-print">Basılsın</label>
                                    </div>
                                    {design.designImage && (
                                        <div className="d-flex align-items-center gap-2 mt-2">
                                            <small className="text-muted">{designImageFileName || 'Yüklü Görsel'}</small>
                                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={temizleDesignImage}>
                                                Kaldır
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3">
                                    <label className="form-label">Tasarım Adı</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={designName}
                                        onChange={(e) => setDesignName(e.target.value)}
                                        placeholder="Örn: Personel Kartı V1"
                                    />
                                </div>

                                <div className="mt-3">
                                    <label className="form-label">Önceden Kaydedilmiş Tasarımlar</label>
                                    <select
                                        className="form-control form-control-sm"
                                        value={selectedSavedDesignId}
                                        onChange={(e) => {
                                            setSelectedSavedDesignId(e.target.value);
                                            const secilen = savedDesigns.find((x) => String(x.id ?? x.Id) === String(e.target.value));
                                            const secilenAd = secilen?.name ?? secilen?.Name;
                                            if (secilenAd) setDesignName(secilenAd);
                                        }}
                                    >
                                        <option value="">Seçiniz</option>
                                        {savedDesigns.map((item) => (
                                            <option key={item.id ?? item.Id} value={String(item.id ?? item.Id)}>
                                                {item.name ?? item.Name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="d-flex gap-2 mt-2">
                                        <button type="button" className="btn btn-outline-primary btn-sm w-100" onClick={kayitliTasariGetir}>
                                            Getir
                                        </button>
                                        <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={kayitliTasariSil}>
                                            Sil
                                        </button>
                                    </div>
                                </div>
                                </div>
                            </div>

                            <div className="col-xl-6 col-md-8">
                                <div className={styles.panelCard}>
                                <h6 className={styles.sectionTitle}>Tasarım Tuvali</h6>
                                <div className={styles.canvasShell}>
                                    <div className={styles.rulerBoard} style={{ width: canvasWidth + 24, height: canvasHeight + 24,zoom:"1.4" }}>
                                        <div className={styles.rulerCorner}>mm</div>
                                        <div className={styles.rulerTop}>
                                            {yatayCetvel.map((m) => (
                                                <div
                                                    key={`top-${m.mm}`}
                                                    className={`${styles.rulerTick} ${m.mm % 10 === 0 ? styles.rulerTickMajor : m.mm % 5 === 0 ? styles.rulerTickMid : ''}`}
                                                    style={{ left: `${m.px}px` }}
                                                >
                                                    {m.mm % 10 === 0 && <span className={styles.rulerLabel}>{m.mm}</span>}
                                                </div>
                                            ))}
                                        </div>
                                        <div className={styles.rulerLeft}>
                                            {dikeyCetvel.map((m) => (
                                                <div
                                                    key={`left-${m.mm}`}
                                                    className={`${styles.rulerTickY} ${m.mm % 10 === 0 ? styles.rulerTickMajorY : m.mm % 5 === 0 ? styles.rulerTickMidY : ''}`}
                                                    style={{ top: `${m.px}px` }}
                                                >
                                                    {m.mm % 10 === 0 && <span className={styles.rulerLabelY}>{m.mm}</span>}
                                                </div>
                                            ))}
                                        </div>
                                        <div
                                            ref={canvasRef}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={onCanvasDrop}
                                            onClick={() => setSelectedId(null)}
                                            className={`position-relative border shadow-sm ${styles.canvasStage}`}
                                            style={{
                                                width: `${canvasWidth}px`,
                                                height: `${canvasHeight}px`,
                                                background: design.background || '#ffffff',
                                                userSelect: 'none',
                                                overflow: 'hidden',
                                                left: 24,
                                                top: 24,
                                                
                                            }}
                                        >
                                            {design.designImage && (
                                                <img
                                                    src={design.designImage}
                                                    alt="Tasarım referans görseli"
                                                    style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        opacity: design.designImageOpacity ?? 0.95,
                                                        pointerEvents: 'none',
                                                        userSelect: 'none',
                                                        zIndex: 0,
                                                    }}
                                                />
                                            )}
                                            {design.elements.map((el, index) => {
                                                const isSelected = selectedId === el.id;
                                                const commonStyle = {
                                                    width: `${el.width}px`,
                                                    height: `${el.height}px`,
                                                    color: el.color || '#111111',
                                                    backgroundColor: el.type === 'line' ? 'transparent' : el.bgColor || 'transparent',
                                                    border: el.type === 'line'
                                                        ? 'none'
                                                        : `1px solid ${el.borderColor || 'transparent'}`,
                                                    textAlign: el.textAlign || 'left',
                                                    fontSize: `${el.fontSize || 11}pt`,
                                                    fontWeight: el.fontWeight || 'normal',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    cursor: 'move',
                                                    zIndex: index + 1,
                                                    outline: isSelected ? '2px dashed #0d6efd' : 'none',
                                                };

                                                return (
                                                    <Draggable
                                                        key={el.id}
                                                        bounds="parent"
                                                        position={{ x: el.x, y: el.y }}
                                                        onStart={() => setSelectedId(el.id)}
                                                        onStop={(_, data) => onElementDragStop(el.id, data)}
                                                        cancel=".resize-handle,input,textarea,button,select"
                                                    >
                                                        <div style={{ position: 'absolute' }} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                                                            {el.type === 'line' ? (
                                                                <div style={{ ...commonStyle, borderTop: `2px solid ${el.bgColor || '#111111'}`, height: 0 }} />
                                                            ) : (
                                                                <div style={commonStyle} className="d-flex align-items-center px-1">
                                                                    {el.type === 'photo' && (
                                                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
                                                                            Fotoğraf
                                                                        </div>
                                                                    )}
                                                                    {el.type === 'barcode' && (
                                                                        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                                                                            <div style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>{el.text || '|||| ||| ||||'}</div>
                                                                        </div>
                                                                    )}
                                                                    {el.type === 'field' && (
                                                                        <div className="w-100 text-truncate">{getFieldSample(el.fieldKey)}</div>
                                                                    )}
                                                                    {el.type === 'text' && <div className="w-100 text-truncate">{el.text || 'Metin'}</div>}
                                                                    {el.type === 'box' && <div className="w-100 h-100"></div>}
                                                                </div>
                                                            )}
                                                            {isSelected && el.type !== 'line' && (
                                                                <button
                                                                    type="button"
                                                                    className="resize-handle"
                                                                    onMouseDown={(event) => startResize(event, el)}
                                                                    style={{
                                                                        position: 'absolute',
                                                                        right: -6,
                                                                        bottom: -6,
                                                                        width: 12,
                                                                        height: 12,
                                                                        border: '1px solid #0d6efd',
                                                                        borderRadius: 2,
                                                                        background: '#ffffff',
                                                                        cursor: 'se-resize',
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    </Draggable>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <small className="text-muted">
                                    Kart boyutu: {genislik} x {yukseklik} mm
                                </small>
                                </div>
                            </div>

                            <div className="col-xl-3 mt-3 mt-xl-0">
                                <div className={`${styles.panelCard} ${styles.softBluePanel}`}>
                                <h6 className={styles.sectionTitle}>Özellikler</h6>
                                {!selectedElement && (
                                    <div className="alert alert-light border mb-0">Düzenlemek için bir element seçin.</div>
                                )}
                                {selectedElement && (
                                    <div className="border rounded p-2">
                                        <div className="mb-2 d-flex gap-2">
                                            <button type="button" className="btn btn-sm btn-outline-secondary w-100" onClick={sendToBack}>
                                                Alta Al
                                            </button>
                                            <button type="button" className="btn btn-sm btn-outline-secondary w-100" onClick={bringToFront}>
                                                Üste Al
                                            </button>
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <label className="form-label mb-1">X</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={selectedElement.x}
                                                    onChange={(e) => updateSelected({ x: clamp(parseInt(e.target.value || 0, 10), 0, canvasWidth - 10) })}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label mb-1">Y</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={selectedElement.y}
                                                    onChange={(e) => updateSelected({ y: clamp(parseInt(e.target.value || 0, 10), 0, canvasHeight - 10) })}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label mb-1">Genişlik</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={selectedElement.width}
                                                    onChange={(e) => updateSelected({ width: clamp(parseInt(e.target.value || 20, 10), 20, 600) })}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label mb-1">Yükseklik</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={selectedElement.height}
                                                    onChange={(e) => updateSelected({ height: clamp(parseInt(e.target.value || 10, 10), 10, 300) })}
                                                />
                                            </div>
                                        </div>

                                        {selectedElement.type === 'field' && (
                                            <div className="mt-2">
                                                <label className="form-label mb-1">Veri Alanı</label>
                                                <select
                                                    className="form-control form-control-sm"
                                                    value={selectedElement.fieldKey || ''}
                                                    onChange={(e) => updateSelected({ fieldKey: e.target.value })}
                                                >
                                                    {FIELD_OPTIONS.map((f) => (
                                                        <option key={f.key} value={f.key}>
                                                            {f.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {selectedElement.type !== 'field' && selectedElement.type !== 'box' && selectedElement.type !== 'photo' && (
                                            <div className="mt-2">
                                                <label className="form-label mb-1">Metin</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={selectedElement.text || ''}
                                                    onChange={(e) => updateSelected({ text: e.target.value })}
                                                />
                                            </div>
                                        )}

                                        {selectedElement.type !== 'line' && (
                                            <div className="row g-2 mt-1">
                                                <div className="col-6">
                                                    <label className="form-label mb-1">Yazı Boyutu (pt)</label>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        value={selectedElement.fontSize || 11}
                                                        onChange={(e) => updateSelected({ fontSize: clamp(parseInt(e.target.value || 6, 10), 6, 72) })}
                                                    />
                                                </div>
                                                <div className="col-6">
                                                    <label className="form-label mb-1">Kalınlık</label>
                                                    <select
                                                        className="form-control form-control-sm"
                                                        value={selectedElement.fontWeight || 'normal'}
                                                        onChange={(e) => updateSelected({ fontWeight: e.target.value })}
                                                    >
                                                        <option value="normal">Normal</option>
                                                        <option value="bold">Kalın</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        <div className="row g-2 mt-1">
                                            <div className="col-6">
                                                <label className="form-label mb-1">Yazı</label>
                                                <input
                                                    type="color"
                                                    className="form-control form-control-color"
                                                    value={selectedElement.color || '#111111'}
                                                    onChange={(e) => updateSelected({ color: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label mb-1">Arka Plan</label>
                                                <input
                                                    type="color"
                                                    className="form-control form-control-color"
                                                    value={(selectedElement.bgColor && selectedElement.bgColor !== 'transparent') ? selectedElement.bgColor : '#ffffff'}
                                                    onChange={(e) => updateSelected({ bgColor: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-2">
                                            <label className="form-label mb-1">Hizalama</label>
                                            <select
                                                className="form-control form-control-sm"
                                                value={selectedElement.textAlign || 'left'}
                                                onChange={(e) => updateSelected({ textAlign: e.target.value })}
                                            >
                                                <option value="left">Sol</option>
                                                <option value="center">Orta</option>
                                                <option value="right">Sağ</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={printModalOpen} toggle={() => setPrintModalOpen(false)} size="md">
                <ModalHeader toggle={() => setPrintModalOpen(false)}>Kart Yazdır</ModalHeader>
                <ModalBody>
                    <div className="mb-3">
                        <label className="form-label">Personel Seç</label>
                        <AsyncSelect
                            classNamePrefix="react-select"
                            cacheOptions
                            defaultOptions={personDefaultOptions}
                            loadOptions={(inputValue) => loadPersonList(inputValue, false)}
                            isLoading={personLoading}
                            value={selectedPrintPersonOption}
                            onChange={(option) => {
                                const nextId = option?.value || '';
                                setSelectedPrintPersonId(nextId);
                                setSelectedPrintPersonCache(option?.person || null);
                            }}
                            placeholder="Ad, soyad, sicil no veya personel no ile ara..."
                            noOptionsMessage={() => 'Sonuç bulunamadı'}
                            isClearable
                        />
                        <small className="text-muted d-block mt-1">İlk 20 kayıt listelenir, yazdıkça sonuçlar güncellenir.</small>
                    </div>
                    {selectedPrintPerson && (
                        <div className="alert alert-info py-2">
                            Seçilen Personel: <strong>{getPersonFieldValue(selectedPrintPerson, 'adSoyad')}</strong>
                        </div>
                    )}
                    <div className="mb-3">
                        <label className="form-label">Önizleme</label>
                        <div className="border rounded p-2 bg-light d-flex justify-content-center overflow-auto">
                            <div
                                className="position-relative border shadow-sm"
                                style={{
                                    width: `${modalPreviewWidthMm}mm`,
                                    height: `${modalPreviewHeightMm}mm`,
                                    background: design.background || '#ffffff',
                                    overflow: 'hidden',
                                }}
                            >
                                {design.designImage && (
                                    <img
                                        src={design.designImage}
                                        alt="Tasarım referans görseli"
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            opacity: design.designImageOpacity ?? 0.95,
                                            pointerEvents: 'none',
                                            userSelect: 'none',
                                            zIndex: 0,
                                        }}
                                    />
                                )}
                                {design.elements.map((el, index) => {
                                    const xMm = (el.x || 0) / MM_TO_PX;
                                    const yMm = (el.y || 0) / MM_TO_PX;
                                    const wMm = (el.width || 20) / MM_TO_PX;
                                    const hMm = (el.height || 10) / MM_TO_PX;
                                    const fontPt = Math.max(6, Number(el.fontSize) || 11);

                                    let text = '';
                                    if (el.type === 'field') text = getPersonFieldValue(selectedPrintPerson, el.fieldKey);
                                    if (el.type === 'text') text = el.text || 'Metin';
                                    if (el.type === 'barcode') text = el.text || '|||| ||| ||||';
                                    if (el.type === 'photo') text = 'Fotoğraf';
                                    const personPhotoSrc = getPersonPhotoSrc(selectedPrintPerson);

                                    if (el.type === 'line') {
                                        return (
                                            <div
                                                key={el.id}
                                                style={{
                                                    position: 'absolute',
                                                    left: `${xMm}mm`,
                                                    top: `${yMm}mm`,
                                                    width: `${wMm}mm`,
                                                    height: 0,
                                                    borderTop: `2px solid ${el.bgColor || '#111111'}`,
                                                    zIndex: index + 1,
                                                }}
                                            />
                                        );
                                    }

                                    return (
                                        <div
                                            key={el.id}
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
                                                padding: '2px 3px',
                                                boxSizing: 'border-box',
                                                overflow: 'hidden',
                                                zIndex: index + 1,
                                            }}
                                        >
                                            {el.type === 'photo' && personPhotoSrc ? (
                                                <img
                                                    src={personPhotoSrc}
                                                    alt="Personel Fotoğrafı"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <span className="text-truncate w-100">{text}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <small className="text-muted d-block mt-1">
                            Önizlemede tasarım resmi gösterilir, yazdırmada tasarım resmi basılmaz.
                        </small>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-light" onClick={() => setPrintModalOpen(false)}>
                            Vazgeç
                        </button>
                        <button type="button" className="btn btn-primary" onClick={yazdir} disabled={!selectedPrintPerson}>
                            <i className="icon-printer"></i> Yazdır
                        </button>
                    </div>
                </ModalBody>
            </Modal>
        </Layout>
    );
}
