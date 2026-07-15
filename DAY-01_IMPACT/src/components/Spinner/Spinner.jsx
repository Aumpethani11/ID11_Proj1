import React from "react";
import "./Spinner.css";
import Loader from "../../assets/Spinner.svg"

const Spinner = () => {

  return (
    <div className="signlang__loader">
       <img src={Loader} alt="loader"/>
    </div>
  );
};

export default Spinner;
