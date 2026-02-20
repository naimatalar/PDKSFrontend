import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import AlertFunction from '../../../../components/alertfunction';
import DataTable from '../../../../components/datatable';
import PageLoading from '../../../../layout/pageLoading';
import DebisButton from '../../../../components/button';
import { GetWithToken, PostWithToken } from '../../../api/crud';

export default function AltFirmaTanimlama() {
    const [modalOpen, setModalOpen] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [refreshDatatable, setRefreshDatatable] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => setLoading(false), []);
    const toggle = () => setModalOpen(!modalOpen);

    const submit = async (val) => {
        try {
            const v = val;
            if (!v.id) await PostWithToken('CboAltFirma/Create', { ad: v.ad, altFirmaKodu: v.altFirmaKodu, firmaKodu: v.firmaKodu, email: v.email });
            else {
                const res = await PostWithToken('CboAltFirma/Update', { id: v.id, ad: v.ad, altFirmaKodu: v.altFirmaKodu, firmaKodu: v.firmaKodu, email: v.email });
                if (res?.data?.isError) { AlertFunction('Hata', res.data.message); return; }
            }
            setRefreshDatatable(new Date());
            setModalOpen(false);
        } catch (e) { AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu'); }
    };

    const deleteData = async (data) => {
        try {
            const res = await PostWithToken('CboAltFirma/Delete', { Id: data.id });
            if (res?.data?.isError) { AlertFunction('Hata', res.data.message); return; }
            setRefreshDatatable(new Date());
        } catch (e) { AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu'); }
    };

    const editData = async (data) => {
        try {
            const res = await GetWithToken('CboAltFirma/GetById', { id: data.id });
            setInitialData(res?.data?.data || {});
            setModalOpen(true);
        } catch (e) { AlertFunction('Hata', 'Alt Firma yüklenemedi'); }
    };

    const formInitial = initialData || { id: null, ad: '', altFirmaKodu: '', firmaKodu: '', email: '' };

    return (
        <>
            {loading && <PageLoading />}
            <Modal isOpen={modalOpen} toggle={toggle} size="md">
                <ModalHeader toggle={toggle}>{formInitial.id ? 'Alt Firma Düzenle' : 'Alt Firma Ekle'}</ModalHeader>
                <ModalBody>
                    <Formik initialValues={formInitial} onSubmit={submit} enableReinitialize>
                        {({ handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className="row">
                                <Field type="hidden" name="id" />
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Alt Firma Adı</label><Field name="ad" type="text" className="form-control" required /></div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Alt Firma Kodu</label><Field name="altFirmaKodu" type="text" className="form-control" /></div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Firma Kodu</label><Field name="firmaKodu" type="text" className="form-control" /></div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">E-posta</label><Field name="email" type="email" className="form-control" /></div>
                                <div className="col-12"><DebisButton type="submit" className="me-2">Kaydet</DebisButton><button type="button" className="btn btn-outline-secondary" onClick={toggle}>İptal</button></div>
                            </Form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>
            <div className="card">
                <DataTable Refresh={refreshDatatable} DataUrl="CboAltFirma/GetAll" Pagination={{ pageNumber: 1, pageSize: 20 }} UseGetPagination
                    Headers={[['ad', 'Alt Firma Adı'], ['altFirmaKodu', 'Alt Firma Kodu'], ['firmaKodu', 'Firma Kodu'], ['sicilSayisi', 'Sicil Sayısı']]}
                    Title="Alt Firma Listesi" Description="Sicil kayıtlarında kullanılacak alt firma tanımlarını yönetebilirsiniz."
                    HeaderButton={{ text: 'Alt Firma Ekle', action: () => { setInitialData(null); setModalOpen(true); } }} EditButton={editData} DeleteButton={deleteData}
                />
            </div>
        </>
    );
}
