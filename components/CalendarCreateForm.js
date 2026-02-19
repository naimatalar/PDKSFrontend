import React, { useEffect } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { ErrorMessage, Formik, Field, Form } from 'formik';
import ReactDatePicker from 'react-datepicker';
import ReactSelect from "react-select";

import DebisButton from './button';
import { ModalFooter } from 'react-bootstrap';
import { useState } from 'react';

import { GetWithToken, PostWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';

// import TimePicker from "react-time-picker"
// import 'react-time-picker/dist/TimePicker.css';
// import 'react-clock/dist/Clock.css';


function CalendarCreateForm({ open, initialWorkPlanData, refreshCalendar }) {

    const [workPlanGroup, setWorkPlanGroup] = useState([])
    const [subWorkPlanGroup, setSubWorkPlanGroup] = useState([])
    const [innerSubWorkPlanGroup, setInnerSubWorkPlanGroup] = useState()
    const [customerSelect, setCustomerSelect] = useState([])
    const [initialData, setInitialData] = useState()



    useEffect(() => {
        GetWorkPlan()

        // initData.workTypeId = initialWorkPlanData.group.innerSubGroup?.id &&
        // || initialWorkPlanData.group.subGroup?.id &&{value:initialWorkPlanData.group.subGroup?.id,label:initialWorkPlanData.group.subGroup?.name }
        if (initialWorkPlanData?.workPlan) {

            var initData = initialWorkPlanData?.workPlan
            if (initialWorkPlanData?.group?.innerSubGroup) {
                initData.workTypeId = { value: initialWorkPlanData.group.innerSubGroup?.id, label: initialWorkPlanData.group.innerSubGroup?.name }
                initData.workTypeId = { value: initialWorkPlanData.group.innerSubGroup?.id, label: initialWorkPlanData.group.innerSubGroup?.name }
                initData.workTypeSubId = { value: initialWorkPlanData.group.subGroup?.id, label: initialWorkPlanData.group.subGroup?.name }
                initData.workTypeInnerSubId = { value: initialWorkPlanData.group.group?.id, label: initialWorkPlanData.group.group?.name }
                setInnerSubWorkPlanGroup([{ value: initialWorkPlanData.group.group?.id, label: initialWorkPlanData.group.group?.name }])
            }
            if (initialWorkPlanData?.group?.innerSubGroup == null) {
                initData.workTypeId = { value: initialWorkPlanData.group.subGroup?.id, label: initialWorkPlanData.group.subGroup?.name }
                initData.workTypeSubId = { value: initialWorkPlanData.group.group?.id, label: initialWorkPlanData.group.group?.name }

            }
            if (initialWorkPlanData?.customer?.customer) {
                initData.customer = { value: initialWorkPlanData.customer.customer.id, label: initialWorkPlanData.customer.customer.name }
                initData.customerSelect = true

            }
            if (initialWorkPlanData?.customer?.project) {
                initData.project = { value: initialWorkPlanData.customer.project.id, label: initialWorkPlanData.customer.project.name }
            }

            if (initialWorkPlanData?.customer?.customerAgents) {
                initData.customerAgents = initialWorkPlanData.customer.customerAgents.map((item, key) => { return { label: item.fullName, value: item.id, email: item.email, phone: item.phone, title: item.title } })
            }

            setInitialData(initData)
        } else {

            setInitialData(initialWorkPlanData)
        }





    }, [initialWorkPlanData, initialData])


    const GetWorkPlan = async (id, inner = false) => {
        var param = id ? "?parentId=" + id : "";
        var d = await GetWithToken("listItem/WorkPlanGroup" + param).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false });

        if (id && inner == false) {
            setSubWorkPlanGroup(d.data)
        } else if (id == undefined && inner == false) {

            setWorkPlanGroup(d.data)
        }
        if (inner == true && id) {

            setInnerSubWorkPlanGroup(d.data)
        }
        return d.data
    }
    const createWorkPlan = async (val) => {
        await PostWithToken("workPlan/CreateWorkPlan", val).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false });
        // return d.data
    }
    const GetCustomerSelect = async (name) => {
        var param = name ? "?name=" + name : "";
        var d = await GetWithToken("listItem/GetCompanyByName" + param).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false });

        setCustomerSelect(d.data)
        return d.data
    }
    return (
        <div>
            {initialData && <Formik
                initialValues={initialData}
                onSubmit={async (values, { setSubmitting }) => {
                    setSubmitting(true);
                    // Your submit logic here
                    await createWorkPlan(values)
                    setSubmitting(false);

                    await refreshCalendar()

                    open(false)
                }}

            >
                {({ isSubmitting, values, setFieldValue, handleBlur }) => (<Modal size='md' isOpen={true}>
                    <Form className="col-md-12 col-12 form-n-popup p-0">
                        <ModalHeader cssModule={{ 'modal-title': 'w-100 text-center m-0' }}>
                            <div className="d-flex justify-content-center mb-2">
                            </div>
                            <div className="d-flex ">
                                <p>İş <b>Planı</b> Kayıt</p>

                            </div>
                        </ModalHeader>
                        <ModalBody>


                            <Field
                                type="hidden"
                                id="id"
                                className="form-control"
                                name="id"
                            />
                            <Field type="hidden" name="parentId" id="parentId" />
                            <div className="row">
                                <div className='col-md-6 col-12 mb-3 row '>
                                    <div className='col-md-12 col-12 mb-3 ml-4'>

                                        <ReactDatePicker
                                            selected={values.startDate}
                                            onChange={(date) => setFieldValue('startDate', date)}
                                            className="form-control"
                                            placeholderText="Tarih seçiniz"
                                            disabled
                                            name='startDate'

                                        />
                                        <label className="input-label me-2">Başlangıç Tarihi</label>
                                    </div>
                                    <div className='col-md-12 col-12 mb-3 ml-4'>

                                        {/* <TimePicker onChange={onChange} value={value} /> */}
                                        <span className='back-time' >
                                            <input className="form-control" style={{ width: 200 }} type={"time"} onChange={(x) => setFieldValue("startTime", x.target.value)} value={values.startTime}></input>
                                        </span>
                                        <label className="input-label me-2">Başlangıç Saati</label>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12 mb-3'>
                                    <div className='col-md-12 col-12 mb-3 ml-3'>

                                        <ReactDatePicker
                                            selected={values.endDate}
                                            onChange={(date) => setFieldValue('endDate', date)}
                                            className="form-control"
                                            placeholderText="Tarih seçiniz"
                                            disabled
                                        />   <label className="input-label me-2">Bitiş Tarihi</label>
                                    </div>
                                    <div className='col-md-12 col-12 mb-3 ml-3'>


                                        <input type={"time"} style={{ width: 200 }} className="form-control" onChange={(x) => setFieldValue("endTime", x.target.value)} value={values.endTime}></input>


                                        <label className="input-label me-2">Bitiş Saati</label>
                                    </div>
                                </div>
                            </div>
                            <div className="row">

                                <div className='col-md-10 col-12 mb-3 ml-4'>

                                    <ReactSelect
                                        loadingMessage={"Yükleniyor"}
                                        isClearable
                                        options={workPlanGroup.map((item, key) => { return { label: item.name, value: item.id, customerSelect: item.customerSelect } })}
                                        placeholder={"Seçiniz"}
                                        defaultValue={initialData.workTypeId}
                                        onChange={(val) => {
                                            if (val == null) {
                                                setSubWorkPlanGroup([])
                                                setFieldValue("workTypeId", "");

                                            } else {
                                                GetWorkPlan(val.value)
                                                // setFieldValue("category", val.value);
                                                setFieldValue("workTypeId", val.value);

                                                setFieldValue("customerSelect", val.customerSelect);
                                            }
                                        }}
                                    />        <label className="input-label">Çalışma Tipi</label>
                                </div>

                                {subWorkPlanGroup &&
                                    <div className='col-md-10 col-12 mb-3 ml-4'>
                                        <ReactSelect
                                            loadingMessage={"Yükleniyor"}
                                            isClearable
                                            options={subWorkPlanGroup.map((item, key) => { return { label: item.name, value: item.id, customerSelect: item.customerSelect } })}
                                            value={values.workTypeSubId}
                                            placeholder={"Seçiniz"}
                                            onChange={(val) => {

                                                if (val == null) {
                                                    setInnerSubWorkPlanGroup(undefined)
                                                    setFieldValue("groupId", "");
                                                    setFieldValue("workTypeSubId", "");
                                                } else {
                                                    GetWorkPlan(val.value, true)
                                                    setFieldValue("groupId", val.value);
                                                    setFieldValue("workTypeSubId", val);
                                                    setFieldValue("customerSelect", val.customerSelect);
                                                }
                                            }}
                                        />
                                        <label className="input-label">Yapılan Çalışma</label>
                                    </div>
                                }

                                {innerSubWorkPlanGroup && innerSubWorkPlanGroup?.length > 0 && <div className='col-md-10 col-12 mb-3 ml-4'>
                                    <ReactSelect
                                        loadingMessage={"Yükleniyor"}
                                        isClearable
                                        options={innerSubWorkPlanGroup.map((item, key) => { return { label: item.name, value: item.id, customSelect: item.customSelect } })}
                                        value={values.workTypeInnerSubId}
                                        placeholder={"Seçiniz"}
                                        onChange={(val) => {
                                            if (val == null) {
                                                setFieldValue("groupId", "");
                                                setFieldValue("workTypeInnerSubId", "");
                                            } else {
                                                setFieldValue("workTypeInnerSubId", val);
                                                setFieldValue("groupId", val.value);
                                            }
                                        }}
                                    />
                                    <label className="input-label">Görev Tipi</label>
                                </div>}

                                {values.customerSelect && <div className='container bd-workplan-firm'>
                                    <div className='row'>
                                        <div className='col-md-10 col-12 mb-3 ml-3'>
                                            <ReactSelect
                                                loadingMessage={"Yükleniyor"}
                                                isClearable
                                                onInputChange={(x) => {

                                                    GetCustomerSelect(x)
                                                }}
                                                options={customerSelect?.map((item, key) => { return { label: item.name, value: item.id, project: item?.customerProjects, agent: item?.customerAgent } })}
                                                value={values.customer}
                                                placeholder={"Seçiniz"}
                                                onChange={(val) => {
                                                    if (val == null) {
                                                        setFieldValue("customerId", "");
                                                        setFieldValue("customer", "");
                                                        setFieldValue("projects", []);
                                                    } else {
                                                        setFieldValue("customerName", val.name);
                                                        setFieldValue("customer", val);

                                                        setFieldValue("customerId", val.value);
                                                        setFieldValue("projects", val.project);
                                                        setFieldValue("agent", val.agent);
                                                    }
                                                }}
                                            />
                                            <label className="input-label">Firma Seçiniz</label>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='col-md-10 col-12 mb-3 ml-3'>

                                            <ReactSelect
                                                loadingMessage={"Yükleniyor"}
                                                isClearable
                                                value={values.project}
                                                onInputChange={(x) => {
                                                    GetCustomerSelect(x)
                                                }}
                                                options={values?.projects?.map((item, key) => { return { label: item.name, value: item.id } })}

                                                placeholder={"Proje Seçiniz"}
                                                onChange={(val) => {
                                                    if (val == null) {
                                                        setFieldValue("projectId", "");
                                                        setFieldValue("project", "");
                                                    } else {
                                                        setFieldValue("project", val);
                                                        setFieldValue("projectId", val.value);
                                                        setFieldValue("title", val.name);

                                                    }
                                                }}
                                            />
                                            <label className="input-label">Proje Seçiniz</label>
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='col-md-10 col-12 mb-3 ml-3'>

                                            <ReactSelect
                                                loadingMessage={"Yükleniyor"}
                                                isClearable
                                                // onInputChange={(x) => {
                                                //     GetCustomerSelect(x)
                                                // }}
                                                value={values.customerAgents}
                                                isMulti
                                                options={values?.agent?.map((item, key) => { return { label: item.fullName, value: item.id, email: item.email, phone: item.phone, title: item.title } })}

                                                placeholder={"Yetkili Seçiniz"}
                                                onChange={(val) => {

                                                    if (val == null) {

                                                        setFieldValue("customerAgentIds", undefined);
                                                        setFieldValue("customerAgents", undefined);
                                                    } else {
                                                        setFieldValue("customerAgentIds", val?.map((item, key) => { return item.value }));
                                                        setFieldValue("customerAgents", val);

                                                    }
                                                }}
                                            />
                                            <label className="input-label">Firma Yetkilisi Seçiniz</label>
                                        </div>
                                    </div>
                                </div>


                                }


                                {values.customerSelect && <div className='col-12'>
                                    <div className="col-10 mb-3 ml-3">
                                        <ErrorMessage
                                            name="key"
                                            component="div"
                                            className="text-danger danger-alert-form"
                                        />

                                        <Field
                                            type="text"
                                            id="companyName"
                                            className="form-control"
                                            name="companyName"
                                            placeholder="Not Giriniz:"
                                        /><label className="input-label">Yer/Firma/Proje</label>
                                    </div>
                                </div>}
                                <div className='col-12'>
                                <div className="col-10 mb-3" style={{ marginLeft: '26px' }}>
                                <label htmlFor="explanationText" className="input-label">
                                    İşin Açıklaması
                                </label>
                                
                                <Field
                                    as="textarea"
                                    id="explanationText"
                                    className="form-control"
                                    name="explanationText"
                                    placeholder="Not Giriniz:"
                                    style={{ 
                                        minHeight: '50px', 
                                        resize: 'down',  // Her iki yönde yeniden boyutlandırılabilir
                                        overflow: 'auto' // Taşan içerik için kaydırma çubuğu
                                    }}
                                    rows="1" // Başlangıçta bir satırlık yer açılması için
                                />
                                
                                <ErrorMessage
                                    name="key"
                                    component="div"
                                    className="text-danger danger-alert-form"
                                />
                            </div>

                                </div>
                                <div className='col-12'>
                                <div className="col-10 mb-3" style={{ marginLeft: '26px' }}>
                                <label htmlFor="reasonText" className="input-label">
                                    Tamamlanmama Gerekçesi
                                </label>
                                
                                <Field
                                    as="textarea"
                                    id="reasonText"
                                    className="form-control"
                                    name="reasonText"
                                    placeholder="Not Giriniz:"
                                    style={{ 
                                        minHeight: '75px', 
                                        resize: 'down',  // Her iki yönde yeniden boyutlandırılabilir
                                        overflow: 'auto' // Taşan içerik için kaydırma çubuğu
                                    }}
                                    rows="1" // Başlangıçta bir satırlık yer açılması için
                                />
                                
                                <ErrorMessage
                                    name="key"
                                    component="div"
                                    className="text-danger danger-alert-form"
                                />
                            </div>

                                </div>
                            </div>

                        </ModalBody>
                        <ModalFooter style={{ backgroundColor: "#eff3f8", color: 'white' }}>
                            <div className="col-12">
                                <h5 style={{ color: 'black' }}>Detam Group mesai saatleri Pazartesi-Cuma 09:00 - 18:00. Cumartesi 09:00 - 15:00 arasındadır.</h5>
                                <DebisButton
                                    type="submit"
                                    style={{ backgroundColor: "#239A8F", color: 'white' }}
                                >
                                    Kaydet
                                </DebisButton>
                                <DebisButton
                                    onClick={() => open(false)}
                                    style={{ backgroundColor: "Red", color: 'white' }}
                                >
                                    İptal
                                </DebisButton>
                            </div>
                        </ModalFooter>
                    </Form>

                </Modal>
                )}
            </Formik>}
        </div>
    );
}

export default CalendarCreateForm;
