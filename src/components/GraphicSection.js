import React from "react";
import "../styles/style.css"
import placeholder from "../images/placholder350.jpg"

function GraphicSection() {
  return (
    <div>
      <div className="info2">
        <div className="container">
          <h2>GRAPHIC DESIGN</h2>
          <div className="row">
            <div className="col-md-5">
              <h5>PHOTOSHOP | ADOBE ILLUSTRATOR | INDESIGN | TYPOGRAPHY</h5>
            </div>

            <div className="col-md-7">
              <img src={placeholder} className="rounded img-thumbnail thumb" alt=""/>
              <img src={placeholder} className="rounded img-thumbnail thumb" alt=""/>
              <img src={placeholder} className="rounded img-thumbnail thumb" alt=""/>
              <img src={placeholder} className="rounded img-thumbnail thumb" alt=""/>
              <button type="button" className="btn view">View More</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraphicSection;