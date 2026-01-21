import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import '../CSS/OldPatient.css';
import '../CSS/DashBoard.css'; 

function OldPatient() {
  const location = useLocation();
  const navigate = useNavigate();
  const doctorUsername = location.state?.doctorUsername;
  const doctorName = location.state?.doctorName;
  
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("All"); 
  const [sortOrder, setSortOrder] = useState("Latest"); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`https://docscode-3.onrender.com/patients/doctor/${doctorUsername}`);
        setPatients(res.data);
      } catch (err) {
        console.error("❌ Error fetching patients:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (doctorUsername) fetchPatients();
  }, [doctorUsername]);

  // --- 1. Filter Logic (Updated) ---
  let processedPatients = patients.filter(p => {
    // Search by Name or ID
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by Gender
    const matchesFilter = filterGender === "All" || p.gender === filterGender;

    // **NEW CHECK: Must have at least 1 visit**
    const hasVisits = p.visits && p.visits.length > 0;

    return matchesSearch && matchesFilter && hasVisits;
  });

  // --- 2. Sort Logic ---
  processedPatients.sort((a, b) => {
    // Helper to get date safely (we know visits > 0 due to filter above)
    const getDate = (p) => new Date(p.visits[p.visits.length - 1].createdAt);
    
    // Helper to get visit count
    const getCount = (p) => p.visits.length;

    if (sortOrder === "Latest") {
        return getDate(b) - getDate(a); // Descending Date
    } 
    else if (sortOrder === "MostVisits") {
        return getCount(b) - getCount(a); // Descending Count
    } 
    else if (sortOrder === "FewestVisits") {
        return getCount(a) - getCount(b); // Ascending Count
    }
    return 0;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar doctorName={doctorName} />

      <main className="main-content">
        <Topbar doctorName={doctorName} />

        <div className="directory-container">
          <div className="directory-header">
            <div>
              <h2>Patient Directory</h2>
              <p>Manage and view all registered patients.</p>
            </div>
            
            <div className="controls-wrapper">
              
              {/* Sort Dropdown */}
              <select 
                className="filter-dropdown"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="Latest">🕒 Latest Visit</option>
                <option value="MostVisits">⬆️ Most Visits</option>
                <option value="FewestVisits">⬇️ Fewest Visits</option>
              </select>

              {/* Filter Dropdown */}
              <select 
                className="filter-dropdown"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              {/* Search Bar */}
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search Name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-search-bar"
                />
              </div>
            </div>
          </div>

          {isLoading && <div className="loading-state">Loading patient records...</div>}

          <div className="patient-grid">
            {!isLoading && processedPatients.length > 0 ? (
              processedPatients.map((patient) => {
                const visitCount = patient.visits.length; // Safe to access directly now
                const lastVisit = patient.visits[visitCount - 1].createdAt;

                return (
                  <div key={patient._id} className="modern-patient-card">
                    <div className="card-top">
                      <div className="patient-avatar">
                        {patient.gender === "Female" ? "👩" : "👨"}
                      </div>
                      <div className="patient-main-info">
                        <h4>{patient.name}</h4>
                        <span className="patient-id">{patient.patientId}</span>
                      </div>
                    </div>
                    
                    <div className="card-details">
                      <div className="detail-row">
                        <span className="label">Age/Gender:</span>
                        <span className="value">{patient.age} / {patient.gender}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Last Visit:</span>
                        <span className="value">{formatDate(lastVisit)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Total Visits:</span>
                        <span className="badge">{visitCount}</span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate("/old-patient-details", {
                          state: { patient, doctorName, doctorUsername },
                        })
                      }
                      className="view-details-btn"
                    >
                      View Medical History
                    </button>
                  </div>
                );
              })
            ) : (
              !isLoading && (
                <div className="empty-state">
                  <p>No patients found matching your criteria.</p>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default OldPatient;