import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { fileUploadUrl, GetWithToken, PostWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';

function Discount(props) {
    const [data, setData] = useState([])

    const [selectCompanyData, setSelectComapnyData] = useState([])

    const [description, setDescription] = useState()
    const [companyId, setCompanyId] = useState()
    const [discount, setDiscount] = useState()


    useEffect(() => {
        start()

    }, [])

    const start = async () => {

        var d = await GetWithToken("IndexDesign/getDiscountCompany").then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        setData(d.data)
        selectedCompanyChange("")

    }


    const selectedCompanyChange = async (data) => {

        var d = await PostWithToken("company/GetCompanyByName", { name: data }).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        var lst = [];
        for (const item of d.data) {
            lst.push({ label: item.name, value: item.id })

        }
        setSelectComapnyData(lst)
    }
    const create = async () => {

        var d = await PostWithToken("IndexDesign/createDiscountCompany", { description: description, companyId: companyId, discount: discount }).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        setDescription()
         setDiscount()
        start()
    }

    const deleteData = async (id) => {
        var d = await GetWithToken("IndexDesign/removeDiscountCompany/" + id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        start()
    }



    return (
        <div >
            <div className='row'>
                <div className='col-12'>
                    <div className='row justify-content-center' style={{
                        position: "absolute",
                        width: "100%",
                        zIndex: "99"
                    }}>

                        <div className='col-12 col-md-4'>
                            <Select placeholder="Seçiniz" onChange={(x) => { setCompanyId(x.value) }} onInputChange={(x) => { selectedCompanyChange(x) }} options={selectCompanyData} ></Select>

                        </div>
                        <div className='col-12 col-md-4'>
                            <input type={"text"} className="form-control" value={description} onChange={(x) => setDescription(x.target.value)}></input>
                        </div>
                        <div className='row col-12 justify-content-center p-0 mt-3'>
                            <div className='col-12 col-md-2 p-0 row align-items-center'>
                                <input className='form-control col-9' type={"number"} value={discount} style={{ width: "100%" }} onChange={(x) => setDiscount(x.target.value)}></input>
                                <span className='ml-1' style={{ fontSize: 18, fontWeight: "bold" }}>%</span>
                            </div>
                            <div className='col-12 col-md-2 row  justify-content-end pl-4'>
                                <button style={{ width: "100%" }} onClick={() => create()} className='btn btn-success'> Ekle </button>

                            </div>
                        </div>

                    </div>
                    <div className='row mt-5 pb-5 justify-content-center' style={{ paddingTop: 100 }}>
                        {data.length == 0 && <>
                            <div className='col-12 row justify-content-center'>
                                <div className='col-6 text-center'>
                                    <b style={{ fontSize: 20 }}>Anasayfa İndirimli Firmalar</b>

                                </div>

                            </div>
                            <div className='col-12 row justify-content-center'>
                                <div className='col-6 text-center'>
                                    <span style={{ fontSize: 20 }}>Henüz Anasayfa İndirimli Firmalar Eklenmemiş.</span>
                                </div>
                            </div>

                        </>
                        }
                        {data.map((item, key) => {

                            return <div key={ke
                            } className='col-12 col-md-3 p-3 row '>
                                <button className='bb-index-delete' onClick={() => { confirm("Kayıt Silinecek Onayliyor Musunuz") && deleteData(item.id) }}><i className='fa fa-trash'></i></button>
                                <div className='bb-index-discount-w'>{item.discount}%</div>
                                <div className='bb-index-cat col-12'>

                                    <img style={{ width: "100%" }} src={fileUploadUrl + item.logoUrl}></img>
                                    <div className='bb-index-name'> {item.name}</div>
                                </div>
                            </div>
                        })}
                    </div>
                </div>
            </div>
        </div>

    );
}

export default Discount;