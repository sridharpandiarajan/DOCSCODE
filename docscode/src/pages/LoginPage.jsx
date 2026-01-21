import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // 1. Instantly locks the UI

    try {
      const res = await fetch("https://docscode-3.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/dashboard", { state: { doctorName: data.doctorName, doctorUsername: username } });
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err) {
      setError("Server connection failed.");
      console.error(err);
    } finally {
      setIsLoading(false); // Unlocks only if login fails
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgCircle1}></div>
      <div style={styles.bgCircle2}></div>

      <div style={styles.card}>
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <span style={{ fontSize: '28px' }}>🩺</span>
          </div>
          <h2 style={styles.title}>Doc's CODE</h2>
          <p style={styles.subtitle}>Welcome back, Doctor</p>
        </div>

        <form style={styles.form} onSubmit={handleLogin} autoComplete="off">
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Doctor ID</label>
            <div style={styles.inputWrapper}>
              <div style={styles.iconWrapper}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              
              {/* UPDATE: Added disabled={isLoading} */}
              <input
                type="text"
                name="doc_id_field" 
                id="doc_id_field"
                autoComplete="off"
                placeholder="Ex: DR-1024"
                style={isLoading ? styles.inputDisabled : styles.input} 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading} 
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <div style={styles.iconWrapper}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              
              {/* UPDATE: Added disabled={isLoading} */}
              <input
                type="password"
                name="doc_password_field"
                id="doc_password_field"
                autoComplete="new-password"
                placeholder="••••••••"
                style={isLoading ? styles.inputDisabled : styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{marginRight: '8px'}}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...styles.button, 
              opacity: isLoading ? 0.7 : 1, 
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Secure HIPAA Compliant Login</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
  },
  bgCircle1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
    zIndex: 0,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
    zIndex: 0,
  },
  card: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.05)',
    width: '100%',
    maxWidth: '420px',
    zIndex: 1,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.5)'
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logoIcon: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px auto',
    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
  },
  title: {
    margin: '0',
    fontSize: '26px',
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '15px',
    color: '#6B7280',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'absolute',
    left: '16px',
    color: '#9CA3AF',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 48px',
    borderRadius: '12px',
    border: '2px solid transparent',
    backgroundColor: '#F3F4F6',
    fontSize: '15px',
    color: '#1F2937',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  // New style for disabled inputs
  inputDisabled: {
    width: '100%',
    padding: '14px 14px 14px 48px',
    borderRadius: '12px',
    border: '2px solid transparent',
    backgroundColor: '#E5E7EB', // Darker gray
    fontSize: '15px',
    color: '#9CA3AF', // Gray text
    outline: 'none',
    cursor: 'not-allowed', // Shows "stop" cursor
    boxSizing: 'border-box',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FEE2E2',
    color: '#B91C1C',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    color: '#fff',
    fontWeight: '600',
    fontSize: '16px',
    border: 'none',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
    transition: 'transform 0.1s ease, box-shadow 0.2s ease',
    marginTop: '10px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '25px',
    borderTop: '1px solid #E5E7EB',
    paddingTop: '20px',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: '12px',
    margin: 0,
    fontWeight: '500',
  }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  input:focus {
    background-color: #FFFFFF !important;
    border-color: #2563EB !important;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important;
  }
  /* Ensure disabled inputs don't glow when clicked */
  input:disabled {
    background-color: #E5E7EB !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }
  button:hover:not(:disabled) {
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3) !important;
    transform: translateY(-1px);
  }
  button:active:not(:disabled) {
    transform: translateY(1px);
  }
`;
document.head.appendChild(styleSheet);

export default LoginPage;