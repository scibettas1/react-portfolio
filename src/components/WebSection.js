import React from "react";
import "../styles/style.css"
import placeholder from "../images/placholder350.jpg"

function WebSection() {
  return (
    <div>
      <div className="info1">
        <div className="container">
          <h3>WEB DEVELOPMENT</h3>
          <div className="row">
            <div className="col-md-5">
              <h4>HTML | CSS | JAVASCRIPT | ANIMATIONS | UI/UX | API | SQL | MONGODB | REACT | HEROKU | CPANEL | GIT |
                GITHUB | WORDPRESS</h4>
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

export default WebSection;