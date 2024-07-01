import "../../styles/Sidebar.css";
function HomeSidebar() {
  return (
    <>
      <body className="sidebar-body">
        <aside className="sidebar">
          <div className="header">
            <img src="logo.svg" />
            <h1>Run It Up</h1>
          </div>
          <nav>
            <a>
              <i className="ai-search"></i>
              <p>Search</p>
            </a>
            <a>
              <i className="ai-home"></i>
              <p>Home</p>
            </a>
            <a>
              <i className="ai-folder"></i>
              <p>Projects</p>
            </a>
            <a>
              <i className="ai-dashboard"></i>
              <p>Dashboard</p>
            </a>
            <a>
              <i className="ai-person"></i>
              <p>Team</p>
            </a>
            <a>
              <i className="ai-envelope"></i>
              <p>Support</p>
            </a>
            <a>
              <i className="ai-gear"></i>
              <p>Settings</p>
            </a>
          </nav>
        </aside>
      </body>
    </>
  );
}

export default HomeSidebar;
