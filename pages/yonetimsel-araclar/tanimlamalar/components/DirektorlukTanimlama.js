import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import AlertFunction from '../../../../components/alertfunction';
import DataTable from '../../../../components/datatable';
import PageLoading from '../../../../layout/pageLoading';
import DebisButton from '../../../../components/button';
import { GetWithToken, PostWithToken } from '../../../api/crud';

export default function DirektorlukTanimlama() {
    const [modalOpen, setModalOpen] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [refreshDatatable, setRefreshDatatable] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => setLoading(false), []);
    const toggle = () => setModalOpen(!modalOpen);

    const submit = async (val) => {
        try {
            if (!val.id) await PostWithToken('CboDirektorluk/Create', { ad: val.ad });
            else {
                const res = await PostWithToken('CboDirektorluk/Update', { id: val.id, ad: val.ad });
                if (res?.data?.isError) { AlertFunction('Hata', res.data.message); return; }
            }
            setRefreshDatatable(new Date());
            setModalOpen(false);
        } catch (e) { AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu'); }
    };

    const deleteData = async (data) => {
        try {
            const res = await PostWithToken('CboDirektorluk/Delete', { Id: data.id });
            if (res?.data?.isError) { AlertFunction('Hata', res.data.message); return; }
            setRefreshDatatable(new Date());
        } catch (e) { AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu'); }
    };

    const editData = async (data) => {
        try {
            const res = await GetWithToken('CboDirektorluk/GetById', { id: data.id });
            setInitialData(res?.data?.data || {});
            setModalOpen(true);
        } catch (e) { AlertFunction('Hata', 'Direktörlük yüklenemedi'); }
    };

    const formInitial = initialData || { id: null, ad: '' };

    return (
        <>
            {loading && <PageLoading />}
            <Modal isOpen={modalOpen} toggle={toggle} size="md">
                <ModalHeader toggle={toggle}>{formInitial.id ? 'Direktörlük Düzenle' : 'Direktörlük Ekle'}</ModalHeader>
                <ModalBody>
                    <Formik initialValues={formInitial} onSubmit={submit} enableReinitialize>
                        {({ handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className="row">
                                <input type="hidden" name="id" />
                                <div className="col-12 mb-3"><label className="form-label">Direktörlük Adı</label><Field name="ad" type="text" className="form-control" required /></div>
                                <div className="col-12"><DebisButton type="submit" className="me-2">Kaydet</DebisButton><button type="button" className="btn btn-outline-secondary" onClick={toggle}>İptal</button></div>
                            </Form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>
            <div className="card">
                <DataTable Refresh={refreshDatatable} DataUrl="CboDirektorluk/GetAll" Pagination={{ pageNumber: 1, pageSize: 20 }} UseGetPagination
                    Headers={[['ad', 'Direktörlük Adı'], ['sicilSayisi', 'Sicil Sayısı']]}
                    Title="Direktörlük Listesi" Description="Sicil kayıtlarında kullanılacak direktörlük tanımlarını yönetebilirsiniz."
                    HeaderButton={{ text: 'Direktörlük Ekle', action: () => { setInitialData(null); setModalOpen(true); } }} EditButton={editData} DeleteButton={deleteData}
                />
            </div>
        </>
    );
}
