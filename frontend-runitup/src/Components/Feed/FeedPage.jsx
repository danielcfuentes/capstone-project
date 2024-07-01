import React from "react";

function Feed({ user }) {
  return (
    <div className="main-container">
      <h1>Welcome to Feeds Page!</h1>
      <h1>{user.name}</h1>
    </div>
  );
}

export default Feed;
