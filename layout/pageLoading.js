import Image from 'next/image';
import React from 'react';

export default function PageLoading() {

  return (

    <div className='loader-lg'>
      <div style={{width:100, margin:"0 auto",marginTop:50}} className='loding-page-gif'>
        <Image width={100} height={100} src={require("../layout/assets/images/loading.gif")}></Image>

      </div>
    </div>

  )

}