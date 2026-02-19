import React, { useEffect, useState } from 'react';
import AlertFunction from '../../../components/alertfunction';
import DataTable from '../../../components/datatable';
import Modal from '../../../components/modal';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import PageLoading from '../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../api/crud';


export default function Index() {
    const [modalOpen, setModelOpen] = useState(false)
    const [initialData, setInitialData] = useState({})
    const [hiddenPassordField, setHiddenPassordField] = useState(false)
    const [refresh, setRefresh] = useState(null)
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshDataTable, setRefreshDatatable] = useState(null)


    useEffect(() => {

        start();
    }, [])
    const start = async () => {
        var roles = await GetWithToken("UserManager/GetRoles").then(x => { return x.data }).catch(x => { return false })
        var roleSelectList = []
        for (const iterator of roles.data) {
            roleSelectList.push({ id: iterator.name, text: iterator.name })
        }
        setRoles(roleSelectList)


        setLoading(false)
    }
    const closeModal = () => {
        setModelOpen(false)
    }
    const submit = async (val) => {

        if (val.values.id == undefined) {
            await PostWithToken("UserManager/CreateUser", val.values).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })

        } else {
            var d = await PostWithToken("UserManager/EditUser", val.values).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
            if (d.isError) {
                alert(d.message)
            }
        }
        setRefreshDatatable(new Date())
    }
    const deleteData = async (data) => {
        var d = await GetWithToken("UserManager/delete/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
        if (d.isError) {
            alert(d.message)
        }
        setRefreshDatatable(new Date())

    }
    const createPassword = () => {

        var idata = initialData;
        idata.password = "M" + Math.random().toString(36).slice(-5) + "2!"
        setInitialData(idata)
        setRefresh(new Date())
    }
    const resetPassword = () => {

        var idata = initialData;
        idata.password = ""
        setInitialData(idata)
        setRefresh(new Date())

    }


    const editData = async (data) => {
        setHiddenPassordField(true)
        var d = await GetWithToken("UserManager/GetUserById/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        d.data.roles = d.data.roles.map((x) => { return x.text })



        setInitialData(d.data)


        setRefresh(new Date())
        setModelOpen(true)
    }

    return (
        <>{
            loading && <PageLoading></PageLoading>
        }




            {modalOpen &&
                <Modal modalSize="small" modalTitle={initialData == null ? "Kullanıcı Ekle" : "Kullanıcı Düzenle"} closeModal={closeModal} items={
                    [
                        {
                            props: {
                                name: "id",
                                type: "hidden",
                            },

                        },

                        {
                            props: {
                                name: "firstName",
                                type: "text",
                                className: "form-control",
                                label: "Ad",
                                required: "required"
                            },
                            rowCssClass: "col-12 col-md-6 col-lg-6"
                        },
                        {
                            props: {
                                name: "lastname",
                                type: "text",
                                className: "form-control",
                                label: "Soyad",
                                required: "required"
                            },
                            rowCssClass: "col-12 col-md-6 col-lg-6"
                        },
                        {
                            props: {
                                name: "userName",
                                type: "text",
                                className: "form-control",
                                label: "Kullanıcı Adı",
                                required: "required"
                            },
                            rowCssClass: "col-12 col-md-6 col-lg-6"
                        },
                        {
                            props: {
                                name: "email",
                                type: "email",
                                className: "form-control",
                                label: "E-posta",
                                required: "required"
                            },
                            rowCssClass: "col-12 col-md-6 col-lg-6"
                        },
                        {
                            props: {
                                name: "roles",
                                type: "listselect",
                                className: "form-control",
                                label: "Grup",
                                required: "required"
                            },
                            data: roles,
                            rowCssClass: "col-12 col-md-6 col-lg-6"
                        },

                        {
                            props: {
                                name: "password",
                                type: "text",
                                className: "form-control",
                                label: (hiddenPassordField && (<><b>Şifre İşlemleri</b><br></br> <span style={{ fontWeight: "normal" }}>Şifre değiştirmek istemiyorsanız boş bırakın</span><br></br><div className='btn btn-sm btn-outline-success mt-2 mb-2' onClick={() => createPassword()}>Şifre Oluştur</div><div className='btn btn-sm btn-outline-danger ml-3 mt-2 mb-2' onClick={() => resetPassword()}>Temizle</div></>) || <span>Şifre</span>),
                                required: !hiddenPassordField,
                                disabled: "disabled",

                                style: { fontWeight: "bold", color: "black", borderColor: "black" },

                            },
                            rowCssClass: ("col-12 col-md-6 col-lg-6 ") + (hiddenPassordField && "password-panel")
                        },

                    ]
                }
                    initialValues={initialData == null ? {
                        id: null,
                        firstName: "",
                        lastname: "",
                        userName: "",
                        email: "",
                        roles: [],
                        password: "M" + Math.random().toString(36).slice(-5) + "2!",



                    } : initialData}
                    submit={submit}
                ></Modal>
            }

            <Layout>
                <PageHeader title="Kullanıcı Oluştur" map={[
                    { url: "", name: "Yönetimsel Araçlar" },
                    { url: "", name: "Kullanıcı Oluştur" }
                ]}>

                </PageHeader>



                <div className='content pr-3 pl-3'>
                    <div className='card'>

                    

                        <DataTable Refresh={refreshDataTable} DataUrl={"UserManager/GetAllUsers"} Headers={[
                            ["firstName", "Adı",],
                            ["lastname", "Soyad"],
                            ["email", "E-posta"],
                            ["userName", "Kullanıcı Adı"],

                        ]} Title={"Kullanıcı Listesi"}
                            Description={"Listedeki kullanıcıları düzenleme işlemleri yapabilirsiniz. "}
                            HeaderButton={{ text: "Kullanıcı Oluştur", action: () => { setHiddenPassordField(false); setModelOpen(true); setInitialData(null) } }}
                            EditButton={editData}
                            DeleteButton={deleteData}
                        ></DataTable>
                    </div>
                </div>
            </Layout>
        </>
    )

}