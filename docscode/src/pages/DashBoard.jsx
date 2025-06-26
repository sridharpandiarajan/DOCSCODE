import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import '../CSS/DashBoard.css';

function DashBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const doctorName = location.state?.doctorName || "Doctor";
  const doctorUsername = location.state?.doctorUsername || "";

  const [totalPatients, setTotalPatients] = useState(0);
  const [patientsToday, setPatientsToday] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`https://docscode-3.onrender.com/patients/stats/${doctorUsername}`);
        setTotalPatients(res.data.totalPatients);
        setPatientsToday(res.data.patientsToday);
      } catch (err) {
        console.error("❌ Error fetching stats:", err);
      }
    };

    if (doctorUsername) fetchStats();
  }, [doctorUsername]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">🏥 Doc's CODE Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, Dr. {doctorName}</p>
      </header>

      <main className="dashboard-main">
        <button
          className="dashboard-button"
          onClick={() => navigate("/add-patient", { state: { doctorName, doctorUsername } })}>
          Add New Patient
        </button>
        <button
          className="dashboard-button"
          onClick={() => navigate("/old-patients", { state: { doctorName, doctorUsername } })}>
          Old Patient
        </button>
        <button
          className="dashboard-button"
          onClick={() => navigate("/view-patients", { state: { doctorName, doctorUsername } })}>
          View Patients
        </button>
      </main>

      <div className="stats-card">
        <h4 className="stats-title">📊 Patients Treated</h4>
        <p>Total: <strong>{totalPatients}</strong></p>
        <p>Today: <strong>{patientsToday}</strong></p>
      </div>
    </div>
  );
}

export default DashBoard;
