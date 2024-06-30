import "../styles/Header.css";
import { Link, NavLink } from "react-router-dom";
const Header = ({ onLogout }) => {
  return (
    <header className="header">
      <div className="logo">
        <h3>Run It Up</h3>
      </div>
      <nav className="nav">
        <NavLink to="/routes" className="nav-item" activeclassname="active">
          Routes
        </NavLink>
        <NavLink to="/feed" className="nav-item" activeclassname="active">
          Feed
        </NavLink>
        <NavLink
          to="/recommendations"
          className="nav-item"
          activeclassname="active"
        >
          Recommendations
        </NavLink>
        <a href="#logout" className="nav-item" onClick={onLogout}>
          Logout
        </a>
      </nav>
    </header>
  );
};

export default Header;
