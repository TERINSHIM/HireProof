import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function CandidateProfile() {
  const [form, setForm] = useState({
    phone: "",
    location: "",
    headline: "",
    bio: "",
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
  });

  const [resume, setResume] = useState(null);
  const [currentResume, setCurrentResume] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("candidate/profile/")
      .then(({ data }) => {
        setForm({
          phone: data.phone || "",
          location: data.location || "",
          headline: data.headline || "",
          bio: data.bio || "",
          github_url: data.github_url || "",
          linkedin_url: data.linkedin_url || "",
          portfolio_url: data.portfolio_url || "",
        });
        setCurrentResume(data.resume || "");
      })
      .catch(() => setError("Unable to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (resume) {
        data.append("resume", resume);
      }

      const response = await api.patch("candidate/profile/", data);

      setCurrentResume(response.data.resume || "");
      setResume(null);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Update failed."));
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <main>
      <h1>My Profile</h1>
      <Link to="/candidate/dashboard">Back to Dashboard</Link>

      <form onSubmit={handleSubmit}>
        {[
          ["phone", "Phone Number"],
          ["location", "Location"],
          ["headline", "Professional Headline"],
          ["github_url", "GitHub URL"],
          ["linkedin_url", "LinkedIn URL"],
          ["portfolio_url", "Portfolio URL"],
        ].map(([name, label]) => (
          <div key={name}>
            <label htmlFor={name}>{label}</label>
            <input
              id={name}
              type={name.endsWith("_url") ? "url" : "text"}
              value={form[name]}
              onChange={(e) =>
                setForm({ ...form, [name]: e.target.value })
              }
            />
          </div>
        ))}

        <div>
          <label htmlFor="bio">About Me</label>
          <textarea
            id="bio"
            value={form.bio}
            onChange={(e) =>
              setForm({ ...form, bio: e.target.value })
            }
          />
        </div>

        <div>
          <label htmlFor="resume">Upload Resume (PDF, maximum 5 MB)</label>
          <input
            id="resume"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setResume(e.target.files[0] || null)}
          />
        </div>

        {currentResume && (
          <p>
            <a href={currentResume} target="_blank" rel="noreferrer">
              View Current Resume
            </a>
          </p>
        )}

        <button type="submit">Save Profile</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p role="alert">{error}</p>}
    </main>
  );
}