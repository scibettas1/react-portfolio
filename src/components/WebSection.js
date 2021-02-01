import React from "react";
import "../styles/style.css";
import password from "../images/password_generator.png";
import planner from "../images/day_planner.png";
import readMe from "../images/readMe_generator.png";
import eTracker from "../images/employee_tracker.png";
import { Link } from "react-router-dom";

function WebSection() {
  return (
    <div>
      <div className="info1">
        <div className="container">
          <h3>WEB DEVELOPMENT</h3>
          <div className="row">
            <div className="col-md-5">
              <h4>SKILLS: HTML &middot; CSS &middot; JAVASCRIPT &middot; ANIMATIONS &middot; UI/UX &middot; API &middot; SQL &middot; MONGODB &middot; REACT &middot; HEROKU &middot; CPANEL &middot; GIT &middot;
                GITHUB &middot; WORDPRESS</h4>
          </div>

          <div className="col-md-7">
              <img src={password} className="rounded thumb" alt=""/>
              <img src={planner} className="rounded thumb" alt=""/>
              <img src={readMe} className="rounded thumb" alt=""/>
              <img src={eTracker} className="rounded thumb" alt=""/>
              <Link to="/web"><button type="button" className="view-btn">View More</button></Link>
            </div>
        </div>
      </div>
    </div>
  </div>
  );
}

export default WebSection;