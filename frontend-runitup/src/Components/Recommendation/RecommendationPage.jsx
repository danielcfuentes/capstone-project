import React from "react";

function RecommendationPage({  user  }) {
  return (
    <div className="main-container">
      <h1>Recommendation Page</h1>
      <h1>{user.name}</h1>
    </div>
  );
}

export default RecommendationPage;
