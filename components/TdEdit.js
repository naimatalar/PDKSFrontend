import React from 'react';
import fileBaseString from './convertFileBase64';

function TdEdit({ setTableEditableContainer, setTableEditableText, jitem }) {
    debugger
    return (
        <div className='row editabletable-dd' style={{ width: 200 ,textAlign:"left",fontSize:13}}>
            <div onClick={() => { setTableEditableContainer(undefined); setTableEditableText(undefined) }} className='table-edit-hide'>x</div>
            <div className='col-12 mb-1'>
                <button onClick={() => { ; setTableEditableText(jitem) }} type='button'>Yazı Yaz</button>
            </div>

            <div className='col-12 row mb-1'>
                <div className='col-6'>
                    Resim Ekle
                </div>
                <div className='col-6'>
                    <input type="file" style={{width:78}} onChange={async(v) => {;setTableEditableText(new Date()); jitem.style = { ...jitem.style, backgroundImage: `url(${JSON.stringify(await fileBaseString(v.target.files[0]))})`,backgroundSize:"100%" ,backgroundRepeat:"no-repeat"} }} ></input>

                </div>

            </div>

            <div className='col-12 row mb-1'>
                <div className='col-6'>
                    Yükseklik
                </div>
                <div className='col-6'>
                    <input type="number"  defaultValue={ typeof(jitem.style.height)=="number"&&jitem.style.height||  parseInt(jitem.style.height?.split(".")[0])} style={{width:78}} onChange={async(v) => {;setTableEditableText(new Date()); jitem.style = { ...jitem.style, height: v.target.value+"px" } }} ></input>

                </div>
            </div>
   
            <div className='col-12 row mb-1'>
                <div className='col-6'>
                    Text Konumu
                </div>
                <div className='col-6'>

                <select defaultValue={jitem.style.textAlign} onChange={async(v) => {;setTableEditableText(new Date()); jitem.style = { ...jitem.style, textAlign: v.target.value } }}>
                                <option value={"right"}>
                                    Sol
                                </option>
                                <option value={"center"}>
                                    Orta
                                </option>
                                <option value={"left"}>
                                    Sağ
                                </option>
                            </select>

                </div>
            </div>


            <div className='col-12 row mb-1'>
                <div className='col-6'>
                    Genişlik
                </div>
                <div className='col-6'>
                    <input type="number" defaultValue={typeof(jitem.style.width)=='number'&&jitem.style.width|| parseInt(jitem.style.width?.split(".")[0])} style={{width:78}} onChange={async(v) => {;setTableEditableText(new Date()); jitem.style = { ...jitem.style, width: v.target.value+"px" } }} ></input>

                </div>
            </div>

            
            <div className='col-12 row mb-1'>
                <div className='col-6'>
                    Yazı Boyutu
                </div>
                <div className='col-6'>
                    <input type="number" defaultValue={typeof(jitem.style.fontSize)=='number'&&jitem.style.fontSize||parseInt(jitem.style.fontSize?.split(".")[0])} style={{width:78}} onChange={async(v) => {;setTableEditableText(new Date()); jitem.style = { ...jitem.style, fontSize: v.target.value+"px" } }} ></input>

                </div>
            </div>

            <div className='col-12 row mb-1'>
                <div className='col-6'>
                    Dolgu Rengi
                </div>
                <div className='col-6'>
                    <input defaultValue={jitem.style.backgroundColor} onChange={(v) => { setTableEditableText(new Date()); jitem.style = { ...jitem.style, backgroundColor: v.target.value } }} type={"color"}></input>
                </div>


            </div>
            <div className='col-12 row mb-1'>
                <div className='col-6'>
                    Yazı Rengi
                </div>
                <div className='col-6'>
                    <input defaultValue={jitem.style.color} onChange={(v) => { setTableEditableText(new Date()); jitem.style = { ...jitem.style, color: v.target.value } }} type={"color"}></input>

                </div>

            </div>
            <div className='col-12 row mb-1'>
                <div className='col-6'>
                    Yazı Kalınlığı
                </div>
                <div className='col-6'>
                    <select defaultValue={jitem.style.fontWeight} onChange={(v) => { setTableEditableText(new Date()); jitem.style = { ...jitem.style, fontWeight: v.target.value } }}>
                        <option value={"initial"}>ince</option>
                        <option value={"bold"}>Kalın</option>
                    </select>
                </div>

            </div>
        </div>
    );
}

export default TdEdit;