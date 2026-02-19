import React from 'react';
import fileBaseString from './convertFileBase64';

function EditContainer({ item, propAdd, companyPropertyKeys, setAddedProp, setCompanyPropertyKey, setOpenEdit, addedProp }) {
    return (
        <>
            <div className='edt-cls row justify-content-center' onClick={() => { setOpenEdit(undefined) }}>x</div>

            <div className='col-12 p-0'>
                <div className='row m-0'>
                    <div className='col-6'>
                        Uzunluk
                    </div>
                    <div className='col-6'>
                        <select value={item.col} style={{ width: "100%" }} onChange={(val) => {

                            propAdd(item.id, val.target.value, "col")
                        }}>
                            <option value={4}>
                                4/4
                            </option>
                            <option value={3}>
                                4/3
                            </option>
                            <option value={2}>
                                4/2
                            </option>
                            <option value={1}>
                                4/1
                            </option>
                        </select>
                    </div>
                </div>


                <div className='col-12 m-0 p-0 mt-1'>
                    <div className='row m-0'>
                        <div className='col-6'>
                            Dolgu Renki
                        </div>
                        <div className='col-6'>
                            <input value={item.bcolor} style={{ width: "100%" }} onChange={(val) => {
                                propAdd(item.id, val.target.value, "bcolor")
                            }} type={"color"}></input>
                        </div>
                    </div>
                </div>

                <div className='col-12 m-0 p-0 mt-1'>
                    <div className='row m-0'>
                        <div className='col-6'>
                            Yükseklik
                        </div>
                        <div className='col-6'>
                            <input defaultValue={"25"} value={item.height} onChange={(val) => {
                                propAdd(item.id, val.target.value, "height")

                            }} style={{ width: "75%" }} type={"number"}></input> px
                        </div>
                    </div>
                </div>

                <div className='col-12 m-0 p-0 mt-1'>
                    <div className='row m-0'>
                        <div className='col-6'>
                            Yazı Boyutu
                        </div>
                        <div className='col-6'>
                            <input defaultValue={"25"} value={item.fontSize} onChange={(val) => {
                                propAdd(item.id, val.target.value, "fontSize")

                            }} style={{ width: "75%" }} type={"number"}></input> px
                        </div>
                    </div>
                </div>

                <div className='col-12 m-0 p-0 mt-1'>
                    <div className='row m-0'>
                        <div className='col-6'>
                            Sıra
                        </div>
                        <div className='col-6'>
                            <input  value={item.order} onChange={(val) => {
                                propAdd(item.id, val.target.value, "order")

                            }} style={{ width: "75%" }} type={"number"}></input>
                        </div>
                    </div>
                </div>


                <div className='col-12 m-0 p-0 mt-1'>
                    <div className='row m-0'>
                        <div className='col-3'>
                            Text
                        </div>
                        <div className='col-9'>
                            <textarea rows={3} value={item.text} onChange={(val) => {
                                propAdd(item.id, val.target.value, "text")
                                
                            }} style={{ width: "100%" }} type={"text"}></textarea>
                        </div>
                    </div>
                </div>

                <div className='col-12 m-0 p-0 mt-1'>
                    <div className='row m-0'>
                        <div className='col-3'>
                            Resim Ekle
                        </div>
                        <div className='col-9'>
                        <input type="file" style={{width:78}} onChange={async(v) => {   propAdd(item.id,  await fileBaseString(v.target.files[0]), "backgroundImage")}} ></input>
                 {/* <input type="file" style={{width:78}} onChange={async(v) => {   propAdd(item.id,  `url(${JSON.stringify(await fileBaseString(v.target.files[0]))})`, "image")}} ></input> */}

                           
                        </div>
                    </div>
                </div>
                
                <div className='col-12 m-0 p-0 mt-1'>
                    <div className='row m-0'>
                        <div className='col-6'>
                            Text Konum
                        </div>
                        <div className='col-6'>
                            <select value={item.textAlign} onChange={(val) => {
                                propAdd(item.id, val.target.value, "textAlign")
                            }}>
                                <option value={"right"}>
                                    Sol
                                </option>
                                <option value={"center"}>
                                    Orta
                                </option>
                                <option value={"left"}>
                                    Sağ
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className='col-12 m-0 p-0 mt-1'>
                    <div className='row m-0'>
                        <div className='col-6'>
                            Yazı Kalınlık
                        </div>
                        <div className='col-6'>
                            <select value={item.fontWeight} onChange={(val) => {
                                propAdd(item.id, val.target.value, "fontWeight")
                            }}>
                                <option value={"inherit"}>
                                    ince
                                </option>
                                <option value={"bold"}>
                                    Kalın
                                </option>
                            </select>
                        </div>
                    </div>
                </div>



            </div>
            <button type='button' className='btn btn-danger btn-sm'
                onClick={() => {
                    if (item.type == "prop") {
                        var cpp = addedProp.filter(x => { return x.id != item.id })
                        setAddedProp(cpp)
                        // var addedp = companyPropertyKeys;
                        // addedp.unshift(item.value)
                        // setCompanyPropertyKey(addedp)
                       
                    } else {
                        var cpp = addedProp.filter(x => { return x.id != item.id })
                        setAddedProp(cpp)
                    }

                }}
            ><i className='fa fa-trash'></i> Sil</button>
        </>
    );
}

export default EditContainer;