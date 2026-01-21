import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/AddPatient.css";
// Ensure you have the main dashboard CSS for layout structure
import "../CSS/DashBoard.css"; 

function AddPatient() {
  const navigate = useNavigate();
  const location = useLocation();
  const doctorName = location.state?.doctorName || "Doctor";
  const doctorUsername = location.state?.doctorUsername;

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    navigate("/dashboard", { state: { doctorName, doctorUsername } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const trimmedData = {
      name: formData.name.trim(),
      age: formData.age.trim(),
      gender: formData.gender,
      doctorUsername: doctorUsername,
    };

    if (!trimmedData.name || !trimmedData.age || !trimmedData.gender) {
      alert("Please fill in all fields properly.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("https://docscode-3.onrender.com/patients", trimmedData);
      const savedPatient = response.data;

      navigate("/patient-details", {
        state: { patient: savedPatient, doctorName, doctorUsername },
      });
    } catch (error) {
      console.error("❌ Error adding patient:", error);
      alert("Failed to add patient. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* 1. Sidebar Integration */}
      <Sidebar doctorName={doctorName} />

      <main className="main-content">
        {/* 2. Topbar Integration */}
        <Topbar doctorName={doctorName} />

        <div className="add-patient-wrapper">
          <div className="add-patient-card">
            <div className="form-header">
              <h2>Register New Patient</h2>
              <p>Enter patient details to create a new medical record.</p>
            </div>

            <form className="add-patient-form" onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="e.g. 34"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group half">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className={!formData.gender ? "placeholder-text" : ""}
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="button-group">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AddPatient;