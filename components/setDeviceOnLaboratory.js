import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { GetWithToken, PostWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';


function SetDeviceOnLanoratory({ laboratory }) {
    useEffect(() => {
        start()
    }, [])
    const [devices, setDevices] = useState([]);
    const [deviceOption, setDeviceOption] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState([]);

    const start = async () => {
        debugger
        var data = await GetWithToken("Device/GetAllDevicesByLaboratory/" + laboratory.id)
            .then(x => { return x.data }).catch(x => { return false })
        setDevices(data.data);

    }
    const setOrRemoveDeviceOnLaboratory = async (uId, action) => {
        var d = await PostWithToken("Device/SetOrRemoveDeviceOnLaboratory/",
            { laboratoryId: laboratory.id, deviceId: uId, action: action })
            .then(x => { return x.data }).catch(x => { return false })
        if (d.isError) {
            AlertFunction("Atama Yapılmadı", d.message);
            return null;
        }
        start();
    }

    const GetDeviceByLaboratoryDeviceName = async (val) => {

        if (val.length > 2) {
            var d = await PostWithToken("Device/GetDeviceByLaboratoryDeviceName", {
                query: val
            })
                .then(x => { return x.data }).catch(x => { return false })

            let list = [];
            for (const item of d.data) {
                list.push({
                    label: item.name+","+item.brand, value: item.id
                })
            }
            console.log(list)
            setDeviceOption(list)
        }

    }

    return (
        <div className='row col-12'>
            <div className='col-12 tbls'>
                <div className='row justify-content-center mb-2'>
                    <div className='col-6'>
                        <Select options={deviceOption} isClearable noOptionsMessage={(x) => { x.inputValue = "Minimum 3 karakter girerek arayınız" }} onChange={(x) => { x&&setSelectedDevice(x.value) }} onInputChange={(x) => { GetDeviceByLaboratoryDeviceName(x) }}></Select>

                    </div>
                    <div className='col-4'>
                        <button onClick={() => { setOrRemoveDeviceOnLaboratory(selectedDevice, 1) }} className='btn btn-success' ><i className='fa fa-microchip'><b style={{fontWeight:"bolder"}}>+</b></i> Cihaz Ekle</button>

                    </div>
                </div>
                <div className='row col-12 mb-3 mt-3' style={{fontSize:14}}>
                   <b>{laboratory?.name} </b>  <span> Adlı Laboratuvar`a Atanmış Kullanıcı Listesi.</span> 
                </div>
                {devices.length==0&& <i><b style={{color:"red"}}>Tanımlanmış Cihaz Bulunmuyor</b></i>}
                {devices.length>0&&
                 <table className='table table-bordered'>
                    <thead>
                        <tr>
                            <th>Cihaz Adı</th>
                            <th>Marka</th>
                            <th>Model</th>
                             <th>Anvarter/Seri Numarası</th>
                            <th style={{ width: 80 }}>#</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            devices.map((item, key) => {
                                return <tr key={key}>
                                    <td>
                                        {item.name}
                                    </td>
                                    <td>
                                        {item.brand}
                                    </td>
                                     <td>
                                        {item.model}
                                    </td>
                                      <td>
                                        {item.code}
                                    </td>
                                    <td>
                                        <button style={{ padding: "2px 5px 2px 5px", fontSize: 10 }} onClick={() => {
                                            setOrRemoveDeviceOnLaboratory(item.id, 0)
                                        }} className='btn btn-danger btn-sm' >
                                            <i className='fa fa-times-circle' style={{fontSize:11}}></i> Kaldır</button>
                                    </td>
                                </tr>
                            })
                        }
                    </tbody>
                </table>
                }
               
            </div>
        </div>
    )
}

export default SetDeviceOnLanoratory;