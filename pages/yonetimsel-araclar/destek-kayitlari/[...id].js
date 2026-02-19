import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import AlertFunction from "../../../components/alertfunction";
import DataTable from "../../../components/datatable";
import Layout from "../../../layout/layout";
import PageHeader from "../../../layout/pageheader";
import PageLoading from "../../../layout/pageLoading";
import { Button, Modal, ModalBody, ModalHeader, Tooltip } from "reactstrap";
import {
  fileUploadUrl,
  GetWithToken,
  PostWithToken,
  PostWithTokenFile,
} from "../../api/crud";
import DebisButton from "../../../components/button";
import PersonelSelectCM from "../../../components/PersonelSelectComp";


const isBrowser = typeof window !== "undefined";

export default function Index(props) {
  const [modalOpen, setModelOpen] = useState(false);
  const [initialData, setInitialData] = useState({ id: null });
  const [loading, setLoading] = useState(true);

  const [projectId, setProjectId] = useState();
  const [refresh, setRefresh] = useState();
  const [selectedEditPersonelRow, setSelectedEditPersonelRow] = useState();

  useEffect(() => {
    start();
  }, []);
  const start = async () => {
    setLoading(false);

    if (isBrowser) {
      const hrf = window.location.href.split("/")
      const companyTypeId = hrf[hrf.length - 1]
      setProjectId(companyTypeId)
      setRefresh(new Date())
    }
  };
  return (
    <>
      {loading && <PageLoading></PageLoading>}

      {/* <Layout permissionControl={false}>
        <PageHeader
          title="Destek Kayıtları"
          map={[
            { url: "", name: "Yönetimsel Araçlar" },
            { url: "", name: "Destek Kayıtları" },
          ]}
        ></PageHeader> */}
      <div className="content pr-3 pl-3">
        <div className="card">

          <DebisButton style={{ marginTop: 15, marginBottom: 15, width: 100 }} link yellow href="#" onClick={() => {
            if (isBrowser) {
              window.history.go(-1);
            }

          }}>{"<"} Geri</DebisButton>
          <DataTable
            Refresh={refresh}
            DataUrl={"Ticket/GetTicketByProjectId/"}
            Headers={[
              ["content", "İçerik"],
              ["createdBy", "Oluşturan"],
              {
                header: <span>Atanan Sorumlu</span>,
                dynamicButton: (data) => {

                  return (<div><b style={{ color: "green" }}>
                    {selectedEditPersonelRow != data.id && <div style={{ minWidth: 140 }}>                    {data.appointedPersonelName}
                      <i onClick={() => setSelectedEditPersonelRow(data.id)} style={{ color: "black", cursor: "pointer" ,marginLeft:10 }} className="fa fa-edit"></i>
                    </div>}

                  </b>
                    {selectedEditPersonelRow == data.id && <div style={{ position: "relative", minWidth: 200 }}>

                      <PersonelSelectCM onChange={async (x) => {
                        var d = await GetWithToken("ticket/UpdateTicketAppointmentUser/" + data.id + "/" + (x?.value || 0)).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
                        
                        // setSelectedEditPersonelRow(undefined)
                        setRefresh(new Date())
                      }}></PersonelSelectCM>
                      <i style={{
                        color: "white",
                        background: "#c41616",
                        width: 4,
                        position: "absolute",
                        right: -18,
                        cursor: "pointer"
                      }} onClick={() => setSelectedEditPersonelRow(undefined)} className="fas fa-times"></i>
                    </div>}
                  </div>);


                },
              },
              {
                header: <span>Durum</span>,
                dynamicButton: (data) => {
                  if (data.ticketStatus == 1) {
                    return (<b style={{ color: "orange" }}>Bekliyor</b>);
                  } else if (data.ticketStatus == 2) {
                    return (<b style={{ color: "green" }}>Çözüldü</b>);
                  } else if (data.ticketStatus == 3) {
                    return (<b style={{ color: "red" }}>Çözülmedi</b>);
                  }else if (data.ticketStatus == 4) {
                    return (<b style={{ color: "#ff00cf" }}>Test Ediliyor</b>);
                  }

                },
              },
              ["estimated", "Planlanan Bitiş"],
              ["createDate", "Oluşturulma Tarihi"],
              {
                header: <span>Detay</span>,
                dynamicButton: (data) => {
                  return (
                    <DebisButton link href={"detay/" + data.id}>Detay</DebisButton>

                  );
                },
              },
              {
                header: <span>Sil</span>,
                dynamicButton:  (data)  => {
                  return (
                    <DebisButton onClick={async()=>{
                      if(!confirm("Kayıt silinecek onaylıyor musunuz?")){

                      }else{
                        
                        var d = await GetWithToken("ticket/DeleteTicket/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
    
                           setRefresh(new Date())
                      }
                    }}>Sİl</DebisButton>

                  );
                },
              },
            ]}
            Title={"Ticket Listesi "}
            Description={
              "Listedeki kullanıcıları düzenleme işlemleri yapabilirsiniz. "
            }
            // HeaderButton={{
            //   text: "Kullanıcı Oluştur",
            //   action: () => {
            //     setModelOpen(true);

            //     // setParentId(null);
            //   },
            // }}
            Pagination={{ pageSize: 10, pageNumber: 1, id: projectId }}
            // EditButton={editData}
            //  DeleteButton={deleteData}
            HideButtons
          ></DataTable>
        </div>
      </div>
      {/* </Layout> */}
    </>
  );
}
