
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

const emptyForm = {
  job_title: "",
  company_name: "",
  employment_type: "",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
};

export default function CandidateExperience() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRecords = async () => {
    const response = await api.get("candidate/experiences/");
    setRecords(response.data.results ?? response.data);
  };

  useEffect(() => {
    loadRecords().catch(() => setError("Unable to load experiences."));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        end_date: form.end_date || null,
      };

      if (editingId) {
        await api.patch(`candidate/experiences/${editingId}/`, payload);
      } else {
        await api.post("candidate/experiences/", payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadRecords();
      setMessage("Experience saved successfully.");
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Unable to save."));
    }
  };

  const editRecord = (record) => {
    setEditingId(record.id);
    setForm({
      job_title: record.job_title,
      company_name: record.company_name,
      employment_type: record.employment_type || "",
      location: record.location || "",
      start_date: record.start_date,
      end_date: record.end_date || "",
      description: record.description || "",
    });
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this experience?")) return;

    try {
      await api.delete(`candidate/experiences/${id}/`);
      await loadRecords();
      setMessage("Experience deleted.");
    } catch {
      setError("Unable to delete experience.");
    }
  };

  return (
    <main>
      <h1>Work Experience</h1>
      <Link to="/candidate/dashboard">Back to Dashboard</Link>

      <h2>{editingId ? "Edit Experience" : "Add Experience"}</h2>

      <form onSubmit={handleSubmit}>
        {[
          ["job_title", "Job Title"],
          ["company_name", "Company Name"],
          ["employment_type", "Employment Type"],
          ["location", "Location"],
          ["start_date", "Start Date"],
          ["end_date", "End Date"],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              type={key.includes("date") ? "date" : "text"}
              value={form[key]}
              required={["job_title", "company_name", "start_date"].includes(key)}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
            />
          </label>
        ))}

        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </label>

        <button type="submit">
          {editingId ? "Update Experience" : "Add Experience"}
        </button>

        {editingId && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
          }}>
            Cancel Edit
          </button>
        )}
      </form>

      {message && <p>{message}</p>}
      {error && <p role="alert">{error}</p>}

      <h2>Experience History</h2>

      {records.map((record) => (
        <article key={record.id}>
          <h3>{record.job_title} — {record.company_name}</h3>
          <p>{record.location}</p>
          <p>{record.start_date} to {record.end_date || "Present"}</p>
          <button onClick={() => editRecord(record)}>Edit</button>
          <button onClick={() => deleteRecord(record.id)}>Delete</button>
        </article>
      ))}
    </main>
  );
}
