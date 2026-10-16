
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

const emptyForm = {
  institution: "",
  degree: "",
  field_of_study: "",
  start_date: "",
  end_date: "",
  description: "",
};

export default function CandidateEducation() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRecords = async () => {
    const response = await api.get("candidate/educations/");
    setRecords(response.data.results ?? response.data);
  };

  useEffect(() => {
    loadRecords().catch(() => setError("Unable to load education."));
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
        await api.patch(`candidate/educations/${editingId}/`, payload);
      } else {
        await api.post("candidate/educations/", payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadRecords();
      setMessage("Education saved successfully.");
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Unable to save."));
    }
  };

  const editRecord = (record) => {
    setEditingId(record.id);
    setForm({
      institution: record.institution,
      degree: record.degree,
      field_of_study: record.field_of_study || "",
      start_date: record.start_date,
      end_date: record.end_date || "",
      description: record.description || "",
    });
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this education record?")) return;

    try {
      await api.delete(`candidate/educations/${id}/`);
      await loadRecords();
      setMessage("Education deleted.");
    } catch {
      setError("Unable to delete education.");
    }
  };

  return (
    <main>
      <h1>My Education</h1>
      <Link to="/candidate/dashboard">Back to Dashboard</Link>

      <h2>{editingId ? "Edit Education" : "Add Education"}</h2>

      <form onSubmit={handleSubmit}>
        {[
          ["institution", "Institution"],
          ["degree", "Degree"],
          ["field_of_study", "Field of Study"],
          ["start_date", "Start Date"],
          ["end_date", "End Date"],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              type={key.includes("date") ? "date" : "text"}
              value={form[key]}
              required={["institution", "degree", "start_date"].includes(key)}
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
          {editingId ? "Update Education" : "Add Education"}
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

      <h2>Education History</h2>

      {records.map((record) => (
        <article key={record.id}>
          <h3>{record.degree} — {record.institution}</h3>
          <p>{record.field_of_study}</p>
          <p>{record.start_date} to {record.end_date || "Present"}</p>
          <button onClick={() => editRecord(record)}>Edit</button>
          <button onClick={() => deleteRecord(record.id)}>Delete</button>
        </article>
      ))}
    </main>
  );
}
