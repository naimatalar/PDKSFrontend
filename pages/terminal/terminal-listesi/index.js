import React, { useEffect, useState, useMemo } from 'react';
import { Modal, ModalBody, Collapse, Button } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import Select from 'react-select';
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
    const [filterOpen, setFilterOpen] = useState(true);
    const [filterTerminalId, setFilterTerminalId] = useState('');
    const [terminalListForFilter, setTerminalListForFilter] = useState([]);
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
        GetWithToken('Terminaller/GetAll', { PageNumber: 1, PageSize: 500 })
            .then((x) => {
                const list = x.data?.data?.list || [];
                setTerminalListForFilter(list.map((m) => ({ id: m.id ?? m.Id, text: m.name ?? m.Name ?? `${m.id ?? m.Id}` })));
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

    const filterParams = useMemo(() => {
        const p = {};
        if (filterTerminalId && filterTerminalId !== '0') p.TerminalId = filterTerminalId;
        return p;
    }, [filterTerminalId]);

    const dataUrlWithFilters = useMemo(() => {
        const qs = new URLSearchParams(filterParams).toString();
        return `Terminaller/GetAll${qs ? '?' + qs : ''}`;
    }, [filterParams]);

    const activeFilterCount = Object.keys(filterParams).length;

    const applyFilters = () => setRefreshDatatable(new Date());
    const clearFilters = () => { setFilterTerminalId(''); setRefreshDatatable(new Date()); };

    const terminalFilterOptions = useMemo(
        () => [{ value: '', label: 'Tümü' }, ...terminalListForFilter.map((o) => ({ value: `${o.id}`, label: o.text }))],
        [terminalListForFilter]
    );

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
                        <div
                            className="card-body p-0"
                            style={{
                                borderRadius: 10,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                marginBottom: 15,
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                className="border-bottom"
                                style={{
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    background: filterOpen ? 'rgba(124, 58, 237, 0.08)' : '#f8f9fa',
                                }}
                                onClick={() => setFilterOpen(!filterOpen)}
                                onKeyDown={(e) => e.key === 'Enter' && setFilterOpen(!filterOpen)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = filterOpen ? 'rgba(124, 58, 237, 0.12)' : '#e9ecef';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = filterOpen ? 'rgba(124, 58, 237, 0.08)' : '#f8f9fa';
                                }}
                                role="button"
                                tabIndex={0}
                                title={filterOpen ? 'Filtreleri gizle' : 'Filtreleri göster'}
                            >
                                <div
                                    className="d-flex align-items-center justify-content-between px-4 py-3"
                                    style={{ borderLeft: '4px solid #7c3aed' }}
                                >
                                    <span className="d-flex align-items-center gap-2">
                                        <i className="icon-filter4 text-primary" style={{ fontSize: '1.1rem' }} />
                                        <span className="fw-semibold">Filtreler</span>
                                        <span className="text-muted small">
                                            ({filterOpen ? 'gizlemek için tıklayın' : 'görmek için tıklayın'})
                                        </span>
                                        {activeFilterCount > 0 && (
                                            <span className="badge bg-primary rounded-pill">{activeFilterCount} aktif</span>
                                        )}
                                    </span>
                                    <span className="d-flex align-items-center gap-2 text-muted small">
                                        <span>{filterOpen ? 'Daralt' : 'Genişlet'}</span>
                                        <i
                                            className="icon-arrow-down8"
                                            style={{
                                                transform: filterOpen ? 'rotate(180deg)' : 'none',
                                                transition: 'transform 0.25s',
                                                fontSize: '1.25rem',
                                            }}
                                        />
                                    </span>
                                </div>
                            </div>
                            <Collapse isOpen={filterOpen}>
                                <div className="px-4 pb-4 pt-0">
                                    <div className="row g-3 align-items-end">
                                        <div className="col-12 col-md-6 col-lg-4">
                                            <label className="form-label small text-muted mb-1">Terminal Adı</label>
                                            <Select
                                                classNamePrefix="react-select"
                                                options={terminalFilterOptions}
                                                value={terminalFilterOptions.find((x) => x.value === filterTerminalId) || terminalFilterOptions[0]}
                                                placeholder="Tümü"
                                                isClearable={false}
                                                onChange={(o) => setFilterTerminalId(o?.value ?? '')}
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: 32,
                                                        fontSize: '0.875rem',
                                                        borderRadius: 6,
                                                        borderColor: state.isFocused ? '#7c3aed' : '#dee2e6',
                                                    }),
                                                    menu: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6 col-lg-auto">
                                            <Button color="primary" size="sm" onClick={applyFilters}>
                                                <i className="icon-search4 me-1" /> Filtrele
                                            </Button>
                                            <Button color="light" size="sm" outline className="ms-2" onClick={clearFilters}>
                                                Temizle
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Collapse>
                        </div>
                        <DataTable
                            Refresh={refreshDatatable}
                            DataUrl={dataUrlWithFilters}
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
