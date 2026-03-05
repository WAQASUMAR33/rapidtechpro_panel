'use client';

import React, { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
}

interface Technology {
  id: number;
  name: string;
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, projectsRes] = await Promise.all([
        fetch('/api/categories?t=' + Date.now(), {
          headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
        }),
        fetch('/api/projects?t=' + Date.now(), {
          headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
        }),
      ]);

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        const categoriesData = data.success ? data.data : (Array.isArray(data) ? data : data.data || []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
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

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      setMessage('Please enter a category name');
      return;
    }

    try {
      setAdding(true);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'rapidtech_secret_key_2026'
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (res.ok) {
        const result = await res.json();
        const newCategory = result.success ? result.data : result;
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
        setShowAddForm(false);
        setMessage('Category added successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error adding category');
      }
    } catch (error) {
      setMessage('Error adding category');
    } finally {
      setAdding(false);
    }
  };

  const getProjectsByCategory = (categoryId: number) => {
    return projects.filter((project) =>
      project.categories.some((cat) => cat.id === categoryId)
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
          <h2 className="text-3xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-600 mt-1">Manage project categories</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
        >
          {showAddForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                maxLength={100}
                placeholder="Enter category name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none text-black bg-white"
                style={{
                  color: 'black',
                  WebkitTextFillColor: 'black',
                }}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              />
              <p className="text-xs text-gray-500 mt-1">{newCategoryName.length}/100 characters</p>
            </div>
            <button
              onClick={addCategory}
              disabled={adding}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition font-medium self-start"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
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
          placeholder="Search categories..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none text-black bg-white placeholder-gray-500"
          style={{
            color: 'black',
            WebkitTextFillColor: 'black',
          }}
        />
      </div>

      {/* Category Tags Filter */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-700 mb-2">Filter by Category:</p>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2 py-1 text-xs rounded-full font-medium transition ${selectedCategory === null
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            All
          </button>
          {categories && categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-1 text-xs rounded-full font-medium transition ${selectedCategory === cat.id
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg p-8 shadow-sm text-center">
            <p className="text-gray-600">No categories yet. Create one to get started!</p>
          </div>
        ) : (
          categories
            .filter((cat) =>
              cat && cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((category) => {
              const categoryProjects = getProjectsByCategory(category.id);

              return (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className={`bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition cursor-pointer border-2 ${selectedCategory === category.id
                    ? 'border-teal-600'
                    : 'border-gray-200'
                    }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="text-4xl font-bold text-teal-600 mb-2">
                      {categoryProjects.length}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {categoryProjects.length === 1 ? 'Project' : 'Projects'}
                    </p>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Category Filter Results */}
      {selectedCategory && (
        <div className="mt-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Projects in {categories.find(c => c.id === selectedCategory)?.name}
            </h3>
            {getProjectsByCategory(selectedCategory).length === 0 ? (
              <p className="text-gray-600">No projects in this category yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getProjectsByCategory(selectedCategory).map((project) => (
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
                      {project.technologies.map((tech) => (
                        <span
                          key={tech.id}
                          className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded"
                        >
                          {tech.name}
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
      {categories.filter((cat) =>
        cat && cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).length === 0 &&
        categories.length > 0 && (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <p className="text-gray-600">No categories match your search.</p>
          </div>
        )}
    </div>
  );
}


