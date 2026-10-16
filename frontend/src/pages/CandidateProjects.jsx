import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

const initial = {
  title: "", description: "", project_url: "", github_url: ""
};

export default function CandidateProjects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await api.get("candidate/projects/");
    setProjects(res.data.results ?? res.data);
  };

  useEffect(() => {
    load().catch(() => setError("Unable to load projects."));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.patch(`candidate/projects/${editingId}/`, form);
      } else {
        await api.post("candidate/projects/", form);
      }
      setEditingId(null);
      setForm(initial);
      await load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Unable to save project."));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`candidate/projects/${id}/`);
      await load();
    } catch {
      setError("Unable to delete project.");
    }
  };

  return (
    <main>
      <h1>My Projects</h1>
      <Link to="/candidate/dashboard">Back to Dashboard</Link>

      <form onSubmit={save}>
        <input placeholder="Project title" required value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}/>
        <textarea placeholder="Description" required value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}/>
        <input placeholder="Project URL" type="url" value={form.project_url}
          onChange={(e) => setForm({ ...form, project_url: e.target.value })}/>
        <input placeholder="GitHub URL" type="url" value={form.github_url}
          onChange={(e) => setForm({ ...form, github_url: e.target.value })}/>
        <button type="submit">{editingId ? "Update" : "Add"} Project</button>
        {editingId && <button type="button" onClick={() => {
          setEditingId(null); setForm(initial);
        }}>Cancel</button>}
      </form>

      {error && <p role="alert">{error}</p>}

      {projects.map((project) => (
        <article key={project.id}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <Link to={`/candidate/projects/${project.id}/skills`}>
            Tag Skills
          </Link>{" "}
          <button onClick={() => {
            setEditingId(project.id);
            setForm({
              title: project.title,
              description: project.description,
              project_url: project.project_url || "",
              github_url: project.github_url || ""
            });
          }}>Edit</button>{" "}
          <button onClick={() => remove(project.id)}>Delete</button>
        </article>
      ))}
    </main>
  );
}