import React from "react";
import Banner from "../Banner"
import ModalLaunch from "../PortfolioItem";

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
        <div class="row row-padding">
          <ModalLaunch image={crossroads7619} />
          <ModalLaunch image={dingbatz102515} />
          <ModalLaunch image={upcomingShows} />
          <ModalLaunch image={henrietta12912} />
          <ModalLaunch image={clubHouse} />
          <ModalLaunch image={directions} />
          <ModalLaunch image={endingDG} />
          <ModalLaunch image={deadPonies} />
          <ModalLaunch image={waverlyMenu} />
          <ModalLaunch image={song} />
        </div>
      </div>
    </div>
  );
}

export default Graphic;
