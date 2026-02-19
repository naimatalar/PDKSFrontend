import { Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Col } from 'reactstrap';
import { GetWithToken, PostWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';
const isBrowser = typeof window === 'undefined'
import classnames from 'classnames';
import Image from 'next/image';

const SampleExaminationValue = ({ SampleExamination = [] }) => {
    const [initialVal, setInitialVal] = useState({})
    const [pageLoad, setPageLoad] = useState(false)
    const [minMaxValue, setMinMaxVal] = useState(false)
    const [activeTab, setActiveTab] = useState({})
    const [pageRefresh, setPageRefresh] = useState(new Date())

    useEffect(() => {

        start()
    }, [])
    const start = async () => {
        activeTabFunc(SampleExamination[SampleExamination.length - 1])
    }

    const activeTabFunc = async (d) => {
        setPageLoad(false)
        setActiveTab(d)
        var ppp = ""
        if (!isBrowser) {
            var path = window.location.pathname.split("/")
            ppp = path[path.length - 1]
        }

        var d = await GetWithToken("Analysis/GetSampleExaminationValues/" + d.sampleExaminationId + "/" + ppp).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

        if (d.data !== null) {
            setInitialVal(JSON.parse(d.data));

        }
        if (JSON.parse(d.data)?.isMinMax) {
            var mmax = JSON.parse(d.data).isMinMax == "true" ? true : false;

            if (mmax) {
                setMinMaxVal(mmax)

            }
        }



        setTimeout(() => {
            setPageLoad(true)

        }, 100);
        setPageRefresh(new Date())
    }
    const submit = async (val) => {

        var d = await PostWithToken("Analysis/SetSampleExaminationValue", { data: val }).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        if (d.isError) {
            AlertFunction("İşlem Yapılamadı", d?.message)
        }
        var act = activeTab;

        setTimeout(() => {
            // setPageLoad(true)
            setActiveTab({})
            activeTabFunc(act)
            setPageRefresh(Date())
        }, 100);


    }


    return (
        <div >
            <div className='tabbed' style={{ background: "white" }}>

                <ul style={{ padding: "0 0 0 36px" }}>
                    <li className='exclude-list' style={{ float: 'left' }}>Analiz Sonucu Girişi <i className='ml-3 fa fa-arrow-circle-right'></i></li>

                    {
                        SampleExamination?.map((item, key) => {
                            return <li key={key} onClick={() => { activeTabFunc(item); }} className={classnames({ active: activeTab === item })}>
                                {item.sampleExaminationName}
                            </li>

                        })
                    }
                </ul>
            </div>
            <div className='tab-p-analisys' style={{ background: "white" }}>
            <b className='text-warning' style={{
                                    border: "1px dashed red",
                                    padding: "10px"
                                }}>Analiz sonucunda rapor oluşturulabilmesi için aşağıdaki değerleri giriniz</b>
                {!pageLoad &&
                    <div className='text-center pt-5'>
                        <Image width={100} className="blur-exclude" height={100} src={require("../layout/assets/images/loading.gif")}></Image>
                    </div>
                }
                {pageLoad &&
                    <Formik
                        initialValues={initialVal}
                        validate={values => {
                            const errors = {};
                            return errors;
                        }}
                        onSubmit={(values, { setSubmitting }) => {
                            setPageLoad(false)
                            var ppp = ""
                            if (!isBrowser) {
                                var path = window.location.pathname.split("/")
                                ppp = path[path.length - 1]
                            }
                            values.createAnalisysRecordId = ppp;

                            values.sampleExaminationId = activeTab.sampleExaminationId;
                            setTimeout(async () => {
                                await submit(values)
                                setSubmitting(false);

                            }, 400);

                        }}>

                        {({ isSubmitting, isValidating, handleChange, handleBlur, setFieldValue, values, initialValues }) => (
                            <Form className={(pageLoad != true && "pg-load-dev-from") + ' row mt-3 col-12 form-n-popup'} >
                                {/* {JSON.stringify(initialVal)} */}

                               

                                <div className={(values.isMinMax && "mb-3") + " pl-2 col-12"}><label><input checked={values.isMinMax} value={"true"} onClick={(x) => { setMinMaxVal(x.target.checked) }} type={'checkbox'} name="isMinMax" onChange={handleChange} onBlur={handleBlur} ></input><b>Referans değerler girilecek (min-max)</b></label></div>


                                {
                                    activeTab?.sampleExaminationResultValueType?.map((kitem, kkey) => {

                                        if (kitem.measureUnitType == 1) {
                                            return <div className={'col-6 mt-4 ' + (values.isMinMax && "mb-max-min-val")} key={kkey}>
                                                {
                                                    values.isMinMax &&
                                                    <div className='min-max-val row col-12 justify-content-end mb-1'>
                                                        <div style={{ position: "relative", marginRight: 10 }}><label className='input-label' style={{ left: -5, top: -18, height: 15 }}>Min </label>
                                                            <input onChange={handleChange} onBlur={handleBlur} name={"min-" + kitem.id} value={values?.["min-" + kitem.id]} className='min-input-border' max={100} style={{ width: 56 }} type="number"></input></div>
                                                        <div style={{ position: "relative" }}><label className='input-label' style={{ left: -5, top: -18, height: 15 }}>Max </label>
                                                            <input onChange={handleChange} onBlur={handleBlur} name={"max-" + kitem.id} value={values?.["max-" + kitem.id]} className='max-input-border' max={100} style={{ width: 56 }} type="number"></input></div>
                                                    </div>}
                                                <label className='input-label'>{kitem.measurementUnit} ({kitem.measureUnitSymbol})</label>
                                                <input name={kitem.id} value={values?.[kitem.id]} onChange={handleChange} onBlur={handleBlur} className='device-value-input' max={100} type="number"></input>

                                            </div>
                                        }
                                        if (kitem.measureUnitType == 2) {
                                            return <div className={'col-6 mt-4 ' + (values.isMinMax && "mb-max-min-val")} key={kkey}>
                                                {
                                                    values.isMinMax &&
                                                    <div className='min-max-val row col-12 justify-content-end mb-1'>
                                                        <div style={{ position: "relative", marginRight: 10 }}><label className='input-label' style={{ left: -5, top: -18, height: 15 }}>Min </label>
                                                            <input onChange={handleChange} onBlur={handleBlur} name={"min-" + kitem.id} value={values?.["min-" + kitem.id]} className='min-input-border' max={100} style={{ width: 56 }} type="number"></input></div>
                                                        <div style={{ position: "relative" }}><label className='input-label' style={{ left: -5, top: -18, height: 15 }}>Max </label>
                                                            <input onChange={handleChange} onBlur={handleBlur} name={"max-" + kitem.id} value={values?.["max-" + kitem.id]} className='max-input-border' max={100} style={{ width: 56 }} type="number"></input></div>
                                                    </div>}
                                                <label className='input-label'>{kitem.measurementUnit} ({kitem.measureUnitSymbol})</label>
                                                <input name={kitem.id} value={values?.[kitem.id]} onChange={handleChange} onBlur={handleBlur} className='device-value-input' max={100} type="number" ></input>

                                            </div>
                                        }
                                        if (kitem.measureUnitType == 3) {
                                            return <div className={'col-6 mt-4 ' + (values.isMinMax && "mb-max-min-val")} key={kkey}>
                                                {
                                                    values.isMinMax &&
                                                    <div className='min-max-val row col-12 justify-content-end mb-1'>
                                                        <div style={{ position: "relative", marginRight: 10 }}><label className='input-label' style={{ left: -5, top: -18, height: 15 }}>Min </label>
                                                            <input onChange={handleChange} onBlur={handleBlur} name={"min-" + kitem.id} value={values?.["min-" + kitem.id]} className='min-input-border' max={100} style={{ width: 56 }} type="number"></input></div>
                                                        <div style={{ position: "relative" }}><label className='input-label' style={{ left: -5, top: -18, height: 15 }}>Max </label>
                                                            <input onChange={handleChange} onBlur={handleBlur} name={"max-" + kitem.id} value={values?.["max-" + kitem.id]} className='max-input-border' max={100} style={{ width: 56 }} type="number"></input></div>
                                                    </div>}
                                                <label className='input-label'>{kitem.measurementUnit} ({kitem.measureUnitSymbol})</label>
                                                <input name={kitem.id} value={values?.[kitem.id]} onChange={handleChange} onBlur={handleBlur} className='device-value-input' max={100} type="number" ></input>

                                            </div>
                                        }
                                        if (kitem.measureUnitType == 4) {
                                            return <div className={'col-6 mt-4 ' + (values.isMinMax && "mb-max-min-val")} key={kkey}>
                                                {
                                                    values.isMinMax &&
                                                    <div className='min-max-val row col-12 justify-content-end mb-1'>
                                                        <div style={{ position: "relative", marginRight: 10 }}><label className='input-label' style={{ left: -5, top: -18, height: 15 }}>Min </label>
                                                            <input onChange={handleChange} onBlur={handleBlur} name={"min-" + kitem.id} value={values?.["min-" + kitem.id]} className='min-input-border' max={100} style={{ width: 56 }} type="number"></input></div>
                                                        <div style={{ position: "relative" }}><label className='input-label' style={{ left: -5, top: -18, height: 15 }}>Max </label>
                                                            <input onChange={handleChange} onBlur={handleBlur} name={"max-" + kitem.id} value={values?.["max-" + kitem.id]} className='max-input-border' max={100} style={{ width: 56 }} type="number"></input></div>
                                                    </div>}
                                                <label className='input-label'>{kitem.measurementUnit} ({kitem.measureUnitSymbol})</label>
                                                <input name={kitem.id} value={values?.[kitem.id]} onChange={handleChange} onBlur={handleBlur} className='device-value-input' max={100} type="text" ></input>

                                            </div>
                                        }


                                    })
                                }
                                <Col lg="12" className='mt-2 mb-3'>
                                    <button type='submit' className='btn btn-outline-success'><i className='fa fa-save'></i> Kaydet</button>
                                </Col>
                            </Form>
                        )}

                    </Formik>
                }
            </div>
        </div>
    );
};

export default SampleExaminationValue;