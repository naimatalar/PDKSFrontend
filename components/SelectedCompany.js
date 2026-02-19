import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { fileUploadUrl, GetWithToken, PostWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';

function SelectedCompany(props) {
    const [data, setData] = useState([])

    const [selectCompanyData, setSelectComapnyData] = useState([])

    const [description, setDescription] = useState()
    const [companyId, setCompanyId] = useState()
    


    useEffect(() => {
        start()

    }, [])

    const start = async () => {

        var d = await GetWithToken("IndexDesign/getSelectedCompany").then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
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

        var d = await PostWithToken("IndexDesign/createSelectedCompany", { description: description, companyId: companyId }).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        setDescription()
        start()
    }

    const deleteData = async (id) => {
        var d = await GetWithToken("IndexDesign/removeSelectedCompany/" + id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
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
                        <div className='row col-12 col-md-3 justify-content-center '>
                         
                           
                                <button style={{ width: "100%" }} onClick={() => create()} className='btn btn-success'> Ekle </button>

                          
                        </div>

                    </div>
                    <div className='row mt-5 pb-5 justify-content-center'>
                        {data.length == 0 && <>
                            <div className='col-12 row justify-content-center'>
                                <div className='col-6 text-center'>
                                    <b style={{ fontSize: 20 }}>Anasayfa Öne Çıkan Firmaları</b>

                                </div>

                            </div>
                            <div className='col-12 row justify-content-center'>
                                <div className='col-6 text-center'>
                                    <span style={{ fontSize: 20 }}>Henüz Anasayfa Öne Çıkan Firmaları Eklenmemiş.</span>

                                </div>

                            </div>

                        </>
                        }
                        {data.map((item, key) => {

                            return <div key={key} className='col-12 col-md-3 p-3 row '>
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

export default SelectedCompany;