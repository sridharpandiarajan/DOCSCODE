import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../CSS/Topbar.css'; 

function Topbar({ doctorName }) {
  const location = useLocation();
  const [greeting, setGreeting] = useState("Good Morning");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // 1. Path to Title Mapping
  const getPageTitle = (path) => {
    switch(path) {
      case "/add-patient": return "New Consultation";
      case "/old-patients": return "Returning Patient";
      case "/view-patients": return "Patient Directory";
      case "/patient-details": return "Patient Details";
      case "/old-patient-details": return "Medical History";
      default: return "Medical Portal";
    }
  };

  useEffect(() => {
    // 2. Logic for Dynamic Greeting (Only needed for dashboard)
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
    else if (hour >= 17) setGreeting("Good Evening");

    // 3. Live Clock Timer (Updates every second)
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, []);

  const initial = doctorName ? doctorName.charAt(0).toUpperCase() : "D";
  
  // Check if we are on the dashboard
  const isDashboard = location.pathname === '/dashboard';

  // Format Date: "Wednesday, Jan 21, 2026"
  const dateOptions = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  const dateString = currentDateTime.toLocaleDateString('en-US', dateOptions);

  // Format Time: "10:45:30 AM"
  const timeString = currentDateTime.toLocaleTimeString('en-US');

  return (
    <header className="top-header">
      {/* Left Section: Context Aware Title */}
      <div className="welcome-section">
        <h1 className="greeting-title">
          {isDashboard ? (
            // Show Greeting + Name ONLY on Dashboard
            <>
              {greeting}, <span className="highlight-name">Dr. {doctorName}</span>
            </>
          ) : (
            // Show Page Title on other pages
            <span className="page-title">{getPageTitle(location.pathname)}</span>
          )}
        </h1>
        
        {/* Date and Time with Seconds */}
        <p className="date-subtitle">
          📅 {dateString} &nbsp; | &nbsp; ⏰ {timeString}
        </p>
      </div>

      {/* Right Section: Icons & Profile */}
      <div className="header-actions">
        <div className="icon-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="notification-dot"></span>
        </div>

        <div className="profile-badge">
          <div className="avatar">{initial}</div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;