import "../../styles/SignUp.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleChangeUser = (e) => {
    setUsername(e.target.value);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleCreate = (e) => {
    e.preventDefault();

    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/create`, {
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
          navigate("/login");
        } else {
          throw new Error("Failed to create account");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="signup-container">
      <div className="left-side">
        <div className="signup-form">
          <h1>Sign up</h1>
          <p>Sign up to enjoy the features of Run It Up</p>
          <form>
            <label>
              Username
              <input
                type="text"
                placeholder="Ex. J_Khurwaldi"
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
              className="signup-button"
              onClick={handleCreate}
            >
              Sign up
            </button>
          </form>
          <p className="login-link">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")}>Login</button>
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
