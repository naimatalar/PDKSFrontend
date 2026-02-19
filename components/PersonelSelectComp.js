import React, { useEffect, useState } from 'react';
import ReactSelect from 'react-select';
import { PostWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';

function PersonelSelectCM(props) {
    // useEffect(()=>{},[])
    const [personels, setPersonels] = useState([])
    const [loading, setLoading] = useState(false)

    const getUser = async (name) => {
        if (name.length > 2) {
            setLoading(true)
            var d = await PostWithToken("personel/GetPersonelByNameSurname/", { key: name }).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
            var pr = d.data.map(x => { return { label: x.ad + " " + x.soyad, value: x.personelId } })
            
            setPersonels(pr)
            setLoading(false)
        }
    }
    return (
        <ReactSelect isClearable options={personels} {...props} onChange={props.onChange} isLoading={loading} loadingMessage={() => <span>Yükleniyor...</span>} onInputChange={(val) => { getUser(val) }} isSearchable>

        </ReactSelect>
    );
}

export default PersonelSelectCM;