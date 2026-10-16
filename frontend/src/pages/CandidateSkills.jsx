import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function CandidateSkills() {
  const [skills, setSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [mine, available] = await Promise.all([
      api.get("candidate/skills/"),
      api.get("skills/"),
    ]);
    setSkills(mine.data.results ?? mine.data);
    setAvailableSkills(available.data.results ?? available.data);
  };

  useEffect(() => {
    load().catch(() => setError("Unable to load skills."));
  }, []);

  const addSkill = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("candidate/skills/", { skill: selectedSkill });
      setSelectedSkill("");
      await load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Unable to add skill."));
    }
  };

  const deleteSkill = async (id) => {
    if (!window.confirm("Remove this skill and its linked evidence?")) return;
    try {
      await api.delete(`candidate/skills/${id}/`);
      await load();
    } catch {
      setError("Unable to remove skill.");
    }
  };

  return (
    <main>
      <h1>My Skills</h1>
      <Link to="/candidate/dashboard">Back to Dashboard</Link>

      <form onSubmit={addSkill}>
        <select required value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}>
          <option value="">Select a skill</option>
          {availableSkills.map((skill) => (
            <option key={skill.id} value={skill.id}>{skill.name}</option>
          ))}
        </select>
        <button type="submit">Add Skill</button>
      </form>

      {error && <p role="alert">{error}</p>}

      {skills.map((skill) => (
        <article key={skill.id}>
          <strong>{skill.skill_name}</strong>{" "}
          <Link to={`/candidate/skills/${skill.id}/evidence`}>
            Manage Evidence
          </Link>{" "}
          <button onClick={() => deleteSkill(skill.id)}>Delete</button>
        </article>
      ))}
    </main>
  );
}