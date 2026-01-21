import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import '../CSS/ViewPatients.css';
import '../CSS/DashBoard.css'; 

function ViewPatients() {
  const location = useLocation();
  const navigate = useNavigate();
  const doctorUsername = location.state?.doctorUsername;
  const doctorName = location.state?.doctorName;
  
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`https://docscode-3.onrender.com/patients/doctor/${doctorUsername}`);
        setPatients(res.data);

        // OPTIONAL: If you strictly want to delete them from the Database automatically, 
        // you would uncomment the logic below. (Use with caution!)
        /*
        const emptyPatients = res.data.filter(p => !p.visits || p.visits.length === 0);
        if (emptyPatients.length > 0) {
          console.log(`Cleaning up ${emptyPatients.length} empty records...`);
          // Promise.all(emptyPatients.map(p => axios.delete(`https://docscode-3.onrender.com/patients/${p._id}`)));
        }
        */

      } catch (err) {
        console.error("❌ Error fetching patients:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (doctorUsername) fetchPatients();
  }, [doctorUsername]);

  // Filter Logic: Search Term + Non-Zero Visits
  const filteredPatients = patients.filter(p => {
    // 1. Match Name or ID
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Remove if Visit Count is 0 (Clean UI)
    const hasVisits = p.visits && p.visits.length > 0;

    return matchesSearch && hasVisits;
  });

  // Helper for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar doctorName={doctorName} />

      <main className="main-content">
        <Topbar doctorName={doctorName} />

        <div className="view-patient-wrapper">
          
          {/* Header Section */}
          <div className="view-header">
            <div>
              <h2 className="page-heading">Patient Directory</h2>
              {/* Count now reflects only patients with actual visits */}
              <p className="page-subheading">Total Patients: {filteredPatients.length}</p>
            </div>
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by Name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-search-bar"
              />
            </div>
          </div>

          {/* Table Section */}
          <div className="table-container">
            <table className="patients-table">
              <thead>
                <tr>
                  <th style={{width: '20%'}}>Patient Name</th>
                  <th style={{width: '15%'}}>ID</th>
                  <th style={{width: '15%'}}>Age / Gender</th>
                  <th style={{width: '30%'}}>Last Visit Symptoms</th>
                  <th style={{width: '20%'}}>Last Visit Date</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => {
                    // We know visits exist because of the filter above
                    const lastVisit = patient.visits[patient.visits.length - 1];
                    
                    return (
                      <tr key={patient._id} className="patient-row">
                        <td>
                          <div className="patient-cell">
                            <div className="avatar-small">
                              {patient.gender === "Female" ? "👩" : "👨"}
                            </div>
                            <span className="name-text">{patient.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="id-badge">{patient.patientId}</span>
                        </td>
                        <td>{patient.age} / {patient.gender}</td>
                        <td className="symptoms-cell">
                          {lastVisit?.symptoms ? (
                            <span className="symptoms-text">{lastVisit.symptoms}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{formatDate(lastVisit?.createdAt)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      {isLoading ? "Loading records..." : "No active patient records found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}

export default ViewPatients;