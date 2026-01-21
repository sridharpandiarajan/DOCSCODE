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

  // --- UPDATED PROFESSIONAL PRINT FUNCTION ---
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Calculate current visit number (Total visits + 1 new one)
    const currentVisitNum = (patient.visits?.length || 0) + 1;
    const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const medsHtml = medications.map(p => `
      <tr>
        <td class="med-name">${p.tablet}</td>
        <td class="center">
          ${p.morning ? '1' : '0'} - ${p.evening ? '1' : '0'} - ${p.night ? '1' : '0'}
        </td>
        <td class="center">${p.duration} Days</td>
        <td>${p.dosage}</td>
      </tr>
    `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patient.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1f2937; max-width: 800px; margin: 0 auto; }
          
          /* Header */
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
          .doctor-info h1 { margin: 0; color: #2563EB; font-size: 24px; }
          .doctor-info p { margin: 4px 0 0; color: #6B7280; font-size: 14px; font-weight: 500; }
          .visit-meta { text-align: right; }
          .visit-meta p { margin: 0; font-size: 14px; color: #4B5563; }
          .visit-number { font-weight: 700; color: #111827; font-size: 16px; margin-bottom: 4px !important; }

          /* Patient Card */
          .patient-box { background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
          .info-group label { display: block; font-size: 11px; text-transform: uppercase; color: #9CA3AF; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px; }
          .info-group span { font-size: 15px; font-weight: 600; color: #111827; }

          /* Diagnosis */
          .diagnosis-box { margin-bottom: 30px; padding-left: 10px; border-left: 4px solid #F59E0B; }
          .diagnosis-label { font-weight: 700; color: #B45309; font-size: 14px; display: block; margin-bottom: 4px; }
          .diagnosis-text { font-size: 16px; }

          /* Rx Table */
          .rx-header { font-size: 24px; font-weight: bold; margin-bottom: 10px; font-family: serif; font-style: italic; color: #2563EB; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { background-color: #EFF6FF; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #1E40AF; border-bottom: 2px solid #DBEAFE; }
          td { padding: 12px; border-bottom: 1px solid #F3F4F6; font-size: 14px; vertical-align: middle; }
          .med-name { font-weight: 600; font-size: 15px; }
          .center { text-align: center; }

          /* Footer */
          .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: flex-end; }
          .signature-box { text-align: center; }
          .signature-line { width: 200px; border-bottom: 1px solid #111827; margin-bottom: 8px; }
          .disclaimer { font-size: 10px; color: #9CA3AF; max-width: 60%; }
        </style>
      </head>
      <body>
        
        <div class="header">
          <div class="doctor-info">
            <h1>Dr. ${doctorName}</h1>
            <p>General Physician • Doc's CODE Clinic</p>
          </div>
          <div class="visit-meta">
            <p class="visit-number">Visit #${currentVisitNum}</p>
            <p>${currentDate}</p>
          </div>
        </div>

        <div class="patient-box">
          <div class="info-group">
            <label>Patient Name</label>
            <span>${patient.name}</span>
          </div>
          <div class="info-group">
            <label>Patient ID</label>
            <span>${patient.patientId}</span>
          </div>
          <div class="info-group">
            <label>Age / Gender</label>
            <span>${patient.age} Yrs / ${patient.gender}</span>
          </div>
          <div class="info-group">
            <label>Visit Type</label>
            <span>Consultation</span>
          </div>
        </div>

        <div class="diagnosis-box">
          <span class="diagnosis-label">DIAGNOSIS / SYMPTOMS</span>
          <span class="diagnosis-text">${symptoms}</span>
        </div>

        <div class="rx-header">Rx</div>
        <table>
          <thead>
            <tr>
              <th width="40%">Medicine Name</th>
              <th width="20%" class="center">Frequency (M-A-N)</th>
              <th width="15%" class="center">Duration</th>
              <th width="25%">Dosage / Note</th>
            </tr>
          </thead>
          <tbody>
            ${medsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div class="disclaimer">
            This is a computer-generated prescription. Valid without a physical signature for general consultation purposes.
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <strong>Dr. ${doctorName}</strong>
          </div>
        </div>

      </body>
      </html>`;
    
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
          
          {/* Patient Header Card */}
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
               <button className="btn-secondary" onClick={handlePrint}>🖨️ Print</button>
               <button className="btn-primary" onClick={handleSaveToDB} disabled={isSaving}>
                 {isSaving ? "Saving..." : "💾 Save Record"}
               </button>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default PatientDetails;