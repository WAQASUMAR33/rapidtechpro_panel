'use client';

import React, { useState, useEffect, useRef } from 'react';

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
  blog?: string;
  client?: string;
  challenge?: string;
  processSteps?: string;
  features?: string;
  results?: string;
  categories: Category[];
  technologies: Technology[];
  images: Array<{ id: number; imageUrl: string }>;
  createdAt: string;
  updatedAt: string;
}

export default function ContentPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTechnology, setShowAddTechnology] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTechnologyName, setNewTechnologyName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingTechnology, setAddingTechnology] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [technologyDropdownOpen, setTechnologyDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [technologySearch, setTechnologySearch] = useState('');

  // Dropdown refs for click-outside detection
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const technologyDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    keyword: '',
    metaTitle: '',
    metaDescription: '',
    canonicalTag: '',
    mainImage: '',
    mainImageFile: null as File | null,
    projectUrl: '',
    location: '',
    blog: '',
    client: '',
    challenge: '',
    processSteps: '',
    features: '',
    results: '',
    categoryIds: [] as number[],
    technologyIds: [] as number[],
    images: [] as Array<{ file: File | null; url: string }>,
  });

  // Fetch initial data
  useEffect(() => {
    fetchProjects();
    fetchCategories();
    fetchTechnologies();
    // Initialize with sample data if empty
    initializeSampleData();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Close category dropdown only if click is outside its container
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(target)) {
        setCategoryDropdownOpen(false);
      }

      // Close technology dropdown only if click is outside its container
      if (technologyDropdownRef.current && !technologyDropdownRef.current.contains(target)) {
        setTechnologyDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const initializeSampleData = async () => {
    try {
      const categoriesRes = await fetch('/api/categories', {
        headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
      });
      const categoriesData = await categoriesRes.json();

      if (categoriesData.data && categoriesData.data.length === 0) {
        // Add sample categories
        const sampleCategories = ['Web Design', 'E-Commerce', 'Mobile App', 'Corporate Website'];
        for (const cat of sampleCategories) {
          await fetch('/api/categories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': 'rapidtech_secret_key_2026'
            },
            body: JSON.stringify({ name: cat }),
          });
        }
      }

      const technologiesRes = await fetch('/api/technologies', {
        headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
      });
      const technologiesData = await technologiesRes.json();

      if (technologiesData.data && technologiesData.data.length === 0) {
        // Add sample technologies
        const sampleTechs = ['React', 'Next.js', 'Node.js', 'Vue', 'Angular', 'TypeScript', 'Tailwind CSS', 'MongoDB'];
        for (const tech of sampleTechs) {
          await fetch('/api/technologies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': 'rapidtech_secret_key_2026'
            },
            body: JSON.stringify({ name: tech }),
          });
        }
      }

      fetchCategories();
      fetchTechnologies();
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects?t=' + Date.now(), {
        headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
      });
      const data = await res.json();
      const projectsData = data.success ? data.data : (Array.isArray(data) ? data : data.data || []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?t=' + Date.now(), {
        headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
      });
      const data = await res.json();
      const categoriesData = data.success ? data.data : (Array.isArray(data) ? data : data.data || []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTechnologies = async () => {
    try {
      const res = await fetch('/api/technologies?t=' + Date.now(), {
        headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
      });
      const data = await res.json();
      const technologiesData = data.success ? data.data : (Array.isArray(data) ? data : data.data || []);
      setTechnologies(Array.isArray(technologiesData) ? technologiesData : []);
    } catch (error) {
      console.error('Error fetching technologies:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-');
      setFormData((prev) => ({
        ...prev,
        slug: slug,
      }));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.message || 'Upload failed');
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        mainImageFile: file,
        mainImage: file.name,
      }));
    }
  };

  const handleAdditionalImageChange = (index: number, file: File | null) => {
    const newImages = [...formData.images];
    newImages[index] = {
      file: file,
      url: file ? file.name : '',
    };
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleImageAdd = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { file: null, url: '' }],
    }));
  };

  const handleImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let mainImageUrl = formData.mainImage;

      // Only upload main image if a new file is selected
      if (formData.mainImageFile) {
        if (!editingProjectId) {
          setMessage('📤 Uploading images...');
        }
        mainImageUrl = await uploadImage(formData.mainImageFile);
      } else if (!editingProjectId) {
        setMessage('❌ Please select a main image');
        setLoading(false);
        return;
      }

      // Upload additional images
      const uploadedImageUrls: string[] = [];
      for (const img of formData.images) {
        if (img.file) {
          const url = await uploadImage(img.file);
          uploadedImageUrls.push(url);
        } else if (typeof img.url === 'string' && img.url.startsWith('http')) {
          // Keep existing image URLs
          uploadedImageUrls.push(img.url);
        }
      }

      setMessage(editingProjectId ? '💾 Updating project...' : '💾 Creating project...');

      const method = editingProjectId ? 'PUT' : 'POST';
      const url = editingProjectId ? `/api/projects?id=${editingProjectId}` : '/api/projects';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'rapidtech_secret_key_2026'
        },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          keyword: formData.keyword,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          canonicalTag: formData.canonicalTag,
          mainImage: mainImageUrl,
          projectUrl: formData.projectUrl,
          location: formData.location,
          blog: formData.blog,
          client: formData.client,
          challenge: formData.challenge,
          processSteps: formData.processSteps,
          features: formData.features,
          results: formData.results,
          categoryIds: formData.categoryIds,
          technologyIds: formData.technologyIds,
          images: uploadedImageUrls,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(editingProjectId ? '✅ Project updated successfully!' : '✅ Project created successfully!');
        setFormData({
          title: '',
          slug: '',
          keyword: '',
          metaTitle: '',
          metaDescription: '',
          canonicalTag: '',
          mainImage: '',
          mainImageFile: null,
          projectUrl: '',
          location: '',
          blog: '',
          client: '',
          challenge: '',
          processSteps: '',
          features: '',
          results: '',
          categoryIds: [],
          technologyIds: [],
          images: [],
        });
        setCategoryDropdownOpen(false);
        setTechnologyDropdownOpen(false);
        setCategorySearch('');
        setTechnologySearch('');
        setEditingProjectId(null);
        setShowForm(false);
        fetchProjects();
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✅ Project deleted successfully!');
        fetchProjects();
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const editProject = (project: Project) => {
    setFormData({
      title: project.title,
      slug: project.slug,
      keyword: project.keyword,
      metaTitle: project.metaTitle,
      metaDescription: project.metaDescription,
      canonicalTag: project.canonicalTag || '',
      mainImage: project.mainImage,
      mainImageFile: null,
      projectUrl: project.projectUrl,
      location: project.location,
      blog: project.blog || '',
      client: project.client || '',
      challenge: project.challenge || '',
      processSteps: project.processSteps || '',
      features: project.features || '',
      results: project.results || '',
      categoryIds: project.categories.map(c => c.id),
      technologyIds: project.technologies.map(t => t.id),
      images: project.images.map(img => ({ file: null, url: img.imageUrl })) || [],
    });
    setEditingProjectId(project.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      setMessage('❌ Category name cannot be empty');
      return;
    }

    setAddingCategory(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'rapidtech_secret_key_2026'
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✅ Category added successfully!');
        setNewCategoryName('');
        setShowAddCategory(false);
        fetchCategories();
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAddingCategory(false);
    }
  };

  const addTechnology = async () => {
    if (!newTechnologyName.trim()) {
      setMessage('❌ Technology name cannot be empty');
      return;
    }

    setAddingTechnology(true);
    try {
      const res = await fetch('/api/technologies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'rapidtech_secret_key_2026'
        },
        body: JSON.stringify({ name: newTechnologyName }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✅ Technology added successfully!');
        setNewTechnologyName('');
        setShowAddTechnology(false);
        fetchTechnologies();
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAddingTechnology(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600 mt-1">Manage your projects and portfolio</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add Project'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          {message}
        </div>
      )}

      {/* Project Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {editingProjectId ? 'Edit Project' : 'Add New Project'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Title *
                </label>
                <div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    maxLength={100}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black"
                    placeholder="e.g., E-Commerce Platform"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug *
                </label>
                <div>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    maxLength={100}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black"
                    placeholder="Auto-generated from title"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.slug.length}/100 characters</p>
                </div>
              </div>
            </div>

            {/* SEO Fields */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">SEO Optimization</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Keywords
                  </label>
                  <div>
                    <input
                      type="text"
                      name="keyword"
                      value={formData.keyword}
                      onChange={handleInputChange}
                      maxLength={100}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black"
                      placeholder="e.g., react, ecommerce, web development"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.keyword.length}/100 characters</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <div>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      maxLength={60}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black"
                      placeholder="Page title for search engines"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/60 characters</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <div>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      maxLength={160}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black"
                      placeholder="Page description for search engines (155-160 characters)"
                      rows={2}
                    />
                    <p className={`text-xs mt-1 ${formData.metaDescription.length < 155 ? 'text-yellow-600' : formData.metaDescription.length <= 160 ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.metaDescription.length}/160 characters {formData.metaDescription.length < 155 && '(minimum 155 recommended)'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Canonical Tag
                  </label>
                  <div>
                    <input
                      type="url"
                      name="canonicalTag"
                      value={formData.canonicalTag}
                      onChange={handleInputChange}
                      maxLength={2000}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black"
                      placeholder="e.g., https://example.com/project"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.canonicalTag.length}/2000 characters</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Project Details</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project URL *
                  </label>
                  <div>
                    <input
                      type="url"
                      name="projectUrl"
                      value={formData.projectUrl}
                      onChange={handleInputChange}
                      maxLength={2000}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black"
                      placeholder="https://example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.projectUrl.length}/2000 characters</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      maxLength={100}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black"
                      placeholder="e.g., New York, USA"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.location.length}/100 characters</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Blog / Description
                </label>
                <div>
                  <textarea
                    name="blog"
                    value={formData.blog}
                    onChange={handleInputChange}
                    maxLength={5000}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black placeholder-gray-500"
                    placeholder="Write the project blog/description here..."
                    rows={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.blog.length}/5000 characters</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Client Name
                </label>
                <div>
                  <input
                    type="text"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black"
                    placeholder="e.g., Acme Corporation"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.client.length}/100 characters</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Challenge / Problem Statement
                </label>
                <div>
                  <textarea
                    name="challenge"
                    value={formData.challenge}
                    onChange={handleInputChange}
                    maxLength={2000}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black placeholder-gray-500"
                    placeholder="Describe the challenge or problem the project addressed..."
                    rows={5}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.challenge.length}/2000 characters</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Process / Journey Steps
                </label>
                <div>
                  <textarea
                    name="processSteps"
                    value={formData.processSteps}
                    onChange={handleInputChange}
                    maxLength={2000}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black placeholder-gray-500"
                    placeholder="Describe the process/journey in steps (e.g., Research | Discovery | Design | Development | Testing)"
                    rows={5}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.processSteps.length}/2000 characters</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Key Features / Capabilities
                </label>
                <div>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    maxLength={2000}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black placeholder-gray-500"
                    placeholder="List key features and capabilities (separate with line breaks)..."
                    rows={5}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.features.length}/2000 characters</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Results / Outcomes
                </label>
                <div>
                  <textarea
                    name="results"
                    value={formData.results}
                    onChange={handleInputChange}
                    maxLength={2000}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black placeholder-gray-500"
                    placeholder="Describe the results and outcomes of the project..."
                    rows={5}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.results.length}/2000 characters</p>
                </div>
              </div>
            </div>

            {/* Categories & Technologies */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Project Classification</h4>

              {/* Categories Dropdown */}
              <div className="mb-6" ref={categoryDropdownRef}>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Categories
                </label>
                {categories.length === 0 ? (
                  <p className="text-gray-600 text-sm">No categories available. Create one first.</p>
                ) : (
                  <div>
                    {/* Dropdown Input */}
                    <div className="relative mb-3">
                      <input
                        type="text"
                        placeholder="Search and select categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onFocus={(e) => {
                          e.stopPropagation();
                          setCategoryDropdownOpen(true);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoryDropdownOpen(true);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black placeholder-gray-500"
                      />

                      {/* Dropdown List */}
                      {categoryDropdownOpen && categories.length > 0 && (
                        <div
                          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {categories
                            .filter(
                              (cat) =>
                                cat.name.toLowerCase().includes(categorySearch.toLowerCase()) &&
                                !formData.categoryIds.includes(cat.id)
                            )
                            .map((category) => (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    categoryIds: [...prev.categoryIds, category.id],
                                  }));
                                  setCategorySearch('');
                                  setCategoryDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-teal-50 transition text-gray-800"
                              >
                                {category.name}
                              </button>
                            ))}
                          {categories.filter(
                            (cat) =>
                              cat.name.toLowerCase().includes(categorySearch.toLowerCase()) &&
                              !formData.categoryIds.includes(cat.id)
                          ).length === 0 && (
                              <div className="px-4 py-2 text-gray-500 text-sm">No matching categories</div>
                            )}
                        </div>
                      )}
                    </div>

                    {/* Selected Tags */}
                    <div className="flex flex-wrap gap-2">
                      {formData.categoryIds.map((catId) => {
                        const category = categories.find((c) => c.id === catId);
                        return category ? (
                          <span
                            key={catId}
                            className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                          >
                            {category.name}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  categoryIds: prev.categoryIds.filter((id) => id !== catId),
                                }));
                              }}
                              className="hover:text-teal-900 transition"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Technologies Dropdown */}
              <div ref={technologyDropdownRef}>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Technologies
                </label>
                {technologies.length === 0 ? (
                  <p className="text-gray-600 text-sm">No technologies available. Create one first.</p>
                ) : (
                  <div>
                    {/* Dropdown Input */}
                    <div className="relative mb-3">
                      <input
                        type="text"
                        placeholder="Search and select technologies..."
                        value={technologySearch}
                        onChange={(e) => setTechnologySearch(e.target.value)}
                        onFocus={(e) => {
                          e.stopPropagation();
                          setTechnologyDropdownOpen(true);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTechnologyDropdownOpen(true);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none text-black placeholder-gray-500"
                      />

                      {/* Dropdown List */}
                      {technologyDropdownOpen && technologies.length > 0 && (
                        <div
                          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {technologies
                            .filter(
                              (tech) =>
                                tech.name.toLowerCase().includes(technologySearch.toLowerCase()) &&
                                !formData.technologyIds.includes(tech.id)
                            )
                            .map((technology) => (
                              <button
                                key={technology.id}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    technologyIds: [...prev.technologyIds, technology.id],
                                  }));
                                  setTechnologySearch('');
                                  setTechnologyDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-teal-50 transition text-gray-800"
                              >
                                {technology.name}
                              </button>
                            ))}
                          {technologies.filter(
                            (tech) =>
                              tech.name.toLowerCase().includes(technologySearch.toLowerCase()) &&
                              !formData.technologyIds.includes(tech.id)
                          ).length === 0 && (
                              <div className="px-4 py-2 text-gray-500 text-sm">No matching technologies</div>
                            )}
                        </div>
                      )}
                    </div>

                    {/* Selected Tags */}
                    <div className="flex flex-wrap gap-2">
                      {formData.technologyIds.map((techId) => {
                        const technology = technologies.find((t) => t.id === techId);
                        return technology ? (
                          <span
                            key={techId}
                            className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                          >
                            {technology.name}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  technologyIds: prev.technologyIds.filter((id) => id !== techId),
                                }));
                              }}
                              className="hover:text-teal-900 transition"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Images Section */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Project Images</h4>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Main Image *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                  {formData.mainImage && (
                    <p className="text-sm text-teal-600 mt-2">✓ {formData.mainImage}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Images */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Images</h4>
              <div className="space-y-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAdditionalImageChange(idx, e.target.files?.[0] || null)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(idx)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleImageAdd}
                className="mt-3 px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition"
              >
                + Add Image
              </button>
            </div>

            <div className="border-t pt-6 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                {loading ? (editingProjectId ? 'Updating...' : 'Creating...') : (editingProjectId ? 'Update Project' : 'Create Project')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProjectId(null);
                  setCategoryDropdownOpen(false);
                  setTechnologyDropdownOpen(false);
                  setCategorySearch('');
                  setTechnologySearch('');
                  setFormData({
                    title: '',
                    slug: '',
                    keyword: '',
                    metaTitle: '',
                    metaDescription: '',
                    canonicalTag: '',
                    mainImage: '',
                    mainImageFile: null,
                    projectUrl: '',
                    location: '',
                    blog: '',
                    client: '',
                    challenge: '',
                    processSteps: '',
                    features: '',
                    results: '',
                    categoryIds: [],
                    technologyIds: [],
                    images: [],
                  });
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Projects ({projects.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Categories</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Technologies</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created At</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-600">
                    No projects yet. Create one to get started!
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-semibold text-gray-800">{project.title}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <div className="flex gap-1 flex-wrap">
                        {project.categories.map((cat) => (
                          <span
                            key={cat.id}
                            className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <div className="flex gap-1 flex-wrap">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech.id}
                            className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs"
                          >
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{project.location}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <div className="flex gap-3">
                        <button
                          onClick={() => editProject(project)}
                          className="text-teal-600 hover:text-teal-800 hover:scale-110 transition-transform text-lg"
                          title="Edit project"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="text-red-600 hover:text-red-800 hover:scale-110 transition-transform text-lg"
                          title="Delete project"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


