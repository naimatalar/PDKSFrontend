import React from 'react'
import Axios from 'axios'


export const apiConstant = "http://localhost:57022";
//   export const apiConstant = "https://api.dimforthumb.net";



export const antegraSystem = "http://localhost:2354/api/";

const masterUrl = apiConstant + "/api/";
export const fileUploadUrl = apiConstant + "/root/Upload/";
export const imageUploadUrl = apiConstant + "/root/UploadedImages/";
export const fileRoot = apiConstant + "/root/";
export const GetWithToken = async (url, params) => {
    const config = {
        headers: {
            'Content-Type': 'application/Json',
            Authorization: 'Bearer ' + localStorage.getItem("dgbrdconftknserr")
        }
    }
    if (params) config.params = params
    try {
        return Axios.get(masterUrl + url, config)

    } catch (error) {
        alert("hata oluştu n/ " + error)
    }
}

export const GetAntegraSystemNoneToken = async (url) => {
    const headers =
    {
        headers: {
            'Content-Type': 'application/Json',
        }
    }
    try {
        return Axios.get(antegraSystem + url, headers)
    } catch (error) {
        return false

    }
}
export const GetTrandyolBrand = async (url) => {
    const headers =
    {
        headers: {
            'Content-Type': 'application/Json',
        }
    }
    try {
        return Axios.get(url, headers)
    } catch (error) {
        return false

    }
}


export const GetNoneToken = async (url) => {
    const headers =
    {
        headers: {
            'Content-Type': 'application/Json',
        }
    }
    try {
        return Axios.get(masterUrl + url, headers)
    } catch (error) {
        alert("hata oluştu n/ " + error)

    }
}

export const PostWithToken = async (url, data) => {

    const headers =
    {
        headers: {
            'Content-Type': 'application/Json',
            Authorization: 'Bearer ' + localStorage.getItem("dgbrdconftknserr")
        },
        onUploadProgress: progressEvent => {

            let percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
            );
        }
    }
    try {

        return Axios.post(masterUrl + url, data, headers)
    } catch (error) {
        alert("hata oluştu n/ " + error)
    }
}

export const PostWithTokenFile = async (url, data, fomrData) => {

    const headers =
    {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: 'Bearer ' + localStorage.getItem("dgbrdconftknserr")
        },
    }
    var bodyFormData = fomrData

    if (!fomrData) {
     bodyFormData = new FormData();

        bodyFormData.append(data.name, data.data)
    }else{
        bodyFormData=data;
    }


    try {

        return Axios.post(masterUrl + url, data, headers)
    } catch (error) {
        alert("hata oluştu n/ " + error)
    }
}

export const PostNoneToken = async (url, data) => {

    const headers =
    {
        headers: {
            'Content-Type': 'application/Json',
        }
    }
    try {

        return Axios.post(masterUrl + url, data, headers)
    } catch (error) {
        alert("hata oluştu n/ " + error)
    }
}