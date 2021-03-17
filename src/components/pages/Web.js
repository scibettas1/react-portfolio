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
          <ModalLaunchWeb image={fiveWire} link="https://group5-proj2.herokuapp.com/" repo="https://github.com/scibettas1/5Wire" title="5Wire" description="Full-stack music application that allows the user to create and save their own playlists. Group project using HTML, CSS, BootStrap JavaScript, Spotify API, and MongoDB, deployed on Heroku." alt="music player website" />
          <ModalLaunchWeb image={burger} link="https://eat-the-burger-scibetta.herokuapp.com/" repo="https://github.com/scibettas1/eat-the-burger" title="Eat the Burger" description="Full-stack application that allows you to create a burger, eat it, and delete it. Created using HTML, CSS, BootStrap, JavaScript, and MySQL, deployed on Heroku." alt="eat the burger application" />
          <ModalLaunchWeb image={weather} link="https://scibettas1.github.io/weather/" repo="https://github.com/scibettas1/weather" title="Front-end weather application that pulls weather data by location. Created with HTML, CSS, BootStrap, JavaScript, and Open Weathermap API." description="this is a description" alt="" />
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
