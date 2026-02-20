import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import AlertFunction from '../../../../components/alertfunction';
import DataTable from '../../../../components/datatable';
import PageLoading from '../../../../layout/pageLoading';
import DebisButton from '../../../../components/button';
import { GetWithToken, PostWithToken } from '../../../api/crud';

export default function MesaiPeriyodlariTanimlama() {
    const [modalOpen, setModalOpen] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [refreshDatatable, setRefreshDatatable] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => setLoading(false), []);
    const toggle = () => setModalOpen(!modalOpen);

    const submit = async (val) => {
        try {
            const v = val;
            const varsayilan = v.varsayilan === 'true' || v.varsayilan === true;
            if (!v.id) await PostWithToken('MesaiPeriyodlari/Create', { aciklama: v.aciklama, varsayilan });
            else {
                const res = await PostWithToken('MesaiPeriyodlari/Update', { id: v.id, aciklama: v.aciklama, varsayilan });
                if (res?.data?.isError) { AlertFunction('Hata', res.data.message); return; }
            }
            setRefreshDatatable(new Date());
            setModalOpen(false);
        } catch (e) { AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu'); }
    };

    const deleteData = async (data) => {
        try {
            const res = await PostWithToken('MesaiPeriyodlari/Delete', { Id: data.id });
            if (res?.data?.isError) { AlertFunction('Hata', res.data.message); return; }
            setRefreshDatatable(new Date());
        } catch (e) { AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu'); }
    };

    const editData = async (data) => {
        try {
            const res = await GetWithToken('MesaiPeriyodlari/GetById', { id: data.id });
            const d = res?.data?.data;
            setInitialData(d ? { ...d, varsayilan: d.varsayilan ? 'true' : 'false' } : {});
            setModalOpen(true);
        } catch (e) { AlertFunction('Hata', 'Mesai Periyodu yüklenemedi'); }
    };

    const formInitial = initialData || { id: null, aciklama: '', varsayilan: 'false' };

    return (
        <>
            {loading && <PageLoading />}
            <Modal isOpen={modalOpen} toggle={toggle} size="md">
                <ModalHeader toggle={toggle}>{formInitial.id ? 'Mesai Periyodu Düzenle' : 'Mesai Periyodu Ekle'}</ModalHeader>
                <ModalBody>
                    <Formik initialValues={formInitial} onSubmit={submit} enableReinitialize>
                        {({ handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className="row">
                                <Field type="hidden" name="id" />
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Açıklama</label><Field name="aciklama" type="text" className="form-control" required /></div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Varsayılan</label>
                                    <Field as="select" name="varsayilan" className="form-control">
                                        <option value="false">Hayır</option>
                                        <option value="true">Evet</option>
                                    </Field>
                                </div>
                                <div className="col-12"><DebisButton type="submit" className="me-2">Kaydet</DebisButton><button type="button" className="btn btn-outline-secondary" onClick={toggle}>İptal</button></div>
                            </Form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>
            <div className="card">
                <DataTable Refresh={refreshDatatable} DataUrl="MesaiPeriyodlari/GetAll" Pagination={{ pageNumber: 1, pageSize: 20 }} UseGetPagination
                    Headers={[['aciklama', 'Açıklama'], ['varsayilan', 'Varsayılan'], ['mesaiPeriyodlariUyeleriSayisi', 'Üye Sayısı']]}
                    Title="Mesai Periyotları Listesi" Description="Sicil kayıtlarında kullanılacak mesai periyodu tanımlarını yönetebilirsiniz."
                    HeaderButton={{ text: 'Mesai Periyodu Ekle', action: () => { setInitialData(null); setModalOpen(true); } }} EditButton={editData} DeleteButton={deleteData}
                />
            </div>
        </>
    );
}
