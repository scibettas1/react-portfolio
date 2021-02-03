import React from "react";
import Banner from "../Banner"
import ModalLaunchGraphic from "../PortfolioItemGraphic";

// ----------------------Images---------------------------------
import crossroads7619 from "../../images/crossroads7-6-19.jpg";
import dingbatz102515 from "../../images/dingbatz_10_25_15.jpg";
import upcomingShows  from "../../images/upcoming-shows.jpg";
import henrietta12912 from "../../images/12_9_12_henrietta_hudson.jpg";
import clubHouse from "../../images/clubhouse_recording_logo.jpg";
import directions from "../../images/directions_interpretation.jpg";
import endingDG from "../../images/ending_dan_gordon_band_logo.jpg";
import song from "../../images/song_interpretation.jpg";
import deadPonies from "../../images/the_dead_ponies_band_logo.jpg";
import waverlyMenu from "../../images/Waverly_Menu.jpg";
// -------------------------------------------------------------


function Graphic() {
  return (
    <div>
      <Banner pageTitle="Graphic Design Portfolio" />
      <div className="container">
        <div className="row row-padding">
          <ModalLaunchGraphic image={crossroads7619} description="this is a description" alt=""  />
          <ModalLaunchGraphic image={dingbatz102515} description="this is a description" alt=""  />
          <ModalLaunchGraphic image={upcomingShows} description="this is a description" alt=""  />
          <ModalLaunchGraphic image={henrietta12912} description="this is a description" alt=""  />
          <ModalLaunchGraphic image={clubHouse} description="this is a description" alt=""  />
          <ModalLaunchGraphic image={directions} description="this is a description" alt=""  />
          <ModalLaunchGraphic image={endingDG} description="this is a description" alt=""  />
          <ModalLaunchGraphic image={deadPonies} description="this is a description" alt=""  />
          <ModalLaunchGraphic image={waverlyMenu} description="this is a description" alt=""  />
          <ModalLaunchGraphic image={song} description="this is a description" alt=""  />
        </div>
      </div>
    </div>
  );
}

export default Graphic;
