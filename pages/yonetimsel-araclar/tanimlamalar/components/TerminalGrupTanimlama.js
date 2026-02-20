import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import AlertFunction from '../../../../components/alertfunction';
import DataTable from '../../../../components/datatable';
import PageLoading from '../../../../layout/pageLoading';
import DebisButton from '../../../../components/button';
import { GetWithToken, PostWithToken } from '../../../api/crud';

export default function TerminalGrupTanimlama() {
    const [modalOpen, setModalOpen] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [refreshDatatable, setRefreshDatatable] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => setLoading(false), []);
    const toggle = () => setModalOpen(!modalOpen);

    const submit = async (val) => {
        try {
            const v = val;
            if (!v.id) await PostWithToken('TerminalGroup/Create', { ad: v.ad, alarm: v.alarm ? parseInt(v.alarm) : null });
            else {
                const res = await PostWithToken('TerminalGroup/Update', { id: v.id, ad: v.ad, alarm: v.alarm ? parseInt(v.alarm) : null });
                if (res?.data?.isError) { AlertFunction('Hata', res.data.message); return; }
            }
            setRefreshDatatable(new Date());
            setModalOpen(false);
        } catch (e) { AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu'); }
    };

    const deleteData = async (data) => {
        try {
            const res = await PostWithToken('TerminalGroup/Delete', { Id: data.id });
            if (res?.data?.isError) { AlertFunction('Hata', res.data.message); return; }
            setRefreshDatatable(new Date());
        } catch (e) { AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu'); }
    };

    const editData = async (data) => {
        try {
            const res = await GetWithToken('TerminalGroup/GetById', { id: data.id });
            const d = res?.data?.data;
            setInitialData(d ? { ...d, alarm: d.alarm?.toString() || '' } : {});
            setModalOpen(true);
        } catch (e) { AlertFunction('Hata', 'Terminal Grubu yüklenemedi'); }
    };

    const formInitial = initialData || { id: null, ad: '', alarm: '' };

    return (
        <>
            {loading && <PageLoading />}
            <Modal isOpen={modalOpen} toggle={toggle} size="md">
                <ModalHeader toggle={toggle}>{formInitial.id ? 'Terminal Grubu Düzenle' : 'Terminal Grubu Ekle'}</ModalHeader>
                <ModalBody>
                    <Formik initialValues={formInitial} onSubmit={submit} enableReinitialize>
                        {({ handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className="row">
                                <Field type="hidden" name="id" />
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Terminal Grubu Adı</label><Field name="ad" type="text" className="form-control" required /></div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Alarm</label><Field name="alarm" type="number" className="form-control" /></div>
                                <div className="col-12"><DebisButton type="submit" className="me-2">Kaydet</DebisButton><button type="button" className="btn btn-outline-secondary" onClick={toggle}>İptal</button></div>
                            </Form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>
            <div className="card">
                <DataTable Refresh={refreshDatatable} DataUrl="TerminalGroup/GetAll" Pagination={{ pageNumber: 1, pageSize: 20 }} UseGetPagination
                    Headers={[['ad', 'Terminal Grubu Adı'], ['sicilSayisi', 'Sicil Sayısı']]}
                    Title="Terminal Grubu Listesi" Description="Sicil kayıtlarında kullanılacak terminal grubu tanımlarını yönetebilirsiniz."
                    HeaderButton={{ text: 'Terminal Grubu Ekle', action: () => { setInitialData(null); setModalOpen(true); } }} EditButton={editData} DeleteButton={deleteData}
                />
            </div>
        </>
    );
}
