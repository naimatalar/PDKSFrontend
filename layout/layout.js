import { Dropdown, DropdownItem, DropdownMenu, Modal, ModalBody, ModalHeader } from 'reactstrap';
import Image from 'next/image';
import React, { useEffect, useState, useRef, } from 'react';
import { DropdownToggle } from 'reactstrap';
import { apiConstant, GetWithToken } from '../pages/api/crud';
import App from "../layout/assets/js/app"
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import PermissionCheck from '../components/permissioncheck';
import { addOrUpdateStorage, getLaboratoryFromStorage, storageMercahtKey } from '../components/localStorage';
import PageLoading from './pageLoading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsd } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import DebisButton from '../components/button';
import TextBox from '../components/TextBox';
import DatePicker from '../components/DatePicker';
import * as signalR from '@microsoft/signalr';
import OnlineUsersSidebar from '../components/sideOnlineUser';
import ChatWindow from '../components/ChatWindow';
import { SignalRContext } from '../components/SignalRContext';
import { useContext } from 'react';
import { ToastContainer } from 'react-toastify';
// import signalR from '@microsoft/signalr';




function Layout({ children, permissionControl = true, loadingContent = false, pageName,isLayoutReady=()=>{} }) {
    const [toggleButtons, setToggleButtons] = useState(false)


    const [dropdownMerchant, setDropdownMerchant] = useState(false)
    const toggleMerchant = () => setDropdownMerchant(!dropdownMerchant)

    const [dropdownMaster, setDropdownMaster] = useState(false)
    const [userData, setUserData] = useState({})
    const [menuList, setMenuList] = useState()
    const [menu, setMenu] = useState("")
    const [loadJquery, setLoadJquery] = useState(false)
    const pagePath = useRouter().asPath.split("/")
    const toggleMaster = () => setDropdownMaster(!dropdownMaster)
    const [permission, setPermission] = useState(null)
    const [isPageOk, setIsPageOk] = useState(false)
    const [show, setshow] = useState(false)
    const overlay = document.querySelector('overlay-backdown');
    const [connection, setConnection] = useState(null);
    const [messageUsers, setMessageUsers] = useState([]);
    const [unreadMessages, setUnreadMessage] = useState([]);
    const [messageUser, setMessageUser] = useState([]);
    const [unreadWarning, setUnreadWarning] = useState([]);
    const [blog, setBlog] = useState({});

    // useEffect(() => {
    //     const addIconsToTableCells = () => {
    //       const targetCells = document.querySelectorAll('.datatable-with-icon td');
      
    //       targetCells.forEach((cell) => {
    //         if (cell.classList.contains('has-icon')) return;
      
    //         const icon = document.createElement('i');
    //         icon.className = 'fa fa-exclamation-circle custom-icon'; // Ekstra sınıf ekledik
    //         icon.style.position = 'absolute';
    //         icon.style.right = '8px';
    //         icon.style.top = '20px';
    //         icon.style.color = 'gray';
    //         icon.style.transition = 'opacity 0.3s ease'; // Yumuşak geçiş efekti
      
    //         cell.style.position = 'relative'; // Hücreyi relative yapıyoruz
    //         cell.appendChild(icon);
    //         cell.classList.add('has-icon');
    //       });
    //     };
      
    //     addIconsToTableCells();
      
    //     const observer = new MutationObserver(addIconsToTableCells);
    //     observer.observe(document.body, { childList: true, subtree: true });
      
    //     return () => observer.disconnect();
    //   }, []);
      


    const hubConnection = useContext(SignalRContext);

    useEffect(() => {



        if (hubConnection) {

            connect();


        }




        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, [hubConnection]);

    const connect = async () => {




        hubConnection.start()
            .then(() => console.log('Connection started!'))
            .catch(err => console.log('Error while establishing connection', err));


        setConnection(hubConnection);
        hubConnection.on('GetOnlineUser', (userJson) => {

            // Gelen veriyi deserialize et
            var d = JSON.parse(userJson)
            const user = d.User;
            setMessageUsers(user);

        });

        hubConnection.on('getMessage', (message) => {
            var d = JSON.parse(message)
            const msg = d.message;
            setUnreadMessage(msg)
        });
    };


    useEffect(() => {
        start()
    }, [])

    const start = async () => {


        if (permissionControl == false) {
            setPermission(false)
        } else {
            var permission = await PermissionCheck(pageName).then(x => { return x })
            setPermission(permission)
        }
        var data = await GetWithToken("Layout/GetLayoutData").then(x => { return x.data })


        setUserData(data.data)
        setMenuList(data.data.menuList)
        setUnreadWarning(data.data.unreadWarning)
        setBlog(data.data.blog)


        let urls = ""
        const renderMenuItems = (menuList, parentUrl = "", parentId = null) => {
            return menuList?.filter(item => item.parentId === parentId).map((item, key) => {
                const subItems = menuList.filter(subItem => subItem.parentId === item.id);
                const currentUrl = parentUrl ? `${parentUrl}/${item.pageUrl}` : item.pageUrl; // URL oluşturuluyor

                return (
                    <li key={key} className={"nav-item " + (subItems.length > 0 ? "nav-item-submenu" : "") + (pagePath.includes(currentUrl.split("/")[currentUrl.split("/").length - 1]) ? " nav-item-expanded nav-item-open" : "")}>
                        {subItems.length > 0 ? (
                            <>

                                <a href={currentUrl} className={"nav-link " + (pagePath.includes(currentUrl) ? "active" : "")} style={{ borderBottom: "1px solid #cccccc" }}>
                                    {currentUrl.split("/").length > 1 && <div className='wwd'></div>}
                                    <i className="fa fa-caret-right" style={{ marginRight: 5, fontSize: 13 }}></i>
                                    <span style={{ fontSize: 11 }}>{item.pageName}</span>
                                </a>
                                <ul className="nav nav-group-sub" data-submenu-title="Sub-items">
                                    {renderMenuItems(menuList, currentUrl, item.id)} {/* Alt menüler için recursive çağrı */}
                                </ul>
                            </>
                        ) : (
                            <Link href={`/${currentUrl}`}>
                                <a className={"nav-link " + (pagePath.includes(currentUrl) ? "active" : "")}>
                                    {currentUrl.split("/").length > 1 && <div className='wwd'></div>}
                                    <i style={{ marginRight: 5, fontSize: 13 }} className='fa fa-caret-right'></i>
                                    <span className='pl-2' style={{ fontSize: 11 }}> {item.pageName}</span>
                                </a>
                            </Link>
                        )}
                    </li>
                );
            });
        };


        var html = data.data.menuList?.map((item, key) => {

            // nav-item-expanded nav-item-open
            if (item.parentId == null && item.isMainPage) {
                return (
                    <li key={key} style={{ borderBottom: 0 }} className={"nav-item nav-item-submenu " + (pagePath.includes(item.pageUrl) && "nav-item-expanded nav-item-open")}>
                        <a href="#" className="nav-link" style={{ borderBottom: "1px solid #cccccc" }}>
                            <i className="fa fa-caret-right" style={{ marginRight: 5, fontSize: 13 }}></i>
                            <span style={{ fontSize: 11 }}>{item.pageName}</span>
                        </a>

                        <ul className="nav nav-group-sub" data-submenu-title="Layouts">
                            {data.data.menuList?.filter((x) => x.parentId == item.id)?.map((jitem, jkey) => {
                                const subItems = data.data.menuList?.filter((subItem) => subItem.parentId == jitem.id);

                                return (
                                    <li className="nav-item ddi" key={jkey}>
                                        {subItems.length > 0 ? (
                                            <>
                                                <a href="#" className={"nav-link " + (pagePath.includes(jitem.pageUrl) && "active")}>
                                                    <div className='wwd'></div>
                                                    <i style={{ marginRight: 5, fontSize: 13 }} className='fa fa-caret-right'></i>
                                                    <span className='pl-2' style={{ fontSize: 11 }}> {jitem.pageName}</span>
                                                </a>

                                                {/* Sub-items, açılır menü */}
                                                <ul className="nav nav-group-sub sub-items" data-submenu-title="Sub-items">

                                                    {data.data.menuList?.filter((si) => si.parentId == subItems.id).map((subJItem, subJKey) => (
                                                        <li className="nav-item ddi" key={subJKey}>
                                                            {subJItem.length > 0 ? (
                                                                <>
                                                                    <a href="#" className={"nav-link " + (pagePath.includes(jitem.pageUrl) && "active")}>
                                                                        <div className='wwd'></div>
                                                                        <i style={{ marginRight: 5, fontSize: 13 }} className='fa fa-caret-right'></i>
                                                                        <span className='pl-2' style={{ fontSize: 11 }}> {subJItem.pageName}</span>
                                                                    </a>

                                                                    {/* Sub-items, açılır menü */}
                                                                    <ul className="nav nav-group-sub sub-items" data-submenu-title="Sub-items">
                                                                        {subJItem.map((subJItem2, subJKey) => (
                                                                            <li className="nav-item ddi" key={subJKey}>


                                                                                <Link href={"/" + item.pageUrl + "/" + jitem.pageUrl + "/" + subJItem2.pageUrl}>
                                                                                    <a className={"nav-link " + (pagePath.includes(subJItem2.pageUrl) && "active")}>
                                                                                        <i style={{ marginLeft: 0, fontSize: 13 }} className='fa fa-caret-right'></i>
                                                                                        <span className='pl-2' style={{ fontSize: 11 }}> {subJItem2.pageName}</span>
                                                                                    </a>
                                                                                </Link>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </>
                                                            ) : (
                                                                <Link href={"/" + item.pageUrl + "/" + jitem.pageUrl}>
                                                                    <a className={"nav-link " + (pagePath.includes(jitem.pageUrl) && "active")}>
                                                                        <div className='wwd'></div>
                                                                        <i style={{ marginRight: 5, fontSize: 13 }} className='fa fa-caret-right'></i>
                                                                        <span className='pl-2' style={{ fontSize: 11 }}> {jitem.pageName}</span>
                                                                    </a>
                                                                </Link>
                                                            )}


                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        ) : (
                                            <Link href={"/" + item.pageUrl + "/" + jitem.pageUrl}>
                                                <a className={"nav-link " + (pagePath.includes(jitem.pageUrl) && "active")}>
                                                    <div className='wwd'></div>
                                                    <i style={{ marginRight: 5, fontSize: 13 }} className='fa fa-caret-right'></i>
                                                    <span className='pl-2' style={{ fontSize: 11 }}> {jitem.pageName}</span>
                                                </a>
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </li>
                );
            }


            if (item.parentId == null && item.isMainPage == false) {
                return (
                    <li className="nav-item " key={key}>
                        <Link href={"/" + item.pageUrl}>
                            <a className="nav-link">
                                <i style={{ marginRight: 5, fontSize: 13 }} className="fa fa-caret-right"></i>
                                <span style={{ fontSize: 11 }}>{item.pageName}
                                    {item.pageUrl == "dashboard"}
                                </span>
                                {/* <span className="badge bg-blue-400 align-self-center ml-auto">2.2</span> */}
                            </a>
                        </Link>
                    </li>
                )
            }
        }
        )

        html = renderMenuItems(data.data.menuList)
        setMenu(html)
        setTimeout(() => {
            if (loadJquery == false) {
                App.initBeforeLoad();
                App.initCore();
                setLoadJquery(true)
            }
        }, 100);

        setIsPageOk(true)
        isLayoutReady(true)

    }


    if (permission == null) {
        return <></>
    }
    if (!isPageOk) {
        return <PageLoading></PageLoading>
    }

    return (

        <>
       <ToastContainer />

<ToastContainer />
            <div className="navbar navbar-expand-md navbar-dark">
                <div className="navbar-brand">
                    <a href="index.html" style={{ width: "100%" }} className="d-inline-block">

                        <Image objectFit='contain' layout='fixed' src={require("../layout/global_assets/images/logoInside.png")} ></Image>

                    </a>

                </div>


                <div className="d-md-none">
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-mobile">
                        <i className="icon-tree5"></i>
                    </button>
                    <button className="navbar-toggler sidebar-mobile-main-toggle" type="button">
                        <i className="icon-paragraph-justify3"></i>
                    </button>

                </div>

                <div className="collapse navbar-collapse" id="navbar-mobile">
                    <ul className="navbar-nav">

                    </ul>

                    <span className="badge ml-md-3 mr-md-auto">&nbsp;</span>

                    {/* <span className='header-destek' style={{color:"black"}}> <i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Destek </span> */}

                    <Dropdown isOpen={toggleButtons == "warning"} className='mr-2' toggle={() => setToggleButtons(false)}>
                        {/* <DropdownToggle >
                            <i className="icon-exclamation"></i>
                            <span className="d-md-none ml-2">Uyarılar</span>
                            <span className="badge badge-pill bg-warning-400 ml-auto ml-md-0" style={{ top: -8 }}>2</span>
                        </DropdownToggle> */}
                        <DropdownMenu>
                            <div className="dropdown-content-body dropdown-scrollable">
                                <ul className="media-list">
                                    <li className="media">
                                        <div className="mr-3 position-relative">
                                            {/* <Image src={require("../layout/global_assets/images/placeholders/placeholder.jpg" )}width={36} height={36} className="rounded-circle" alt=""></Image> */}
                                        </div>

                                        <div className="media-body">
                                            <div className="media-title">
                                                <a href="#">
                                                    <span className="font-weight-semibold">James Alexander</span>
                                                    <span className="text-muted float-right font-size-sm">04:58</span>
                                                </a>
                                            </div>

                                            <span className="text-muted">who knows, maybe that would be the best thing for me...</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </DropdownMenu>
                    </Dropdown>

                    <Dropdown isOpen={dropdownMaster} toggle={toggleMaster}>
                        <DropdownToggle caret className='d-flex align-items-center'>
                            <Image
                                height={34}
                                width={34}
                                style={{ objectFit: 'contain' }}
                                src={require("../layout/global_assets/images/placeholders/Sample_User_Icon.png")}
                                className="rounded-circle mr-2"
                                alt="Profile"
                            />
                            <span>{userData?.firstName + " " + userData?.lastname}</span>

                        </DropdownToggle>
                        <DropdownMenu>
                            {/* <div>
                                <a href="#" className="dropdown-item">
                                    <i className="icon-home"></i>Ana Sayfa
                                </a>
                            </div>
                            <div>
                                <a href="../user-pages/bilgilerim" className="dropdown-item">
                                    <i className="icon-user"></i> Bilgilerim
                                </a>
                            </div>
                            <div>
                                <a href="../user-pages/Bildirimlerim" className="dropdown-item">
                                    <i className="icon-file-text"></i> Bildirimlerim
                                </a>
                            </div>
                            <div>
                                <a href="../user-pages/izinlerim" className="dropdown-item">
                                    <i className="icon-bike"></i> İzinlerim
                                </a>
                            </div>
                            <div>
                                <a href="../user-pages/notlarim" className="dropdown-item">
                                    <FontAwesomeIcon style={{ marginRight: 25 }} icon={faEdit} /> Notlarım
                                </a>
                            </div>
                            <div>
                                <a href="../user-pages/planlarim" className="dropdown-item">
                                    <i className="icon-table"></i> Planlarım
                                </a>
                            </div>

                            <div>
                                <a href="../user-pages/harcamalarim" className="dropdown-item">
                                    <FontAwesomeIcon style={{ marginRight: 25 }} icon={faUsd} /> Harcamalarım
                                </a>
                            </div>
                            <div>
                                <a href="../user-pages/maas-avans" className="dropdown-item">
                                    <FontAwesomeIcon style={{ marginRight: 25 }} icon={faUsd} />
                                    Maaş Avans
                                </a>
                            </div>
                            <div>
                                <a href="../user-pages/sifre" className="dropdown-item">
                                    <i className="icon-cog5"></i> Şifre Değiştir
                                </a>
                            </div> */}
                            <div>
                                <a href="#" onClick={() => { localStorage.removeItem("dgbrdconftknserr"); location.reload(); }} className="dropdown-item">
                                    <i className="icon-switch2"></i> Güvenli Çıkış Yap
                                </a>
                            </div>
                        </DropdownMenu>
                    </Dropdown>




                    {/* <li className="nav-item dropdown dropdown-user">
                            <a href="#" className="navbar-nav-link d-flex align-items-center dropdown-toggle" data-toggle="dropdown">
                                <img src="../layout/global_assets/images/placeholders/placeholder.jpg" className="rounded-circle mr-2" height="34" alt=""></img>
                                <span>Victoria</span>
                            </a>

                            <div className="dropdown-menu dropdown-menu-right">
                                <a href="#" className="dropdown-item"><i className="icon-user-plus"></i> My profile</a>
                                <a href="#" className="dropdown-item"><i className="icon-coins"></i> My balance</a>
                                <a href="#" className="dropdown-item"><i className="icon-comment-discussion"></i> Messages <span className="badge badge-pill bg-blue ml-auto">58</span></a>
                                <div className="dropdown-divider"></div>
                                <a href="#" className="dropdown-item"><i className="icon-cog5"></i> Account settings</a>
                                <a href="#" className="dropdown-item"><i className="icon-switch2"></i> Logout</a>
                            </div>
                        </li> */}

                </div>
            </div>




            <div className="page-content">


                <div className="sidebar sidebar-dark sidebar-main sidebar-expand-md">


                    <div className="sidebar-mobile-toggler text-center">
                        <a href="#" className="sidebar-mobile-main-toggle">
                            <i className="icon-arrow-left8"></i>
                        </a>
                        Navigation
                        <a href="#" className="sidebar-mobile-expand">
                            <i className="icon-screen-full"></i>
                            <i className="icon-screen-normal"></i>
                        </a>
                    </div>



                    <div className="sidebar-content">
                        <div className="card card-sidebar-mobile">
                            <ul className="nav nav-sidebar" data-nav-type="accordion">
                                {menu}
                            </ul>
                        </div>


                    </div>


                </div>

                <div className='content-wrapper'>

                    {loadingContent && <PageLoading></PageLoading>}
                    {!permission && !loadingContent && children}

                    {permission && <div className='content'>
                        <div className='row mt-5'>
                            <div className='row col-12 justify-content-center '>
                                <Image width={170} height={170} src={require("../layout/assets/images/notallow.png")}></Image>
                            </div>

                            <div className='col-12 row justify-content-center'>
                                <h1 className='text-center mt-3 text-danger '><b style={{ fontSize: 35 }}>Yetki Kısıtlı</b></h1>
                            </div>
                            <div className='col-12 row justify-content-center'>
                                <p className='text-center mt-3 text-danger ' style={{ fontSize: 20 }}>Bu sayfaya giriş yetkiniz bulunmamaktadır.</p>
                            </div>
                        </div>
                    </div>}
                    <div className="navbar navbar-expand-lg navbar-light">
                        <div className="text-center d-lg-none w-100">
                            <button type="button" className="navbar-toggler dropdown-toggle" data-toggle="collapse" data-target="#navbar-footer">
                                <i className="icon-unfold mr-2"></i>
                                Footer
                            </button>
                        </div>

                        <div className="navbar-collapse collapse" id="navbar-footer">
                            <span className="navbar-text">
                                &copy; 2022 <b>KYC AŞ </b>Tarafından Projelendirilmiştir
                            </span>

                            <ul className="navbar-nav ml-lg-auto">
                                <li className="nav-item"><a href="https://kopyov.ticksy.com/" className="navbar-nav-link" target="_blank"><i className="icon-lifebuoy mr-2"></i> Support</a></li>
                                <li className="nav-item"><a href="http://demo.interface.club/limitless/docs/" className="navbar-nav-link" target="_blank"><i className="icon-file-text2 mr-2"></i> Docs</a></li>
                                <li className="nav-item"><a href="https://themeforest.net/item/limitless-responsive-web-application-kit/13080328?ref=kopyov" className="navbar-nav-link font-weight-semibold"><span className="text-pink-400"><i className="icon-cart2 mr-2"></i> Purchase</span></a></li>
                            </ul>
                        </div>
                    </div>


                </div>
                {show ? <div className="overlay-backdrop" onClick={() => {
                    const sidebarButton = document.getElementById('sidebar-button');
                    if (sidebarButton) {
                        sidebarButton.style.right = sidebarButton.style.right === '250px' ? '0' : '250px';

                    }
                    setshow(!show)
                }} >
                </div> : null}

                {/*    <button id='sidebar-button' class="aside-trigger btn btn-warning btn-app btn-xs ace-settings-btn open" onClick={()=>{
                                                    const sidebarButton = document.getElementById('sidebar-button');
                                                    if (sidebarButton) {
                                                    sidebarButton.style.right = sidebarButton.style.right === '250px' ? '0' : '250px';
                                                    
                                                    }
                                                    setshow(!show)}
                    } type='button' >toggle</button> */}
    
     
            </div>
        


        </>



    )
}

export default Layout