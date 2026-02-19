import { useState, useEffect, useMemo } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import Layout from '../../../layout/layout.js';
import PageHeader from '../../../layout/pageheader.js';
import DebisButton from '../../../components/button.js';


import { ErrorMessage, Formik, Field, Form } from 'formik';
import { PostWithToken, GetWithToken } from '../../api/crud.js';
import AlertFunction from "../../../components/alertfunction";
import DataTable from '../../../components/reactDataTable.js';



export default function Index() {
    const [modalOpen, setModalOpen] = useState(false);
    const [initialData, setInitialData] = useState({ id: null });
    const [data, setData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [parentId, setParentId] = useState(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 300 });

    useEffect(() => {
      getAllMenuModules();
    }, []);

    const getAllMenuModules = async () => {
      try {
        const response = await PostWithToken('MenuModules/ListAll', {
          "pageNumber": pagination.pageIndex,
          "pageSize": pagination.pageSize,
        });
        setTotalCount(response.data.data.allTotalCount);
        const formattedData = formatData(response.data.data.list);
        setData(formattedData);
      } catch (error) {
        AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz yok");
      }
    };

    const formatData = (data) => {
      const dataMap = new Map();
      const rootItems = [];

      data.forEach(item => {
        item.subRows = [];
        dataMap.set(item.id, item);
      });

      data.forEach(item => {
        if (item.parentId && dataMap.has(item.parentId)) {
          const parent = dataMap.get(item.parentId);
          parent.subRows.push(item);
        } else {
          rootItems.push(item);
        }
      });

      return rootItems;
    };

    const submit = async (values) => {
      try {
        await PostWithToken("MenuModules/Create", values);
        getAllMenuModules();
        setModalOpen(false);
      } catch (error) {
        AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor");
      }
    };

    const editData = async (row) => {
      try {
        const response = await GetWithToken("MenuModules/GetById/" + row.id);
        setInitialData(response.data.data); // Set modal's initial data with selected row
        setModalOpen(true);
      } catch (error) {
        AlertFunction("Başarısız işlem", error.response.data.data);
      }
    };

    const deleteData = async (row) => {
      try {
        await GetWithToken("MenuModules/Delete/" + row.id);
        getAllMenuModules();
      } catch (error) {
        AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor");
      }
    };

    // New addNewModul function to open modal for adding a new module
    const addNewModul = (row) => {
      console.log(row, "row")
      setInitialData({
        id: null,
        pageName: '',
        pageUrl: '',
        orderNumber: '',
        iconName: '',
        parentId: row.id  // Set parentId to row.id if row exists, otherwise null
      });
      setModalOpen(true); // Open modal after setting initialData
    };

    const columns = useMemo(() => [
      { accessorKey: 'pageName', header: 'Sayfa Adı' },
      { accessorKey: 'pageUrl', header: 'Link' },
      { accessorKey: 'orderNumber', header: 'Order Number' },
      { accessorKey: 'iconName', header: 'İkon Adı' },
      {
        id: 'actions',
        header: 'Ekle/Düzenle/Sil',
        Cell: ({ row }) => (
          <div style={{ maxWidth: "max-content" }}>
        <button
          className="btn btn-outline-primary btn-sm me-2"
          onClick={() => addNewModul(row.original)}  // Pass the row object
        >
          <i className="fas fa-plus me-1"></i> 
        </button>
        <button
          className="btn btn-outline-secondary btn-sm me-2"
          onClick={() => editData(row.original)}
        >
          <i className="fas fa-pencil-alt me-1"></i> 
        </button>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => deleteData(row.original)}
        >
          <i className="fas fa-trash me-1"></i> 
        </button>
          </div>
        ),
      },
    ], []);

    const handlePaginationChange = (pagination) => {
      setPagination(pagination);
    };

    return (
      <>
        <Modal
          isOpen={modalOpen}
          size="md"
          toggle={() => setModalOpen(!modalOpen)}
          modalTransition={{ timeout: 100 }}
        >
          <ModalHeader>
            <div className="d-flex justify-content-between w-100">
              <p>{initialData.id ? "Veriyi Güncelle" : "Yeni Veri Ekle"}</p>
              <button
                onClick={() => setModalOpen(!modalOpen)}
                type="button"
                className="modal-close-button btn btn-danger btn-sm p-1"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </ModalHeader>
          <ModalBody>
            <Formik
              initialValues={{
                ...initialData,
               
              }}
              enableReinitialize
              validate={(values) => {
                const errors = {};
                return errors;
              }}
              onSubmit={(values) => submit(values)}
            >
              {({ isSubmitting,  }) => (
                <Form className="row mt-3 col-12 form-n-popup">
                
                  <Field  id="parentId" className="form-control" name="parentId" />

                  <div className="col-md-12 col-12 mb-3">
                    <label className="input-label">Sayfa Adı</label>
                    <Field
                      type="text"
                      id="pageName"
                      className="form-control"
                      name="pageName"
                      placeholder="Sayfa Adı giriniz"
                    />
                  </div>

                  <div className="col-md-12 col-12 mb-3">
                    <label className="input-label">Link</label>
                    <Field
                      type="text"
                      id="pageUrl"
                      className="form-control"
                      name="pageUrl"
                      placeholder="Sayfa Linki giriniz"
                    />
                  </div>

                  <div className="col-md-12 col-12 mb-3">
                    <label className="input-label">Order Number</label>
                    <Field
                      type="number"
                      id="orderNumber"
                      className="form-control"
                      name="orderNumber"
                      placeholder="Order Number giriniz"
                    />
                  </div>

                  <div className="col-md-12 col-12 mb-3">
                    <label className="input-label">İkon Adı</label>
                    <Field
                      type="text"
                      id="iconName"
                      className="form-control"
                      name="iconName"
                      placeholder="İkon Adı giriniz"
                    />
                  </div>

                  <div className="col-12">
                    <DebisButton type="submit" disabled={isSubmitting}>
                      {initialData.id ? "Güncelle" : "Ekle"}
                    </DebisButton>
                  </div>
                </Form>
              )}
            </Formik>
          </ModalBody>
        </Modal>

        <Layout permissionControl={false}>
          <PageHeader title="Dashboard" map={[]} />
          <div className="container-fluid">
            <DebisButton onClick={addNewModul}>Yeni Modül Ekle</DebisButton>
            <DataTable
              columns={columns}
              data={data}
              pagination={pagination}
              totalCount={totalCount}
              onPaginationChange={handlePaginationChange}
              enableExpanding={true}
            />
          </div>
        </Layout>
      </>
    );
}
