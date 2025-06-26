import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MedicineAutocomplete from "../components/MedicineAutocomplete"; // Adjust path if needed
import '../CSS/AddPrescription.css';

function AddPrescription() {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId, doctorName, doctorUsername } = location.state || {};

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAutocompleteChange = (value) => {
    setFormData({ ...formData, tablet: value });
  };

  const handleAddPrescription = (e) => {
    e.preventDefault();

    if (!formData.tablet || !formData.duration || !formData.dosage) {
      alert("Please fill all fields for the tablet.");
      return;
    }

    setPrescriptions([...prescriptions, formData]);

    // Clear form
    setFormData({
      tablet: "",
      duration: "",
      dosage: "",
      morning: false,
      evening: false,
      night: false,
    });
  };

  const handleSubmitVisit = async (e) => {
  e.preventDefault();

  if (!symptoms || prescriptions.length === 0) {
    alert("Please enter symptoms and at least one prescription.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/patients/${patientId}/visit`, {
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
      alert("❌ Failed to submit visit: " + (err.message || "Unknown error"));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error while submitting.");
  }
};


  return (
    <div className="add-prescription-wrapper">
      <div className="patient-details-container">
        <h2>Add Prescription</h2>

        <label>Symptoms</label>
        <textarea
          placeholder="Enter patient's symptoms..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows="3"
        />

        <form onSubmit={handleAddPrescription}>
          <div className="prescription-row">
            <MedicineAutocomplete
              value={formData.tablet}
              onChange={handleAutocompleteChange}
            />
            <input
              type="number"
              name="duration"
              placeholder="Duration (days)"
              value={formData.duration}
              onChange={handleChange}
            />
            <input
              type="text"
              name="dosage"
              placeholder="Dosage (mg/mL)"
              value={formData.dosage}
              onChange={handleChange}
            />
          </div>

          <div className="prescription-row">
            <label><input type="checkbox" name="morning" checked={formData.morning} onChange={handleChange} /> 🌞 Morning</label>
            <label><input type="checkbox" name="evening" checked={formData.evening} onChange={handleChange} /> 🌇 Evening</label>
            <label><input type="checkbox" name="night" checked={formData.night} onChange={handleChange} /> 🌙 Night</label>
          </div>

          <div className="prescription-buttons">
            <button type="submit">➕ Add</button>
          </div>
        </form>

        <div className="prescription-summary">
          <h4>Prescriptions Added:</h4>
          <ul>
            {prescriptions.map((p, index) => (
              <li key={index}>
                {p.tablet} – {p.dosage}mg for {p.duration} days [
                {p.morning && "🌞"}
                {p.evening && "🌇"}
                {p.night && "🌙"}
                {!p.morning && !p.evening && !p.night && "No time specified"}]
              </li>
            ))}
          </ul>
        </div>

        <div className="submit-visit">
          <button className="submit-btn" onClick={handleSubmitVisit}>✅ Submit Visit</button>
        </div>
      </div>
    </div>
  );
}

export default AddPrescription;
