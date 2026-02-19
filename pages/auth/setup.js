import React, { useEffect, useState } from 'react';
import InputMask from 'react-input-mask';
import { GetAntegraSystemNoneToken, PostNoneToken } from '../api/crud';
import CreateUser from './createUser';

export default function Setup() {
    useEffect(() => {
        localStorage.removeItem("usrtknbalotetknenter");

    }, [])
    const [value, setValue] = useState("");
    const [isError, setIsError] = useState(false);
    const [redirectCreateUser, setRedirectCreateUser] = useState(false);
    const [loadingbutton, setLoadingButton] = useState(false)
    const keyRegister = async () => {


        setIsError(false);
        
        var reg = new RegExp(/^(((?=.*}$){)|((?!.*}$)))((?!.*-.*)|(?=(.*[-].*){4}))[0-9a-fA-F]{8}[-]?([0-9a-fA-F]{4}[-]?){3}[0-9a-fA-F]{12}?[}]?$/gm)
        var isGuid = reg.test(value)
        if (isGuid == false) {
            setIsError(true);
            return false
        }
        setLoadingButton(true)
        if (value != "") {

            var data = await GetAntegraSystemNoneToken("service/keyreg/" + value).then(x => { return x.data }).catch(() => { return false })

            if (data && data.isError == false) {

                var pst = await PostNoneToken("Auth/RegKey", data.data)
                if (pst.data) {
                    setRedirectCreateUser(true)
                }
            }
            // if (data && data.isError) {

            // }  
            setIsError(true)
        }
        setLoadingButton(false)
    }
    if (redirectCreateUser) {
        return <CreateUser></CreateUser>
    } else {

        return <div className="page-content">
            <div className="content-wrapper">
                <div className="content d-flex justify-content-center align-items-center">
                    <div className="card mb-0" style={{ width: 410 }}>
                        <div className="card-body">
                            <div className="text-center mb-3">
                                <i className="icon-lock icon-2x text-slate-300 border-slate-300 border-3 rounded-round p-3 mb-3 mt-1"></i>
                                <h5 className="mb-0">Ürün anahtarı</h5>
                                <span className="d-block text-muted">Sistemi aktivasyonu için ürün anahtarı giriniz.</span>
                            </div>

                            <div className="form-group form-group-feedback form-group-feedback-left">



                                <InputMask required style={{ fontSize: 15 }} className="form-control" onChange={(x) => { setValue(x.target.value) }} value={value} mask={"********-****-****-****-************"}>
                                </InputMask>
                                {/* <input type="text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"></input> */}
                                <div className="form-control-feedback">
                                    <i className="icon-key text-muted"></i>
                                </div>
                            </div>



                            <div className="form-group">
                                <button onClick={() => { keyRegister(); return false; }} disabled={loadingbutton} className={"btn btn-primary btn-block " + (loadingbutton && " loading-button")}><span>Devam Et <i className="icon-circle-right2 ml-2"></i></span> </button>
                            </div>

                            {isError &&
                                <div className="text-center key-alert">
                                    <div className='text-danger'>
                                        <i className="icon-alert text-danger "></i>   <b>Geçeriz anahtar</b>
                                    </div>
                                </div>
                            }

                        </div>
                    </div>



                </div>




            </div>


        </div>
    }
}