import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import NavTabs from "./components/NavTabs";
import Home from "./components/pages/Home";
import Graphic from "./components/pages/Graphic";
import Web from "./components/pages/Web";

function App() {
  return (
    <Router>
      <div>
        <NavTabs />
        <Route exact path={["/", "/home"]} component={Home} />
        <Route exact path="/web" component={Web} />
        <Route exact path="/graphic" component={Graphic} />
      </div>
    </Router>
  );
}

export default App;
