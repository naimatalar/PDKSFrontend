import React, { useEffect, useState } from 'react';
import AlertFunction from '../../../components/alertfunction';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import PageLoading from '../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../api/crud';

export default function Index() {
    const [loading, setLoading] = useState(true)
    const [roles, setRoles] = useState([])
    const [selectedRoles, setSelectedRoles] = useState({})
    // const [permissions, setPermnissions] = useState([])
    // const [menuModules, setMenuModules] = useState([])
    const [permissionModuleList, setPermissionModuleList] = useState()


    useEffect(() => {
        start();
    }, [])

    const GetMenuModules = async (data) => {
        setLoading(true)
        var d = await GetWithToken("PermissionManager/GetRoleWithMenuModuleByRoleId/" + data?.id).then(x => { return x.data }).catch(x => { return false })


        // setPermnissions(d.data.role.userMenuModules)
        // setMenuModules(d.data.menuModules)


        var html = d.data.menuModules?.map((item, key) => {

            // nav-item-expanded nav-item-open
            if (item.parentId == null && item.isMainPage) {

                return (<ul className='tree col-12 col-lg-5 col-md-5  mr-2'><li key={key} >

                    <a href="#" onClick={() => { multiActivateToggle(data.id, item.id) }} className={d.data.role?.userMenuModules?.filter((x) => x.menuModelId == item.id)?.length > 0 && "there-data"}><i className={item.iconName}></i> <span>{item.pageName}</span></a>

                    <ul >
                        {d.data.menuModules?.filter((x) => { return x.parentId == item.id })?.map((jitem, jkey) => {
                            return <li key={jkey} >
                                <a onClick={() => { d.data.role?.userMenuModules?.filter((x) => x.menuModelId == item.id)?.length > 0 && singleActivateToggle(data.id, jitem.id) || (() => { }) }} href='#' className={d.data.role?.userMenuModules?.filter((x) => x.menuModelId == jitem.id)?.length > 0 && "there-data" || d.data.role?.userMenuModules?.filter((x) => x.menuModelId == item.id)?.length == 0 && " none-strs"}> {jitem.pageName}</a>

                                <ul >
                                    {d.data.menuModules?.filter((x) => { return x.parentId == jitem.id })?.map((titem, tkey) => {

                                        return <li key={tkey} >
                                            <a onClick={() => { (d.data.role?.userMenuModules?.filter((x) => x.menuModelId == jitem.id)?.length > 0 && singleActivateToggle(data.id, titem.id)) || (() => { }) }} href='#' className={d.data.role?.userMenuModules?.filter((x) => x.menuModelId == titem.id)?.length > 0 && "there-data " || (d.data.role?.userMenuModules?.filter((x) => x.menuModelId == jitem.id)?.length == 0) && " none-strs"}><i className='icon-pencil'></i> {titem.pageName}</a>

                                        </li>

                                    })
                                    }
                                </ul>

                            </li>

                        })
                        }
                    </ul>
                </li></ul>)
            }
            if (item.parentId == null && item.isMainPage == false) {
                return (<ul className='tree col-12 col-lg-5 col-md-5  mr-2'> <li key={key}>
                    <a href="#" className={d.data.role?.userMenuModules?.filter((x) => x.menuModelId == item.id)?.length > 0 && "there-data"} onClick={() => { singleActivateToggle(data.id, item.id) }}  >
                        <i className={item.iconName}></i>  &nbsp;{item.pageName}
                        {/* <span className="badge bg-blue-400 align-self-center ml-auto">2.2</span> */}
                    </a>
                </li></ul>
                )
            }
        })
        setSelectedRoles(data)
        setPermissionModuleList(html)
        setLoading(false)
    }
    const multiActivateToggle = async (roleId, menuId) => {
        setLoading(true)
        var d = await PostWithToken("PermissionManager/MultiMenuActivateToggle", { menuId: menuId, roleId: roleId }).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        GetMenuModules(roles.find(x => { return x.id == roleId }))
        if (d.isError) {
            alert(d.message)
        }
        setLoading(false)
    }

    const singleActivateToggle = async (roleId, menuId) => {
        setLoading(true)
        var d = await PostWithToken("PermissionManager/SingleMenuActivateToggle", { menuId: menuId, roleId: roleId }).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        if (d.isError) {
            alert(d.message)
        }
        GetMenuModules(roles.find(x => { return x.id == roleId }))

        setLoading(false)
    }
    const start = async () => {

        var d = await GetWithToken("RoleManager/GetAllRoles").then(x => { return x.data }).catch((e) => { alert(e.response.data); return false })
        if (d) {
            setRoles(d.data)
           
        }
        setLoading(false)
    }
    return (
        <>
            {
                loading && <PageLoading></PageLoading>
            }

            <Layout>
                <PageHeader title="Yeki Tanımlama" map={[
                    { url: "", name: "Yetki Tanımları" },
                    { url: "", name: "Yetki Tanımlama" }
                ]}>
                </PageHeader>
                <div className='content d-flex'>
                    <div className='sidebar sidebar-light sidebar-secondary sidebar-expand-md'>
                        <div className='sidebar-content'>
                            <div className='card'>


                                <div className='card-header bg-transparent header-elements-inline row'>
                                    <div className='row'>
                                        <h2><b>Gruplar</b></h2>
                                        Yetki Vermek istediğiniz grubu seçiniz

                                        {/* <span></span> */}
                                    </div>
                                </div>



                                <div className='card-body'>
{/* 
                                    <ol class="rounded-list">
                                        <li><a href="">List item</a></li>
                                        <li><a href="">List item</a></li>

                                        <li><a href="">List item</a></li>
                                        <li><a href="">List item</a></li>
                                    </ol> */}

                                    <ol className='rounded-list'>
                                        {roles.map((item, key) => {
                                            if (selectedRoles?.id == item.id) {
                                                return <li onClick={() => { GetMenuModules(item) }} key={key} style={{ cursor: "pointer" }} className='act' ><a style={{fontWeight:"bold"}}>{">>"} {item.name}</a></li>

                                            } else {
                                                return <li onClick={() => { GetMenuModules(item) }} key={key} style={{ cursor: "pointer" }}><a >{item.name}</a></li>

                                            }
                                        })}

                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='content-wrapper'>
                        <div className='content pl-4 pt-3'>
                            <div className='row'>
                                {permissionModuleList}
                            </div>


                        </div>

                    </div>
                </div>
            </Layout>
        </>

    )

}