import React from "react";
import "../styles/style.css"

// ----------------------Images---------------------------
import profile from "../images/profile.jpg";
import facebook from "../images/facebook.png";
import linkedin from "../images/linkedin.png";
import github from "../images/github.png";
// -------------------------------------------------------


function Hero() {
  return (
    <div>
      <div className="hero">
        <div className="container">
          <div className="row">
            <div className="col-md-7"></div>
            <div className="col-md-5">
              <img src={profile} className="rounded-circle profile-img" alt="profile sam scibetta"/>
            </div>
          </div>
          <div className="row">
            <div className="col-md-2"></div>
            <div className="col-md-5">
              <h1>Sam Scibetta<br />
                Graphic &amp; Web<br />
                Designer</h1>
                <a href="https://www.facebook.com/int3stine.no0se/" target="_blank" rel="noreferrer"><img src={facebook} className="social-icon" alt="facebook logo"/></a>
                <a href="https://www.linkedin.com/in/samantha-scibetta/" target="_blank" rel="noreferrer"><img src={linkedin} className="social-icon" alt="linkedin logo"/></a>
                <a href="https://github.com/scibettas1" target="_blank" rel="noreferrer"><img src={github} className="social-icon" alt="github logo"/></a>
            </div>

            <div className="col-md-5">
              <p>Sam Scibetta graduated from William Paterson University with a BFA in Fine Art, and also attended the Art
                Institute of Pittsburgh.
                She is currently studying full-stack web development at Rutgers Coding Bootcamp.
                She has 10+ years of graphic design experience.</p>
            </div>
          </div>
        </div>
      </div>
  </div>
  );
}

export default Hero;