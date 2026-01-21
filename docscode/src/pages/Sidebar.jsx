import { useNavigate, useLocation } from "react-router-dom";
import '../CSS/Sidebar.css'; 

function Sidebar({ doctorName }) { 
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.clear(); 
    localStorage.clear(); 
    navigate("/", { replace: true });
  };

  const initial = doctorName ? doctorName.charAt(0).toUpperCase() : "D";
  
  // Safe access to username to persist it across navigation
  const doctorUsername = location.state?.doctorUsername;

  // Helper to determine if a path is active
  const isActive = (path) => location.pathname === path;

  // Reusable function to handle navigation with state
  const handleNav = (path) => {
    navigate(path, { state: { doctorName, doctorUsername } });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">🩺</div>
        <h2 className="logo-text">Doc's CODE</h2>
      </div>
      
      <nav className="sidebar-nav">
        
        {/* Dashboard */}
        <div 
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => handleNav('/dashboard')}
        >
          <span className="nav-icon">🏠</span> Dashboard
        </div>

        {/* Add Patient */}
        <div 
          className={`nav-item ${isActive('/add-patient') ? 'active' : ''}`}
          onClick={() => handleNav('/add-patient')}
        >
          <span className="nav-icon">➕</span> New Consultation
        </div>

        {/* Returning Patient */}
        <div 
          className={`nav-item ${isActive('/old-patients') ? 'active' : ''}`}
          onClick={() => handleNav('/old-patients')}
        >
          <span className="nav-icon">📂</span> Returning Patient
        </div>

        {/* Patient Directory */}
        <div 
          className={`nav-item ${isActive('/view-patients') ? 'active' : ''}`}
          onClick={() => handleNav('/view-patients')}
        >
          <span className="nav-icon">📋</span> Patient Directory
        </div>

      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {initial}
          </div>
          <div className="user-info">
            <p className="user-name">Dr. {doctorName}</p>
            <span className="user-role">Online</span>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;