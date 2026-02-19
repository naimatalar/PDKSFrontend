import { useFormik } from "formik";
import React, { useEffect, useState } from "react"
import { PriceSplitter } from "../components/pricesptitter";
import CurrencyInput from 'react-currency-input-field';
import dynamic from "next/dynamic";
// import SunEditor from 'suneditor-react';
// import SunEditorCore from "suneditor/src/lib/core";
import 'suneditor/dist/css/suneditor.min.css';

// Import Sun Editor's CSS File
const SunEditor = dynamic(() => import("suneditor-react"), {
    ssr: false,
});
export const Modal = (props) => {

    const [uplodFile, setUploadFile] = useState(null)
    const [listVal, setListVal] = useState("")
    const [listSelectVal, setListSelectVal] = useState("")

    const [refreshDom, setRefreshDom] = useState()
    const [fullScreenEditor, setFullScreenEditor] = useState("")
    const [editorValue, setEditorValue] = useState("")
    const [editorShow, setEditorShow] = useState(false)

    const editorShowToggle = (e) => { setEditorShow(!editorShow) }
    const getBase64 = (e) => {
        var file = e.target.files[0]
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            setUploadFile(reader.result)
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        }
    }



    const formik = useFormik({
        initialValues: props.initialValues,
        onSubmit: values => {
            if (props.closeWhenSumbit == false) {

            } else {
                props.closeModal()
            }


            props.submit({ values: values, file: uplodFile })
        },
    });
    const listChange = (name, value) => {
        setListVal("")
        formik.values[name].push(value);
        setRefreshDom(new Date().getMilliseconds() + new Date().getSeconds())
        // formik.handleChange(x)
    }
    const listSelectChange = (name, value) => {
        if (value == "") {
            return null
        }
        setListSelectVal("")

        formik.values[name].push(value);
        setRefreshDom(new Date().getMilliseconds() + new Date().getSeconds())
        // formik.handleChange(x)
    }
    const editorChange = (name, value) => {

        formik.values[name] = value;
        // setRefreshDom(new Date().getMilliseconds() + new Date().getSeconds())
        // formik.handleChange(x)
    }

    const deleteListValue = (name, value) => {

        setListVal("")
        var newdata = formik.values[name].filter(x => x != value);
        formik.values[name] = newdata
        setRefreshDom(new Date().getMilliseconds() + new Date().getSeconds())
        // formik.handleChange(x)
    }
    const deleteListSelectValue = (name, value) => {

        setListSelectVal("")
        var newdata = formik.values[name].filter(x => x != value);
        formik.values[name] = newdata
        setRefreshDom(new Date().getMilliseconds() + new Date().getSeconds())
 
    } 
    useEffect(() => {
        var ssa = props;
    }, [props.bottomChild])
    return (
        <>

            <div className='light-view' onClick={() => { props.closeModal() }}></div>

            <div id="kc-modal" className={"kc-modal " + (props?.modalSize == "small" && " col-12 col-md-6 col-lg-6") || "col-12"}>
                <h2 className="mb-4">{props.modalTitle}</h2>

                {

                    props.child &&
                    <div className="row col-12 mb-4 mt-4">
                        {props.child}
                    </div>
                }

                <form onSubmit={formik.handleSubmit} className="row">
                    {
                        props.items.map((item, key) => {
                            <div key={key}>

                            </div>
                            if (item.props.type == "text" || item.props.type == "number" || item.props.type == "email") {

                                return (
                                    <div key={key} className={"mb-4 form-item " + (item.rowCssClass == undefined ? "col-12" : item.rowCssClass)}>
                                        <label className="description-label">{item.props.label}</label>
                                        <input autoComplete="off" value={formik.values[item.props.name]} {...item.props} onChange={formik.handleChange} ></input>
                                    </div>
                                )
                            }
                            if (item.props.type == "money") {

                                return (
                                    <div key={key} className={"mb-4 form-item " + (item.rowCssClass == undefined ? "col-12" : item.rowCssClass)}>
                                        <label className="description-label">{item.props.label}</label>
                                        <CurrencyInput
                                            required={item.props.required && true || false}
                                            decimalsLimit={2}
                                            onValueChange={(value, name) => { formik.setFieldValue(item.props.name, value) }}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values[item.props.name]}
                                            className="form-control"
                                            suffix="₺"
                                        />


                                        {/* <input autoComplete="off" value={formik.values[item.props.name]} {...item.props} onChange={} ></input> */}
                                    </div>
                                )
                            }

                            if (item.props.type == "hidden") {

                                return (

                                    <input autoComplete="off" value={formik.values[item.props.name]} {...item.props} onChange={formik.handleChange} ></input>

                                )
                            }
                            if (item.props.type == "textarea") {

                                return (
                                    <div key={key} className={"mb-4 form-item "}>
                                        <label className="description-label">{item.props.label}</label>
                                        <textarea value={formik.values[item.props.name]} {...item.props} onChange={formik.handleChange} ></textarea>
                                    </div>
                                )
                            }

                            if (item.props.type == "editor") {

                                return (
                                    <div key={key} className={fullScreenEditor + (item.rowCssClass == undefined ? " col-12" : item.rowCssClass)}>
                                        <input style={{ opacity: 0 }} value={formik.values[item.props.name]} required={item.props.required && true || false}  ></input>
                                        <div>
                                            {item.props.hiddenable && <>

                                                <button type="button" id="editorShowBtn" onClick={() => { editorShowToggle() }} style={{ width: 300, cursor: "pointer" }}>{!editorShow  && "Açıklama yazmak için tıklayınız" || "Açıklamayı gizlemek için tıklayın"}</button>
                                            </>}

                                        </div>
                                        {
                                            fullScreenEditor == "ckeditor-big" &&
                                            <>

                                                <div onClick={() => { setFullScreenEditor("") }} className="close-full-screen">Tamam</div>
                                                <div style={{ marginRight: 120 }} onClick={() => { window.open("allfiles", "popUpWindow"); }} className="close-full-screen">Resimler</div>
                                            </>
                                        }<div className={(editorShow&&"d-flex"||"d-none")}>


                                            <SunEditor defaultValue={formik.values[item.props.name]} setDefaultStyle={"width:100%;height:200px;"} onChange={editor => {
                                                editorChange(item.props.name, editor);
                                                formik.setFieldValue(item.props.name, editor)
                                            }} setOptions={{
                                                buttonList: [

                                                    ['undo', 'redo'],
                                                    [':p-More Paragraph-default.more_paragraph', 'font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                                                    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                                                    ['fontColor', 'hiliteColor', 'textStyle'],
                                                    ['removeFormat'],
                                                    ['outdent', 'indent'],
                                                    ['align', 'horizontalRule', 'list', 'lineHeight'],
                                                    ['-right', ':i-More Misc-default.more_vertical', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print', 'save', 'template'],
                                                    ['-right', 'image', 'video', 'audio', 'link']
                                                ]
                                            }} />
                                        </div>
                                        <div id="letters"></div>
                                    </div>
                                )
                            }
                            if (item.props.type == "file") {

                                return (
                                    <div key={key} className={"mb-4 form-item " + (item.rowCssClass == undefined ? "col-12" : item.rowCssClass)}>
                                        <label className="description-label">{item.props.label}</label>
                                        <input  {...item.props} onChange={getBase64} ></input>
                                    </div>
                                )
                            }
                            if (item.props.type == "select-bool") {

                                return (
                                    <div key={key} className={"mb-4 form-item " + (item.rowCssClass == undefined ? "col-12" : item.rowCssClass)}>
                                        <label className="description-label">{item.props.label}</label>
                                        <select value={formik.values[item.props.name]}  {...item.props} onChange={
                                            (x) => {

                                                formik.handleChange(x)
                                                formik.setFieldValue(item.props.name, (x.target.value == "true"))
                                                try {

                                                    if (item["effectedchange"] != undefined) {
                                                        item.effectedchange(x)
                                                    }
                                                } catch (error) {
                                                }
                                            }} >
                                            <option value="">Seç</option>

                                            {
                                                item.data.map((item2, key2) => {

                                                    return (
                                                        <option key={key2} value={item2.id}>{item2.text}</option>
                                                    )

                                                })
                                            }

                                        </select>
                                    </div>
                                )
                            }
                            if (item.props.type == "select") {
                                return (
                                    <div key={key} className={"mb-4 form-item " + (item.rowCssClass == undefined ? "col-12" : item.rowCssClass)}>
                                        <label className="description-label">{item.props.label}</label>
                                        <select value={formik.values[item.props.name]}  {...item.props} onChange={
                                            (x) => {
                                                formik.handleChange(x)
                                                try {
                                                    if (item["effectedchange"] != undefined) {
                                                        item.effectedchange(x)
                                                    }
                                                } catch (error) {
                                                }
                                            }} >
                                            <option value="" >Seç</option>
                                            {
                                                item.data.map((item2, key2) => {
                                                    return (
                                                        <option key={key2} value={item2.id}>{item2.text}</option>
                                                    )
                                                })
                                            }

                                        </select>
                                    </div>
                                )
                            }
                            if (item.props.type == "list") {
                                return (
                                    <div key={key} className={"mb-4 form-item " + (item.rowCssClass == undefined ? "col-12" : item.rowCssClass)}>
                                        <label className="description-label">{item.props.label}</label>
                                        <div className="row">
                                            <div className="col-8">
                                                <input autoComplete="off" {...item.props} onKeyUp={(x) => { if (x.target.value.includes("+")) { listChange(item.props.name, listVal.replace("+", "")) } }} value={listVal} onChange={(x) => { setListVal(x.target.value) }} type="text" >
                                                </input>
                                            </div>
                                            <div className="col-4">
                                                <div className="item-add-button" onClick={() => { listChange(item.props.name, listVal) }}>
                                                    <div>
                                                        {item.butonName ?? "ekle"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 pb-3">
                                            {
                                                formik.values[item.props.name].map((item2, key2) => {
                                                    return (
                                                        <div className="term-items" key={key2}>{item2}
                                                            <span style={{ marginLeft: 10 }} onClick={() => { deleteListValue(item.props.name, item2) }}>x</span>
                                                        </div>
                                                    )
                                                })}
                                        </div>
                                    </div>
                                )
                            }
                            if (item.props.type == "listselect") {
                                return (
                                    <div key={key} className={"mb-4 form-item " + (item.rowCssClass == undefined ? "col-12" : item.rowCssClass)}>
                                        <label className="description-label">{item.props.label}</label>
                                        <div className="row">
                                            <div className="col-8">


                                                <select {...item.props} value={listSelectVal} onChange={(x) => { setListSelectVal(x.target.value) }}  >
                                                    <option >Seç</option>

                                                    {
                                                        item.data.map((item2, key2) => {
                                                           
                                                            if (formik.values[item.props.name].filter(x => { return x == item2.id }).length > 0) {
                                                                return false
                                                            }
                                                            return (
                                                                <option key={key2} value={item2.id}>{item2.text}</option>
                                                            )
                                                        })
                                                    }
                                                </select>

                                            </div>
                                            <div className="col-4">
                                                <div className="item-add-button" onClick={() => { listSelectChange(item.props.name, listSelectVal) }}>
                                                    <div>
                                                        Ekle
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 pb-3">
                                            <input  {...item.props} value={formik.values[item.props.name].length != 0 && formik.values[item.props.name].length || ""} style={{ position: "absolute", height: 1, with: 1, fontSize: 1, padding: 0, opacity: 0, zIndex: -9999 }} ></input>
                                            {

                                                formik.values[item.props.name]?.map((item2, key2) => {

                                                    return (
                                                        <div className="term-items" key={key2}>{item.data.find(x => x.id == item2)?.text}
                                                            <span style={{ marginLeft: 10 }} onClick={() => { deleteListSelectValue(item.props.name, item2) }}>x</span>
                                                        </div>
                                                    )

                                                })}
                                        </div>

                                    </div>
                                )
                            }
                        })
                    }
                    <div className="row col-12">
{props.bottomChild}
                    </div>
                    <div className="justify-content-end btn-modal-style">
                        {props.extraButtons?.map((item, key) => {

                            return <span key={key}><button type="button" onClick={(item?.onClick && (() => { item?.onClick(formik.values) })) || (() => { })} className={item.className}>{item.text}</button></span>
                        })}
                        <button type="submit" className="btn btn-outline-success mr-2">{props.submintButton ?? <span><i className="fa fa-save"></i> Kaydet</span>}</button>
                        <button className="btn btn-outline-danger" onClick={() => { props.closeModal() }}><span><i className="icon-x"></i> Kapat</span> </button>
                    </div>
                </form>
            </div>
        </>
    )

}
export default Modal