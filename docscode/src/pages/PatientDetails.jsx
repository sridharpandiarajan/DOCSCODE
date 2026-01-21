import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../CSS/PatientDetails.css";
import "../CSS/DashBoard.css"; 
import MedicineAutocomplete from "../components/MedicineAutocomplete";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function PatientDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient;
  const doctorName = location.state?.doctorName || "Doctor";
  const doctorUsername = location.state?.doctorUsername; 

  const [symptoms, setSymptoms] = useState("");
  const [medications, setMedications] = useState([
    { tablet: "", morning: false, evening: false, night: false, duration: "", dosage: "" },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  // --- Logic Handlers (Keep exactly as they were) ---
  const handleChange = (index, field, value) => {
    const updated = [...medications];
    if (["tablet", "duration", "dosage"].includes(field)) {
      updated[index][field] = value;
    } else {
      updated[index][field] = !updated[index][field];
    }
    setMedications(updated);
  };

  const addRow = () => {
    setMedications([...medications, { tablet: "", morning: false, evening: false, night: false, duration: "", dosage: "" }]);
  };

  const removeRow = (index) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const handleSaveToDB = async () => {
    if (!symptoms.trim()) { alert("❗ Please enter symptoms."); return; }
    if (medications.length === 0 || medications.some(m => !m.tablet)) { alert("❗ Please add medicine."); return; }

    setIsSaving(true);
    try {
      const res = await fetch(`https://docscode-3.onrender.com/patients/${patient.patientId}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: symptoms.trim(), prescriptions: medications }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");
      alert(`✅ Prescription saved for ${data.name}`);
      navigate("/old-patients", { state: { doctorName, doctorUsername } });
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    // ... (Keep existing print logic) ...
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    const medsHtml = medications.map(med => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${med.tablet}</td>
        <td style="text-align:center; border: 1px solid #ddd;">${med.morning ? '1' : '0'}</td>
        <td style="text-align:center; border: 1px solid #ddd;">${med.evening ? '1' : '0'}</td>
        <td style="text-align:center; border: 1px solid #ddd;">${med.night ? '1' : '0'}</td>
        <td style="text-align:center; border: 1px solid #ddd;">${med.duration}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${med.dosage}</td>
      </tr>`).join("");

    const htmlContent = `
      <html><head><title>Prescription</title>
      <style>body{font-family:sans-serif;padding:40px;color:#333}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#f4f4f4;text-align:left;padding:10px;border:1px solid #ddd}</style>
      </head><body>
      <div style="border-bottom:2px solid #2563EB;padding-bottom:10px;margin-bottom:20px;display:flex;justify-content:space-between">
        <div><h2 style="margin:0;color:#2563EB">Dr. ${doctorName}</h2><p style="margin:5px 0">General Physician</p></div>
        <div style="text-align:right"><p>Date: ${currentDate}</p></div>
      </div>
      <div style="background:#f9fafb;padding:15px;border-radius:8px;margin-bottom:20px">
        <p style="margin:5px 0"><strong>Patient:</strong> ${patient.name} (${patient.age} / ${patient.gender})</p>
        <p style="margin:5px 0"><strong>ID:</strong> ${patient.patientId}</p>
        <p style="margin:5px 0"><strong>Diagnosis:</strong> ${symptoms}</p>
      </div>
      <table><thead><tr><th>Medicine</th><th>M</th><th>A</th><th>N</th><th>Days</th><th>Dosage</th></tr></thead><tbody>${medsHtml}</tbody></table>
      </body></html>`;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  if (!patient) return <div className="error-state">No patient data loaded.</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar doctorName={doctorName} />

      <main className="main-content fade-in">
        <Topbar doctorName={doctorName} />

        <div className="patient-details-wrapper">
          
          {/* --- NEW PROFESSIONAL PATIENT HEADER --- */}
          <div className="patient-header-card">
            <div className="patient-avatar-wrapper">
              <span className="avatar-text">
                {patient.gender === "Female" ? "👩" : "👨"}
              </span>
            </div>
            
            <div className="patient-identity">
              <div className="identity-top">
                <h1 className="patient-name">{patient.name}</h1>
                <span className="patient-id-badge">
                  ID: {patient.patientId}
                </span>
              </div>
              
              <div className="identity-bottom">
                <div className="detail-item">
                  <span className="icon-label">Age</span>
                  <span className="detail-value">{patient.age} Years</span>
                </div>
                <div className="detail-separator"></div>
                <div className="detail-item">
                  <span className="icon-label">Gender</span>
                  <span className="detail-value">{patient.gender}</span>
                </div>
              </div>
            </div>
          </div>
          {/* --------------------------------------- */}

          {/* Clinical Notes */}
          <div className="clinical-section">
            <div className="section-header-simple">
               <span className="icon">🩺</span> Clinical Notes
            </div>
            <textarea
              className="symptoms-input"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Type clinical diagnosis, symptoms, or observation..."
              rows={3}
            />
          </div>

          {/* Prescription Table */}
          <div className="prescription-section">
            <div className="section-header-row">
              <div className="section-header-simple">
                 <span className="icon">💊</span> Prescription
              </div>
              <button className="add-med-btn" onClick={addRow}>
                <span className="plus">+</span> Add Medicine
              </button>
            </div>

            <div className="prescription-table-wrapper">
              <table className="prescription-table">
                <thead>
                  <tr>
                    <th style={{width: '30%'}}>Medicine Name</th>
                    <th style={{width: '25%'}}>Frequency</th>
                    <th style={{width: '10%'}}>Days</th>
                    <th style={{width: '25%'}}>Dosage/Note</th>
                    <th style={{width: '10%'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((med, index) => (
                    <tr key={index} className="med-row">
                      <td>
                        <MedicineAutocomplete
                          value={med.tablet}
                          onChange={(val) => handleChange(index, "tablet", val)}
                        />
                      </td>
                      <td>
                        <div className="toggle-group">
                          <div className={`circle-toggle ${med.morning ? 'active' : ''}`} onClick={() => handleChange(index, "morning")}>M</div>
                          <div className={`circle-toggle ${med.evening ? 'active' : ''}`} onClick={() => handleChange(index, "evening")}>A</div>
                          <div className={`circle-toggle ${med.night ? 'active' : ''}`} onClick={() => handleChange(index, "night")}>N</div>
                        </div>
                      </td>
                      <td>
                        <input type="number" className="table-input center-text" value={med.duration} onChange={(e) => handleChange(index, "duration", e.target.value)} placeholder="0" />
                      </td>
                      <td>
                        <input type="text" className="table-input" value={med.dosage} onChange={(e) => handleChange(index, "dosage", e.target.value)} placeholder="e.g. after food" />
                      </td>
                      <td style={{textAlign: 'center'}}>
                        <button className="icon-btn delete" onClick={() => removeRow(index)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="action-bar-glass">
             <button className="text-btn" onClick={() => navigate(-1)}>Cancel</button>
             <div className="right-actions">
               <button className="btn-secondary" onClick={handlePrint}>Print</button>
               <button className="btn-primary" onClick={handleSaveToDB} disabled={isSaving}>
                 {isSaving ? "Saving..." : "Save Record"}
               </button>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default PatientDetails;