import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";

export default function ProjectSkills() {
  const { projectId } = useParams();
  const [tagged, setTagged] = useState([]);
  const [candidateSkills, setCandidateSkills] = useState([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [tags, skills] = await Promise.all([
      api.get(`candidate/projects/${projectId}/skills/`),
      api.get("candidate/skills/"),
    ]);
    setTagged(tags.data.results ?? tags.data);
    setCandidateSkills(skills.data.results ?? skills.data);
  };

  useEffect(() => {
    load().catch(() => setError("Unable to load project skills."));
  }, [projectId]);

  const add = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post(`candidate/projects/${projectId}/skills/`, {
        candidate_skill: selected
      });
      setSelected("");
      await load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Unable to tag skill."));
    }
  };

  const remove = async (id) => {
    await api.delete(`candidate/project-skills/${id}/`);
    await load();
  };

  return (
    <main>
      <h1>Project Skills</h1>
      <Link to="/candidate/projects">Back to Projects</Link>

      <form onSubmit={add}>
        <select required value={selected}
          onChange={(e) => setSelected(e.target.value)}>
          <option value="">Select candidate skill</option>
          {candidateSkills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.skill_name}
            </option>
          ))}
        </select>
        <button type="submit">Tag Skill</button>
      </form>

      {error && <p role="alert">{error}</p>}

      {tagged.map((tag) => (
        <p key={tag.id}>
          {candidateSkills.find((s) => s.id === tag.candidate_skill)?.skill_name
            || tag.candidate_skill}{" "}
          <button onClick={() => remove(tag.id)}>Remove</button>
        </p>
      ))}
    </main>
  );
}