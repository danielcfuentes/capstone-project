import React from "react";
import Footer from "../../utils/Footer";
function RecommendationPage({  user  }) {
  return (
    <div className="main-container">
      <h1>Recommendation Page</h1>
      <h1>{user.name}</h1>
      <Footer />
    </div>
  );
}

export default RecommendationPage;
