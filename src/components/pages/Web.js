import React from "react";
import Banner from "../Banner"
import ModalLaunch from "../PortfolioItem"


// ----------------------Images----------------------------
import password from "../../images/password_generator.png";
import planner from "../../images/day_planner.png";
import readMe from "../../images/readMe_generator.png";
import eTracker from "../../images/employee_tracker.png";
import fiveWire from "../../images/fivewire.png";
import burger from "../../images/eat-the-burger.png";
import weather from "../../images/weather-app.png";
// -------------------------------------------------------

function Web() {
  return (
    <div>
      <Banner pageTitle="Web Development Portfolio" />
      <div className="container">
        <div class="row row-padding">
          <ModalLaunch image={fiveWire} alt="" />
          <ModalLaunch image={burger} alt="" />
          <ModalLaunch image={weather} alt="" />
          <ModalLaunch image={password} alt="" />
          <ModalLaunch image={planner} alt="" />
          <ModalLaunch image={readMe} alt="" />
          <ModalLaunch image={eTracker} alt="" />
        </div>
      </div>
    </div>
  );
}

export default Web;



{/* <a href="https://group5-proj2.herokuapp.com/"><PortfolioItem image={fiveWire} alt="" /></a>
<a href="https://eat-the-burger-scibetta.herokuapp.com/"><PortfolioItem image={burger} alt="" /></a>
<a href="https://scibettas1.github.io/weather/"><PortfolioItem image={weather} alt="" /></a> */}