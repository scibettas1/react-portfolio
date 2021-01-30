import React from "react";
import "../styles/style.css";
import img1 from "../images/crossroads7-6-19.jpg";
import img2 from "../images/dingbatz_10_25_15.jpg";
import img3 from "../images/upcoming-shows.jpg";
import img4 from "../images/12_9_12_henrietta_hudson.jpg";
import { Link } from "react-router-dom";

function GraphicSection() {
  return (
    <div>
      <div className="info2">
        <div className="container">
          <h2>GRAPHIC DESIGN</h2>
          <div className="row">
            <div className="col-md-5">
              <h5>SKILLS: PHOTOSHOP &middot; ADOBE ILLUSTRATOR &middot; INDESIGN &middot; TYPOGRAPHY</h5>
            </div>

            <div className="col-md-7">
              <img src={img1} className="rounded img-thumbnail thumb" alt=""/>
              <img src={img2} className="rounded img-thumbnail thumb" alt=""/>
              <img src={img3} className="rounded img-thumbnail thumb" alt=""/>
              <img src={img4} className="rounded img-thumbnail thumb" alt=""/>
              <Link to="/graphic"><button type="button" className="btn view">View More</button></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraphicSection;