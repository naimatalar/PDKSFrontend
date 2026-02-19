import React from 'react';

export function addOrUpdateStorage(key, value) {

    localStorage.removeItem(key)
    localStorage.setItem(key, value)

}
export function getLaboratoryFromStorage() {

    try {


        return JSON.parse(localStorage.getItem(storageMercahtKey))

    } catch (error) {


        return null;
    }


}

export const storageMercahtKey = "STR_Merchant-156256a1-7d0a-44ce-998b-6b1176b94e8e"