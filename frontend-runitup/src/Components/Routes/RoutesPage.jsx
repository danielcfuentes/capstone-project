import React from "react";
import Header from "../../utils/Header";
import Footer from "../../utils/Footer";
function RoutesPage({ user, onLogout }) {
  return (
    <div className="main-container">
      <Header onLogout={onLogout} />
      <h1>Routes Page</h1>
      <h1>{user.name}</h1>
      <Footer />
    </div>
  );
}

export default RoutesPage;
