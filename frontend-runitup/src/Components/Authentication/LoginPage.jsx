import "../../styles/LoginPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleChangeUser = (e) => {
    setUsername(e.target.value);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to login");
        }
      })
      .then((data) => {
        onLogin({ name: username }, data.accessToken, data.refreshToken);
        navigate("/feed");
      })
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <div className="login-form">
          <h1>Login</h1>
          <form>
            <label>
              Username
              <input
                type="text"
                placeholder="Ex. J_Kahrwaldi"
                id="username"
                value={username}
                onChange={handleChangeUser}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                id="password"
                value={password}
                onChange={handleChangePassword}
                required
              />
            </label>
            <button
              type="submit"
              className="login-button"
              onClick={handleLogin}
            >
              Login
            </button>
          </form>
          <p className="login-link">
            Need an account?{" "}
            <button onClick={() => navigate("/signup")}>Sign Up</button>
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

export default LoginPage;
