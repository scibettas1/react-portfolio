import React from "react";
import "../styles/style.css"
import profile from "../images/profile.jpg"


function Hero() {
  return (
    <div>
      <div className="hero">
        <div className="container">
          <div className="row">
            <div className="col-md-7"></div>
            <div className="col-md-5">
              <img src={profile} className="img-fluid rounded-circle profile-img" alt="profile sam scibetta"/>
            </div>
          </div>
          <div className="row">
            <div className="col-md-2"></div>
            <div className="col-md-5">
              <h1>Sam Scibetta<br />
                Graphic &amp; Web<br />
                Designer</h1>
            </div>

            <div className="col-md-5">
              <p>Sam Scibetta graduated from William Paterson University with a BFA in Fine Art, and also attended the Art
                Institute of Pittsburgh.
                She is currenlty studying full-stack web development at Rutgers Coding Bootcamp.
                Sam has explored various mediums including graphic &amp; web design, musical performance &amp; composition, and
                creative writing.
                She has 10+ years of graphic design experience, 15 years of classNameical
                voice training, and is the current singer for the symphonic metal band, Infinitus Mortus.</p>
            </div>
          </div>
        </div>
      </div>
  </div>
  );
}

export default Hero;