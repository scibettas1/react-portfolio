import React from "react";
import Banner from "../Banner"
import PortfolioItem from "../PortfolioItem"


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
      <Banner pageTitle="Web Development Portfolio"/>
      <div class="row row-padding">
        <a href="https://group5-proj2.herokuapp.com/"><PortfolioItem image={fiveWire} alt=""/></a>
        <a href="https://eat-the-burger-scibetta.herokuapp.com/"><PortfolioItem image={burger} alt=""/></a>
        <a href="https://scibettas1.github.io/weather/"><PortfolioItem image={weather} alt=""/></a>
        <PortfolioItem image={password} alt=""/>
        <PortfolioItem image={planner} alt=""/>
        <PortfolioItem image={readMe} alt=""/>
        <PortfolioItem image={eTracker} alt=""/>
        <PortfolioItem image="" alt=""/>
        <PortfolioItem image="" alt=""/>
      </div>
    </div>
  );
}

export default Web;
