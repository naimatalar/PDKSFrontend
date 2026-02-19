import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { PostNoneToken } from '../api/crud';
//    if (typeof window!=="undefined") {
//            import $ from "jquery"
//     }
export default function CreateUser() {
    useEffect(() => {
        localStorage.removeItem("dgbrdconftknserr");

    }, [])

    const [initialValues, setInitialValues] = useState({ userName: "", email: "", password: "", password2: "", isActive: true, firstName: "", lastName: "" })
    // var l = $('.my-button').ladda();
    const [value, setValue] = useState();
    const keyRegister = async () => {
        var data = await GetAntegraSystemNoneToken("service/keyreg/" + value).then(x => { return x.data })
    }

    return <div className="page-content">
        <div className="content-wrapper">
            <div className="content d-flex justify-content-center align-items-center">


                <div className="card mb-0" style={{ width: 410 }}>
                    <div className="card-body">
                        <div className="text-center mb-3">
                            <i className="icon-user icon-2x text-slate-300 border-slate-300 border-3 rounded-round p-3 mb-3 mt-1"></i>
                            <h5 className="mb-0">Kullanıcı Kayıt</h5>
                            <span className="d-block text-muted">Sistem aktivasyonu başarılı. Giriş yapabilmek için kullanıcı oluşturunuz.</span>
                        </div>
                        <h1>Giriş Bilgileri</h1>
                        <Formik
                            initialValues={initialValues}
                            validate={values => {
                                const errors = {};

                                if (!values.firstName) {
                                    errors.firstName = 'Zorunlu Alan';
                                }
                                if (!values.lastName) {
                                    errors.lastName = 'Zorunlu Alan';
                                }
                                if (!values.userName) {
                                    errors.userName = 'Zorunlu Alan';
                                }
                                if (!values.email) {
                                    errors.email = 'Zorunlu Alan';
                                }
                                if (!values.password) {
                                    errors.password = 'Zorunlu Alan';


                                }
                                if (!values.password2) {
                                    errors.password = 'Zorunlu Alan';


                                }
                                var reg = new RegExp(/^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[#?!@$%^&*\\-_]).{8,}$/g)
                                var passReg = reg.test(values.password)

                                if (!passReg) {
                                    errors.password = <div className='text-center password-tooltip mb-2'><b>Şifre içeri;</b>
                                        <div style={{ fontStyle: "italic" }}>
                                            - Büyük/Küçük harf<br></br>
                                            - Özel Karakter (! @ + * /)<br></br>
                                            - Minimum 8 karakter
                                            <br></br>
                                            <b>Şeklinde olmalıdır. Örnek (Dft956t*)</b>
                                        </div>
                                    </div>;



                                }

                                if (values.password2 != "" && values.password != values.password2) {
                                    errors.password = 'Şifre aynı değil';

                                }
         
                                return errors;
                            }}
                            onSubmit={(values, { setSubmitting }) => {

                                setTimeout(async () => {

                                    var data = await PostNoneToken("auth/SignUp", values)
                                    location.reload()
                                    setSubmitting(false);
                                }, 400);
                            
                            }}
                        >
                            {({ isSubmitting, isValidating }) => (
                                <Form autocomplete="off" className='row'>
                                    <div className='col-6 mb-3'>
                                        <ErrorMessage name="firstName" component="div" className='text-danger' />
                                        <Field type="firstName" autocomplete="off" placeholder="Ad" name="firstName" className="form-control" />
                                    </div>
                                    <div className='col-6 mb-3'>
                                        <ErrorMessage name="lastName" component="div" className='text-danger' />
                                        <Field type="lastName" autocomplete="off" placeholder="Soyad" name="lastName" className="form-control" />
                                    </div>

                                    <div className='col-12 mb-3'>
                                        <ErrorMessage name="email" component="div" className='text-danger' />
                                        <Field type="email" autocomplete="off" placeholder="Email Aderesi" name="email" className="form-control" />
                                    </div>

                                    <div className='col-12 mb-3'>
                                        <ErrorMessage name="userName" component="div" className='text-danger' />
                                        <Field type="userName" autocomplete="off" placeholder="Kullanıcı Adı" name="userName" className="form-control" />
                                    </div>

                                    <div className='col-12'>
                                        <ErrorMessage name="password" component="div" className='text-danger' />

                                    </div>
                                    <div className='col-6 mb-3'>
                                        <Field type="password" autocomplete="off" placeholder="Şifre" name="password" className="form-control" />

                                    </div>
                                    <div className='col-6 mb-3'>
                                        <Field type="password" autocomplete="off" placeholder="Şifer Tekrar" name="password2" className="form-control" />
                                    </div>





                                    <button className={"btn btn-primary btn-block loading-button" + (isSubmitting && " loading-button")}><span>Devam Et <i className="icon-circle-right2 ml-2"></i></span></button>
                                </Form>
                            )}
                        </Formik>

                        {/* <div className="form-control-feedback">
                                <i className="icon-key text-muted"></i>
                            </div> */}
                    </div>



                    {/* <div className="form-group">
                            <button onClick={() => { keyRegister() }} className="btn btn-primary btn-block">Devam Et <i className="icon-circle-right2 ml-2"></i></button>
                        </div> */}

                    <div className="text-center">

                    </div>
                </div>
            </div>



        </div>




    </div>




}