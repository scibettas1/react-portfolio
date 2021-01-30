import React from "react";
import "../styles/style.css"

function Banner(props) {
  return (
    <div>
      <div className="banner">
        <div className="container">
          <div className="row">
            <h1 className="pageTitle">{props.pageTitle}</h1>
          </div>
        </div>
      </div>
  </div>
  );
}

export default Banner;