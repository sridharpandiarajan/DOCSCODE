import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import '../CSS/PatientVisitDetails.css';
import '../CSS/DashBoard.css'; 

function PatientVisitDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { patient, doctorName, doctorUsername } = location.state || {};

  if (!patient) {
    return (
      <div className="error-container">
        <p>❌ No patient data found.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Use visits if they exist, otherwise fallback to root-level data (migration support)
  const visits = Array.isArray(patient.visits) && patient.visits.length > 0
    ? [...patient.visits].reverse() 
    : (patient.symptoms && patient.prescriptions
        ? [{
            symptoms: patient.symptoms,
            prescriptions: patient.prescriptions,
            createdAt: patient.createdAt || new Date()
          }]
        : []);

  const handleAddData = () => {
    navigate("/add-prescription", {
      state: { patientId: patient.patientId, doctorName, doctorUsername, patient }
    });
  };

  // UPDATED: Print Function with Professional UI
  const handlePrintVisit = (visit, index, totalVisits) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Calculate Visit Number (Since the list is reversed: Newest = Total - Index)
    const chronologicalVisitNum = totalVisits - index;
    const visitDate = new Date(visit.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    
    const medsHtml = visit.prescriptions.map(p => `
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
            <p class="visit-number">Visit #${chronologicalVisitNum}</p>
            <p>${visitDate}</p>
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
          <span class="diagnosis-text">${visit.symptoms}</span>
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar doctorName={doctorName} />

      <main className="main-content fade-in">
        <Topbar doctorName={doctorName} />

        <div className="visit-details-wrapper">
          
          {/* 1. Patient Header Card */}
          <div className="patient-header-card">
            <div className="patient-avatar-wrapper">
              <span className="avatar-text">
                {patient.gender === "Female" ? "👩" : "👨"}
              </span>
            </div>
            
            <div className="patient-identity">
              <div className="identity-top">
                <h1 className="patient-name">{patient.name}</h1>
                <span className="patient-id-badge">ID: {patient.patientId}</span>
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
                <div className="detail-separator"></div>
                <div className="detail-item">
                  <span className="icon-label">Total Visits</span>
                  <span className="detail-value">{visits.length}</span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button className="btn-primary-small" onClick={handleAddData}>
                ➕ New Consultation
              </button>
            </div>
          </div>

          {/* 2. Timeline of Visits */}
          <div className="timeline-container">
            <h3 className="section-title">Medical History</h3>
            
            {visits.length > 0 ? (
              visits.map((visit, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="visit-header">
                      <span className="visit-date">🕒 {formatDate(visit.createdAt)}</span>
                      {/* NEW: Print Button per visit */}
                      <button 
                        className="print-visit-btn" 
                        onClick={() => handlePrintVisit(visit, index, visits.length)}
                        title="Print Prescription"
                      >
                        🖨️ Print
                      </button>
                    </div>
                    
                    <div className="clinical-notes-box">
                      <strong>Diagnosis/Symptoms:</strong>
                      <p>{visit.symptoms}</p>
                    </div>

                    {visit.prescriptions && visit.prescriptions.length > 0 && (
                      <div className="prescription-mini-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Medicine</th>
                              <th>Frequency</th>
                              <th>Duration</th>
                              <th>Dosage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visit.prescriptions.map((p, id) => (
                              <tr key={id}>
                                <td className="med-name">{p.tablet || 'Unnamed'}</td>
                                <td>
                                  <div className="freq-badges">
                                    {p.morning && <span className="badge sun" title="Morning">M</span>}
                                    {p.evening && <span className="badge sunset" title="Afternoon">A</span>}
                                    {p.night && <span className="badge moon" title="Night">N</span>}
                                    {!p.morning && !p.evening && !p.night && <span>-</span>}
                                  </div>
                                </td>
                                <td>{p.duration} days</td>
                                <td>{p.dosage}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No medical history recorded yet.</p>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="page-footer">
            <button
              className="text-btn"
              onClick={() => navigate("/old-patients", { state: { doctorName, doctorUsername } })}
            >
              ← Back to Patient Directory
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default PatientVisitDetails;