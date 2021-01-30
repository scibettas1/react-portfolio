import React from "react";
import Banner from "../Banner"
import PortfolioItem from "../PortfolioItem"
import portfolio from "../../portfolio.json";

function Graphic() {
  return (
    <div>
      <Banner pageTitle="Graphic Design Portfolio" />
      <div className="container">
        <div class="row row-padding">
          <PortfolioItem image={portfolio[0].image} target={portfolio[0].target}
            alt={portfolio[0].alt} description={portfolio[0].description} />
          <PortfolioItem image={portfolio[0].image} target={portfolio[0].target}
            alt={portfolio[0].alt} description={portfolio[0].description} />
          <PortfolioItem image={portfolio[0].image} target={portfolio[0].target}
            alt={portfolio[0].alt} description={portfolio[0].description} />
          <PortfolioItem image={portfolio[0].image} target={portfolio[0].target}
            alt={portfolio[0].alt} description={portfolio[0].description} />
        </div>
        <div class="row row-padding">
          <PortfolioItem image={portfolio[0].image} target={portfolio[0].target}
            alt={portfolio[0].alt} description={portfolio[0].description} />
          <PortfolioItem image={portfolio[0].image} target={portfolio[0].target}
            alt={portfolio[0].alt} description={portfolio[0].description} />
          <PortfolioItem image={portfolio[0].image} target={portfolio[0].target}
            alt={portfolio[0].alt} description={portfolio[0].description} />
          <PortfolioItem image={portfolio[0].image} target={portfolio[0].target}
            alt={portfolio[0].alt} description={portfolio[0].description} />
        </div>
      </div>
    </div>
  );
}

export default Graphic;
