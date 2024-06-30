import React from "react";
import Header from "../../utils/Header";
function RoutesPage({user, onLogout}) {
  return (
    <div className="main-container">
        <Header onLogout={onLogout}/>
      <h1>Routes Page</h1>
    </div>
  );
}

export default RoutesPage;
