import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("auth/register/", form);

      navigate("/verify-email", {
        state: { email: form.email },
      });
    } catch (err) {
      const data = err.response?.data;
      setError(
        data
          ? JSON.stringify(data)
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>HireProof — Sign Up</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          minLength={8}
          required
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="candidate">Candidate</option>
          <option value="employer">Employer</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      <p>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </main>
  );
}