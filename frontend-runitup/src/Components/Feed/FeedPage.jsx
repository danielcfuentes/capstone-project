import React from "react";

import NavBar from "./NavBar";
import AddButton from "./AddButton";

function Feed({ user }) {
  return (
    <div className="feed-page">
      <NavBar />
      <AddButton />
    </div>
  );
}

export default Feed;
