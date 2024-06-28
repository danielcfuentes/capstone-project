import React from "react";

function Main({ user, onLogout }) {
  console.log(user.user.username);
  return (
    <div className="main-container">
      <h1>Welcome!</h1>
      <h1>{user.user.username}</h1>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default Main;
