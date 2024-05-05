import { Link } from "react-router-dom";
import "./Navbar.css";
import { useState } from "react";

function OldNavbar() {
  return (
    <nav className="mynavbar">
      <ul>
        <li>
          <Link to="/">Profile</Link>
        </li>
        {/* <li>
          <Link to="/Crossword">Crossword</Link>
        </li> */}
        <li>
          <Link to="/FivePM">FivePM</Link>
        </li>
        {/* <li>
          <Link to="/Posts">Posts</Link>
        </li> */}
        <li>
          <Link to="/WordGuessGame">TotallyNotWordle</Link>
        </li>
        <li>
          <Link to="/MultiplayerGames">TotallyNotWordle Royale</Link>
        </li>
      </ul>
    </nav>
  );
}

function Navbar2() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <span
        className="navbar-toggle"
        id="js-navbar-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        &#9776;
      </span>
      <Link to="/" className="logo">
        About me
      </Link>
      <ul className={isOpen ? "main-nav active" : "main-nav"}>
        <li>
          <Link to="/" className="nav-links">
            Home
          </Link>
        </li>
        <li>
          <Link to="/FivePM" className="nav-links">
            FivePM
          </Link>
        </li>
        <li>
          <Link to="/WordGuessGame" className="nav-links">
            WordGuessGame
          </Link>
        </li>
        <li>
          <Link to="/MultiplayerGames" className="nav-links">
            MultiplayerGames
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function Navbar() {
  return <div></div>;
}

export default Navbar;
