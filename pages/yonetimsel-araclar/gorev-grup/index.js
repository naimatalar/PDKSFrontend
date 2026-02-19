import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import AlertFunction from '../../../components/alertfunction';
import DataTable from '../../../components/datatable';
import Modal from '../../../components/modal';
import PermissionCheck from '../../../components/permissioncheck';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import PageLoading from '../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../api/crud';

export default function Index() {
    const [modalOpen, setModelOpen] = useState(false)
    const [initialData, setInitialData] = useState(null)
    const [hiddenPassordField, setHiddenPassordField] = useState(false)
    const [refreshDatatable, setRefreshDatatable] = useState(null)

    const [loading, setLoading] = useState(true)
  
    useEffect(() => {

        start();
    }, [])

    const start = async () => {


      

    
        setLoading(false)
        // var roles = await GetWithToken("RoleManager/GetAllRoles").then(x => { return x.data }).catch(x => { return false })
        // var roleSelectList = []

        // setRoles(roleSelectList)

    }
    const closeModal = () => {
        setModelOpen(false)
    }
    const submit = async (val) => {

        if (val.values.id == undefined) {
            var data = await PostWithToken("RoleManager/CreateRole", val.values).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor."); return false })


        } else {
            var d = await PostWithToken("RoleManager/EditRole", val.values).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
            if (d.isError) {
                alert(d.message)
            }
        }
        setRefreshDatatable(new Date())
    }
    const deleteData = async (data) => {
        var d = await GetWithToken("RoleManager/delete/" + data.id).then(x => { return x.data }).catch((e) => {console.log(e); AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
        if (d.isError) {
            alert(d.message)
        }
        setRefreshDatatable(new Date())


    }


    const editData = async (data) => {
        setHiddenPassordField(true)
        var d = await GetWithToken("RoleManager/GetById/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
        setInitialData(d.data)
        setModelOpen(true)
    }

    return (
        <>{
            loading && <PageLoading></PageLoading>
        }

            {modalOpen &&
                <Modal modalSize="small" modalTitle={initialData == null ? "Grup Ekle" : "Grup Düzenle"} closeModal={closeModal} items={
                    [
                        {
                            props: {
                                name: "id",
                                type: "hidden",
                            },
                        },
                        {
                            props: {
                                name: "name",
                                type: "text",
                                className: "form-control",
                                label: "Rol Adı",
                                required: "required"
                            },
                            rowCssClass: "col-12 col-md-6 col-lg-6"
                        },


                    ]
                }
                    initialValues={initialData == null ? {
                        id: null,
                        name: "",


                    } : initialData}
                    submit={submit}
                ></Modal>
            }

            <Layout>
                <PageHeader title="Grup Oluştur" map={[
                    { url: "", name: "Grup Yönetimi" },
                    { url: "", name: "Grup Oluştur" }
                ]}>

                </PageHeader>



                <div className='content pr-3 pl-3'>
                    <div className='card'>
                        <DataTable Refresh={refreshDatatable} DataUrl={"RoleManager/GetAllRoles"} Headers={[
                            ["name", "Grup Adı",],
                            ["userCount", "Kullanıcı Sayısı"],
                            // ["email", "E-posta"],
                            // ["userName", "Kullanıcı Adı"],

                        ]} Title={"Grup Listesi"}
                            Description={"Yetki rol grupları kullanıcı yetki grubu tanımlamanızı sağlar "}
                            HeaderButton={{ text: "Grup Oluştur", action: () => { setHiddenPassordField(false); setModelOpen(true); setInitialData(null) } }}
                            EditButton={editData}
                            DeleteButton={deleteData}
                        ></DataTable>
                    </div>
                </div>
            </Layout>
        </>
    )

}