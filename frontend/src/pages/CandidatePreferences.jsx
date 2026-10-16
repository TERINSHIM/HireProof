import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function CandidatePreferences() {
  const [form, setForm] = useState({
    target_role: "",
    preferred_location: "",
    work_mode: "",
    employment_type: "",
    expected_salary: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("candidate/preferences/")
      .then(({ data }) => {
        setForm({
          target_role: data.target_role || "",
          preferred_location: data.preferred_location || "",
          work_mode: data.work_mode || "",
          employment_type: data.employment_type || "",
          expected_salary: data.expected_salary ?? "",
        });
      })
      .catch(() => setError("Unable to load preferences."));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.patch("candidate/preferences/", {
        ...form,
        expected_salary:
          form.expected_salary === "" ? null : form.expected_salary,
      });

      setMessage("Job preferences updated successfully!");
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Update failed."));
    }
  };

  return (
    <main>
      <h1>Job Preferences</h1>
      <Link to="/candidate/dashboard">Back to Dashboard</Link>

      <form onSubmit={handleSubmit}>
        <label>
          Target Job Role
          <input
            value={form.target_role}
            onChange={(e) =>
              setForm({ ...form, target_role: e.target.value })
            }
            placeholder="Python Developer"
          />
        </label>

        <label>
          Preferred Location
          <input
            value={form.preferred_location}
            onChange={(e) =>
              setForm({ ...form, preferred_location: e.target.value })
            }
            placeholder="Kochi"
          />
        </label>

        <label>
          Work Mode
          <select
            value={form.work_mode}
            onChange={(e) =>
              setForm({ ...form, work_mode: e.target.value })
            }
          >
            <option value="">Select work mode</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </label>

        <label>
          Employment Type
          <select
            value={form.employment_type}
            onChange={(e) =>
              setForm({ ...form, employment_type: e.target.value })
            }
          >
            <option value="">Select employment type</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </label>

        <label>
          Expected Salary
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.expected_salary}
            onChange={(e) =>
              setForm({ ...form, expected_salary: e.target.value })
            }
          />
        </label>

        <button type="submit">Save Preferences</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p role="alert">{error}</p>}
    </main>
  );
}