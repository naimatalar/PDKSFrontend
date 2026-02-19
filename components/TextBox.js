import React from "react";
import PropTypes from 'prop-types';

const TextBox = (props)=>{
    return (
        <input
        {...props}
        className="default-debis-texbox"
        placeholder=" defaulplaceholder"
 
      />
    )
}

export default TextBox;