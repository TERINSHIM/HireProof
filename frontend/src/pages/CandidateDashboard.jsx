import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { Link } from "react-router-dom";

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await api.get("auth/me/");

        if (response.data.role !== "candidate") {
          navigate("/login", { replace: true });
          return;
        }

        setUser(response.data);
      } catch {
        navigate("/login", { replace: true });
      }
    }

    loadUser();
  }, [navigate]);

  const logout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    navigate("/login");
  };

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading dashboard...</p>;

  return (
    <main>
      <h1>HireProof Candidate Dashboard</h1>

      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>
        Email verified: {user.is_email_verified ? "Yes" : "No"}
      </p>

      <nav>
            <p>
                <Link to="/candidate/profile">Edit My Profile</Link>
            </p>

            <p>
                <Link to="/candidate/preferences">Job Preferences</Link>
            </p>
            <p>
                <Link to="/candidate/education">My Education</Link>
            </p>

            <p>
                <Link to="/candidate/experience">Work Experience</Link>
            </p>
            <p><Link to="/candidate/skills">My Skills</Link></p>
            <p><Link to="/candidate/projects">My Projects</Link></p>
        </nav>

      <button onClick={logout}>Logout</button>
    </main>
  );
}