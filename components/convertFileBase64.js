
import React from 'react';

export default async function fileBaseString(file) {
     debugger
    return new Promise  ((resolve, reject) => {
        
        var reader = new FileReader(); 
      
        reader.readAsDataURL(file) 
    
        var base64="";
        reader.onload = (event) => {

           
            resolve(reader.result)
        };
    
    });

}

