import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/">Profile</Link>
        </li>
        <li>
          <Link to="/Leaderboard">Leaderboard</Link>
        </li>
        <li>
          <Link to="/Posts">Posts</Link>
        </li>
      </ul>
    </nav>
  );
}
export default Navbar;
