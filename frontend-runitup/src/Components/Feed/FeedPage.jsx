import React from "react";
import Header from "../../utils/Header";
import Footer from "../../utils/Footer";
import NavBar from "./NavBar";
import Home from "./Home";

function Feed({ user, onLogout }) {
  return (
    <div className="main-container">
      <Header onLogout={onLogout} />
      <NavBar/>
      <Home />
      <Footer />
    </div>
  );
}

export default Feed;
