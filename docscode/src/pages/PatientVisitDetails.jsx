import { useLocation, useNavigate } from 'react-router-dom';
import '../CSS/PatientVisitDetails.css'
function PatientVisitDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { patient, doctorName, doctorUsername } = location.state || {};

  if (!patient) {
    return <p>❌ No patient data found. Please return to the previous page.</p>;
  }

  // Use visits if they exist, otherwise fallback to root-level data
  const visits = Array.isArray(patient.visits) && patient.visits.length > 0
    ? patient.visits
    : (patient.symptoms && patient.prescriptions
        ? [{
            symptoms: patient.symptoms,
            prescriptions: patient.prescriptions,
            createdAt: patient.createdAt || new Date()
          }]
        : []);

  const handleAddData = () => {
    navigate("/add-prescription", {
      state: { patientId: patient.patientId, doctorName, doctorUsername }
    });
  };

  return (
  <div className="center-wrapper">
    <div className="visit-details-container">
      <h2>📌 {patient.name} ({patient.age}, {patient.gender})</h2>
      <p><strong>🆔 ID:</strong> {patient.patientId}</p>

      {visits.length > 0 ? (
        visits.map((visit, index) => (
          <div key={index} className="visit-card">
            <p><strong>🩺 Symptoms:</strong> {visit.symptoms}</p>
            <p><strong>🕓 Visit:</strong> {new Date(visit.createdAt).toLocaleString()}</p>
            <p><strong>💊 Prescriptions:</strong></p>
            <ul>
              {visit.prescriptions.map((p, id) => (
                <li key={id}>
                    <span className="pill">{p.tablet || 'Unnamed Tablet'}</span> – 
                    {p.duration ? ` ${p.duration} days` : ' — days'}, 
                    {p.dosage ? ` ${p.dosage} mg/mL` : ' — mg/mL'} 
                    <span className="timing">[
                        {p.morning ? '🌞 M ' : '❌'}
                        {p.evening ? '🌇 A ' : '❌'}
                        {p.night ? '🌙 N ' : '❌'}
                        {(!p.morning && !p.evening && !p.night) ? 'No time specified' : ''}
                    ]</span>
                </li>

              ))}
            </ul>
            <hr />
          </div>
        ))
      ) : (
        <p>No visits found.</p>
      )}

      <p><strong>Visit Count:</strong> {visits.length}</p>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          <button className="add-data-btn" onClick={handleAddData}>
            ➕ Add Data
          </button>

          <button
            className="back-button"
            onClick={() =>
              navigate("/old-patients", {
                state: { doctorName, doctorUsername },
              })
            }
          >
            🔙 Back to Patients
          </button>
        </div>
 
    </div>
  </div>
  );
}

export default PatientVisitDetails;
