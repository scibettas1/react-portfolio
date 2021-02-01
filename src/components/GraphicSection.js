import React from "react";
import "../styles/style.css";
import { Link } from "react-router-dom";

// ----------------------Images---------------------------
import crossroads7619 from "../images/crossroads7-6-19.jpg";
import dingbatz102515 from "../images/dingbatz_10_25_15.jpg";
import upcomingShows from "../images/upcoming-shows.jpg";
import henrietta12912 from "../images/12_9_12_henrietta_hudson.jpg";
// -------------------------------------------------------


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
              <img src={crossroads7619} className="rounded thumb" alt=""/>
              <img src={dingbatz102515} className="rounded thumb" alt=""/>
              <img src={upcomingShows} className="rounded thumb" alt=""/>
              <img src={henrietta12912} className="rounded thumb" alt=""/>
              <Link to="/graphic"><button type="button" className="view-btn">View More</button></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraphicSection;