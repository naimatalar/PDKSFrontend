import React, { useEffect, useState } from "react"




const DebisButton = (props) => {
 
let cls="default-debis-button"
  if (props.yellow) {
    cls="yellow-debis-button"
  }
  if (props.red) {
    cls="red-debis-button"
  }

    return (
      props.link&&<a
      {...props}
      className={ cls}
      >
      
        {props.children} 
      </a>||<button
      {...props}
      className={ cls}
      >
      
        {props.children} 
      </button>
    );
  };


  


  export default DebisButton;

