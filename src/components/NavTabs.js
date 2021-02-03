import React from "react";
import { Navbar, Nav, NavItem } from 'react-bootstrap'
import { NavLink } from "react-router-dom";
import resume from "../images/Samantha_Scibetta_resume2020.pdf"

function NavTabs() {

  return (
    <div>
      <Navbar fixed="top" bg="#2f4f4f" expand="lg">
        <Navbar.Brand>Sam Scibetta's Portfolio</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <NavItem>
              <NavLink className="nav-link" to="/">Home</NavLink>
            </NavItem>

            <NavItem>
              <NavLink className="nav-link" to="/web">Web Development</NavLink>
            </NavItem>

            <NavItem>
              <NavLink className="nav-link" to="/graphic">Graphic Design</NavLink>
            </NavItem>

            <NavItem>
              <NavLink to={resume} target="_blank" rel="noreferrer"><button type="button" className="view-btn">Download Resume</button></NavLink>
            </NavItem>

          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}

export default NavTabs;

