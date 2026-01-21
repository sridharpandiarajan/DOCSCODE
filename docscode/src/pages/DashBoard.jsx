import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar";   
import '../CSS/DashBoard.css';

function DashBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const doctorName = location.state?.doctorName || "Doctor";
  const doctorUsername = location.state?.doctorUsername || "";

  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [allPatients, setAllPatients] = useState([]); 
  const [chartData, setChartData] = useState([]);
  const [timeFilter, setTimeFilter] = useState("Weekly");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch All Patients
        const patientsRes = await axios.get(`https://docscode-3.onrender.com/patients/doctor/${doctorUsername}`);
        const rawPatients = patientsRes.data;

        // --- FILTER: Strictly remove patients with 0 visits ---
        const activePatients = rawPatients.filter(p => p.visits && p.visits.length > 0);

        // --- CALC 1: Total Patients (with visits) ---
        const totalCount = activePatients.length;

        // --- CALC 2: Patients Today ---
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // Start of today (00:00:00)

        const todayCount = activePatients.filter(p => {
          // Check if ANY of the patient's visits happened today or later
          return p.visits.some(v => new Date(v.createdAt) >= todayStart);
        }).length;

        setStats({ total: totalCount, today: todayCount });
        setAllPatients(activePatients); // Update state with ONLY valid patients

      } catch (err) {
        console.error("❌ Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (doctorUsername) fetchData();
  }, [doctorUsername]);

  // --- Logic: Get 5 Latest Patients (Active Patients Only) ---
  const latestPatients = useMemo(() => {
    if (!allPatients.length) return [];
    
    // Sort active patients by their latest visit date
    const sorted = [...allPatients].sort((a, b) => {
        // We can safely access index 0 or length-1 because we filtered visits > 0
        const dateA = new Date(a.visits[a.visits.length - 1].createdAt);
        const dateB = new Date(b.visits[b.visits.length - 1].createdAt);
        return dateB - dateA; // Descending (Newest first)
    });

    return sorted.slice(0, 5); 
  }, [allPatients]);

  // --- Chart Processing Logic ---
  useEffect(() => {
    if (allPatients.length === 0 && !isLoading) {
        // If no data, set empty graph to avoid crash
        setChartData([]);
        return;
    }

    const processData = () => {
      const today = new Date();
      let data = [];

      if (timeFilter === "Weekly") {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        allPatients.forEach(p => p.visits.forEach(v => {
          const vDate = new Date(v.createdAt);
          if (vDate >= startOfWeek) counts[days[vDate.getDay()]]++;
        }));

        data = [
          { name: 'Mon', visits: counts.Mon }, { name: 'Tue', visits: counts.Tue },
          { name: 'Wed', visits: counts.Wed }, { name: 'Thu', visits: counts.Thu },
          { name: 'Fri', visits: counts.Fri }, { name: 'Sat', visits: counts.Sat },
          { name: 'Sun', visits: counts.Sun },
        ];
      } else if (timeFilter === "Monthly") {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const counts = Array(12).fill(0);
        const currentYear = today.getFullYear();

        allPatients.forEach(p => p.visits.forEach(v => {
          const vDate = new Date(v.createdAt);
          if (vDate.getFullYear() === currentYear) counts[vDate.getMonth()]++;
        }));
        data = months.map((m, i) => ({ name: m, visits: counts[i] }));
      } else if (timeFilter === "Yearly") {
        const yearCounts = {};
        allPatients.forEach(p => p.visits.forEach(v => {
          const year = new Date(v.createdAt).getFullYear();
          yearCounts[year] = (yearCounts[year] || 0) + 1;
        }));
        data = Object.keys(yearCounts).sort().map(year => ({ name: year, visits: yearCounts[year] }));
        if(data.length === 0) data = [{ name: today.getFullYear().toString(), visits: 0 }];
      }
      setChartData(data);
    };
    processData();
  }, [allPatients, timeFilter, isLoading]);

  // Action Cards Data
  const menuItems = [
    { 
      title: "New Consultation", 
      desc: "Register and prescribe a new patient", 
      path: "/add-patient", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>,
      color: "blue"
    },
    { 
      title: "Returning Patient", 
      desc: "Find existing records by ID", 
      path: "/old-patients", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
      color: "green"
    },
    { 
      title: "Patient Directory", 
      desc: "View full history and analytics", 
      path: "/view-patients", 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
      color: "purple"
    }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar doctorName={doctorName} />

      <main className="main-content fade-in">
        <Topbar doctorName={doctorName} />

        <div className="dashboard-container">
          
          {/* 1. Stats Row */}
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue-bg">👥</div>
              <div className="stat-info">
                <h3>{isLoading ? "..." : stats.today}</h3>
                <p>Patients Today</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green-bg">📁</div>
              <div className="stat-info">
                <h3>{isLoading ? "..." : stats.total}</h3>
                <p>Total Records</p>
              </div>
            </div>
          </section>

          {/* 2. Middle Section: Chart + Latest Patients */}
          <section className="dashboard-middle">
            
            {/* Chart Section */}
            <div className="chart-card">
              <div className="chart-header-row">
                <h3 className="card-title">{timeFilter} Visits</h3>
                <select 
                  className="chart-filter-select"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <option value="Weekly">This Week</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div style={{ width: '100%', height: 250 }}>
                {isLoading ? (
                    <div className="loading-placeholder">Loading Chart...</div>
                ) : (
                    <ResponsiveContainer>
                    <AreaChart data={chartData}>
                        <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} allowDecimals={false} />
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                        <Area type="monotone" dataKey="visits" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                    </AreaChart>
                    </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Latest Patients Section */}
            <div className="schedule-card">
              <div className="card-header">
                <h3 className="card-title">Recent Patients</h3>
                <span 
                  className="view-all" 
                  onClick={() => navigate('/view-patients', { state: { doctorName, doctorUsername } })}
                >
                  View All
                </span>
              </div>
              <div className="appointment-list">
                {isLoading ? (
                  <div style={{textAlign:'center', color:'#9CA3AF', padding:'20px'}}>Loading...</div>
                ) : latestPatients.length > 0 ? (
                  latestPatients.map((p) => {
                    // Safe access because we filtered visits > 0
                    const lastVisitDate = new Date(p.visits[p.visits.length - 1].createdAt).toLocaleDateString('en-US', {month:'short', day:'numeric'});
                    
                    return (
                      <div key={p._id} className="appointment-item">
                        <div className="apt-time">{lastVisitDate}</div>
                        <div className="apt-info">
                          <span className="apt-name">{p.name}</span>
                          <span className="apt-type">{p.age} Yrs / {p.gender}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{textAlign:'center', color:'#9CA3AF', padding:'20px'}}>No recent visits</div>
                )}
              </div>
            </div>
          </section>

          {/* 3. Actions Grid */}
          <section className="actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="actions-grid">
              {menuItems.map((item, index) => (
                <div 
                  key={index} 
                  className="action-card"
                  onClick={() => navigate(item.path, { state: { doctorName, doctorUsername } })}
                >
                  <div className={`action-icon ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="action-text">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                  <div className="arrow-icon">→</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default DashBoard;