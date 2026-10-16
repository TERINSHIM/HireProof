import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";

const initial = {
  project: "", title: "", description: "", evidence_url: ""
};

export default function SkillEvidence() {
  const { skillId } = useParams();
  const [records, setRecords] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const [evidence, projectList] = await Promise.all([
      api.get(`candidate/skills/${skillId}/evidence/`),
      api.get("candidate/projects/")
    ]);
    setRecords(evidence.data.results ?? evidence.data);
    setProjects(projectList.data.results ?? projectList.data);
  };

  useEffect(() => {
    load().catch(() => setError("Unable to load evidence."));
  }, [skillId]);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, project: form.project || null };

    try {
      if (editingId) {
        await api.patch(`candidate/skill-evidence/${editingId}/`, payload);
      } else {
        await api.post(`candidate/skills/${skillId}/evidence/`, payload);
      }
      setForm(initial);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Unable to save evidence."));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this evidence?")) return;
    try {
      await api.delete(`candidate/skill-evidence/${id}/`);
      await load();
    } catch {
      setError("Unable to delete evidence.");
    }
  };

  return (
    <main>
      <h1>Skill Evidence</h1>
      <Link to="/candidate/skills">Back to Skills</Link>

      <form onSubmit={save}>
        <input placeholder="Evidence title" required value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}/>
        <textarea placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}/>
        <input placeholder="Evidence URL" type="url" value={form.evidence_url}
          onChange={(e) => setForm({ ...form, evidence_url: e.target.value })}/>
        <select value={form.project}
          onChange={(e) => setForm({ ...form, project: e.target.value })}>
          <option value="">No linked project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <button type="submit">{editingId ? "Update" : "Add"} Evidence</button>
        {editingId && <button type="button" onClick={() => {
          setEditingId(null); setForm(initial);
        }}>Cancel</button>}
      </form>

      {error && <p role="alert">{error}</p>}

      {records.map((record) => (
        <article key={record.id}>
          <h3>{record.title}</h3>
          <p>{record.description}</p>
          {record.evidence_url && (
            <a href={record.evidence_url} target="_blank" rel="noreferrer">
              View Evidence
            </a>
          )}
          <button onClick={() => {
            setEditingId(record.id);
            setForm({
              project: record.project || "",
              title: record.title,
              description: record.description || "",
              evidence_url: record.evidence_url || ""
            });
          }}>Edit</button>
          <button onClick={() => remove(record.id)}>Delete</button>
        </article>
      ))}
    </main>
  );
}