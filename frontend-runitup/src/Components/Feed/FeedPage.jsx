import React from "react";

import NavBar from "./NavBar";
import Home from "./Home";

function Feed({ user }) {
  return (
    <div className="main-container">
      <NavBar/>
      <Home />
    </div>
  );
}

export default Feed;
