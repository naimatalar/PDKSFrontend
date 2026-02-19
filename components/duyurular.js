import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { GetWithToken } from '../pages/api/crud';

const Duyurular = () => {
  const [talepler, setTalepler] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const talepsPerPage = 10;

  useEffect(() => {
    GetAllNews()
}, []);


const GetAllNews = async () => {
  var d = await GetWithToken("Calendar/GetDebisNews").then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
  setTalepler(d.data)
}

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };
  console.log(talepler)

  const offset = currentPage * talepsPerPage;
  const CurrentTaleps = talepler.slice(offset, offset + talepsPerPage);
  const pageCount = Math.ceil(talepler.length / talepsPerPage);

  return (
    
    <div>
        <h3>  <FontAwesomeIcon  style={{marginRight:25}} icon={faNewspaper} />Debis Yenilikleri</h3>
    <div className="dashboard-duyurular-container">
        
         {CurrentTaleps.length > 0 && (
      <>
                <div className="dashboard-talepler">
                {CurrentTaleps.map((talep, index) => (
                    <div key={talep.duyuruId} className="talep-item">
                    <h4>{talep.duyuruBaslik}</h4>
                    <p>{talep.duyuruTarih.slice(0,10)}</p> 
                    <p>{talep.duyuruKonu}</p> 
                    </div> 
                ))}
                </div>
      </>
        )}
     </div>
     
     </div>
  );
};

export default Duyurular;