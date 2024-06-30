import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Run It Up</h4>
          <p>Your running community</p>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: info@runitup.com</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Run It Up. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
