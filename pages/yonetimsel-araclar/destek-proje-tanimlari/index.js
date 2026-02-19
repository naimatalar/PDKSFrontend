import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import AlertFunction from "../../../components/alertfunction";
import DataTable from "../../../components/datatable";
import Layout from "../../../layout/layout";
import PageHeader from "../../../layout/pageheader";
import PageLoading from "../../../layout/pageLoading";
import Image from "next/image";
import { Button, Modal, ModalBody, ModalHeader, Tooltip } from "reactstrap";
import {
  fileUploadUrl,
  GetWithToken,
  PostWithToken,
  PostWithTokenFile,
} from "../../api/crud";
import DebisButton from "../../../components/button";
import { data } from "jquery";
import { useRouter } from 'next/router'
// import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

const isBrowser = typeof window !== "undefined";

export default function Index() {
  const [modalOpen, setModelOpen] = useState(false);
  const [initialData, setInitialData] = useState({ id: null });
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState();



  const router = useRouter()
  const chartRef = useRef(null);
  const chartRef2 = useRef(null);

  // const navigate = useNavigate();


  useEffect(() => {




    start();
  }, []);

  const chartCreate = async (data) => {
    let lbl = data.filter((item) => { return item.total > 0 }).map((item) => { return item.name })




    let bDtaset = { notSolved: [], waiting: [], solved: [], total: [], test: [] }

    const totalBcount = 0
    const resolveBcount = 0
    const notResolveBcount = 0
    const waitingBcount = 0
    const testBcount = 0


    for (const item of lbl) {



      var ds = data.find(x => { return x.name == item })


      bDtaset.notSolved.push(ds.notSolved)
      bDtaset.waiting.push(ds.waiting)
      bDtaset.solved.push(ds.solved)
      bDtaset.total.push(ds.total)
     bDtaset.test.push(ds.readyForTest)

      totalBcount += ds.total
      resolveBcount += ds.solved
      notResolveBcount += ds.notSolved
      waitingBcount += ds.waiting
      testBcount += ds.readyForTest

    }


    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: lbl,
          datasets: [{
            label: 'Çözülmedi',
            data: bDtaset.notSolved,
            backgroundColor: [
              'red'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1
          },
          {
            label: 'Bekliyor',
            data: bDtaset.waiting,
            backgroundColor: [
              'orange',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1
          },
          {
            label: 'Test Ediliyor',
            data: bDtaset.test,
            backgroundColor: [
              '#ff00cf',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1
          },
          {
            label: 'Çözüldü',
            data: bDtaset.solved,
            backgroundColor: [
              'green',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1
          },
          {
            label: 'Toplam',
            data: bDtaset.total,
            backgroundColor: [
              'grey',
            ],
            borderColor: [
              'black',
            ],
            borderWidth: 1
          },
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: false
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Proje Bazlı Analiz Grafiği', // Burada grafik başlığını belirleyebilirsiniz
              font: {
                size: 16
              }
            }
          }

        }

      });
    }
    if (chartRef2.current) {
      const ctx2 = chartRef2.current.getContext('2d');
      new Chart(ctx2, {
        type: 'polarArea',
        data: {
          labels: ['Çözüldü', 'Bekliyor',"Test Ediliyor", 'Çözülmedi', "Toplam"],
          datasets: [
            {
              label: 'Dataset 1',
              data: [resolveBcount, waitingBcount,testBcount, notResolveBcount, totalBcount],
              backgroundColor: [
                "green", "orange","#ff00cf", "red", "grey"
              ]
            }
          ]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Genel Toplam Grafiği', // Burada grafik başlığını belirleyebilirsiniz
              font: {
                size: 16
              }
            }
          }
        }

      });
    }
  }
  const start = async () => {

    setLoading(false);
  };


  const deleteData = async (data) => {

    var d = await GetWithToken("ticket/DeleteTicketProject/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
    setRefresh(new Date())
    // setModelOpen(false)

  }
  const editData = async (data) => {

    setInitialData(data)
    setModelOpen(true)

  }

  return (
    <>

      {loading && <PageLoading></PageLoading>}
      <Modal
        isOpen={modalOpen}
        size="md"
        toggle={() => setModelOpen(!modalOpen)}
        modalTransition={{ timeout: 100 }}
      >
        <ModalHeader cssModule={{ "modal-title": "w-100 text-center" }}>
          <div className="d-flex justify-content-center mb-2"></div>
          <div className="d-flex ">
            <p>
              Proje <b>Tanımlama</b> Formu
            </p>
          </div>
          <button
            onClick={() => setModelOpen(!modalOpen)}
            type="button"
            className="modal-close-button btn btn-danger btn-sm p-1"
          >
            <i className="fas fa-times"></i>
          </button>
        </ModalHeader>
        <ModalBody>
          <Formik
            initialValues={initialData}
            validate={(values) => {
              const errors = {};
              values = [];

              return errors;
            }}
            onSubmit={(values,) => {
              setTimeout(async () => {
                var d = await PostWithToken("ticket/CreateTicketProject", values).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
                setInitialData({ id: null })
                setRefresh(new Date())
                setModelOpen(false)

              }, 400);
            }}
          >
            {({ isSubmitting, values, }) => (
              <Form className="row mt-3 col-12 form-n-popup">
                {initialData && (
                  <>
                    <Field
                      type="hidden"
                      id="id"
                      className="form-control"
                      name="id"
                    />
                    <Field type="hidden" name="parentId" id="parentId" />


                    <div className="col-md-6 col-12 mb-3">
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-danger danger-alert-form"
                      />
                      <label className="input-label">Proje Adı</label>
                      <Field

                        id="name"
                        className="form-control"
                        name="name"
                      />
                    </div>
                  </>
                )}
                <div className="col-12">
                  <DebisButton
                    type="submit" >
                    Submit
                  </DebisButton>
                </div>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </Modal>

      {/* <Layout permissionControl={false}>
        <PageHeader
          title="Kullanıcı Oluştur"
          map={[
            { url: "", name: "Yönetimsel Araçlar" },
            { url: "", name: "Ticket Oluştur" },
          ]}
        >
         
        </PageHeader> */}
      <div className="content pr-3 pl-3">
        <div className="card">


          <DataTable
            Refresh={data}
            DataUrl={"Ticket/GetAllProjects"}

            GetAllData={(x) => { chartCreate(x) }}
            Headers={[
              ["name", "Proje Adı"],
              {
                header: <span>Toplam Kayıt</span>,
                dynamicButton: (data) => {
                  return (
                    <div className="row">
                      <div className="col-12">
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          Çözülen : {data.solved} </span>
                        <span style={{ color: "orange", fontWeight: "bold" }}>
                          Beklemede : {data.waiting} </span>

                        <span style={{ color: "red", fontWeight: "bold" }}>
                          Çözülmedi : {data.notSolved} </span>
                        <span style={{ color: "#ff00cf", fontWeight: "bold" }}>
                          Test Ediliyor : {data.readyForTest} </span>

                        <span style={{ color: "blue", fontWeight: "bold" }}>
                          Toplam : {data.total}</span>
                        <DebisButton link href={`/yonetimsel-araclar/destek-kayitlari/${data.id}`} style={{ border: "1px solid grey" }}>
                          Detaylar
                        </DebisButton>
                      </div>
                      {/* <div className="col-12">
                          <DebisButton onClick={() => handleButtonClick(data)}  style={{border:"1px solid grey"}}>
                            Detaylar
                          </DebisButton>
                        </div> */}
                    </div>

                  );
                },
              },
            ]}
            Title={"Ticket Listesi "}
            Description={
              "Listedeki kullanıcıları düzenleme işlemleri yapabilirsiniz. "
            }
            HeaderButton={{
              text: "Proje Tanımla",
              action: () => {
                setModelOpen(true);
                setInitialData({ id: null })

                // setParentId(null);
              },
            }}
            EditButton={editData}
            DeleteButton={deleteData}
          // HideButtons
          ></DataTable>

          <div className="row" style={{
            background: "#e2f284",
            border: "1px dashed #5e7310",
          }}>
            <div className="col-12 p-3">
              <b style={{
                color: "white",
                textShadow: "1px 1px 1px black",
                fontSize: "21px"
              }}>Destek Analiz Grafikleri</b>
              <br></br>
              <i>Aşağıda destek taleplerine ait sonuçları grafikler halinde gösterilmiştir.</i>
            </div>
          </div>
          <div className="row" style={{ background: "#edfabc" }}>


            <div className="col-8 p-4">

              <div className="col-12 p-4">
                <canvas ref={chartRef} /></div>

            </div>
            <div className="col-4">

              <div className="col-12 p-0">
                <canvas ref={chartRef2} />
              </div>

            </div>
          </div>
        </div>
      </div>
      {/* </Layout> */}

    </>
  );
}
