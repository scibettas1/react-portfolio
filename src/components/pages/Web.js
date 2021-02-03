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
          <ModalLaunch image={fiveWire} link="https://group5-proj2.herokuapp.com/" repo="" description="" alt="" />
          <ModalLaunch image={burger} link="https://eat-the-burger-scibetta.herokuapp.com/" repo="" description="" alt="" />
          <ModalLaunch image={weather} link="https://scibettas1.github.io/weather/" repo="" description="" alt="" />
          <ModalLaunch image={password} link="" repo="" description="" alt="" />
          <ModalLaunch image={planner} link="" repo="" description="" alt="" />
          <ModalLaunch image={readMe} link="" repo="" description="" alt="" />
          <ModalLaunch image={eTracker} link="" repo="" description="" alt="" />
        </div>
      </div>
    </div>
  );
}

export default Web;
