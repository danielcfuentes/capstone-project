import React from "react";
import Header from "../../utils/Header";
function RecommendationPage({user, onLogout}) {
  return (
    <div className="main-container">
      <Header onLogout={onLogout} />
      <h1>Recommendation Page</h1>
    </div>
  );
}

export default RecommendationPage;
