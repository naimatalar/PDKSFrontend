import React, { useEffect, useState } from 'react';
import { GetWithToken, PostWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';

function ContactUs({ companyId }) {
    const [dataList, setDataList] = useState([]);
    const [contactType, setContactType] = useState();
    const [contactValue, setContactValue] = useState();

    useEffect(() => {

        start()
    }, [])
    const start = async () => {
        var d = await GetWithToken("contact/GetContactUsByCompanyId/" + companyId).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })

        setDataList(d.data)
    }
    const SetValue = async (val, type) => {

      
        var data = dataList.filter(x => { return x.contactType != type })
        data.push({ value: val, contactType: type, companyId: companyId })
        setDataList(data);
 
        // await PostWithToken("contact/create", { companyId: companyId, value: val, contactType: type }).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
        // start()
    }

    const changeValue = async (val, type) => {

 
        await PostWithToken("contact/create", { companyId: companyId, value: val, contactType: type }).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
        
    }


    return (
        <div className='row'>

            <div className='row col-12'>

                {dataList &&
                    <div className='col-12 row p-4'>
                        <div className='col-4 mb-3'>
                            <label>İş Telefonu</label>
                            <input placeholder='İş Telefonu Giriniz' className='form-control' value={dataList.find(x => { return x.contactType == 1 })?.value} onBlur={(x) => { changeValue(x.target.value, 1) }} onChange={(x) => { SetValue(x.target.value, 1) }} type={"text"}></input>
                        </div>
                        <div className='col-4 mb-3'>
                            <label>İş Telefonu 2</label>
                            <input placeholder='İş Telefonu 2 Giriniz' className='form-control' value={dataList.find(x => { return x.contactType == 6 })?.value} onBlur={(x) => { changeValue(x.target.value, 6) }}   onChange={(x) => { SetValue(x.target.value, 6) }} type={"text"}></input>
                        </div>
                        <div className='col-4 mb-3'>
                            <label>GSM</label>
                            <input placeholder='Gsm Numarası Giriniz' className='form-control' value={dataList.find(x => { return x.contactType == 7 })?.value} onBlur={(x) => { changeValue(x.target.value, 7) }} onChange={(x) => { SetValue(x.target.value, 7) }} type={"text"}></input>
                        </div>
                        <div className='col-4 mb-3'>
                            <label>Watsapp</label>
                            <input placeholder='Watsapp Numarası Giriniz' className='form-control' value={dataList.find(x => { return x.contactType == 8 })?.value} onBlur={(x) => { changeValue(x.target.value, 8) }}  onChange={(x) => { SetValue(x.target.value, 8) }} type={"text"}></input>
                        </div>
                        <div className='col-4 mb-3'>
                            <label>E-posta </label>
                            <input placeholder='E-posta Giriniz' className='form-control' value={dataList.find(x => { return x.contactType == 9})?.value} onBlur={(x) => { changeValue(x.target.value, 9) }} onChange={(x) => { SetValue(x.target.value, 9) }} type={"text"}></input>
                        </div>
                        <div className='col-4 mb-3'>
                            <label>Web Sitesi </label>
                            <input placeholder='Web Sitesi Giriniz' className='form-control'  value={dataList.find(x => { return x.contactType == 10 })?.value} onBlur={(x) => { changeValue(x.target.value, 10) }} onChange={(x) => { SetValue(x.target.value, 10) }} type={"text"}></input>
                        </div>
                        <div className='col-4 mb-3'>
                            <label>Instagram </label>
                            <input placeholder='Instagram Linki Giriniz' className='form-control'  value={dataList.find(x => { return x.contactType == 2 })?.value}  onBlur={(x) => { changeValue(x.target.value, 2) }} onChange={(x) => { SetValue(x.target.value, 2) }} type={"text"}></input>
                        </div>
                        <div className='col-4 mb-3'>
                            <label>Youtube </label>
                            <input placeholder='Youtube Linki Giriniz' className='form-control'  value={dataList.find(x => { return x.contactType == 3 })?.value} onBlur={(x) => { changeValue(x.target.value, 3) }} onChange={(x) => { SetValue(x.target.value, 3) }} type={"text"}></input>
                        </div>
                        <div className='col-4 mb-3'>
                            <label>Linkedin </label>
                            <input placeholder='Linkedin Linki Giriniz' className='form-control'  value={dataList.find(x => { return x.contactType == 4 })?.value}  onBlur={(x) => { changeValue(x.target.value, 4) }} onChange={(x) => { SetValue(x.target.value, 4) }}type={"text"}></input>
                        </div>

                        <div className='col-4 mb-3'>
                            <label>Facebook </label>
                            <input placeholder='Facebook Linki Giriniz' className='form-control'  value={dataList.find(x => { return x.contactType == 5 })?.value}  onBlur={(x) => { changeValue(x.target.value, 5) }} onChange={(x) => { SetValue(x.target.value, 5) }} type={"text"}></input>
                        </div>

                        <div className='col-4 mb-3'>
                            <label>Harita </label>
                            <input placeholder='Harita Linki Giriniz' className='form-control'  value={dataList.find(x => { return x.contactType == 14 })?.value}  onBlur={(x) => { changeValue(x.target.value, 14) }} onChange={(x) => { SetValue(x.target.value, 14) }} type={"text"}></input>
                        </div>
                        <div className='col-12 mb-3'>
                            <label>Adres </label>
                            <textarea placeholder='Adres Giriniz' className='form-control'  value={dataList.find(x => { return x.contactType == 11 })?.value}  onBlur={(x) => { changeValue(x.target.value, 11) }} onChange={(x) => { SetValue(x.target.value, 11) }} rows="4"></textarea>
                        </div>



                    </div>

                }
            </div>

        </div>
    );
}

export default ContactUs;