import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./components/pages/Home";
import Web from "./components/pages/Web";
import Graphic from "./components/pages/Graphic";

function App() {
  return (
    <Router>
      <div>
        <Nav />
        <Route exact path={["/", "/home"]}>
          <Home />
        </Route>
        <Route exact path="/web">
          <Web />
        </Route>
        <Route exact path="/graphic">
          <Graphic />
        </Route>
      </div>
    </Router>
  );
}

export default App;

