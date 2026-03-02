'use client';

import React, { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
}

interface Technology {
  id: number;
  name: string;
  icon?: string;
}

interface Project {
  id: number;
  title: string;
  slug: string;
  keyword: string;
  metaTitle: string;
  metaDescription: string;
  canonicalTag?: string;
  mainImage: string;
  projectUrl: string;
  location: string;
  categories: Category[];
  technologies: Technology[];
  images: Array<{ id: number; imageUrl: string }>;
  createdAt: string;
  updatedAt: string;
}

export default function TechnologiesPage() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTechnologyName, setNewTechnologyName] = useState('');
  const [newTechnologyIcon, setNewTechnologyIcon] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnology, setSelectedTechnology] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [technologiesRes, projectsRes] = await Promise.all([
        fetch('/api/technologies?t=' + Date.now(), {
          headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
        }),
        fetch('/api/projects?t=' + Date.now(), {
          headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
        }),
      ]);

      if (technologiesRes.ok) {
        const data = await technologiesRes.json();
        const technologiesData = data.success ? data.data : (Array.isArray(data) ? data : data.data || []);
        setTechnologies(Array.isArray(technologiesData) ? technologiesData : []);
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        const projectsData = data.success ? data.data : (Array.isArray(data) ? data : data.data || []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const addTechnology = async () => {
    if (!newTechnologyName.trim()) {
      setMessage('Please enter a technology name');
      return;
    }

    if (!newTechnologyIcon) {
      setMessage('Please select an icon (PNG format)');
      return;
    }

    try {
      setAdding(true);

      // Upload icon
      const formData = new FormData();
      formData.append('file', newTechnologyIcon);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        setMessage('Error uploading icon');
        setAdding(false);
        return;
      }

      const res = await fetch('/api/technologies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'rapidtech_secret_key_2026'
        },
        body: JSON.stringify({
          name: newTechnologyName.trim(),
          icon: uploadData.data.url,
        }),
      });

      if (res.ok) {
        const newTechnology = await res.json();
        setTechnologies([...technologies, newTechnology]);
        setNewTechnologyName('');
        setNewTechnologyIcon(null);
        setShowAddForm(false);
        setMessage('Technology added successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error adding technology');
      }
    } catch (error) {
      setMessage('Error adding technology');
    } finally {
      setAdding(false);
    }
  };

  const getProjectsByTechnology = (technologyId: number) => {
    return projects.filter((project) =>
      project.technologies.some((tech) => tech.id === technologyId)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Technologies</h2>
          <p className="text-gray-600 mt-1">Manage project technologies</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
        >
          {showAddForm ? 'Cancel' : '+ Add Technology'}
        </button>
      </div>

      {/* Add Technology Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={newTechnologyName}
                onChange={(e) => setNewTechnologyName(e.target.value)}
                maxLength={100}
                placeholder="Enter technology name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none text-black bg-white placeholder-gray-500"
                style={{
                  color: 'black',
                  WebkitTextFillColor: 'black',
                }}
              />
              <p className="text-xs text-gray-500 mt-1">{newTechnologyName.length}/100 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technology Icon (PNG, no background)
              </label>
              <input
                type="file"
                accept=".png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.type === 'image/png') {
                    setNewTechnologyIcon(file);
                  } else {
                    setMessage('Please select a valid PNG file');
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none"
              />
              {newTechnologyIcon && (
                <p className="text-sm text-teal-600 mt-2">✓ {newTechnologyIcon.name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={addTechnology}
                disabled={adding}
                className="flex-1 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition font-medium"
              >
                {adding ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTechnologyName('');
                  setNewTechnologyIcon(null);
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          {message}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxLength={100}
          placeholder="Search technologies..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none text-black bg-white placeholder-gray-500"
          style={{
            color: 'black',
            WebkitTextFillColor: 'black',
          }}
        />
      </div>

      {/* Technology Tags Filter */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-700 mb-2">Filter by Technology:</p>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedTechnology(null)}
            className={`px-2 py-1 text-xs rounded-full font-medium transition ${selectedTechnology === null
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            All
          </button>
          {technologies && technologies.map((tech) => (
            <button
              key={tech.id}
              onClick={() => setSelectedTechnology(tech.id)}
              className={`px-2 py-1 text-xs rounded-full font-medium transition ${selectedTechnology === tech.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {tech.name}
            </button>
          ))}
        </div>
      </div>

      {/* Technologies Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technologies.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg p-8 shadow-sm text-center">
            <p className="text-gray-600">No technologies yet. Create one to get started!</p>
          </div>
        ) : (
          technologies
            .filter((tech) =>
              tech && tech.name && tech.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((technology) => {
              const technologyProjects = getProjectsByTechnology(technology.id);
              return (
                <div
                  key={technology.id}
                  onClick={() => setSelectedTechnology(selectedTechnology === technology.id ? null : technology.id)}
                  className={`bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition cursor-pointer border-2 ${selectedTechnology === technology.id
                      ? 'border-teal-600'
                      : 'border-gray-200'
                    }`}
                >
                  <div className="flex flex-col items-center text-center">
                    {technology.icon && (
                      <img
                        src={technology.icon}
                        alt={technology.name}
                        className="w-12 h-12 object-contain mb-2"
                      />
                    )}
                    <div className="text-4xl font-bold text-teal-600 mb-2">
                      {technologyProjects.length}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {technology.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {technologyProjects.length === 1 ? 'Project' : 'Projects'}
                    </p>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Technology Filter Results */}
      {selectedTechnology && (
        <div className="mt-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Projects using {technologies.find(t => t.id === selectedTechnology)?.name}
            </h3>
            {getProjectsByTechnology(selectedTechnology).length === 0 ? (
              <p className="text-gray-600">No projects using this technology yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getProjectsByTechnology(selectedTechnology).map((project) => (
                  <div
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    {project.mainImage && (
                      <img
                        src={project.mainImage}
                        alt={project.title}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h4 className="font-semibold text-gray-800 line-clamp-2">{project.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {technologies.filter((tech) =>
        tech && tech.name && tech.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).length === 0 &&
        technologies.length > 0 && (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <p className="text-gray-600">No technologies match your search.</p>
          </div>
        )}
    </div>
  );
}

