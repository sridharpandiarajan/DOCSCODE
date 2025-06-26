import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../CSS/PatientDetails.css";
import MedicineAutocomplete from "../components/MedicineAutocomplete";

function PatientDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient;
  const doctorName = location.state?.doctorName || "Not Doctor";

  const [symptoms, setSymptoms] = useState("");
  const [medications, setMedications] = useState([
    { tablet: "", morning: false, evening: false, night: false, duration: "", dosage: "" },
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = ["tablet", "duration", "dosage"].includes(field)
      ? value
      : !updated[index][field];
    setMedications(updated);
  };

  const addRow = () => {
    setMedications([
      ...medications,
      { tablet: "", morning: false, evening: false, night: false, duration: "", dosage: "" },
    ]);
  };

 const handleSaveToDB = async () => {
  if (!symptoms.trim()) {
    alert("❗Please enter symptoms before saving.");
    return;
  }

  if (medications.length === 0 || medications.some(m => !m.tablet)) {
    alert("❗Please add at least one valid tablet with name.");
    return;
  }

  const payload = {
    symptoms: symptoms.trim(),
    prescriptions: medications,
  };

  try {
    const res = await fetch(`http://localhost:5000/patients/${patient.patientId}/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Error from server:", data);
      throw new Error(data.message || "Save failed");
    }

    alert(`✅ Prescription saved for ${data.name}`);
    navigate("/old-patient", {
      state: { doctorName, doctorUsername }
    });

  } catch (err) {
    console.error("❌ Error saving prescription:", err);
  }
};


  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const medsHtml = medications.map(med => `
      <tr>
        <td>${med.tablet}</td>
        <td>${med.morning ? '✔️' : '❌'}</td>
        <td>${med.evening ? '✔️' : '❌'}</td>
        <td>${med.night ? '✔️' : '❌'}</td>
        <td>${med.duration}</td>
        <td>${med.dosage}</td>
      </tr>
    `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription</title>
          <style>
            body {
              position: relative;
              min-height: 100vh;
              padding-bottom: 80px;
              box-sizing: border-box;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: center;
            }
            .prescription-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .patient-details {
              width: 50%;
              line-height: 1.5;
              text-align: left;
            }
            .clinic-details {
              width: 45%;
              line-height: 1.5;
              text-align: right;
            }
            .signature-block {
              position: fixed;
              bottom: 30px;
              right: 40px;
              text-align: center;
            }
            .signature-line {
              width: 200px;
              border-top: 1px solid #000;
              margin-bottom: 5px;
            }
            .signature-text {
              font-size: 16px;
              width: 200px;
            }
            .signature-text-1 {
              font-size: 20px;
              width: 200px;
            }
            @media print {
              html, body {
                height: 100%;
                margin: 0;
                padding: 0;
              }
              @page {
                size: A4;
                margin: 20mm;
              }
              .signature-block {
                position: fixed;
                bottom: 30mm;
                right: 20mm;
              }
              table, .prescription-header {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="prescription-header">
            <div class="patient-details">
              <h2>Prescription</h2>
              <p><strong>Patient Name:</strong> ${patient.name}</p>
              <p><strong>Patient ID:</strong> ${patient.patientId}</p>
              <p><strong>Age:</strong> ${patient.age}</p>
              <p><strong>Symptoms:</strong> ${patient.symptoms}</p>
              <p><strong>Date:</strong> ${currentDate}</p>
            </div>
            <div class="clinic-details">
              <h1>Dr. ${doctorName}</h1>
              <h3>MBBS</h3>
              <p>Reg. No: ABC123456</p>
              <p>Clinic Name: ${doctorName}'s Clinic</p>
              <p>Address: 123 Main Street, Kattupakkam, Porur.</p>
              <p>Phone: +91-9361199033</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tablet</th>
                <th>Morning</th>
                <th>Evening</th>
                <th>Night</th>
                <th>Duration (days)</th>
                <th>Dosage</th>
              </tr>
            </thead>
            <tbody>
              ${medsHtml}
            </tbody>
          </table>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-text">Signature</div>
            <div class="signature-text-1">Dr. ${doctorName}</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  if (!patient) {
    return (
      <div className="add-patient-container">
        <p>No patient data found. Please add a patient first.</p>
        <button onClick={() => navigate("/add-patient")}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="patient-details-wrapper">
      <div className="patient-details-container">
        <div className="patient-info">
          <h2>🧑‍⚕️ Patient Details</h2>
          <p><strong>Patient ID:</strong> {patient.patientId}</p>
          <p><strong>Name:</strong> {patient.name}</p>
          <p><strong>Age:</strong> {patient.age}</p>
          <p><strong>Doctor:</strong> {doctorName}</p>
        </div>

        <h4>🩺 Symptoms</h4>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe symptoms here..."
          rows={3}
          required
          style={{
            width: "90%",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontFamily: "inherit",
            resize: "vertical",
            backgroundColor: "#FAF9F6",
            color: "#000",
          }}
        />

        <h4>📄 Prescription</h4>
        {medications.map((med, index) => (
          <div className="prescription-row" key={index}>
            <MedicineAutocomplete
              value={med.tablet}
              onChange={(val) => handleChange(index, "tablet", val)}
            />
            <label>
              <input
                type="checkbox"
                checked={med.morning}
                onChange={() => handleChange(index, "morning")}
              /> Morning
            </label>
            <label>
              <input
                type="checkbox"
                checked={med.evening}
                onChange={() => handleChange(index, "evening")}
              /> AfterNoon
            </label>
            <label>
              <input
                type="checkbox"
                checked={med.night}
                onChange={() => handleChange(index, "night")}
              /> Night
            </label>
            <input
              type="number"
              placeholder="Days"
              value={med.duration}
              onChange={(e) => handleChange(index, "duration", e.target.value)}
            />
            <input
              type="text"
              placeholder="Dosage [mg/mL]"
              value={med.dosage}
              onChange={(e) => handleChange(index, "dosage", e.target.value)}
            />
          </div>
        ))}
        <div className="prescription-buttons">
          <button onClick={addRow}>➕ Add Tablet</button>
          <button onClick={handlePrint}>🧾 Print Prescription</button>
          <button onClick={handleSaveToDB}>💾 Save in DB</button>
        </div>

        <div className="full-width-button-wrapper">
          <button
            className="back-button-full"
            onClick={() =>
              navigate("/dashboard", {
                state: { doctorName, doctorUsername: patient.doctorUsername },
              })
            }
          >
            🔙 Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

export default PatientDetails;
