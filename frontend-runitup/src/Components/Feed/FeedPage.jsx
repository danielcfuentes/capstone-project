import React from "react";
import Header from "../../utils/Header";
function Feed({ user, onLogout }) {
  return (
    <div className="main-container">
      <Header onLogout={onLogout} />
      <h1>Welcome!</h1>
      <h1>{user.name}</h1>
    </div>
  );
}

export default Feed;
