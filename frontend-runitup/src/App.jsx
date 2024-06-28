import "./App.css";
import SignUp from "./Components/Signup_Page/SignUp";
import LoginPage from "./Components/Login_Page/LoginPage";
import Main from "./Components/Main/Main";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/main" /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/main" />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              user ? <Navigate to="/main" /> : <SignUp onSignUp={handleLogin} />
            }
          />
          <Route
            path="/main"
            element={
              user ? (
                <Main user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
