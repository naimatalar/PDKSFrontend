import { confirmAlert } from 'react-confirm-alert'; 

import React from 'react';

export default function AlertFunction(title="",message=""){
  
var mess=message.title||message
var tit=title
if (!mess?.includes) {
     confirmAlert({
        title: "Hata",
        message: "Sunucu Kaynaklı Bir Hata Oluştu",
        buttons: [
          {
            label: 'Tamam',
            onClick: () => {}
          }
        ]
      })
    return false
}
if (mess?.includes("Yetkisiz") ) {
  mess="Bu işlem İçin yetkiniz bulunmuyor"
  tit="Yetkisiz İşlem"
}

    confirmAlert({
        title: tit,
        message: mess,
        buttons: [
          {
            label: 'Tamam',
            onClick: () => {}
          }
        ]
      })

}
