import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import AlertFunction from '../../../../components/alertfunction';
import DataTable from '../../../../components/datatable';
import PageLoading from '../../../../layout/pageLoading';
import DebisButton from '../../../../components/button';
import { GetWithToken, PostWithToken } from '../../../api/crud';

export default function BolumTanimlama() {
    const [modalOpen, setModalOpen] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [refreshDatatable, setRefreshDatatable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mesaiPeriyodList, setMesaiPeriyodList] = useState([]);

    useEffect(() => {
        GetWithToken('MesaiPeriyodlari/GetAll', { PageNumber: 1, PageSize: 500 })
            .then((x) => setMesaiPeriyodList((x.data?.data?.list || []).map((m) => ({ id: m.id, text: m.aciklama || m.Aciklama || m.id }))))
            .catch(() => {});
        setLoading(false);
    }, []);
    const toggle = () => setModalOpen(!modalOpen);

    const submit = async (val) => {
        try {
            const v = val;
            if (!v.id) await PostWithToken('CboBolum/Create', { ad: v.ad, bolumKodu: v.bolumKodu, email: v.email, periyodId: v.periyodId ? parseInt(v.periyodId) : null });
            else {
                const res = await PostWithToken('CboBolum/Update', { id: v.id, ad: v.ad, bolumKodu: v.bolumKodu, email: v.email, periyodId: v.periyodId ? parseInt(v.periyodId) : null });
                if (res?.data?.isError) { AlertFunction('Hata', res.data.message); return; }
            }
            setRefreshDatatable(new Date());
            setModalOpen(false);
        } catch (e) { AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu'); }
    };

    const deleteData = async (data) => {
        try {
            const res = await PostWithToken('CboBolum/Delete', { Id: data.id });
            if (res?.data?.isError) { AlertFunction('Hata', res.data.message); return; }
            setRefreshDatatable(new Date());
        } catch (e) { AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu'); }
    };

    const editData = async (data) => {
        try {
            const res = await GetWithToken('CboBolum/GetById', { id: data.id });
            const d = res?.data?.data;
            setInitialData(d ? { ...d, periyodId: d.periyodId?.toString() || '' } : {});
            setModalOpen(true);
        } catch (e) { AlertFunction('Hata', 'Bölüm yüklenemedi'); }
    };

    const formInitial = initialData || { id: null, ad: '', bolumKodu: '', email: '', periyodId: '' };

    return (
        <>
            {loading && <PageLoading />}
            <Modal isOpen={modalOpen} toggle={toggle} size="md">
                <ModalHeader toggle={toggle}>{formInitial.id ? 'Bölüm Düzenle' : 'Bölüm Ekle'}</ModalHeader>
                <ModalBody>
                    <Formik initialValues={formInitial} onSubmit={submit} enableReinitialize>
                        {({ handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className="row">
                                <Field type="hidden" name="id" />
                                <div className="col-12 mb-3"><label className="form-label">Bölüm Adı</label><Field name="ad" type="text" className="form-control" required /></div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Bölüm Kodu</label><Field name="bolumKodu" type="text" className="form-control" /></div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">E-posta</label><Field name="email" type="email" className="form-control" /></div>
                                <div className="col-12 mb-3">
                                    <label className="form-label">Mesai Periyodu</label>
                                    <Field as="select" name="periyodId" className="form-control">
                                        <option value="">Seçiniz</option>
                                        {mesaiPeriyodList.map((m) => (<option key={m.id} value={m.id}>{m.text}</option>))}
                                    </Field>
                                </div>
                                <div className="col-12"><DebisButton type="submit" className="me-2">Kaydet</DebisButton><button type="button" className="btn btn-outline-secondary" onClick={toggle}>İptal</button></div>
                            </Form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>
            <div className="card">
                <DataTable Refresh={refreshDatatable} DataUrl="CboBolum/GetAll" Pagination={{ pageNumber: 1, pageSize: 20 }} UseGetPagination
                    Headers={[['ad', 'Bölüm Adı'], ['bolumKodu', 'Bölüm Kodu'], ['email', 'E-posta'], ['sicilSayisi', 'Sicil Sayısı']]}
                    Title="Bölüm Listesi" Description="Sicil kayıtlarında kullanılacak bölüm tanımlarını yönetebilirsiniz."
                    HeaderButton={{ text: 'Bölüm Ekle', action: () => { setInitialData(null); setModalOpen(true); } }} EditButton={editData} DeleteButton={deleteData}
                />
            </div>
        </>
    );
}
