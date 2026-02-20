

import 'react-confirm-alert/src/react-confirm-alert.css'; 
import '../styles/globals.css'
import '../layout/assets/css/bootstrap.min.css'
import '../layout/assets/css/bootstrap_limitless.min.css'

import '../layout/assets/css/components.min.css'
import '../layout/assets/css/colors.min.css'
// import '../layout/assets/js/'

import "../layout/global_assets/css/icons/icomoon/styles.min.css"
import Login from './auth/login'
import '../layout/assets/css/layout.min.css'
import '../layout/assets/css/tree.css'
import '../layout/assets/css/menu-pro.css'
import '../components/datatable-pro.css'
import '../pages/yonetimsel-araclar/tanimlamalar/tanimlamalar-tabs.css'
import "../layout/global_assets/css/icons/fontawesome/styles.min.css"
import 'react-toastify/dist/ReactToastify.css';
import "react-image-crop/dist/ReactCrop.css";
import { useEffect, useState } from 'react'
import { GetNoneToken, GetWithToken } from './api/crud'
import { SignalRProvider } from '../components/SignalRContext';

//import Index from "/yonetimsel-araclar/destek-kayitlari/[...id]";






function Antegra({ Component, pageProps }) {
  const [checkData, setCheckData] = useState();
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {

    start();
  }, [])
  const start = async () => {

    var d = await GetWithToken("Auth/CheckLogin").then(x => { return x.data })

    setCheckData(d)
    setLoading(false)
  }
  if (!loading) {
    if (checkData?.userExist && checkData?.auth) {
      return <SignalRProvider> <Component {...pageProps} /></SignalRProvider>
    }
    if (!checkData?.auth) {
      
      return <Login></Login>
    }


  }

  



  // return <Login></Login>

  return <div>
   
  </div>
}

export default Antegra
