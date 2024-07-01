import React from "react";
import Footer from "../../utils/Footer";
function Feed({ user }) {
  return (
    <div className="main-container">
      <h1>Welcome to Feeds Page!</h1>
      <h1>{user.name}</h1>
      <Footer />
    </div>
  );
}

export default Feed;
