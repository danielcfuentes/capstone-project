import React from "react";
import Header from "../../utils/Header";
import Footer from "../../utils/Footer";
function RecommendationPage({ user, onLogout }) {
  return (
    <div className="main-container">
      <Header onLogout={onLogout} />
      <h1>Recommendation Page</h1>
      <h1>{user.name}</h1>
      <Footer />
    </div>
  );
}

export default RecommendationPage;
