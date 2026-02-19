import React, { useCallback, useEffect, useState } from 'react';
import ImageCrop from '../../../../components/ImageCrop';
import { fileUploadUrl, GetWithToken, PostWithToken, PostWithTokenFile } from '../../../api/crud';
const isBrowser = typeof window !== "undefined";
import { useDropzone } from 'react-dropzone';
import AlertFunction from '../../../../components/alertfunction';
import DebisButton from '../../../../components/button';
import ReactSelect from 'react-select';
import moment from 'moment';
import Layout from '../../../../layout/layout';
import PageHeader from '../../../../layout/pageheader';
function Index(props) {
    const [ticketId, setTicketId] = useState();
    const [data, setData] = useState();
    const [imagePupup, setImagePopup] = useState();
    const [comment, setComment] = useState();
    const [croppedFile, setCroppedFile] = useState();
    const [resImage, setResImage] = useState();
    const [showCrop, setShowCrop] = useState(false);
    const [estimateDate, setEstimatedDate] = useState();

    useEffect(() => {
        start()
    }, [])

    const onDrop = useCallback(acceptedFiles => {
        // Yükleme işlemi burada gerçekleştirilecek
        
        setCroppedFile(acceptedFiles[0])
        // Örnek olarak, burada dosyaları bir API'ye yollayabilirsiniz
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    const start = async () => {
        document.addEventListener('paste', async (event) => {
            const items = event.clipboardData.files;

            if (items.length > 0) {

                // var nwImg = await resizeImage(items[0], 900) 
                setResImage(items[0])
                setShowCrop(true)
            }

        });
        if (isBrowser) {
            const hrf = window.location.href.split("/")
            const companyTypeId = hrf[hrf.length - 1]
            setTicketId(companyTypeId)
            var d = await GetWithToken("ticket/GetTicketById/" + companyTypeId).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
            setData(d.data)
        }
    }
    const submit = async () => {
        if (isBrowser) {
            const hrf = window.location.href.split("/")
            const companyTypeId = hrf[hrf.length - 1]
            var fd = new FormData();

            if (croppedFile) {
                fd.append("imageUrl", croppedFile)
            }
            fd.append("comment", comment)
            fd.append("ticketSystemId", companyTypeId)

            var d = await PostWithTokenFile("ticket/CreateComment", null, fd).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
            setComment("")
            setCroppedFile(undefined)
            start()
        }
    }
    return (
        <>

            {/* <Layout permissionControl={false}>
                <PageHeader
                    title="Destek Kayıtları"
                    map={[
                        { url: "", name: "Yönetimsel Araçlar" },
                        { url: "", name: "Destek Kayıtları" },
                    ]}
                ></PageHeader> */}
            {data && <div style={{ padding: 27 }}>
                {resImage && URL.createObjectURL(resImage) && <div style={{ display: "none" }} >
                    <img id="source" src={URL.createObjectURL(resImage)} />
                </div>}
                <div className="ticket">
                  
                    <div style={{
                        border: "1px dashed #8a8888",
                        padding: 11
                    }}>  
                    <DebisButton style={{marginBottom:50}} link yellow href="#" onClick={() => {
                        if (isBrowser) {
                            window.history.go(-1);
                        }

                    }}>{"<"} Geri</DebisButton>
                        <div className='row ccss'>
                            <div style={{ marginRight: 20 }}><b>Proje :  </b>{data.name}</div>

                            <div style={{ marginRight: 20 }}><b>Talep Numarası:</b> {data.trackingNumber}</div>
                            {data.ticketType == 1 && <div style={{ marginRight: 20 }}>  <><b>Talep Türü :</b> <span> Hata</span></>  </div>}
                            {data.ticketType == 2 && <div style={{ marginRight: 20 }}> <><b>Talep Türü :</b> <span>Yeni İş</span></>   </div>}
                            {data.ticketType == 3 && <div style={{ marginRight: 20 }}>  <><b>Talep Türü :</b><span> Öneri Fikir</span></>  </div>}
                            {data.ticketType == 4 && <div style={{ marginRight: 20 }}> <><b>Talep Türü :</b><span> Genel Talep</span></> </div>}
                            <div style={{ marginRight: 20 }}>

                                <span> {data.ticketStatus == 1 && <> <b>Durum : </b><span style={{ fontWeight: "bold", color: "orange" }}><i className="fas fa-hourglass-start"></i> Bekliyor</span></>}</span>
                                <span>{data.ticketStatus == 2 && <><b>Durum : </b> <span style={{ fontWeight: "bold", color: "green" }}><i className="fas fa-check-circle"></i> Çözüldü</span></>}</span>
                                <span>{data.ticketStatus == 3 && <><b>Durum : </b><span style={{ fontWeight: "bold", color: "red" }}> <i className="fas fa-times"></i> Çözülmedi</span> </>}</span>
                                <span>{data.ticketStatus == 4 && <><b>Durum : </b><span style={{ fontWeight: "bold", color: "#ff00cf" }}> <i className="fas fa-hourglass-start"></i> Test Ediliyor</span> </>}</span>

                                <ReactSelect onChange={async (a) => {
                                    await GetWithToken("ticket/UpdateTicketStatus/" + data.id + "/" + a.value)
                                    start()
                                }} options={[
                                    { value: 1, label: "Bekliyor" },
                                    { value: 2, label: "Çözüldü" },
                                    { value: 3, label: "Çözülmedi" },
                                    { value: 4, label: "Test Eiliyor" },

                                ]}>

                                </ReactSelect>
                            </div>
                            <div style={{ marginRight: 20 }}><b>Talep Tarihi :  </b>{data.createDate}</div>
                            <div className='col'>
                                <div style={{ marginRight: 20 }}><b>Tahmini Bitiş Tarihi :  </b>{data.estimated || <span>--</span>}</div>
                                <div> <input onChange={async (d) => {
                                    await PostWithToken("ticket/UpdateTicketEstimated", { id: data.id, date: moment(d.target.value).format("yyyy-MM-DD") })
                                    start()

                                }} type="date"></input>  <DebisButton onClick={async () => {
                                    await PostWithToken("ticket/UpdateTicketEstimated", { id: data.id, date: null })
                                    start()
                                }} red><i className='fas fa-trash'></i></DebisButton></div>
                            </div>

                        </div>


                        <div style={{
                            padding: 12,
                            borderLeft: "3px dashed rgb(120 121 121)",
                            margin: "10px 4px 2px 17px",
                            paddingLeft: 23
                        }}>

                            <p>{data.content}</p>
                            <div style={{ position: "relative", width: 100, cursor: "pointer" }} onClick={() => { setImagePopup(fileUploadUrl + data.imageUrl) }}>


                                <img style={{ width: 100 }} src={fileUploadUrl + data.imageUrl} alt="Ticket" />
                                <i style={{
                                    position: "absolute",
                                    top: "35%",
                                    fontSize: 38,
                                    left: 27
                                }} className='fas fa-search'></i>
                            </div>
                        </div>
                    </div>
                    <h3 style={{ borderBottom: " 1px solid #979191" }}>Yorumlar</h3>
                    {data.ticketComments?.length == 0 && <span style={{ color: "grey" }}>Hnüz yorum yapılmamış</span>}
                    {data.ticketComments?.map((comment, index) => (
                        <div key={index} className="comment">

                            <div className='col-1' style={{ textAlign: "center" }}>
                                <div><img src={fileUploadUrl + comment.resimUrl} alt="User" /></div>
                                <div style={{ fontSize: 10 }}> {comment.userName}</div>
                            </div>
                            <div className='col-9'>
                                <p style={{ background: "#c5ffdb", padding: 10, borderRadius: 10 }}>{comment.comment}</p>

                                <p className="date">Date: {comment.createDate}                             {comment.imageUrl && <b style={{ cursor: "pointer", color: "black", marginLeft: 18 }} onClick={() => setImagePopup(fileUploadUrl + comment.imageUrl)}> <i className="fas fa-paperclip"></i> 1 Adet Ek</b>}</p>
                            </div>

                        </div>
                    ))}

                </div>

                <div>
                    {croppedFile && <div style={{
                        width: "200px",
                        textAlign: "center",
                        background: "#8fffba",
                        marginBottom: "20px",
                        padding: 5,
                        borderRadius: 10
                    }}>
                        <b>Yorum Ek Resmi</b> <br></br>
                        <img style={{ border: "1ps solid black", borderRadius: 10, width: 150 }} onClick={() => setImagePopup(URL.createObjectURL(croppedFile))} src={URL.createObjectURL(croppedFile)}></img>
                        <br></br>
                        <i onClick={() => setCroppedFile(undefined)} style={{ cursor: "pointer", color: "red", fontWeight: "bold" }}>Kaldır</i>
                    </div>}
                </div>


                <div {...getRootProps()} style={{
                    padding: 5,
                    border: "1px dashed grey",
                }}>
                    <input {...getInputProps()} />
                    Dosyayı sürükle yada tıkla, Ekran görüntüsü yapıştımak için CTRL-V
                </div>
                <div className='row' style={{

                    padding: 10
                }}>


                    <textarea
                        className='col-11'
                        style={{ width: "70%" }}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Yorum Ekle..."
                        rows="3"
                        required
                    />
                    <DebisButton onClick={() => submit()} className='col-1' type="submit">Gönder</DebisButton>
                </div>

                {imagePupup && <div style={{
                    position: "absolute", width: "100%", left: 0, top: 0, right: 0, textAlign: "center",
                    background: "#bbbbbb"
                }}>
                    <button style={{
                        margin: "0 auto",
                        position: "absolute",
                        right: 7,
                        top: 10
                    }}

                        className='btn btn-danger' onClick={() => { setImagePopup(undefined) }}>Kapat</button>
                    <img width={"80%"} src={imagePupup} alt="Comment" />
                </div>}


            </div>}
            {resImage && <ImageCrop show={showCrop} ReturnedImage={setCroppedFile} Source={resImage}></ImageCrop>}
            {/* </Layout> */}
        </>
    );
}

export default Index;