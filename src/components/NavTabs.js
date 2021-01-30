import React from "react";
import { Link } from "react-router-dom";

function NavTabs() {

  return (
    <div><a href="#offcanvas-slide" class="uk-button uk-button-default" uk-toggle>Menu</a>
      <div id="offcanvas-slide" uk-offcanvas>
        <div className="uk-offcanvas-bar">
          <ul className="uk-nav uk-nav-default">
            <li className="uk-nav-header">Sam Scibetta's Portfolio</li>
            <li><Link to="/">
              Home</Link></li>
            <li><Link to="/web">
              Web Development</Link></li>
            <li><Link to="/graphic">
              Graphic Design</Link></li>
            <li className="uk-nav-divider"></li>
            <li>
              <button type="button" className="btn btn-light">Download Resume</button></li>
          </ul>

        </div>
      </div>
    </div>
  );
}

export default NavTabs;
