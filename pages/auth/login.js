
import React, { useEffect, useState } from 'react';
import { PostNoneToken } from '../api/crud';
import CreateUser from './createUser';
import Image from 'next/image';

const isBrowser = typeof window !== "undefined";

export default function Login() {
    const [userName, setUserName] = useState();
    const [password, setPassword] = useState();
    const [isError, setIsError] = useState();
    const [buttonLoad, setButtonLoad] = useState(false)
    const [register, setRegister] = useState(false)

    if (isBrowser) {
        localStorage.removeItem("dgbrdconftknserr")
        window.addEventListener('message', function (event) {

            setTimeout(() => {
                localStorage.setItem("dgbrdconftknserr", event.data)
                console.log(event.data)
            }, 2000);


        });


    }
    // localStorage.setItem("dgbrdconftknserr","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiVmFyc2F5aWxhbiIsImp0aSI6IjAyYzljOGRlLTMyZDUtNDBkMy05ZWRkLTljNjZmMjIxMmIxOSIsInVzZXJJZCI6IjMxY2E5ZTY2LWQ2OTctNDRhNy0zZGYzLTA4ZGJlMDk0NzFjOSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlN1cGVyQWRtaW4ifQ.VZY7TUFmf0OgT9yClUXTeJBkjNecKjo3eSBvvManvAY")

    useEffect(() => {
        qlogin()
        //  localStorage.removeItem("dgbrdconftknserr");
    }, [])


    const qlogin = async () => {
        if (isBrowser) {
            const queryString = window.location.search;

            // URLSearchParams API'sini kullanarak query string parametrelerini alma
            const urlParams = new URLSearchParams(queryString);

            // Belirli bir parametreyi alma
            const u = urlParams.get('u'); // 'John'
            const p = urlParams.get('p');
            if (u) {
                var d = await PostNoneToken("Auth/login", { userName: u, password: p }).then(x => { return x.data })
                // ?u=direncmert@detam.com.tr&p=Cemal1234*
                if (d.isError) {
                    setButtonLoad(false)
                    setIsError(true)
                    return false;
                }

                localStorage.setItem("dgbrdconftknserr", d.data.token)

                location.reload();
            }

        }
    }

    const login = async () => {
        setButtonLoad(true)

        if (userName == "" || password == "") {

            setIsError(true)
            return false;
        }
        var d = await PostNoneToken("Auth/login", { userName: userName, password: password }).then(x => { return x.data })

        if (d.isError) {
            setButtonLoad(false)
            setIsError(true)
            return false;
        }

        localStorage.setItem("dgbrdconftknserr", d.data.token)

        location.reload();
    }
    if (register) {
        return <CreateUser></CreateUser>
    }
    return <div className="page-content">
        <div className="content-wrapper">
            <div className="content d-flex justify-content-center align-items-center">


                <div className="card mb-0">
                    <div className="card-body">
                        <div className="text-center mb-3">
                            <Image
                                src={require("../../layout/global_assets/images/logoInside.png")}
                                alt="Logo Inside"
                                layout='fixed'
                                objectFit='contain'
                            />
                            <h5 className="mb-0">Kullanıcı Girişi</h5>
                            <span className="d-block text-muted">Kullanıcı adı yada mail adresinizi şifrenizle beraber giriniz</span>
                        </div>

                        <div className="form-group form-group-feedback form-group-feedback-left">
                            <input type="text" className="form-control" value={userName} onChange={(x) => { setUserName(x.target.value) }} placeholder="Kullanıcı Adı"></input>
                            <div className="form-control-feedback">
                                <i className="icon-user text-muted"></i>
                            </div>
                        </div>

                        <div className="form-group form-group-feedback form-group-feedback-left">
                            <input type="password" value={password} onChange={(x) => { setPassword(x.target.value) }} className="form-control" placeholder="Şifre"></input>
                            <div className="form-control-feedback">
                                <i className="icon-lock2 text-muted"></i>
                            </div>
                        </div>

                        <div className="form-group">
                            <button type="submit" disabled={buttonLoad} onClick={() => { login() }} className={"btn btn-primary btn-block " + (buttonLoad && " loading-button")}><span>Giriş  <i className="icon-circle-right2 ml-2"></i></span></button>

                            {isError &&
                                <div className="text-center key-alert mt-3">
                                    <div className='text-danger'>
                                        <i className="icon-alert text-danger "></i>   <b>Giriş hatalı !</b>
                                    </div>
                                </div>
                            }
                        </div>



                    </div>
                </div>

            </div>




        </div>


    </div>

}