import React from "react";
import "../../styles/style.css"

function Home() {
  return (
    <div>
      <div class="hero">
        <div class="container">
          <div class="row">
            <div class="col-md-7"></div>
            <div class="col-md-5">
              <img src="images/IMG_0030.JPG" class="img-fluid rounded-circle profile-margin" alt="profile photo of sam scibetta"/>
            </div>
          </div>
          <div class="row">
            <div class="col-md-2"></div>
            <div class="col-md-5">
              <h1>Sam Scibetta<br />
                Graphic &amp; Web<br />
                Designer</h1>
            </div>

            <div class="col-md-5">
              <p>Sam Scibetta graduated from William Paterson University with a BFA in Fine Art, and also attended the Art
                Institute of Pittsburgh.
                She is currenlty studying full-stack web development at Rutgers Coding Bootcamp.
                Sam has explored various mediums including graphic &amp; web design, musical performance &amp; composition, and
                creative writing.
                She has 10+ years of graphic design experience, 15 years of classical
                voice training, and is the current singer for the symphonic metal band, Infinitus Mortus.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="info1">
        <div class="container">
          <h3>WEB DEVELOPMENT</h3>
          <div class="row">
            <div class="col-md-5">
              <h4>HTML | CSS | JAVASCRIPT | ANIMATIONS | UI/UX | API | SQL | MONGODB | REACT | HEROKU | CPANEL | GIT |
                GITHUB | WORDPRESS</h4>
          </div>

          <div class="col-md-7">
              <img src="images/placholder350.jpg" class="rounded img-thumbnail thumb"/>
              <img src="images/placholder350.jpg" class="rounded img-thumbnail thumb"/>
              <img src="images/placholder350.jpg" class="rounded img-thumbnail thumb"/>
              <img src="images/placholder350.jpg" class="rounded img-thumbnail thumb"/>
              <button type="button" class="btn view">View More</button>
            </div>
        </div>
      </div>

      <div class="info2">
        <div class="container">
          <h2>GRAPHIC DESIGN</h2>
          <div class="row">
            <div class="col-md-5">
              <h5>PHOTOSHOP | ADOBE ILLUSTRATOR | INDESIGN | TYPOGRAPHY</h5>
            </div>

            <div class="col-md-7">
              <img src="images/placholder350.jpg" class="rounded img-thumbnail thumb"/>
              <img src="images/placholder350.jpg" class="rounded img-thumbnail thumb"/>
              <img src="images/placholder350.jpg" class="rounded img-thumbnail thumb"/>
              <img src="images/placholder350.jpg" class="rounded img-thumbnail thumb"/>
              <button type="button" class="btn view">View More</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;