import React from 'react';


export const SelectTYSelectedValue =(data, valueId) =>{
    
        var optList =data.find(x=>x.attributeId==valueId)
        return optList;
} 

 export const SelectTYOptionGenerator =(data, search = null) =>{
    if (search == null || search=="") {
        var optList = data?.map((jitem, key) => {

            return { value: jitem.id, label: jitem.name }

        }).slice(0, 10);
        return optList;
    } else {
        var optList = data?.filter(x => x.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map((jitem, key) => {

            return { value: jitem.id, label: jitem.name }

        }).slice(0, 10);
        return optList;
    }

} 
 export const  SelectHBOptionGenerator=(data, search = null) =>{


    if (search == null || search=="") {
        var optList = data?.map((jitem, key) => {

            return { value: jitem.value, label: jitem.label }

        }).slice(0, 10);
        return optList;
    } else {
        var optList = data?.filter(x => x.label.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map((jitem, key) => {

            return { value: jitem.value, label: jitem.label }

        }).slice(0, 10);
        return optList;
    }

} 

