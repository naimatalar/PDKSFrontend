import React from 'react';
import Draggable from 'react-draggable';
function ReportDesingTools({ onDragStart,onDragStop }) {
    return (
        <div className='row'>
            <div className='col-6'>
                <Draggable 
                onStart={()=>onDragStart("Table")}
                onStop={()=>onDragStop("Table")}
                position={{ x: 0, y: 0 }}>
                    <button type='button' style={{zIndex:"99",position:"absolute"}}>
                        <i className='fa fa-table'> </i> Tablo</button>
                </Draggable>
            </div>
            <div className='col-6'>
                {/* <Draggable><div>das</div></Draggable> */}
            </div>
        </div>
    );
}

export default ReportDesingTools;