import React from "react";
import Banner from "../Banner"
import PortfolioItem from "../PortfolioItem"

function Web() {
  return (
    <div>
      <Banner pageTitle="Web Development Portfolio"/>
      <div class="row row-padding">
        <PortfolioItem image="" target="" alt="" description=""/>
        <PortfolioItem image="" target="" alt="" description=""/>
        <PortfolioItem image="" target="" alt="" description=""/>
        <PortfolioItem image="" target="" alt="" description=""/>
      </div>
      <div class="row row-padding">
        <PortfolioItem image="" target="" alt="" description=""/>
        <PortfolioItem image="" target="" alt="" description=""/>
        <PortfolioItem image="" target="" alt="" description=""/>
        <PortfolioItem image="" target="" alt="" description=""/>
      </div>
    </div>
  );
}

export default Web;
