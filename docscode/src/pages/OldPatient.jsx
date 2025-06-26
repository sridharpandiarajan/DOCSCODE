import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../CSS/OldPatient.css';

function OldPatient() {
  const location = useLocation();
  const navigate = useNavigate();
  const doctorUsername = location.state?.doctorUsername;
  const doctorName = location.state?.doctorName;
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`https://docscode-rttc.vercel.app/patients/doctor/${doctorUsername}`);
        setPatients(res.data);
      } catch (err) {
        console.error("❌ Error fetching patients:", err);
      }
    };

    if (doctorUsername) fetchPatients();
  }, [doctorUsername]);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="view-patient-container">
      <div style={{ textAlign: "right", marginBottom: "15px" }}>
        <button
           onClick={() => {
          if (doctorName && doctorUsername) {
            navigate("/dashboard", { state: { doctorName, doctorUsername } });
          } else {
            alert("Doctor info missing, cannot navigate");
          }
        }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c5ce7",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          🏠 Back to Dashboard
        </button>
      </div>
      <h2>📁 Patients of Dr. {doctorName}</h2>
      <input
        type="text"
        placeholder="🔍 Search by name or ID"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <div className="patient-cards">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => {
            const visitCount = patient.visits?.length || 0;
            const lastVisit = visitCount > 0
              ? patient.visits[visitCount - 1].createdAt
              : null;

            const formattedLastVisit = lastVisit
              ? `${new Date(lastVisit).toLocaleString()} (${new Date(lastVisit).toLocaleDateString('en-US', { weekday: 'long' })})`
              : "N/A";
            return (
              <div key={patient._id} className="patient-card">
                <h4>🧑‍⚕️ {patient.name} ({patient.age}, {patient.gender})</h4>
                <p><strong>🆔 ID:</strong> {patient.patientId}</p>
                <p><strong>🕓 Last Visit:</strong> {formattedLastVisit}</p>
                <p><strong>📋 Visit Count:</strong> {visitCount}</p>
                <button
                    onClick={() =>
                      navigate("/old-patient-details", {
                        state: { patient, doctorName, doctorUsername },
                      })
                    }
                    className="view-btn">View Details</button>

              </div>
            );
          })
        ) : (
          <p>No patients found.</p>
        )}
      </div>
    </div>
  );
}

export default OldPatient;
