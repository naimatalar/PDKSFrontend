import { useMemo, useState, useEffect } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_TR } from 'material-react-table/locales/tr';
import { GetWithToken, PostWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';
import {  Modal, ModalBody, ModalHeader } from 'reactstrap';
import { ErrorMessage, Formik, Field, Form } from 'formik';
import ReactSelect from 'react-select';
import DebisButton from './button';
import { colors, IconButton,  } from '@mui/material';




const  Example = () => {
  const [jobs, setJobs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [initialData, setInitialData] = useState({ id: null });
  const [parentId, setParentId] = useState();
  // const [plist, setPlist] = useState([]);

  useEffect(() => {
    getAllJobs();
  }, []);

  // API'den veriyi alıp parent-child ilişkisine göre düzenleyen fonksiyon
  const getAllJobs = async () => {
    try {
      const response = await GetWithToken("Definitions/GetAllJobTitles");
      const formattedData = formatData(response.data.data);
      setJobs(formattedData); // Formatlanmış veriyi state'e atıyoruz
    } catch (error) {
      AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor");
    }
  };

  // Parent-child ilişkisine göre veriyi düzenleyen fonksiyon
  const formatData = (data) => {
    const dataMap = new Map(); // id -> data mapping
    const rootItems = [];

    // İlk olarak her bir öğeyi map'e ekliyoruz
    data.forEach(item => {
      item.subRows = []; // Her öğeye boş subRows ekliyoruz
      dataMap.set(item.id, item); // id'yi key yapıyoruz
    });

    // Şimdi parentId'yi kontrol ederek hiyerarşiyi oluşturuyoruz
    data.forEach(item => {
      if (item.parentId && dataMap.has(item.parentId)) {
        // Eğer parentId'si varsa, parent'ın subRows'ına ekliyoruz
        const parent = dataMap.get(item.parentId);
        parent.subRows.push(item);
      } else {
        // parentId yoksa bu root seviyede bir öğedir
        rootItems.push(item);
      }
    });

    return rootItems;
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Görev',
        colors:"red"
      },
      {
        accessorKey: 'explanationText',
        header: 'Açıklama',
        size: 40,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 40,
      },
      {
        accessorKey: 'code',
        header: 'Kod',
        size: 40,
      },
      // {
      //   // Custom edit ve delete butonlarını buraya ekleyebilirsiniz
      //   id: 'add',
      //   header: 'Ekle',
      //   Cell: ({ row }) => (
      //     <div>
      //       <button style={{width: "4rem", backgroundColor:"green", color:"white", height:"2rem", marginRight:"10px", borderRadius:"5px", fontWeight:"700"}} onClick={() => addnewgorev(row.original)}>Ekle</button>
            
      //     </div>
      //   ),
      // },

      {
        // Custom edit ve delete butonlarını buraya ekleyebilirsiniz
        id: 'actions',
        header: 'Ekle/Düzenle/Sil',
        Cell: ({ row }) => (
          <div style={{maxWidth:"max-content"}}>
                    <button  onClick={() => addnewgorev(row.original)}>
                    <i className='fas fa-user'  />
                    </button>
            <button  onClick={() => editData(row.original)}>
            <i className='fas fa-user'  />
            </button>
            <button color="error" onClick={() => deleteData(row.original)}>
            <i className='fas fa-user'  />
            </button>
          </div>
        ),
      },
    ],
    [],
  );
  const submit = async (values) => {
    console.log(values)
    try {
      await PostWithToken("Definitions/CreateEditJobTitles", values).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false });
       getAllJobs();
        setModalOpen(false);
    } catch (error) {
        console.error("Error:", error);
    }
};
const addnewgorev = (data) => {
  setModalOpen(true);
  console.log(data);
  setParentId(data.id); // Set the parentId for the current job
  setInitialData({ ...initialData, parentId: data.id || null }); // If there's no parent, it will be null
};

  const editData = async (data) => {
    console.log(data)
    try {
        const response = await GetWithToken("Definitions/GetJobTitlesById/" + data.id);
        console.log(response)
        setInitialData(response.data.data);
        // setPlist(response.data.data);   
        setModalOpen(!modalOpen);
        getAllJobs();
    } catch (error) {
        AlertFunction("", error.response.data.data);
    }
};

  const deleteData = async (data) => {
    console.log(data)
    var d = await GetWithToken("Definitions/DeleteJobTitlesById/" + data.id)
    .then((x) => {
      getAllJobs();
      return x.data;
    })
    .catch((e) => {
      AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor");
      return true;
    });
    if (d.isError) {
      alert(d.message);
    }
};

  const table = useMaterialReactTable({
    columns,
    data: jobs, // API'den gelen hiyerarşik veri
    localization:MRT_Localization_TR,
    enableExpanding: true,
    filterFromLeafRows: true, //apply filtering to all rows instead of just parent rows
    getSubRows: (row) => row.subRows, //default
    initialState: { expanded: true }, //expand all rows by default
    enableStickyHeader: true,
    enablePagination: false,
    initialState: { density: 'compact' },
    
    
    // renderRowActionMenuItems: ({ closeMenu }) => [
    //   // <IconButton  onClick={() => addnewgorev(row.original)}>
    //   // <PersonAddAltIcon />
    //   // </IconButton>
    //   <MenuItem
    //     key={0}
    //     onClick={() => addnewgorev(row.original)&closeMenu()}
    //     sx={{ m: 0 }}
    //   >
    //     <ListItemIcon>
    //     <PersonAddAltIcon />
    //     </ListItemIcon>
    //     aksiyon
    //   </MenuItem>,
     
    // ],

  });

  return (
    <>
    <Modal
                isOpen={modalOpen}
                size="md"
                toggle={() => setModalOpen(!modalOpen)}
                modalTransition={{ timeout: 100 }}
            >
                <ModalHeader cssModule={{ "modal-title": "w-100 text-center" }} >
                    <div className="d-flex justify-content-center mb-2"></div>
                    <div className="d-flex " >
                        <p>Eğitim Durumu Ekleme</p>
                    </div>
                    <button
                        onClick={() => setModalOpen(!modalOpen)}
                        type="button"
                        className="modal-close-button btn btn-danger btn-sm p-1"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </ModalHeader>
                <ModalBody>
                <Formik
                      initialValues={{
                        ...initialData, // Keep existing initialData
                        parentId: parentId || null, // Set parentId dynamically based on whether it exists
                      }}
                      validate={(values) => {
                        const errors = {};
                        // Your validation logic
                        return errors;
                      }}
                      onSubmit={(values) => {
                        submit(values); // Pass values directly, which will include parentId
                      }}
                    >
                        {({ isSubmitting, values, setSubmitting }) => (
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
                                        {/* <div className="col-md-12 col-12 mb-3">
                                        <ErrorMessage
                                            name="anotherField"
                                            component="div"
                                            className="text-danger danger-alert-form"
                                        />
                                        <label className="input-label">Bağlı Olduğu Görev Ünvanı</label>
                                        <ReactSelect
                                                loadingMessage={"Yükleniyor"}
                                                isClearable
                                                placeholder={"Seçiniz:"}
                                                options={jobs.map(x => { return { label: x.name, value: x.id } })}
                                                // onBlur={handleBlur}
                                                // onChange={(val) => {
                                                //     if (val == null) {
                                                //         setFieldValue("category", "");
                                                //     } else {
                                                //         setFieldValue("category", val.value);
                                                //     }
                                                // }}
                                            />
                                        </div> */}
                                        <div className="col-md-12 col-12 mb-3">
                                        <ErrorMessage
                                            name="anotherField"
                                            component="div"
                                            className="text-danger danger-alert-form"
                                        />
                                        <label className="input-label">Kodu</label>
                                        <Field
                                            type="text"
                                            id="code"
                                            className="form-control"
                                            name="code"
                                        />
                                        </div>
                                        <div className="col-md-12 col-12 mb-3">
                                        <ErrorMessage
                                            name="anotherField"
                                            component="div"
                                            className="text-danger danger-alert-form"
                                        />
                                        <label className="input-label">Adı</label>
                                        <Field
                                            type="text"
                                            id="name"
                                            className="form-control"
                                            name="name"
                                        />
                                        </div>
                                        <div className="col-md-12 col-12 mb-3">
                                        <ErrorMessage
                                            name="anotherField"
                                            component="div"
                                            className="text-danger danger-alert-form"
                                        />
                                        <label className="input-label">Açıklama</label>
                                        <Field
                                            type="text"
                                            id="explanationText"
                                            className="form-control"
                                            name="explanationText"
                                        />
                                        </div>
                                    </>
                                )}
                                <div className="col-12">
                                    <DebisButton
                                        type="submit"
                                        onClick={() => setSubmitting}
                                    >
                                        Submit
                                    </DebisButton>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </ModalBody>
            </Modal>
            <MaterialReactTable table={table} />;
 
 </>
  ) 
};

export default Example;
