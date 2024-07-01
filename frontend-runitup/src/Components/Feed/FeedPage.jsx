import React from "react";
import Header from "../../utils/Header";
import Footer from "../../utils/Footer";
import NavBar from "./NavBar";
function Feed({ user, onLogout }) {
  return (
    <div className="main-container">
      <Header onLogout={onLogout} />
      <NavBar/>
      <h1>Welcome to Feeds Page!</h1>
      <h1>{user.name}</h1>
      <Footer />
    </div>
  );
}

export default Feed;
