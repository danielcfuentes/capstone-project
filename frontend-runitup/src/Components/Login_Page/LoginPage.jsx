import "./LoginPage.css";
function LoginPage() {
  return (
    <div className="login-container">
      <div className="left-side">
        <div className="login-form">
          <h1>Login</h1>
          <form>
            <label>
              Email
              <input type="email" placeholder="Ex. jonas_kahrwaldi@gmail.com" />
            </label>
            <label>
              Password
              <input type="password" />
            </label>
            <button type="submit" className="login-button">
              Log In
            </button>
          </form>
          <p className="login-link">
            Need an account <a href="/signup">Create one</a>
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
