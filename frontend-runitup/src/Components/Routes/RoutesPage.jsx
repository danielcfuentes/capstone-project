import React from "react";
import Header from "../../utils/Header";

function RoutesPage({  user  }) {
  return (
    <div className="main-container">
      <h1>Routes Page</h1>
      <h1>{user.name}</h1>
    </div>
  );
}

export default RoutesPage;
