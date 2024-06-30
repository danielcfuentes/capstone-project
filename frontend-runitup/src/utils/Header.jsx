import "../styles/Header.css"

const Header = ({onLogout}) => {
  return (
    <header className="header">
      <div className="logo">
        <h3>Run It Up</h3>
      </div>
      <nav className="nav">
        <a href="#routes" className="nav-item">
          Routes
        </a>
        <a href="#feed" className="nav-item">
          Feed
        </a>
        <a href="#recommend" className="nav-item">
          Recommedations
        </a>
        <a href="#logout" className="nav-item" onClick={onLogout}>
          Logout
        </a>
      </nav>
    </header>
  );
};

export default Header;
