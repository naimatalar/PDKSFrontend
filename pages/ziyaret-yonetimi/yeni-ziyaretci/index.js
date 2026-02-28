import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { debounce } from 'lodash';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import { GetWithToken, PostWithToken } from '../../api/crud';
import { toast } from 'react-toastify';
import { Formik, Form, Field } from 'formik';
import ReactSelect from 'react-select';
import AsyncSelect from 'react-select/async';

const pagination = { PageNumber: 0, PageSize: 500 };

const toOption = (x, labelKey = 'ad') => ({
    value: x?.id ?? x?.Id,
    label: x?.[labelKey] ?? x?.[labelKey === 'ad' ? 'Ad' : 'Aciklama'] ?? String(x?.id ?? x?.Id ?? ''),
});

export default function YeniZiyaretciPage() {
    const [bolumList, setBolumList] = useState([]);
    const [yetkiList, setYetkiList] = useState([]);
    const [kartList, setKartList] = useState([]);
    const [kimlikList, setKimlikList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const fetchList = (url, params) =>
                GetWithToken(url, params)
                    .then((r) => {
                        const data = r?.data?.data ?? r?.data;
                        return data?.list ?? (Array.isArray(data) ? data : []);
                    })
                    .catch(() => []);

            try {
                const [bolumRes, yetkiRes, kartRes, kimlikRes] = await Promise.all([
                    GetWithToken('CboBolum/GetAll', pagination),
                    GetWithToken('Yetki/GetAll'),
                    GetWithToken('Ziyaretci/GetKartlari'),
                    GetWithToken('CboKimlik/GetAll'),
                ]);
                const bolumData = bolumRes?.data?.data ?? bolumRes?.data;
                setBolumList(Array.isArray(bolumData?.list) ? bolumData.list : []);
                setYetkiList(Array.isArray(yetkiRes?.data?.data) ? yetkiRes.data.data : Array.isArray(yetkiRes?.data) ? yetkiRes.data : []);
                setKartList(Array.isArray(kartRes?.data?.data) ? kartRes.data.data : Array.isArray(kartRes?.data) ? kartRes.data : []);
                setKimlikList(Array.isArray(kimlikRes?.data?.data) ? kimlikRes.data.data : Array.isArray(kimlikRes?.data) ? kimlikRes.data : []);
            } catch (e) {
                toast.error('Veriler yüklenemedi.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const loadSicilOptions = useMemo(
        () =>
            debounce(async (inputValue) => {
                try {
                    const res = await GetWithToken('Sicil/GetForSelect', {
                        Search: inputValue || '',
                        PageSize: 10,
                        SonDurum: true,
                    });
                    const list = res?.data?.data ?? res?.data ?? [];
                    const arr = Array.isArray(list) ? list : [];
                    const opts = arr.map((x) => ({
                        value: x?.id ?? x?.Id,
                        label: [x?.ad ?? x?.Ad, x?.soyad ?? x?.Soyad].filter(Boolean).join(' ') || `#${x?.id ?? x?.Id}`,
                    }));
                    return [{ value: 0, label: '- - - - - - - - - - -' }, ...opts];
                } catch {
                    return [{ value: 0, label: '- - - - - - - - - - -' }];
                }
            }, 100),
        []
    );

    const bolumOptions = useMemo(
        () => bolumList.map((x) => toOption(x)),
        [bolumList]
    );
    const yetkiOptions = useMemo(
        () => yetkiList.map((x) => ({ value: x?.id ?? x?.Id, label: x?.aciklama ?? x?.Aciklama ?? '' })),
        [yetkiList]
    );
    const kartOptions = useMemo(
        () => kartList.map((x) => ({ value: x?.userId ?? x?.UserId ?? '', label: ([x?.ad ?? x?.Ad, x?.soyad ?? x?.Soyad].filter(Boolean).join(' ')) || (x?.userId ?? x?.UserId) })),
        [kartList]
    );
    const kimlikOptions = useMemo(
        () => kimlikList.map((x) => toOption(x)),
        [kimlikList]
    );

    const emptySicilOption = { value: 0, label: '- - - - - - - - - - -' };
    const initialValues = {
        kimlikNo: '',
        kimlikTipi: 0,
        ad: '',
        soyad: '',
        telefon: '',
        firma: '',
        plaka: '',
        kisi: emptySicilOption,
        bolum: null,
        geciciKart: emptySicilOption,
        gecisGrubu: null,
        ziyaretNeden: '',
        kartNo: null,
    };

    const handleSubmit = useCallback(
        async (values) => {
            if (submitting) return;
            if (!values.kisi?.value) {
                toast.warning('Ziyaret edilecek kişi seçiniz.');
                return;
            }
            setSubmitting(true);
            try {
                await PostWithToken('Ziyaretci/Create', {
                    kimlikNo: values.kimlikNo,
                    kimlikTipi: values.kimlikTipi || 0,
                    ad: values.ad,
                    soyad: values.soyad,
                    cepTelefonu: values.telefon,
                    firma: values.firma,
                    plaka: values.plaka,
                    gorevli: values.kisi?.value ?? 0,
                    bolumId: values.bolum?.value || null,
                    geciciKartSicilId: values.geciciKart?.value || null,
                    yetki: values.gecisGrubu?.value || null,
                    ziyaretNedeni: values.ziyaretNeden,
                    userId: values.kartNo?.value || '',
                });
                toast.success('Ziyaretçi kaydı oluşturuldu.');
            } catch (e) {
                toast.error(e?.response?.data?.message ?? 'Kayıt oluşturulamadı.');
            } finally {
                setSubmitting(false);
            }
        },
        [submitting]
    );

    if (loading) {
        return (
            <Layout>
                <div className="content p-4 text-center">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="mt-2 text-muted">Yükleniyor...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <PageHeader
                title="Ziyaretçi Yönetimi"
                map={[
                    { url: 'ziyaret-yonetimi', name: 'Ziyaretçi Yönetimi' },
                    { url: 'ziyaret-yonetimi/yeni-ziyaretci', name: 'Yeni Ziyaretçi Ekle' },
                ]}
            />
            <div className="content p-4">
                <div className="card">
                    <header className="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <span className="widget-icon">
                                <i className="fa fa-user-plus" />
                            </span>
                            <h2 className="mb-0">Yeni Ziyaretçi Ekle</h2>
                        </div>
                        <div className="d-flex gap-2">
                            <Link href="/ziyaret-yonetimi/icerdeki-ziyaretciler">
                                <a className="btn btn-outline-info btn-sm">
                                    <i className="fa fa-user-clock me-1" /> İçerideki Ziyaretçiler
                                </a>
                            </Link>
                            <Link href="/ziyaret-yonetimi/tum-ziyaretciler">
                                <a className="btn btn-outline-primary btn-sm">
                                    <i className="fa fa-users me-1" /> Tüm Ziyaretçiler
                                </a>
                            </Link>
                        </div>
                    </header>
                    <div className="card-body">
                        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                            {({ values, setFieldValue }) => (
                                <Form>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Kimlik No</label>
                                            <Field name="kimlikNo" type="text" className="form-control" placeholder="Kimlik No" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Kimlik Tipi</label>
                                            <ReactSelect
                                                classNamePrefix="react-select"
                                                options={kimlikOptions}
                                                value={kimlikOptions.find((o) => o.value === values.kimlikTipi) ?? null}
                                                onChange={(o) => setFieldValue('kimlikTipi', o?.value ?? 0)}
                                                isClearable
                                                placeholder="Seçiniz"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Ad</label>
                                            <Field name="ad" type="text" className="form-control" placeholder="Ad" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Soyad</label>
                                            <Field name="soyad" type="text" className="form-control" placeholder="Soyad" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Telefon</label>
                                            <Field name="telefon" type="text" className="form-control" placeholder="Telefon" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Firma</label>
                                            <Field name="firma" type="text" className="form-control" placeholder="Firma" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Plaka</label>
                                            <Field name="plaka" type="text" className="form-control" placeholder="Plaka" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Ziyaret Edilecek Kişi</label>
                                            <AsyncSelect
                                                classNamePrefix="react-select"
                                                loadOptions={loadSicilOptions}
                                                defaultOptions
                                                cacheOptions
                                                value={values.kisi ?? emptySicilOption}
                                                onChange={(o) => setFieldValue('kisi', o ?? emptySicilOption)}
                                                placeholder="Yazın veya seçin..."
                                                noOptionsMessage={() => 'Sonuç bulunamadı'}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Bölüm</label>
                                            <ReactSelect
                                                classNamePrefix="react-select"
                                                options={bolumOptions}
                                                value={values.bolum}
                                                onChange={(o) => setFieldValue('bolum', o)}
                                                isClearable
                                                placeholder="Seçiniz"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Geçici Kart</label>
                                            <AsyncSelect
                                                classNamePrefix="react-select"
                                                loadOptions={loadSicilOptions}
                                                defaultOptions
                                                cacheOptions
                                                value={values.geciciKart ?? emptySicilOption}
                                                onChange={(o) => setFieldValue('geciciKart', o ?? emptySicilOption)}
                                                placeholder="Yazın veya seçin..."
                                                noOptionsMessage={() => 'Sonuç bulunamadı'}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Geçiş Grubu</label>
                                            <ReactSelect
                                                classNamePrefix="react-select"
                                                options={yetkiOptions}
                                                value={values.gecisGrubu}
                                                onChange={(o) => setFieldValue('gecisGrubu', o)}
                                                isClearable
                                                placeholder="Seçiniz"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Kart No</label>
                                            <ReactSelect
                                                classNamePrefix="react-select"
                                                options={kartOptions}
                                                value={values.kartNo}
                                                onChange={(o) => setFieldValue('kartNo', o)}
                                                isClearable
                                                placeholder="Seçiniz"
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Ziyaret Nedeni</label>
                                            <Field name="ziyaretNeden" as="textarea" className="form-control" placeholder="Ziyaret nedeni" rows={2} />
                                        </div>
                                        <div className="col-12">
                                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                                            </button>
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
