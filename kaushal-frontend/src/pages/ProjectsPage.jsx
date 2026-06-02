// src/pages/ProjectsPage.jsx
import React, { useState, useEffect } from "react";
import { firestore, auth } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newSkills, setNewSkills] = useState([]);
  const [user, setUser] = useState(null);
  const [joinModal, setJoinModal] = useState({ open: false, project: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkill, setFilterSkill] = useState("");

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const projectsCollection = collection(firestore, "projects");

  useEffect(() => {
    const q = query(projectsCollection, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const addSkill = () => {
    const skill = newSkill.trim();
    if (skill && !newSkills.includes(skill)) setNewSkills([...newSkills, skill]);
    setNewSkill("");
  };

  const removeSkill = (skill) => setNewSkills(newSkills.filter((s) => s !== skill));

  const addProject = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be signed in!");
    if (!newTitle.trim() || newSkills.length === 0) return;

    const projectData = {
      title: newTitle,
      skills: newSkills,
      collaborators: [],
      createdBy: user.uid,
      createdAt: new Date(),
    };

    await addDoc(projectsCollection, projectData);
    setNewTitle("");
    setNewSkills([]);
    setNewSkill("");
  };

  const joinProject = async () => {
    if (!user || !joinModal.project) return;
    const projectRef = doc(firestore, "projects", joinModal.project.id);
    await updateDoc(projectRef, { collaborators: arrayUnion(user.uid) });
    setJoinModal({ open: false, project: null });
  };

  const leaveProject = async (projectId) => {
    if (!user) return;
    const projectRef = doc(firestore, "projects", projectId);
    await updateDoc(projectRef, { collaborators: arrayRemove(user.uid) });
  };

  const deleteProject = async (projectId) => {
    await deleteDoc(doc(firestore, "projects", projectId));
  };

  const allSkills = [...new Set(projects.flatMap((p) => p.skills))];
  const filteredProjects = projects.filter(
    (p) =>
      (p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.skills.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )) &&
      (!filterSkill || p.skills.includes(filterSkill))
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex flex-col items-center">
      <div className="w-full max-w-5xl px-6">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Project Collaboration Hub
        </h1>

        {/* Search / Filter */}
        <div className="flex flex-col md:flex-row items-center gap-4 justify-center mb-10">
          <input
            type="text"
            placeholder="Search projects by title or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            className="w-full md:w-60 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Filter by skill</option>
            {allSkills.map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
          {filterSkill && (
            <button
              onClick={() => setFilterSkill("")}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Add New Project Form */}
        <form onSubmit={addProject} className="bg-white rounded-2xl shadow-lg p-8 mb-12 w-full space-y-5">
          <h2 className="text-2xl font-semibold text-gray-700 text-center">Post a New Project</h2>
          <input
            type="text"
            placeholder="Project Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Add a skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 min-w-[150px] p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={addSkill}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition"
            >
              Add Skill
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {newSkills.map((skill) => (
              <span key={skill} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-red-500 font-bold hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold text-lg transition"
          >
            Add Project
          </button>
        </form>

        {/* Projects List */}
        <div className="flex flex-wrap justify-center gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => {
              const isCollaborator = user && project.collaborators.includes(user.uid);
              return (
                <div key={project.id} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition w-full sm:w-[45%] lg:w-[30%] flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">{project.title}</h3>
                    <div className="flex flex-wrap gap-2 justify-center mb-3">
                      {project.skills.map((skill) => (
                        <span key={skill} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                    {project.collaborators.length > 0 && (
                      <p className="text-gray-600 text-sm text-center">Collaborators: {project.collaborators.join(", ")}</p>
                    )}
                  </div>
                  <div className="mt-4 flex justify-center gap-3 flex-wrap">
                    {!isCollaborator && (
                      <button
                        onClick={() => setJoinModal({ open: true, project })}
                        className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition"
                      >
                        Join
                      </button>
                    )}
                    {isCollaborator && (
                      <button
                        onClick={() => leaveProject(project.id)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition"
                      >
                        Leave
                      </button>
                    )}
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="text-red-500 font-semibold hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 w-full text-center">No projects match your search/filter.</p>
          )}
        </div>

        {/* Join Modal */}
        {joinModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-96 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Join Project</h2>
              <p className="text-center">
                Are you sure you want to join: <strong>{joinModal.project.title}</strong>?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setJoinModal({ open: false, project: null })}
                  className="px-4 py-2 rounded-xl border hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={joinProject}
                  className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}