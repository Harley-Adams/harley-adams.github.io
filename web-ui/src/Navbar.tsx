import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="mynavbar">
      <ul>
        <li>
          <Link to="/">Profile</Link>
        </li>
        <li>
          <Link to="/Leaderboard">Leaderboard</Link>
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
          <Link to="/WordGuessGame">WordGuessGame</Link>
        </li>
        <li>
          <Link to="/Lobby">LobbyPrototype</Link>
        </li>
      </ul>
    </nav>
  );
}
export default Navbar;
