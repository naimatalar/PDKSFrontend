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
    const [hiddenPassordField, setHiddenPassordField] = useState(false);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshDataTable, setRefreshDatatable] = useState(null);

    useEffect(() => {
        start();
    }, []);

    const start = async () => {
        const rolesRes = await GetWithToken('UserManager/GetRoles').then((x) => x.data).catch(() => ({ data: [] }));
        const roleSelectList = (rolesRes?.data || []).map((r) => ({ id: r.name, text: r.name }));
        setRoles(roleSelectList);
        setLoading(false);
    };

    const toggle = () => setModalOpen(!modalOpen);

    const submit = async (val) => {
        try {
            const values = { ...val, roles: Array.isArray(val.roles) ? val.roles : [] };
            if (!val.id) {
                await PostWithToken('UserManager/CreateUser', values);
            } else {
                const d = await PostWithToken('UserManager/EditUser', values).then((x) => x.data);
                if (d?.isError) {
                    alert(d.message);
                    return;
                }
            }
            setRefreshDatatable(new Date());
            setModalOpen(false);
        } catch (e) {
            AlertFunction('Başarısız işlem', 'Bu işlem için yetkiniz bulunmuyor');
        }
    };

    const deleteData = async (data) => {
        try {
            const d = await GetWithToken('UserManager/delete/' + data.id).then((x) => x.data);
            if (d?.isError) {
                alert(d.message);
                return;
            }
            setRefreshDatatable(new Date());
        } catch (e) {
            AlertFunction('Başarısız işlem', 'Bu işlem için yetkiniz bulunmuyor');
        }
    };

    const createPassword = (setFieldValue) => {
        setFieldValue('password', 'M' + Math.random().toString(36).slice(-5) + '2!');
    };

    const resetPassword = (setFieldValue) => {
        setFieldValue('password', '');
    };

    const editData = async (data) => {
        try {
            const res = await GetWithToken('UserManager/GetUserById/' + data.id).then((x) => x.data);
            const d = res?.data;
            if (d) {
                d.roles = (d.roles || []).map((x) => x.text || x);
                setInitialData(d);
                setHiddenPassordField(true);
                setModalOpen(true);
            }
        } catch (e) {
            AlertFunction('', e?.response?.data || 'Yüklenemedi');
        }
    };

    const formInitial = initialData || {
        id: null,
        firstName: '',
        lastname: '',
        userName: '',
        email: '',
        roles: [],
        password: 'M' + Math.random().toString(36).slice(-5) + '2!',
    };

    return (
        <>
            {loading && <PageLoading />}
            <Modal isOpen={modalOpen} toggle={toggle} size="md">
                <ModalHeader toggle={toggle}>{formInitial.id ? 'Kullanıcı Düzenle' : 'Kullanıcı Ekle'}</ModalHeader>
                <ModalBody>
                    <Formik initialValues={formInitial} onSubmit={submit} enableReinitialize>
                        {({ values, setFieldValue, handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className="row">
                                <Field type="hidden" name="id" />
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Ad</label>
                                    <Field name="firstName" type="text" className="form-control" required />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Soyad</label>
                                    <Field name="lastname" type="text" className="form-control" required />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Kullanıcı Adı</label>
                                    <Field name="userName" type="text" className="form-control" required />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">E-posta</label>
                                    <Field name="email" type="email" className="form-control" required />
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">Grup</label>
                                    <Field
                                        as="select"
                                        name="roles"
                                        className="form-control"
                                        multiple
                                        style={{ minHeight: 80 }}
                                    >
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.id}>{r.text}</option>
                                        ))}
                                    </Field>
                                    <small className="text-muted">Çoklu seçim için Ctrl tuşuna basılı tutun</small>
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label className="form-label">
                                        {hiddenPassordField ? (
                                            <>
                                                <b>Şifre İşlemleri</b>
                                                <br />
                                                <span style={{ fontWeight: 'normal' }}>Değiştirmek istemiyorsanız boş bırakın</span>
                                                <br />
                                                <button type="button" className="btn btn-sm btn-outline-success mt-2 me-1" onClick={() => createPassword(setFieldValue)}>Şifre Oluştur</button>
                                                <button type="button" className="btn btn-sm btn-outline-danger mt-2" onClick={() => resetPassword(setFieldValue)}>Temizle</button>
                                            </>
                                        ) : (
                                            'Şifre'
                                        )}
                                    </label>
                                    <Field
                                        name="password"
                                        type="text"
                                        className="form-control"
                                        required={!hiddenPassordField}
                                        disabled={false}
                                    />
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
                <PageHeader title="Kullanıcı Oluştur" map={[{ url: '', name: 'Yönetimsel Araçlar' }, { url: '', name: 'Kullanıcı Oluştur' }]} />
                <div className="content pr-3 pl-3">
                    <div className="card">
                        <DataTable
                            Refresh={refreshDataTable}
                            DataUrl="UserManager/GetAllUsers"
                            Headers={[['firstName', 'Adı'], ['lastname', 'Soyad'], ['email', 'E-posta'], ['userName', 'Kullanıcı Adı']]}
                            Title="Kullanıcı Listesi"
                            Description="Listedeki kullanıcıları düzenleme işlemleri yapabilirsiniz."
                            HeaderButton={{ text: 'Kullanıcı Oluştur', action: () => { setHiddenPassordField(false); setInitialData(null); setModalOpen(true); } }}
                            EditButton={editData}
                            DeleteButton={deleteData}
                        />
                    </div>
                </div>
            </Layout>
        </>
    );
}
