import React from "react";
import Banner from "../Banner"
import ModalLaunchWeb from "../PortfolioItemWeb"
import Footer from "../Footer"


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
      <div className="container pushFooter">
        <div class="row row-padding">
          <ModalLaunchWeb image={fiveWire} link="https://group5-proj2.herokuapp.com/" repo="" description="this is a description" alt="" />
          <ModalLaunchWeb image={burger} link="https://eat-the-burger-scibetta.herokuapp.com/" repo="" description="this is a description" alt="" />
          <ModalLaunchWeb image={weather} link="https://scibettas1.github.io/weather/" repo="" description="this is a description" alt="" />
          <ModalLaunchWeb image={password} link="" repo="" description="this is a description" alt="" />
          <ModalLaunchWeb image={planner} link="" repo="" description="this is a description" alt="" />
          <ModalLaunchWeb image={readMe} link="" repo="" description="this is a description" alt="" />
          <ModalLaunchWeb image={eTracker} link="" repo="" description="this is a description" alt="" />
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default Web;
