import React from 'react';
import generateGuid from './GuidGenerator';

function EditTableContainer({ item, propAdd, companyPropertyKeys, setAddedProp, setCompanyPropertyKey, setOpenEdit, addedProp }) {


    const sutunekle = () => {
        for (const iterator of item.value.list.item) {
            iterator.push({ style: {}, id: generateGuid(), field: "---", isDatafield: "" })
            var dds = addedProp.filter(x => x.id != item.id)
            dds.push(item)
            setAddedProp(dds)
        }

    }
    const sutunSil = () => {
        for (const iterator of item.value.list.item) {
            if (iterator.length < 3) {
                break
            }
            iterator.pop()
            var dds = addedProp.filter(x => x.id != item.id)
            dds.push(item)
            setAddedProp(dds)
        }

    }

    const satirEkle = () => {
        let str = [{ rowId: generateGuid() }]

        for (let index = 0; index < item.value.list.item[0].length; index++) {
            if (index != 0) {
                str.push({ style: {}, id: generateGuid(), field: "---", isDatafield: "" })

            }
        }
        var dds = addedProp.filter(x => x.id != item.id)
        item.value.list.item.push(str)
        dds.push(item)
        setAddedProp(dds)

    }
    const satirSil = () => {
        if (item.value.list.item < 2) {
            return false;
        }
        let str2 = item.value.list.item
        str2.pop();

        var dds = addedProp.filter(x => x.id != item.id)
        
        dds.push(item)
        setAddedProp(dds)

    }

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
                            Sıra
                        </div>
                        <div className='col-6'>
                            <input  value={item.order} onChange={(val) => {
                                propAdd(item.id, val.target.value, "order")

                            }} style={{ width: "75%" }} type={"number"}></input>
                        </div>
                    </div>
                </div>

                <div className='col-12 m-0 p-0 mt-3'>
                    <div className='row m-0'>
                        <div className='col-6 p-0 '>
                            <button onClick={sutunekle}>Sona Sütun Ekle</button>
                        </div>
                        <div className='col-6 p-0 mb-3'>
                            <button onClick={sutunSil}>Sondan Sütun Sil</button>

                        </div>

                    </div>
                </div>
                <div className='col-12 m-0 p-0 mt-1'>
                    <div className='row m-0'>
                        <div className='col-6 p-0 '>
                            <button onClick={satirEkle}>Sona Satır Ekle</button>
                        </div>
                        <div className='col-6 p-0 mb-3'>
                            <button onClick={satirSil}>Sondan Satır Sil</button>

                        </div>

                    </div>
                </div>



            </div>
            <button type='button' className='btn btn-danger btn-sm'
                onClick={() => {
                    if (item.type == "prop") {
                        var cpp = addedProp.filter(x => { return x.id != item.id })
                        setAddedProp(cpp)
                        var addedp = companyPropertyKeys;
                        addedp.unshift(item.value)
                        setCompanyPropertyKey(addedp)
                    } else {
                        var cpp = addedProp.filter(x => { return x.id != item.id })
                        setAddedProp(cpp)
                    }

                }}
            ><i className='fa fa-trash'></i> Sil</button>
        </>
    );
}

export default EditTableContainer;