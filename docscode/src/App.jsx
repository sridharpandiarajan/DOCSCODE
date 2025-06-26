import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import DashBoard from './pages/DashBoard';
import AddPatient from './pages/AddPatient';
import PatientDetails from './pages/PatientDetails';
import ViewPatients from "./pages/ViewPatients";
import OldPatient from './pages/OldPatient'; 
import PatientVisitDetails from './pages/PatientVisitDetails';
import AddPrescription from "./pages/AddPrescription";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/add-patient" element={<AddPatient />} />
        <Route path="/patient-details" element={<PatientDetails />} />
        <Route path="/view-patients" element={<ViewPatients />} />
        <Route path="/old-patients" element={<OldPatient />} />
        <Route path="/old-patient-details" element={<PatientVisitDetails />} />
        <Route path="/add-prescription" element={<AddPrescription />} />
      </Routes>
    </Router>
  );
}

export default App;
