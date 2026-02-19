import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import AlertFunction from '../components/alertfunction';
import DataTable from '../components/datatable';
import Layout from '../layout/layout';
import PageHeader from '../layout/pageheader';
import PageLoading from '../layout/pageLoading';
import Image from "next/image"
import { Modal, ModalBody, ModalHeader, Tooltip } from 'reactstrap';
import { apiConstant, fileUploadUrl, GetWithToken, imageUploadUrl, PostWithToken, PostWithTokenFile } from '../pages/api/crud';
import ReactSelect from 'react-select';
import CurrencyInput from 'react-currency-input-field';
import { PriceSplitter } from './pricesptitter';
import Switch from "react-switch";
import { TextField, Select } from '@mui/material';
import Link from 'next/link';


export default function CompanyProperty({ changeTopic, company, loading, setHideLabel, setProperty, properties = [], hideLabel, setListProperty }) {

    const [refresh, setRefresh] = useState()
    const [valueById, setValueById] = useState({ id: "", value: "" });
    const [personelOption, setPersonelOption] = useState([]);
    const [inputVal, setInputVal] = useState();
    const [customerOption, setCustomerOption] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState();
    const [allCustomerData, setAllCustomerData] = useState();
    const [customerProjectTypeId, setCustomerProjectTypeId] = useState();
    const [companyAttachList, setCompanyAttachList] = useState();
    const [selectedCustomerProject, setSelectedCustomerProject] = useState();



    const getPersonelByName = async (name) => {
        setInputVal(name.toLocaleUpperCase())
        if (name.length < 2) {
            return []
        }
        var d = await PostWithToken("debisPersonel/GetActivePersonelByName",
            { key: name }).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })

        setPersonelOption(d.data.map((item, key) => { return { value: item.ad + " " + item.soyad, label: item.ad + " " + item.soyad } }))

    }
    const getCustomerByName = async (name) => {

        if (name.length < 2) {
            return []
        }
        var d = await PostWithToken("debisCompany/GetActiveCustomersByName",
            { key: name }).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })

        setAllCustomerData(d.data)
        setCustomerOption(d.data.map((item, key) => { return { value: item.name, label: item.name } }))


    }

    const AddAttachment = async (data) => {

        var d = await PostWithTokenFile("Company/CreatreCompanyAttachment/" + company.id, { name: "file", data: data }).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
        GetCompanyAttach(true)
    }
    const deleteAttachment = async (id) => {
        if (confirm("Kayıt silinecek onaylıyor musunuz")) {
            var d = await GetWithToken("Company/DeleteCompanyAttachment/" + id).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
            GetCompanyAttach(true)
        }
    }

    const GetCompanyAttach = async (refresh) => {
        if (company.id) {
            if (companyAttachList == undefined && refresh == undefined) {
                var d = await GetWithToken("Company/GetCompanyAttachment/" + company.id).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
                setCompanyAttachList(d.data)

            }
            if (refresh) {
                var d = await GetWithToken("Company/GetCompanyAttachment/" + company.id).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
                setCompanyAttachList(d.data)
            }
        }

    }

    useEffect(() => {
        GetCompanyAttach()
        setRefresh(new Date())


    }, [setHideLabel, setProperty, properties, hideLabel])

    useEffect(() => {
        var is15Data = properties.find(x => x.companyPropertyValueType == 15)

        if (is15Data) {

            setProperty(company?.documentPreCode + "" + company?.documentCode, is15Data.id);
        }


        var defaultText = properties.filter(x => x.companyPropertyValueType == 16)

        if (defaultText) {
            for (const itm of defaultText) {
                if (!itm.companyPropertyValues?.value) {

                    setProperty(itm.defaultValue, itm.id);
                }
            }


        }

    }, [])

    return (
        <div style={{ padding: 20 }} className="row col-12">
            {loading &&
                <div className='prd'></div>
            }

            {properties.map((item, key) => {




                if (item.companyPropertyValueType == 1) {
                    return (<div key={key} className={item.isWithFull && 'col-12 mb-4' || 'col-6 mb-4'}>

                        <div style={{ position: "relative" }}>
                            <TextField size='small' style={{ width: "100%" }} defaultValue={item.companyPropertyValues?.value} onBlur={(val) => { setHideLabel(); setProperty(val.target.value, item.id) }} id={item.id} label={item.key} variant="outlined" multiline />
                        </div>
                    </div>)
                }


                if (item.companyPropertyValueType == 2) {
                    return <div key={key} className={item.isWithFull && 'col-12 mb-4' || 'col-6 mb-4'}>
                        <div style={{ position: "relative" }}>
                            <TextField size='small' style={{ width: "100%" }} defaultValue={item.companyPropertyValues?.value} onBlur={(val) => { setHideLabel(); setProperty(val.target.value, item.id) }} id={item.id} label={item.key} variant="outlined" multiline />
                        </div>
                    </div>
                }
                if (item.companyPropertyValueType == 7) {
                    return <div key={key} className={item.isWithFull && 'col-12 mb-4' || 'col-6 mb-4'}>
                        <div style={{ position: "relative" }}>
                            {/* <input style={{ width: "100%" }} defaultValue={item.companyPropertyValues?.value} onBlur={(val) => { setHideLabel(); setProperty(val.target.value, item.id) }} id={item.id} type={"date"}></input> */}
                            <TextField required className='dd-date' type={"date"} size='small' style={{ width: "100%" }} defaultValue={item.companyPropertyValues?.value} onBlur={(val) => { setHideLabel(); setProperty(val.target.value, item.id) }} id={item.id} label={item.key} variant="outlined" />


                        </div>
                    </div>
                }
                if (item.companyPropertyValueType == 16) {
                    return <div key={key} className={item.isWithFull && 'col-12 mb-4' || 'col-6 mb-4'}>
                        <div style={{ position: "relative" }}>
                            {/* <input style={{ width: "100%" }} defaultValue={item.companyPropertyValues?.value} onBlur={(val) => { setHideLabel(); setProperty(val.target.value, item.id) }} id={item.id} type={"date"}></input> */}
                            <TextField required type={"text"} size='small' style={{ width: "100%" }} defaultValue={item.companyPropertyValues?.value || item.defaultValue} onBlur={(val) => { setHideLabel(); setProperty(val.target.value, item.id) }} id={item.id} label={item.key} variant="outlined" />


                        </div>
                    </div>
                }
                if (item.companyPropertyValueType == 5) {

                    var dd = item?.propertySelectLists.map((jitem, jkey) => { return { label: jitem.item, value: jitem.item } })
                    return <div key={key} className={item.isWithFull && 'col-12 mb-4' || 'col-6 mb-4'}>
                        {/* <legend className='mt-1 label-title-check'> {item.key}</legend> */}




                        <div className='swc-lbl'>
                            <div style={{ width: "100%" }}>
                                <b>{item.key}</b>
                                <ReactSelect onInputChange={(val) => { setValueById({ id: item.id, value: val }) }} placeholder={item.key + " Seç"} options={dd} defaultValue={{ label: item.companyPropertyValues?.value, value: item.companyPropertyValues?.value }} onChange={(val) => { setHideLabel(); setProperty(val.value, item.id) }} name="ilPlaka" ></ReactSelect>
                                {/* <b className='swc-text-b'> {item.key}</b> */}
                            </div>
                        </div>

                        {/* {item?.propertySelectLists.map((jitem, jkey) => {

                                return <div key={key} className={'col-12 mb-4'}>


                                    <div className='swc-lbl'>

                                        <Switch onChange={(val) => { setListProperty(val, jitem.id, item.id) }} checked={jitem.values?.filter((jx) => { return jx.propertySelectListId == jitem.id }).length > 0} id={jitem.id} placeholder={item.key + ' Giriniz'} ></Switch>
                                        <b className='swc-text-b'> {jitem.item}</b>
                                    </div>

                                </div>// checked={jitem.companyPropertyValues?.value == "True"} 
                            })} */}

                    </div>
                }
                if (item.companyPropertyValueType == 3) {

                    return <div key={key} className={item.isWithFull && 'col-12 mb-4' || 'col-6 mb-4'}>
                        {/* <label className='control-labal-f mt-1'><b>{item.key}</b> </label> */}
                        <div style={{ position: "relative" }}>
                            <input type='text' onFocus={() => { setHideLabel(item.id); document.getElementById(item.id).focus(); document.getElementById(item.id).value = 15 }} className={"form-control input-value-label " + (hideLabel == item.id && "hide-value-key")} placeholder='Fiyat Giriniz' value={item.companyPropertyValues?.value == null ? "" : PriceSplitter(item.companyPropertyValues?.value) + (item.companyPropertyValues?.value != "" && " TL")}></input>

                            <CurrencyInput onValueChange={(val) => { setValueById({ id: item.id, value: val }) }} onBlur={(val) => { setHideLabel(); if (valueById.id == item.id) { setProperty(valueById.value, item.id) } }} id={item.id} placeholder='Fiyat Giriniz' suffix=' TL' className='form-control'></CurrencyInput>
                            {/* <TextField  size='small' style={{width:"100%"}} defaultValue={item.companyPropertyValues?.value}  onBlur={(val) => { setHideLabel(); setProperty(val.target.value, item.id) }} id={item.id} label={item.key} variant="outlined" multiline /> */}

                        </div>
                    </div>

                }
                if (item.companyPropertyValueType == 4) {

                    return <div key={key} className={item.isWithFull && 'col-12 mb-4' || 'col-6 mb-4'}>

                        <div style={{ position: "relative" }}>
                            {/* <input type={"checkbox"} readOnly="readonly" onClick={() => { setHideLabel(item.id); document.getElementById(item.id).focus(); }} className={"form-control input-value-label " + (hideLabel == item.id && "hide-value-key")} checked={item.value}></input> */}
                            <div className='swc-lbl'>

                                <Switch onChange={(val) => { setProperty(val, item.id) }} checked={item.companyPropertyValues?.value == "True"} id={item.id} placeholder={item.key + ' Giriniz'} ></Switch>
                                <b className='swc-text-b'> {item.key}</b>
                            </div>
                        </div>
                    </div>
                }

                if (item.companyPropertyValueType == 6) {
                    return <div key={key} className={item.isWithFull && 'col-12 mb-4' || 'col-6 mb-4'}>
                        <label className='control-labal-f mt-1'><b>{item.key}</b> </label>
                        <div cla style={{ position: "relative" }}>


                            <input type="file" onChange={(val) => { setHideLabel(); setProperty(val.target.files[0], item.id, true) }} id={item.id} placeholder={item.key} className='form-control upload-frm'></input>
                            {item.companyPropertyValues?.value &&
                                <img src={imageUploadUrl + item.companyPropertyValues?.value} style={{ width: "100%" }} />

                            }

                        </div>
                    </div>
                }

                if (item.companyPropertyValueType == 11) {
                    return <div key={key} className={item.isWithFull && 'col-12 mb-4' || 'col-6 mb-4'}>
                        <label className='control-labal-f mt-1'><b>{item.key}</b> </label>
                        <div cla style={{ position: "relative" }}>


                            <input type="file" onChange={(val) => { AddAttachment(val.target.files[0]) }} id={item.id} placeholder={item.key} className='form-control upload-frm'></input>
                            <div className='col-12'>

                                <table border="1" style={{ width: "100%" }}>


                                    {companyAttachList?.map((kitem, kkey) => {
                                        return <tr key={kkey} style={{ textAlign: "center" }}>
                                            <td><a href={imageUploadUrl + kitem.url} >Ek {kkey + 1}</a></td>
                                            <td>{kitem.extension}</td>
                                            <td>{((kitem.size / 1024) / 1024).toFixed(2) + "Mb"}</td>
                                            <td ><button onClick={() => deleteAttachment(kitem.id)} className='btn btn-danger btn-sm'><i className='fa fa-trash'></i></button> </td>

                                        </tr>
                                    })

                                    }
                                </table>
                            </div>
                        </div>
                    </div>
                }



                if (item.companyPropertyValueType == 8) {

                    return <div key={key} className={item.isWithFull && 'col-12 mb-4' || 'col-6 mb-4'}>

                        <div style={{ position: "relative" }}>
                            {/* <input type={"checkbox"} readOnly="readonly" onClick={() => { setHideLabel(item.id); document.getElementById(item.id).focus(); }} className={"form-control input-value-label " + (hideLabel == item.id && "hide-value-key")} checked={item.value}></input> */}
                            <div className='swc-lbl'>
                                <div style={{ width: "100%" }}>
                                    <b>{item.key}</b>
                                    <ReactSelect onInputChange={(x) => { getPersonelByName(x.toLocaleLowerCase()); }} placeholder={item.key + " Seç"} options={personelOption.length == 0 && [{ label: item.companyPropertyValues?.value, value: item.companyPropertyValues?.value }] || personelOption} defaultValue={{ label: item.companyPropertyValues?.value, value: item.companyPropertyValues?.value }}
                                        onChange={(val) => { setHideLabel(); setProperty(val.value, item.id); }}  ></ReactSelect>
                                    {/* <b className='swc-text-b'> {item.key}</b> */}
                                </div>
                            </div>
                        </div>
                    </div>
                }

                if (item.companyPropertyValueType == 9) {

                    return <div key={key} className={item.isWithFull && 'col-12 mb-4' || 'col-6 mb-4'}>

                        <div style={{ position: "relative" }}>
                            {/* <input type={"checkbox"} readOnly="readonly" onClick={() => { setHideLabel(item.id); document.getElementById(item.id).focus(); }} className={"form-control input-value-label " + (hideLabel == item.id && "hide-value-key")} checked={item.value}></input> */}
                            <div className='swc-lbl'>
                                <div style={{ width: "100%" }}>
                                    <b>{item.key}</b>
                                    <ReactSelect onInputChange={(x) => { getCustomerByName(x.toLocaleLowerCase()); }} placeholder={item.key + " Seç"} options={customerOption.length == 0 && [{ label: item.companyPropertyValues?.value, value: item.companyPropertyValues?.value }] || customerOption} defaultValue={{ label: item.companyPropertyValues?.value, value: item.companyPropertyValues?.value }}
                                        onChange={(val) => {
                                            setHideLabel(); setProperty(val.value, item.id);

                                            var address = properties.find(x => { return x.companyPropertyValueType == 12 })
                                            var Phone = properties.find(x => { return x.companyPropertyValueType == 13 })
                                            var ePosta = properties.find(x => { return x.companyPropertyValueType == 14 })



                                            changeTopic("customer", val.value)
                                            let slc = allCustomerData?.find(x => { return x.name == val.value });
                                            setSelectedCustomerProject(undefined)
                                            if (slc != undefined) {
                                                setSelectedCustomer(slc)
                                                changeTopic("customerEmail", slc.employerEmail)
                                                changeTopic("customerAddress", slc.address)
                                                changeTopic("customerTel", slc.employerTel)

                                                { address && setProperty(slc.address, address.id); }
                                                { Phone && setProperty(slc.employerTel, Phone.id); }
                                                { ePosta && setProperty(slc.employerEmail, ePosta.id); }
                                            }


                                        }}  ></ReactSelect>
                                    {/* <b className='swc-text-b'> {item.key}</b> */}
                                </div>

                            </div>
                        </div>
                        <div className='row mt-1 p-2'>
                            {selectedCustomer && <>

                                {selectedCustomer && !selectedCustomerProject&& <div className='col-12' style={{ fontSize: 11 }}><b>Adres: </b> {selectedCustomer?.address || "-"}</div>}                                
                                {selectedCustomer && selectedCustomerProject&& <div className='col-12' style={{ fontSize: 11 }}><b>Adres : </b> {selectedCustomerProject?.address || "-"}</div>}                          
                              
                                {selectedCustomer && !selectedCustomerProject&& <div className='col-12' style={{ fontSize: 11 }}><b>Telefon: </b> {selectedCustomer?.employerTel || "-"}</div>}                                
                                {selectedCustomer && selectedCustomerProject&& <div className='col-12' style={{ fontSize: 11 }}><b>Telefon : </b> {selectedCustomerProject?.tel || "-"}</div>}                          

                                <div className='col-12' style={{ fontSize: 11 }}><b>E-posta: </b> {selectedCustomer?.employerEmail || "-"}</div>
                            </>}
                            {!selectedCustomer &&

                                <>

                                    <div className='col-12' style={{ fontSize: 11 }}><b>Adres: </b> {properties.find(x => { return x.companyPropertyValueType == 12 })?.companyPropertyValues?.value || "-"}</div>
                                    <div className='col-12' style={{ fontSize: 11 }}><b>Telefon: </b> {properties.find(x => { return x.companyPropertyValueType == 13 })?.companyPropertyValues?.value || "-"}</div>
                                    <div className='col-12' style={{ fontSize: 11 }}><b>E-posta: </b>{properties.find(x => { return x.companyPropertyValueType == 14 })?.companyPropertyValues?.value || "-"}</div>
                                </>}

                        </div>
                    </div>
                }
                if (item.companyPropertyValueType == 10) {



                    let selectedCustomerProjct = selectedCustomer?.customerProjects?.map(x => { return { label: x.name, value: x.name, fulValue: x } })

                    return <div key={key} className={item.isWithFull && 'col-12 mb-4' || 'col-6 mb-4'}>

                        <div style={{ position: "relative" }}>
                            {/* <input type={"checkbox"} readOnly="readonly" onClick={() => { setHideLabel(item.id); document.getElementById(item.id).focus(); }} className={"form-control input-value-label " + (hideLabel == item.id && "hide-value-key")} checked={item.value}></input> */}
                            <div className='swc-lbl'>
                                <div style={{ width: "100%" }}>
                                    <b>{item.key}</b>
                                    <ReactSelect placeholder={item.key + " Seç"} options={!selectedCustomerProjct && selectedCustomerProjct?.length == 0 && [{ label: item.companyPropertyValues?.value, value: item.companyPropertyValues?.value }] || selectedCustomerProjct} defaultValue={{ label: item.companyPropertyValues?.value, value: item.companyPropertyValues?.value }}
                                        onChange={(val) => {
                                            var address = properties.find(x => { return x.companyPropertyValueType == 12 })
                                            var Phone = properties.find(x => { return x.companyPropertyValueType == 13 })
                                            
                                            setSelectedCustomerProject(val.fulValue)
                                            changeTopic("customerTel",  val.fulValue.tel||" - ")
                                            changeTopic("customerAddress", val.fulValue.address||" - ")

                                            { address && setProperty(val.fulValue.address, address.id); }
                                                { Phone && setProperty(val.fulValue.tel, Phone.id); }
                                         
                                            setHideLabel(); setProperty(val.value, item.id); changeTopic("customerProject", val.value)
                                        }}  ></ReactSelect>
                                    {/* <b className='swc-text-b'> {item.key}</b> */}
                                </div>
                            </div>
                        </div>
                    </div>
                }
                // if (item.companyPropertyValueType == 15) {
                //     // setProperty(company?.documentPreCode+""+company?.documentCode, item.id);
                //     return (<div key={key}  >

                //         <div style={{ position: "relative" }}>
                //             <TextField size='small' style={{ width: "100%", border: "none" }} value={company?.documentPreCode + "" + company?.documentCode} id={item.id} label={item.key} variant="outlined" multiline />
                //         </div>
                //     </div>)
                // }


            })}


        </div>
    )
}
