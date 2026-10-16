import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("auth/login/", form);

      sessionStorage.setItem(
        "access_token",
        response.data.access
      );
      sessionStorage.setItem(
        "refresh_token",
        response.data.refresh
      );

      const role = response.data.user.role;

      if (role === "candidate") {
        navigate("/candidate/dashboard");
      } else if (role === "employer") {
        navigate("/employer/dashboard");
      } else {
        setError("Dashboard for this role is not available yet.");
      }
    } catch (err) {
      setError(
        JSON.stringify(err.response?.data || "Login failed.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>HireProof — Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </main>
  );
}