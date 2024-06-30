import React from "react";

function Feed({ user, onLogout }) {
  return (
    <div className="main-container">
      <h1>Welcome!</h1>
      <h1>{user.name}</h1>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default Feed;
