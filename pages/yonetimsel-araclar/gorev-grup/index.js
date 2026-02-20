import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import AlertFunction from '../../../components/alertfunction';
import DataTable from '../../../components/datatable';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import PageLoading from '../../../layout/pageLoading';
import DebisButton from '../../../components/button';
import { GetWithToken, PostWithToken } from '../../api/crud';

export default function Index() {
    const [modalOpen, setModalOpen] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [refreshDatatable, setRefreshDatatable] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const toggle = () => setModalOpen(!modalOpen);

    const submit = async (val) => {
        try {
            if (!val.id) {
                await PostWithToken('RoleManager/CreateRole', val);
            } else {
                const d = await PostWithToken('RoleManager/EditRole', val).then((x) => x.data);
                if (d?.isError) {
                    alert(d.message);
                    return;
                }
            }
            setRefreshDatatable(new Date());
            setModalOpen(false);
        } catch (e) {
            AlertFunction('Başarısız işlem', 'Bu işlem için yetkiniz bulunmuyor.');
        }
    };

    const deleteData = async (data) => {
        try {
            const d = await GetWithToken('RoleManager/delete/' + data.id).then((x) => x.data);
            if (d?.isError) {
                alert(d.message);
                return;
            }
            setRefreshDatatable(new Date());
        } catch (e) {
            AlertFunction('Başarısız işlem', 'Bu işlem için yetkiniz bulunmuyor');
        }
    };

    const editData = async (data) => {
        try {
            const d = await GetWithToken('RoleManager/GetById/' + data.id).then((x) => x.data);
            setInitialData(d?.data || {});
            setModalOpen(true);
        } catch (e) {
            AlertFunction('Başarısız işlem', 'Bu işlem için yetkiniz bulunmuyor');
        }
    };

    const formInitial = initialData || { id: null, name: '' };

    return (
        <>
            {loading && <PageLoading />}
            <Modal isOpen={modalOpen} toggle={toggle} size="md">
                <ModalHeader toggle={toggle}>{formInitial.id ? 'Grup Düzenle' : 'Grup Ekle'}</ModalHeader>
                <ModalBody>
                    <Formik initialValues={formInitial} onSubmit={submit} enableReinitialize>
                        {({ handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className="row">
                                <Field type="hidden" name="id" />
                                <div className="col-12 mb-3">
                                    <label className="form-label">Rol Adı</label>
                                    <Field name="name" type="text" className="form-control" required />
                                </div>
                                <div className="col-12">
                                    <DebisButton type="submit" className="me-2">Kaydet</DebisButton>
                                    <button type="button" className="btn btn-outline-secondary" onClick={toggle}>İptal</button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>
            <Layout>
                <PageHeader title="Grup Oluştur" map={[{ url: '', name: 'Grup Yönetimi' }, { url: '', name: 'Grup Oluştur' }]} />
                <div className="content pr-3 pl-3">
                    <div className="card">
                        <DataTable
                            Refresh={refreshDatatable}
                            DataUrl="RoleManager/GetAllRoles"
                            Headers={[['name', 'Grup Adı'], ['userCount', 'Kullanıcı Sayısı']]}
                            Title="Grup Listesi"
                            Description="Yetki rol grupları kullanıcı yetki grubu tanımlamanızı sağlar"
                            HeaderButton={{ text: 'Grup Oluştur', action: () => { setInitialData(null); setModalOpen(true); } }}
                            EditButton={editData}
                            DeleteButton={deleteData}
                        />
                    </div>
                </div>
            </Layout>
        </>
    );
}
