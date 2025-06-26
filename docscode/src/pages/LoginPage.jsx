import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

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
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Server error");
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleLogin}>
        <h2 style={styles.title}>🩺Doc's CODE🏥</h2>
        <h3 style={styles.subtitle}>Doctor Login</h3>

        <input
          type="text"
          placeholder="Doctor ID"
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <div style={styles.buttonContainer}>
          <button type="submit" style={styles.button}>Login</button>
        </div>
      </form>
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
    backgroundColor: '#f0f4f8',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: '50px 40px',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
    width: '380px',
  },
  title: {
    marginBottom: '5px',
    textAlign: 'center',
    fontSize: '28px',
    color: '#2c3e50',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '20px',
    color: '#34495e',
    fontWeight: '500',
  },
  input: {
    width: '90%',
    padding: '14px',
    marginBottom: '20px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
    outlineColor: '#3498db',
  },
  buttonContainer: {
    textAlign: 'center',
  },
  button: {
    width: '60%',
    padding: '13px',
    borderRadius: '8px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};

export default LoginPage;
