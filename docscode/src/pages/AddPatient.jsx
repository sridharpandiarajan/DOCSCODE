import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../CSS/AddPatient.css";

function AddPatient() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const doctorName = location.state?.doctorName || "Doctor";
  const doctorUsername = location.state?.doctorUsername;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedData = {
      name: formData.name.trim(),
      age: formData.age.trim(),
      gender: formData.gender,
      doctorUsername: doctorUsername,
    };

    if (!trimmedData.name || !trimmedData.age || !trimmedData.gender) {
      alert("Please fill in all fields properly.");
      return;
    }

    try {
      const response = await axios.post("https://docscode-rttc.vercel.app/patients", trimmedData);
      const savedPatient = response.data;

      navigate("/patient-details", {
        state: { patient: savedPatient, doctorName, doctorUsername },
      });
    } catch (error) {
      console.error("❌ Error adding patient:", error);
      if (error.response?.data?.message) {
        alert(`Failed to add patient: ${error.response.data.message}`);
      } else {
        alert("Failed to add patient. Please try again.");
      }
    }
  };

  return (
    
    <div className="add-patient-wrapper"style={{ position: "relative" }}>
      <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => {
              if (doctorName && doctorUsername) {
                navigate("/dashboard", { state: { doctorName, doctorUsername } });
              } else {
                alert("Doctor info missing, cannot navigate");
              }
            }}
            style={{
              padding: "8px 15px",
              backgroundColor: "#6c5ce7",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            🏠 Back to Dashboard
          </button>
        </div>
        <div className="add-patient-container">        
        <form className="add-patient-form" onSubmit={handleSubmit}>
          <h2 className="add-patient-title">🩺 Add Patient</h2>

          <input
            type="text"
            name="name"
            placeholder="Patient Name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: "90%", padding: "10px", marginBottom: "20px" }}
            required
          />

          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            style={{ width: "90%", padding: "10px", marginBottom: "20px" }}
            required
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="dropdown-select"
            style={{
              width: "97%",
              padding: "10px",
              marginBottom: "20px",
              color: formData.gender ? "#000" : "#888",
            }}
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <button type="submit">➕ Add Patient</button>
        </form>
      </div>
    </div>
  );
}

export default AddPatient;