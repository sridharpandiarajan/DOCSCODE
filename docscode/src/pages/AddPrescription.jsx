import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MedicineAutocomplete from "../components/MedicineAutocomplete";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import '../CSS/AddPrescription.css';
import '../CSS/DashBoard.css'; // Ensure main layout styles are loaded

function AddPrescription() {
  const location = useLocation();
  const navigate = useNavigate();
  const { patient, doctorName, doctorUsername } = location.state || {};

  // Graceful fallback if patient data is missing
  const patientId = patient?.patientId || location.state?.patientId || "N/A";
  const patientName = patient?.name || "Guest Patient";

  const [formData, setFormData] = useState({
    tablet: "",
    duration: "",
    dosage: "",
    morning: false,
    evening: false,
    night: false,
  });

  const [symptoms, setSymptoms] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle Toggle Changes (M-A-N pills)
  const toggleTime = (time) => {
    setFormData({ ...formData, [time]: !formData[time] });
  };

  const handleAutocompleteChange = (value) => {
    setFormData({ ...formData, tablet: value });
  };

  const handleAddPrescription = (e) => {
    e.preventDefault();
    if (!formData.tablet || !formData.duration || !formData.dosage) {
      alert("❗ Please fill all fields (Tablet, Duration, Dosage).");
      return;
    }

    setPrescriptions([...prescriptions, formData]);
    
    // Reset Form
    setFormData({
      tablet: "",
      duration: "",
      dosage: "",
      morning: false,
      evening: false,
      night: false,
    });
  };

  const removePrescription = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSubmitVisit = async () => {
    if (!symptoms.trim()) {
      alert("❗ Please enter symptoms.");
      return;
    }
    if (prescriptions.length === 0) {
      alert("❗ Please add at least one prescription.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`https://docscode-3.onrender.com/patients/${patientId}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, prescriptions }),
      });

      if (res.ok) {
        alert("✅ Visit submitted successfully!");
        navigate("/old-patient-details", {
          state: {
            doctorName,
            doctorUsername,
            patient: await res.json()
          }
        });
      } else {
        const err = await res.json();
        alert("❌ Failed to submit: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar doctorName={doctorName} />

      <main className="main-content fade-in">
        <Topbar doctorName={doctorName} />

        <div className="add-prescription-wrapper">
          
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">New Consultation</h1>
              <p className="page-subtitle">Add clinical notes and medication.</p>
            </div>
            <div className="patient-badge">
              <div className="patient-avatar-small">
                 {patient?.gender === "Female" ? "👩" : "👨"}
              </div>
              <div className="patient-info-mini">
                <span className="p-name">{patientName}</span>
                <span className="p-id">ID: {patientId}</span>
              </div>
            </div>
          </div>

          {/* 1. Clinical Notes Section */}
          <div className="card-section">
            <div className="section-header">
              <span className="icon">🩺</span> Clinical Notes
            </div>
            <textarea
              className="notes-input"
              placeholder="Start typing symptoms, diagnosis, or patient complaints..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows="3"
            />
          </div>

          {/* 2. Add Prescription Form */}
          <div className="card-section">
            <div className="section-header">
              <span className="icon">💊</span> Add Medication
            </div>
            
            <form onSubmit={handleAddPrescription} className="prescription-form">
              <div className="form-grid">
                
                {/* Medicine Name */}
                <div className="form-group med-name">
                  <label>Medicine Name</label>
                  <MedicineAutocomplete
                    value={formData.tablet}
                    onChange={handleAutocompleteChange}
                  />
                </div>

                {/* Frequency Toggles */}
                <div className="form-group frequency">
                  <label>Frequency</label>
                  <div className="toggle-group">
                    <div 
                      className={`circle-toggle ${formData.morning ? 'active' : ''}`} 
                      onClick={() => toggleTime('morning')}
                      title="Morning"
                    >M</div>
                    <div 
                      className={`circle-toggle ${formData.evening ? 'active' : ''}`} 
                      onClick={() => toggleTime('evening')}
                      title="Afternoon"
                    >A</div>
                    <div 
                      className={`circle-toggle ${formData.night ? 'active' : ''}`} 
                      onClick={() => toggleTime('night')}
                      title="Night"
                    >N</div>
                  </div>
                </div>

                {/* Duration */}
                <div className="form-group duration">
                  <label>Days</label>
                  <input
                    type="number"
                    name="duration"
                    placeholder="0"
                    value={formData.duration}
                    onChange={handleChange}
                    className="modern-input center-text"
                  />
                </div>

                {/* Dosage */}
                <div className="form-group dosage">
                  <label>Dosage / Instruction</label>
                  <input
                    type="text"
                    name="dosage"
                    placeholder="e.g. after food"
                    value={formData.dosage}
                    onChange={handleChange}
                    className="modern-input"
                  />
                </div>

                {/* Add Button */}
                <div className="form-group action">
                  <label>&nbsp;</label>
                  <button type="submit" className="add-btn">
                    + Add
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 3. Added Prescriptions List (Table) */}
          {prescriptions.length > 0 ? (
            <div className="card-section prescription-list-card">
              <table className="prescription-table">
                <thead>
                  <tr>
                    <th style={{width: '35%'}}>Medicine</th>
                    <th style={{width: '20%'}}>Frequency</th>
                    <th style={{width: '10%'}}>Days</th>
                    <th style={{width: '25%'}}>Instruction</th>
                    <th style={{width: '10%'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((p, index) => (
                    <tr key={index}>
                      <td className="med-name-cell">{p.tablet}</td>
                      <td>
                        <div className="frequency-tags">
                          {p.morning && <span className="freq-dot sun" title="Morning"></span>}
                          {p.evening && <span className="freq-dot sunset" title="Afternoon"></span>}
                          {p.night && <span className="freq-dot moon" title="Night"></span>}
                          {!p.morning && !p.evening && !p.night && <span className="text-muted text-sm">--</span>}
                        </div>
                      </td>
                      <td className="center-text">{p.duration}</td>
                      <td className="text-muted">{p.dosage}</td>
                      <td className="center-text">
                        <button 
                          className="icon-btn delete" 
                          onClick={() => removePrescription(index)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state-small">No medicines added yet.</div>
          )}

          {/* Footer Actions */}
          <div className="action-footer-sticky">
            <button className="text-btn" onClick={() => navigate(-1)}>Cancel</button>
            <button 
              className="btn-primary" 
              onClick={handleSubmitVisit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "✅ Submit Consultation"}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default AddPrescription;