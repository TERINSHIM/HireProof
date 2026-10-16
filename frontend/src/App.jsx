import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login";
import CandidateDashboard from "./pages/CandidateDashboard";
import CandidateProfile from "./pages/CandidateProfile";
import CandidatePreferences from "./pages/CandidatePreferences";
import CandidateEducation from "./pages/CandidateEducation";
import CandidateExperience from "./pages/CandidateExperience";
import CandidateSkills from "./pages/CandidateSkills";
import CandidateProjects from "./pages/CandidateProjects";
import ProjectSkills from "./pages/ProjectSkills";
import SkillEvidence from "./pages/SkillEvidence";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/candidate/dashboard"
          element={<CandidateDashboard />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/candidate/profile" element={<CandidateProfile />} />
        <Route path="/candidate/preferences" element={<CandidatePreferences />} />
        <Route path="/candidate/education" element={<CandidateEducation />} />
        <Route path="/candidate/experience" element={<CandidateExperience />} />
        <Route path="/candidate/skills" element={<CandidateSkills />} />
        <Route path="/candidate/skills/:skillId/evidence" element={<SkillEvidence />} />
        <Route path="/candidate/projects" element={<CandidateProjects />} />
        <Route path="/candidate/projects/:projectId/skills" element={<ProjectSkills />} />
      </Routes>
    </BrowserRouter>
  );
}