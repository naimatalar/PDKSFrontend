import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { GetWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';

const Talepler = () => {
  const [workOrder, setWorkOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const talepsPerPage = 10;
  

  useEffect(() => {
    GetAllOrders()
}, []);


const GetAllOrders = async () => {
  var d = await GetWithToken("Calendar/GetWorkOrderList/"+ talepsPerPage + "/" + currentPage ).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
  setWorkOrders(d.data)
}
console.log(workOrder)


  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const offset = currentPage * talepsPerPage;
  const CurrentTaleps = workOrder.slice(offset, offset + talepsPerPage);
  const pageCount = Math.ceil(workOrder.length / talepsPerPage);

  return (
    <div>
            <h3> <FontAwesomeIcon  style={{marginRight:25}} icon={faBars} /> Açtığınız iş talepleri</h3>
            <div className="dashboard-talepler-container">
                
                {CurrentTaleps.length > 0 && (
            <>
                        <div className="dashboard-talepler">
                        {CurrentTaleps.map((talep, index) => (
                            <div key={talep.id} className="talep-item">
                              
                            <p>{talep.id + "-" + talep.subject + " " +  "(" + "Hedef:"  + talep.endDate.slice(0,10) + ")"}</p>
                            {/* <p>{talep.explanationText.slice(0, 30)}{talep.explanationText.length > 25 ? '...' : ''}</p> */}

                            </div> 
                        ))}
                        </div>
                       
            </>
                )}
            </div>
            <div>
            <ReactPaginate
                        breakLabel="..."
                        nextLabel=" >"
                        onPageChange={handlePageChange}
                        pageRangeDisplayed={3}
                        pageCount={pageCount}
                        previousLabel="<"
                        pageClassName="page-item"
                        pageLinkClassName="page-link"
                        previousClassName="page-item"
                        previousLinkClassName="page-link"
                        nextClassName="page-item"
                        nextLinkClassName="page-link"
                        breakClassName="page-item"
                        breakLinkClassName="page-link"
                        containerClassName="pagination"
                        activeClassName="active"
                        renderOnZeroPageCount={null}
                />
            </div>
     </div>
  );
};

export default Talepler;