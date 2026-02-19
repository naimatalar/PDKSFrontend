import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const DatePicker = (props, { selectedDate, onChange, placeholder, className, dateFormat }) => {
  return (
    <ReactDatePicker
    {...props}
      selected={selectedDate}
      className="default-debis-texbox"
      dateFormat={dateFormat}
    />
  );
};



export default DatePicker;