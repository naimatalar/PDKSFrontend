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
import { PriceSplitter } from './pricesptitter';

// import TimePicker from "react-time-picker"
// import 'react-time-picker/dist/TimePicker.css';
// import 'react-clock/dist/Clock.css';


function CarPlanCreateForm({ open, initialWorkPlanData, refreshCalendar }) {

    const [planVehicle, setPlanVehicle] = useState([])
    const [planVehicleSub, setPlanVehicleSub] = useState([])
    const [innerSubWorkPlanGroup, setInnerSubWorkPlanGroup] = useState()
    const [customerSelect, setCustomerSelect] = useState([])
    const [initialData, setInitialData] = useState()
    const [personel, setPersonel] = useState([])

    const [personelStatus, setPersonelStatus] = useState([])


    useEffect(() => {
        GetWorkPlan()
        getPersonelStatus()
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
        var d = await GetWithToken("vehicle/GetVehiclePlanGroups").then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false });

        setPlanVehicle(d.data)
        return d.data
    }
    const createWorkPlan = async (val) => {
        console.log(val, "form")
        await PostWithToken("vehicle/CreateVehiclePlan", val).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false });
        // return d.data
    }
    const getPersonelStatus = async (name) => {

        var d = await GetWithToken("definitions/GetAssignedPersonnelStatusParameter").then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false });

        setPersonelStatus(d.data)

    }
    return (
        <div>
            {initialData && <Formik
                //  initialValues={{
                //     id: initialData.id || null,
                //     groupId: initialData.groupId || null,
                //     isCompleted: initialData.isCompleted || null,
                //     assignedPersonel: initialData.assignedPersonel || null,
                //     status: initialData.status || null,
                //     reasonText: initialData.reasonText || null,
                //     start: initialData.startDate || null,
                //     end: initialData.endDate || null,
                //     startTime: initialData.startTime || '',
                //     endTime: initialData.endTime || '',
                //     companyName: initialData.companyName || '',
                //     explanationText: initialData.explanationText || '',
                //     customerMail: initialData.customerMail || '',
                //     customerPhone: initialData.customerPhone || '',
                //     customerNote: initialData.customerNote || '',
                //     totalAmount: initialData.totalAmount || '',
                //     joinPersonel: initialData.joinPersonel || '',
                //     unjoinPersonel: initialData.unjoinPersonel || ''
                // }}
                initialValues={initialData}

                onSubmit={async (values, { setSubmitting }) => {
                    console.log(values, "onsubmit")
                    setSubmitting(true);
                    // Your submit logic here
                    values.totalAmount = PriceSplitter(values.totalAmount)
                    await createWorkPlan(values)
                    setSubmitting(false);

                    await refreshCalendar()

                    // open(false)
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
                                            selected={values.start}
                                            onChange={(date) => setFieldValue('start', date)}
                                            className="form-control"
                                            placeholderText="Tarih seçiniz"

                                            name='start'

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
                                            selected={values.end}

                                            onChange={(date) => setFieldValue('end', date)}
                                            className="form-control"
                                            placeholderText="Tarih seçiniz"

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
                                        options={planVehicle.map((item, key) => { return { label: item.name, value: item.id, customerSelect: item.customerSelect } })}
                                        value={values.workTypeSubId}
                                        placeholder={"Seçiniz"}
                                        onChange={async (val) => {
                                            setFieldValue("workTypeSubId", val)
                                            var d = await GetWithToken("vehicle/GetVehiclePlanGroups?parentId=" + val.value).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false });
                                            setFieldValue("groupId", [])
                                            setPlanVehicleSub(d.data)

                                        }}
                                    />
                                    <label className="input-label">Araç İl</label>
                                </div>
                                <div className='col-md-10 col-12 mb-3 ml-4'>

                                    <ReactSelect
                                        loadingMessage={"Yükleniyor"}
                                        isClearable
                                        options={planVehicleSub.map((item, key) => { return { label: item.name, value: item.id, customerSelect: item.customerSelect } })}
                                        placeholder={"Seçiniz"}
                                        value={values.groupId}
                                        isMulti
                                        // defaultValue={initialData.workTypeId}
                                        onChange={(val) => {

                                            setFieldValue("groupId", val)
                                        }}
                                    />        <label className="input-label">Plan Yapılan Araçlar</label>

                                </div>



                                <div className='col-md-10 col-12 mb-3 ml-4'>
                                    <ReactSelect
                                        loadingMessage={"Yükleniyor"}
                                        isClearable
                                        isMulti

                                        options={personel?.map((item, key) => { return { label: item.ad + " " + item.soyad, value: item.personelId } })}
                                        // value={values.workTypeSubId}
                                        onChange={(val) => {

                                            setFieldValue("assignedPersonel", val)

                                        }}

                                        placeholder={"Seçiniz"}
                                        value={values.assignedPersonel}
                                        onInputChange={(val) => {
                                            if (val.length > 2) {

                                                (async () => {
                                                    var d = await PostWithToken("personel/GetPersonelByNameSurname", { key: val })

                                                    setPersonel(d.data.data)

                                                })()

                                            }


                                        }}
                                    />

                                    <label className="input-label">Atanan Personel</label>
                                </div>
                                <div className='col-md-4 col-12 mb-3 ml-4'>
                                    <ReactSelect
                                        loadingMessage={"Yükleniyor"}
                                        isClearable

                                        options={personelStatus.map((item, key) => { return { label: item.value, value: item.code } })}
                                         value={values.status}
                                        placeholder={"Seçiniz"}
                                        onChange={(val) => {


                                            setFieldValue("status", val);

                                        }}
                                    />
                           
                                    <label className="input-label">Personel Durumu</label>
                                </div>
                                <div className='col-md-10 col-12 mb-3 ml-4'>
                                    <Field

                                        // id="explanationText"
                                        className="form-control"
                                        name="companyName"
                                        placeholder="Proje giriniz"
                                    />
                                    <label className="input-label">Yer | Firma | Proje</label>
                                </div>
                                <div className='col-md-10 col-12 mb-3 ml-4'>
                                    <Field

                                        as="textarea"
                                        // id="explanationText"
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
                                    <label className="input-label">Yapılan Teklifler</label>
                                </div>
                                <div className='col-md-10 col-12 mb-3 ml-4'>
                                    <Field

                                        // id="explanationText"
                                        className="form-control"
                                        name="customerMail"
                                        placeholder="Mail Adresi Giriniz::"

                                    />
                                    <label className="input-label">Müşteri Maili</label>
                                </div>
                                <div className='col-md-10 col-12 mb-3 ml-4'>
                                    <Field

                                        // id="explanationText"
                                        className="form-control"
                                        name="customerPhone"
                                        placeholder="Tel no giriniz"

                                    />
                                    <label className="input-label">Müşteri TEL</label>
                                </div>
                                <div className='col-md-10 col-12 mb-3 ml-4'>
                                    <Field

                                        as="textarea"
                                        // id="explanationText"
                                        className="form-control"
                                        name="customerNote"
                                        placeholder="Not Giriniz:"
                                        style={{
                                            minHeight: '50px',
                                            resize: 'down',  // Her iki yönde yeniden boyutlandırılabilir
                                            overflow: 'auto' // Taşan içerik için kaydırma çubuğu
                                        }}
                                        rows="1" // Başlangıçta bir satırlık yer açılması için
                                    />
                                    <label className="input-label">Müşteri Bilgi Notu</label>
                                </div>
                                <div className='col-md-12 col-12 ' >
                                    <div className='col-md-4 col-12 mb-3 ml-4'>

                                        <input
                                            className="form-control"
                                            name="totalAmount"
                                            placeholder="0.00TL"
                                            value={values.totalAmount}
                                            onChange={(x) => { setFieldValue("totalAmount", PriceSplitter(x.target.value)) }}></input>

                                        <label className="input-label">Toplam Tutar</label>
                                    </div>

                                </div>
                                <div className='col-md-12 col-12 ' >
                                    <div className='col-md-4 col-12 mb-3 ml-4'>
                                        <Field


                                            // id="explanationText"
                                            className="form-control"
                                            name="joinPersonel"
                                            placeholder="0"

                                        />
                                        <label className="input-label">Taramaya Katılan Personel Sayısı</label>
                                    </div>

                                </div>
                                <div className='col-md-12 col-12 ' >
                                    <div className='col-md-5 col-12 mb-3 ml-4'>
                                        <Field


                                            // id="explanationText"
                                            className="form-control"
                                            name="unjoinPersonel"
                                            placeholder="0"

                                        />
                                        <label className="input-label">Taramaya Katılmayan Personel Sayısı</label>
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

export default CarPlanCreateForm;
