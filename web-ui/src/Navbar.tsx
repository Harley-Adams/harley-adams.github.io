import { Link } from "react-router-dom";
import "./Navbar.css";
import { CContainer, CNavbar, CNavbarBrand } from "@coreui/react";

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
        <li>
          <Link to="/Posts">Posts</Link>
        </li>
      </ul>
    </nav>
    // <CNavbar colorScheme="light" className="bg-light">
    //   <CContainer fluid>
    //     <CNavbarBrand className="mb-0 h1" href="/">
    //       Profile
    //     </CNavbarBrand>
    //     <CNavbarBrand className="mb-0 h1" href="/Leaderboard">
    //       Leaderboard
    //     </CNavbarBrand>
    //     <CNavbarBrand className="mb-0 h1" href="/Posts">
    //       Posts
    //     </CNavbarBrand>
    //   </CContainer>
    // </CNavbar>
  );
}
export default Navbar;
