import { confirmAlert } from 'react-confirm-alert'; 

import React from 'react';

export default function DeleteFunction(title="",message="",func){
  
    confirmAlert({
        title: title,
        message: message,
        buttons: [
          {
            label: 'Sil',
            onClick: () => {func()},
            className:"btn btn-danger btn-sm",
        
          },
          {
            label: 'Vazgeç',
            onClick: () => {},
            
          }
          
        ]
      })

}
