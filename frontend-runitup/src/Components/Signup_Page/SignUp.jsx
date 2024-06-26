import "./SignUp.css";
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext.js";

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make the signup API request
      const response = await fetch(`http://localhost:3000/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const loggedInUser = data.user;

        console.log("Signup successful");

        // Reset form fields
        setUsername("");
        setEmail("");
        setPassword("");

        // Update the user context
        updateUser(loggedInUser);

        // Navigate to the home page after successful login
        navigate("/");
      } else {
        // Handle signup failure case
        alert("Signup failed");
      }
    } catch (error) {
      // Handle any network or API request errors
      alert("Signup failed: " + error);
    }
  };

  return (
    <div className="signup-container">
      <div className="left-side">
        <div className="signup-form">
          <h1>Sign up</h1>
          <p>Sign up to enjoy the features of Run It Up</p>
          <form onSubmit={handleSubmit}>
            <label>
              Username
              <input
                type="text"
                placeholder="Ex. J_Khurwaldi"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                placeholder="Ex. jonas_kahrwaldi@gmail.com"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="signup-button">
              Sign up
            </button>
          </form>
          <p className="login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
      <div className="right-side">
        <img
          src="https://transform.octanecdn.com/crop/1000x600/https://octanecdn.com/prolianceorthopedicassociatescom/run-or-walk-1-1.jpg"
          alt="signup background"
        />
        <h2>RUN IT UP</h2>
      </div>
    </div>
  );
}

export default SignUp;
