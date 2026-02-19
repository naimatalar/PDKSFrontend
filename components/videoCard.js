import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { GetWithToken } from '../pages/api/crud';


const VideoComponent = () => {
  const [videos, setVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const videosPerPage = 1;

  useEffect(() => {
        GetAllVideos()
    }, []);

 
    const GetAllVideos = async () => {
      var d = await GetWithToken("Calendar/GetVideoLists").then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlem için yetkiniz bulunmuyor"); return false })
      setVideos(d.data)
  }
      console.log(videos + "videos")
      

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const offset = currentPage * videosPerPage;
  const currentVideos = videos.slice(offset, offset + videosPerPage);
  const pageCount = Math.ceil(videos.length / videosPerPage);
  console.log(currentVideos +"current videos")

  return (
    <div className="dashboard-video mb-3">
      {currentVideos.length > 0 && (
        <>
            <h4> <FontAwesomeIcon  style={{marginRight:25}} icon={faNewspaper} /> {currentVideos[0].title}</h4>
          <div className="video-wrapper">
          <video className='dasboard-video-player' width="100%" height="150rem" controls>
              <source src={currentVideos[0].url} type="video/mp4"></source>
        </video>
        
          </div>
          <ReactPaginate
            breakLabel="..."
            nextLabel=" >"
            onPageChange={handlePageChange}
            pageRangeDisplayed={1}
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
        </>
      )}
    </div>
  );
};

export default VideoComponent;