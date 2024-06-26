import "./SignUp.css";

function SignUp() {
  return (
    <div className="signup-container">
      <div className="left-side">
        <div className="signup-form">
          <h1>Sign up</h1>
          <p>Sign up to enjoy the features of Run It Up</p>
          <form>
            <label>
              Full Name
              <input type="text" placeholder="Ex. Jonas Khurwaldi" />
            </label>
            <label>
              Email
              <input type="email" placeholder="Ex. jonas_kahrwaldi@gmail.com" />
            </label>
            <label>
              Password
              <input type="password" />
            </label>
            <button type="submit" className="signup-button">
              Sign up
            </button>
          </form>
          <p className="login-link">
            Already have an account? <a href="/login">Sign in</a>
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
