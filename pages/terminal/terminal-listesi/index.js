import React, { useEffect, useState } from 'react';
import { Modal, ModalBody } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import AlertFunction from '../../../components/alertfunction';
import DataTable from '../../../components/datatable';
import AppModalHeader from '../../../components/AppModalHeader';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import PageLoading from '../../../layout/pageLoading';
import DebisButton from '../../../components/button';
import { GetWithToken, PostWithToken } from '../../api/crud';

export default function TerminalListesiIndex() {
    const [modalOpen, setModalOpen] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [refreshDatatable, setRefreshDatatable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [terminalGrupList, setTerminalGrupList] = useState([]);
    const [firmaList, setFirmaList] = useState([]);
    const [ioList, setIoList] = useState([]);
    const [kindList, setKindList] = useState([]);
    const [opModeList, setOpModeList] = useState([]);
    const [modelList, setModelList] = useState([]);
    const [cardFormatList, setCardFormatList] = useState([]);
    const [portList, setPortList] = useState([]);

    useEffect(() => {
        GetWithToken('TerminalGroup/GetAll', { PageNumber: 1, PageSize: 500 })
            .then((x) => setTerminalGrupList((x.data?.data?.list || []).map((m) => ({ id: m.id, text: m.ad || m.Ad || m.id }))))
            .catch(() => {});
        GetWithToken('CboFirma/GetAll', { PageNumber: 1, PageSize: 500 })
            .then((x) => setFirmaList((x.data?.data?.list || []).map((m) => ({ id: m.id, text: m.ad || m.Ad || m.id }))))
            .catch(() => {});
        GetWithToken('Terminaller/GetCreateOptions')
            .then((x) => {
                const d = x.data?.data || {};
                setIoList(d.ioList || []);
                setKindList(d.kindList || []);
                setOpModeList(d.opModeList || []);
                setModelList(d.modelList || []);
                setCardFormatList(d.cardFormatList || []);
                setPortList(d.portList || []);
            })
            .catch(() => {});
        setLoading(false);
    }, []);
    const toggle = () => setModalOpen(!modalOpen);

    const submit = async (val) => {
        try {
            const v = val;
            const payload = {
                name: v.name,
                model: v.model ? parseInt(v.model) : 0,
                port: v.port || '',
                controllerNo: v.controllerNo ? parseInt(v.controllerNo) : 0,
                io: v.io ? parseInt(v.io) : 0,
                function: v.func ? parseInt(v.func) : 0,
                opMode: v.opMode ? parseInt(v.opMode) : 0,
                kind: v.kind ? parseInt(v.kind) : 0,
                cardFormat: v.cardFormat || '',
                firmaId: v.firmaId ? parseInt(v.firmaId) : null,
                grupId: v.grupId ? parseInt(v.grupId) : null,
            };
            if (!v.id) {
                await PostWithToken('Terminaller/Create', payload);
            } else {
                const res = await PostWithToken('Terminaller/Update', { id: v.id, ...payload });
                if (res?.data?.isError) { AlertFunction('Hata', res.data.message); return; }
            }
            setRefreshDatatable(new Date());
            setModalOpen(false);
        } catch (e) { AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu'); }
    };

    const deleteData = async (data) => {
        try {
            const res = await PostWithToken('Terminaller/Delete', { Id: data.id });
            if (res?.data?.isError) { AlertFunction('Hata', res.data.message); return; }
            setRefreshDatatable(new Date());
        } catch (e) { AlertFunction('Başarısız işlem', e?.response?.data?.message || 'Bir hata oluştu'); }
    };

    const editData = async (data) => {
        try {
            const res = await GetWithToken('Terminaller/GetById', { id: data.id });
            const d = res?.data?.data;
            setInitialData(d ? {
                id: d.id ?? d.Id ?? null,
                name: d.name ?? d.Name ?? '',
                model: (d.model ?? d.Model)?.toString() || '',
                port: d.port ?? d.Port ?? '',
                controllerNo: (d.controllerNo ?? d.ControllerNo)?.toString() || '',
                io: (d.io ?? d.Io)?.toString() || '',
                func: (d.function ?? d.Function)?.toString() || '',
                opMode: (d.opMode ?? d.OpMode)?.toString() || '',
                kind: (d.kind ?? d.Kind)?.toString() || '',
                cardFormat: d.cardFormat ?? d.CardFormat ?? '',
                firmaId: (d.firmaId ?? d.FirmaId)?.toString() || '',
                grupId: (d.grupId ?? d.GrupId)?.toString() || '',
            } : {});
            setModalOpen(true);
        } catch (e) { AlertFunction('Hata', 'Terminal yüklenemedi'); }
    };

    const formInitial = initialData || {
        id: null, name: '', model: '', port: '', controllerNo: '', io: '', func: '', opMode: '', kind: '',
        cardFormat: '', firmaId: '', grupId: '',
    };

    return (
        <>
            {loading && <PageLoading />}
            <Modal isOpen={modalOpen} toggle={toggle} size="lg">
                <AppModalHeader toggle={toggle}>{formInitial.id ? 'Terminal Düzenle' : 'Terminal Ekle'}</AppModalHeader>
                <ModalBody>
                    <Formik initialValues={formInitial} onSubmit={submit} enableReinitialize>
                        {({ handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className="row">
                                <Field type="hidden" name="id" />
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Terminal Adı</label><Field name="name" type="text" className="form-control" required /></div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Model</label>
                                    <Field as="select" name="model" className="form-control">
                                        <option value="">Seçiniz</option>
                                        {modelList.map((m) => (<option key={m.id} value={m.id}>{m.text}</option>))}
                                    </Field>
                                </div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Port</label>
                                    {portList.length > 0 ? (
                                        <Field as="select" name="port" className="form-control">
                                            <option value="">Seçiniz</option>
                                            {portList.map((m) => (<option key={m.id} value={m.id}>{m.text}</option>))}
                                        </Field>
                                    ) : (
                                        <Field name="port" type="text" className="form-control" />
                                    )}
                                </div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Controller No</label><Field name="controllerNo" type="number" className="form-control" /></div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">IO</label>
                                    <Field as="select" name="io" className="form-control">
                                        <option value="">Seçiniz</option>
                                        {ioList.map((m) => (<option key={m.id} value={m.id}>{m.text}</option>))}
                                    </Field>
                                </div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Function</label>
                                    <Field name="func" type="number" className="form-control" />
                                </div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Op Mode</label>
                                    <Field as="select" name="opMode" className="form-control">
                                        <option value="">Seçiniz</option>
                                        {opModeList.map((m) => (<option key={m.id} value={m.id}>{m.text}</option>))}
                                    </Field>
                                </div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Kind</label>
                                    <Field as="select" name="kind" className="form-control">
                                        <option value="">Seçiniz</option>
                                        {kindList.map((m) => (<option key={m.id} value={m.id}>{m.text}</option>))}
                                    </Field>
                                </div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Terminal Grubu</label>
                                    <Field as="select" name="grupId" className="form-control">
                                        <option value="">Seçiniz</option>
                                        {terminalGrupList.map((m) => (<option key={m.id} value={m.id}>{m.text}</option>))}
                                    </Field>
                                </div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Firma</label>
                                    <Field as="select" name="firmaId" className="form-control">
                                        <option value="">Seçiniz</option>
                                        {firmaList.map((m) => (<option key={m.id} value={m.id}>{m.text}</option>))}
                                    </Field>
                                </div>
                                <div className="col-12 col-md-6 mb-3"><label className="form-label">Kart Formatı</label>
                                    {cardFormatList.length > 0 ? (
                                        <Field as="select" name="cardFormat" className="form-control">
                                            <option value="">Seçiniz</option>
                                            {cardFormatList.map((m) => (<option key={m.id} value={m.value || m.text}>{m.text}</option>))}
                                        </Field>
                                    ) : (
                                        <Field name="cardFormat" type="text" className="form-control" />
                                    )}
                                </div>
                                <div className="col-12"><DebisButton type="submit" className="me-2">Kaydet</DebisButton><button type="button" className="btn btn-outline-secondary" onClick={toggle}>İptal</button></div>
                            </Form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>
            <Layout>
                <PageHeader
                    title="Terminal Listesi"
                    map={[
                        { url: 'terminal', name: 'Terminal' },
                        { url: 'terminal/terminal-listesi', name: 'Terminal Listesi' },
                    ]}
                />
                <div className="content pr-3 pl-3">
                    <div className="card">
                        <DataTable
                            Refresh={refreshDatatable}
                            DataUrl="Terminaller/GetAll"
                            Pagination={{ pageNumber: 1, pageSize: 20 }}
                            UseGetPagination
                            Headers={[['name', 'Terminal Adı'], ['model', 'Model'], ['port', 'Port'], ['sonGecen', 'Son Geçen'], ['grupId', 'Grup Id']]}
                            Title="Terminal Listesi"
                            Description="PDKS terminal cihazlarını yönetebilirsiniz."
                            HeaderButton={{ text: 'Terminal Ekle', action: () => { setInitialData(null); setModalOpen(true); } }}
                            EditButton={editData}
                            DeleteButton={deleteData}
                        />
                    </div>
                </div>
            </Layout>
        </>
    );
}
