'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { uploadImageDirect } from '@/lib/uploadImage';

interface Category {
  id: number;
  name: string;
}

interface Technology {
  id: number;
  name: string;
  icon?: string | null;
}

interface ProjectImageItem {
  id?: number;
  imageUrl: string;
  file?: File | null;
  preview?: string;
}

interface Project {
  id: number;
  title: string;
  slug: string;
  keyword: string;
  metaTitle: string;
  metaDescription: string;
  canonicalTag?: string | null;
  mainImage: string;
  bannerImage?: string | null;
  projectIcon?: string | null;
  projectUrl: string;
  videoUrl?: string | null;
  location: string;
  shortDescription?: string | null;
  blog?: string | null;
  client?: string | null;
  strategy?: string | null;
  challenge?: string | null;
  challengeImage1?: string | null;
  challengeImage2?: string | null;
  challengeImage3?: string | null;
  processSteps?: string | null;
  features?: string | null;
  results?: string | null;
  successPoints?: string | null;
  innovation?: string | null;
  duration?: string | null;
  adaptableHeading?: string | null;
  adaptableDescription?: string | null;
  adaptableImage1?: string | null;
  adaptableImage2?: string | null;
  adaptableImage3?: string | null;
  categories: Category[];
  technologies: Technology[];
  images: Array<{ id: number; imageUrl: string }>;
  createdAt: string;
  updatedAt: string;
}

// Reusable Image Upload & Preview Card component
function ImageUploadDropzone({
  label,
  sublabel,
  required = false,
  aspect = 'aspect-video',
  currentUrl,
  selectedFile,
  onFileChange,
  onRemove,
}: {
  label: string;
  sublabel?: string;
  required?: boolean;
  aspect?: string;
  currentUrl?: string | null;
  selectedFile?: File | null;
  onFileChange: (file: File) => void;
  onRemove: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setLocalPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalPreview('');
    }
  }, [selectedFile]);

  const displayImage = localPreview || currentUrl;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileChange(file);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {sublabel && <span className="text-[11px] text-slate-400">{sublabel}</span>}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative ${aspect} rounded-xl border-2 transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer group shadow-sm ${
          isDragging
            ? 'border-teal-500 bg-teal-50 scale-[1.01]'
            : displayImage
            ? 'border-slate-200 bg-slate-900'
            : 'border-dashed border-slate-300 bg-slate-50/70 hover:border-teal-400 hover:bg-teal-50/30'
        }`}
      >
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt={label}
              className="w-full h-full object-cover transition duration-300 group-hover:opacity-60"
            />
            {/* Status pill on top of image */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-teal-300 backdrop-blur-sm border border-teal-500/30">
              {localPreview ? 'New Selected' : 'Current Asset'}
            </div>

            {/* Hover overlay with action buttons */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-2 bg-slate-950/60 backdrop-blur-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
              >
                Change
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <div className="p-4 flex flex-col items-center justify-center text-center text-slate-400 group-hover:text-teal-600 transition">
            <div className="p-2.5 bg-slate-100 rounded-full group-hover:bg-teal-100 mb-1.5 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-teal-700">Choose Image</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Click or drag & drop (JPG, PNG, WebP)</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onFileChange(e.target.files[0]);
          }
        }}
        className="hidden"
      />
    </div>
  );
}

export default function ContentPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Quick modals for Category & Technology creation
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

  // Main Form Data
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    keyword: '',
    metaTitle: '',
    metaDescription: '',
    canonicalTag: '',
    
    // Media & Assets
    mainImage: '',
    mainImageFile: null as File | null,
    bannerImage: '',
    bannerImageFile: null as File | null,
    projectIcon: '',
    projectIconFile: null as File | null,

    projectUrl: '',
    videoUrl: '',
    location: '',
    shortDescription: '',
    blog: '',
    client: '',
    strategy: '',
    challenge: '',

    // Challenge Images
    challengeImage1: '',
    challengeImage1File: null as File | null,
    challengeImage2: '',
    challengeImage2File: null as File | null,
    challengeImage3: '',
    challengeImage3File: null as File | null,

    processSteps: '',
    features: '',
    results: '',
    successPoints: '',
    innovation: '',
    duration: '',

    // Adaptable / AR
    adaptableHeading: '',
    adaptableDescription: '',
    adaptableImage1: '',
    adaptableImage1File: null as File | null,
    adaptableImage2: '',
    adaptableImage2File: null as File | null,
    adaptableImage3: '',
    adaptableImage3File: null as File | null,

    categoryIds: [] as number[],
    technologyIds: [] as number[],
    additionalImages: [] as Array<{ file: File | null; url: string; preview?: string }>,
  });

  // Fetch initial data
  useEffect(() => {
    fetchProjects();
    fetchCategories();
    fetchTechnologies();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(target)) {
        setCategoryDropdownOpen(false);
      }
      if (technologyDropdownRef.current && !technologyDropdownRef.current.contains(target)) {
        setTechnologyDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

    // Auto-generate slug from title if editing slug hasn't diverged heavily
    if (name === 'title' && !editingProjectId) {
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

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      keyword: '',
      metaTitle: '',
      metaDescription: '',
      canonicalTag: '',
      mainImage: '',
      mainImageFile: null,
      bannerImage: '',
      bannerImageFile: null,
      projectIcon: '',
      projectIconFile: null,
      projectUrl: '',
      videoUrl: '',
      location: '',
      shortDescription: '',
      blog: '',
      client: '',
      strategy: '',
      challenge: '',
      challengeImage1: '',
      challengeImage1File: null,
      challengeImage2: '',
      challengeImage2File: null,
      challengeImage3: '',
      challengeImage3File: null,
      processSteps: '',
      features: '',
      results: '',
      successPoints: '',
      innovation: '',
      duration: '',
      adaptableHeading: '',
      adaptableDescription: '',
      adaptableImage1: '',
      adaptableImage1File: null,
      adaptableImage2: '',
      adaptableImage2File: null,
      adaptableImage3: '',
      adaptableImage3File: null,
      categoryIds: [],
      technologyIds: [],
      additionalImages: [],
    });
    setCategoryDropdownOpen(false);
    setTechnologyDropdownOpen(false);
    setCategorySearch('');
    setTechnologySearch('');
    setEditingProjectId(null);
    setShowForm(false);
    setStatusMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.slug.trim()) {
      setStatusMessage({ type: 'error', text: 'Project Title and Slug are required.' });
      return;
    }

    if (!editingProjectId && !formData.mainImageFile && !formData.mainImage) {
      setStatusMessage({ type: 'error', text: 'Main Display Image is required for the project.' });
      return;
    }

    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Processing assets and uploading media...' });

    try {
      let mainImageUrl = formData.mainImage;
      let bannerImageUrl = formData.bannerImage;
      let projectIconUrl = formData.projectIcon;
      let challengeImage1Url = formData.challengeImage1;
      let challengeImage2Url = formData.challengeImage2;
      let challengeImage3Url = formData.challengeImage3;
      let adaptableImage1Url = formData.adaptableImage1;
      let adaptableImage2Url = formData.adaptableImage2;
      let adaptableImage3Url = formData.adaptableImage3;

      // Upload Main Image
      if (formData.mainImageFile) {
        setStatusMessage({ type: 'info', text: 'Uploading main display image...' });
        mainImageUrl = await uploadImageDirect(formData.mainImageFile);
      }

      // Upload Banner Image
      if (formData.bannerImageFile) {
        setStatusMessage({ type: 'info', text: 'Uploading hero banner...' });
        bannerImageUrl = await uploadImageDirect(formData.bannerImageFile);
      }

      // Upload Project Icon
      if (formData.projectIconFile) {
        setStatusMessage({ type: 'info', text: 'Uploading brand icon...' });
        projectIconUrl = await uploadImageDirect(formData.projectIconFile);
      }

      // Upload Challenge Images
      if (formData.challengeImage1File) {
        challengeImage1Url = await uploadImageDirect(formData.challengeImage1File);
      }
      if (formData.challengeImage2File) {
        challengeImage2Url = await uploadImageDirect(formData.challengeImage2File);
      }
      if (formData.challengeImage3File) {
        challengeImage3Url = await uploadImageDirect(formData.challengeImage3File);
      }

      // Upload Adaptable / Screenshot Images
      if (formData.adaptableImage1File) {
        adaptableImage1Url = await uploadImageDirect(formData.adaptableImage1File);
      }
      if (formData.adaptableImage2File) {
        adaptableImage2Url = await uploadImageDirect(formData.adaptableImage2File);
      }
      if (formData.adaptableImage3File) {
        adaptableImage3Url = await uploadImageDirect(formData.adaptableImage3File);
      }

      // Upload Additional Gallery Images
      const finalAdditionalImageUrls: string[] = [];
      for (let i = 0; i < formData.additionalImages.length; i++) {
        const item = formData.additionalImages[i];
        if (item.file) {
          setStatusMessage({ type: 'info', text: `Uploading gallery image ${i + 1}...` });
          const url = await uploadImageDirect(item.file);
          finalAdditionalImageUrls.push(url);
        } else if (item.url && item.url.startsWith('http')) {
          finalAdditionalImageUrls.push(item.url);
        }
      }

      setStatusMessage({ type: 'info', text: editingProjectId ? 'Saving project updates...' : 'Creating new portfolio project...' });

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        keyword: formData.keyword.trim(),
        metaTitle: formData.metaTitle.trim(),
        metaDescription: formData.metaDescription.trim(),
        canonicalTag: formData.canonicalTag.trim() || null,
        mainImage: mainImageUrl,
        bannerImage: bannerImageUrl || null,
        projectIcon: projectIconUrl || null,
        projectUrl: formData.projectUrl.trim(),
        videoUrl: formData.videoUrl.trim() || null,
        location: formData.location.trim() || 'Global',
        shortDescription: formData.shortDescription?.trim() || null,
        blog: formData.blog?.trim() || null,
        client: formData.client?.trim() || null,
        strategy: formData.strategy?.trim() || null,
        challenge: formData.challenge?.trim() || null,
        challengeImage1: challengeImage1Url || null,
        challengeImage2: challengeImage2Url || null,
        challengeImage3: challengeImage3Url || null,
        processSteps: formData.processSteps?.trim() || null,
        features: formData.features?.trim() || null,
        results: formData.results?.trim() || null,
        successPoints: formData.successPoints?.trim() || null,
        innovation: formData.innovation?.trim() || null,
        duration: formData.duration?.trim() || null,
        adaptableHeading: formData.adaptableHeading?.trim() || null,
        adaptableDescription: formData.adaptableDescription?.trim() || null,
        adaptableImage1: adaptableImage1Url || null,
        adaptableImage2: adaptableImage2Url || null,
        adaptableImage3: adaptableImage3Url || null,
        categoryIds: formData.categoryIds,
        technologyIds: formData.technologyIds,
        images: finalAdditionalImageUrls,
      };

      const method = editingProjectId ? 'PUT' : 'POST';
      const endpoint = editingProjectId ? `/api/projects/${editingProjectId}` : '/api/projects';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'rapidtech_secret_key_2026'
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: editingProjectId ? 'Project updated successfully!' : 'Project created successfully!'
        });
        setTimeout(() => {
          resetForm();
          fetchProjects();
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to save project' });
      }
    } catch (error: any) {
      console.error(error);
      setStatusMessage({ type: 'error', text: error.message || 'An error occurred while saving project.' });
    } finally {
      setLoading(false);
    }
  };

  const editProject = (project: Project) => {
    setFormData({
      title: project.title,
      slug: project.slug,
      keyword: project.keyword || '',
      metaTitle: project.metaTitle || '',
      metaDescription: project.metaDescription || '',
      canonicalTag: project.canonicalTag || '',
      mainImage: project.mainImage,
      mainImageFile: null,
      bannerImage: project.bannerImage || '',
      bannerImageFile: null,
      projectIcon: project.projectIcon || '',
      projectIconFile: null,
      projectUrl: project.projectUrl || '',
      videoUrl: project.videoUrl || '',
      location: project.location || '',
      shortDescription: project.shortDescription || '',
      blog: project.blog || '',
      client: project.client || '',
      strategy: project.strategy || '',
      challenge: project.challenge || '',
      challengeImage1: project.challengeImage1 || '',
      challengeImage1File: null,
      challengeImage2: project.challengeImage2 || '',
      challengeImage2File: null,
      challengeImage3: project.challengeImage3 || '',
      challengeImage3File: null,
      processSteps: project.processSteps || '',
      features: project.features || '',
      results: project.results || '',
      successPoints: project.successPoints || '',
      innovation: project.innovation || '',
      duration: project.duration || '',
      adaptableHeading: project.adaptableHeading || '',
      adaptableDescription: project.adaptableDescription || '',
      adaptableImage1: project.adaptableImage1 || '',
      adaptableImage1File: null,
      adaptableImage2: project.adaptableImage2 || '',
      adaptableImage2File: null,
      adaptableImage3: project.adaptableImage3 || '',
      adaptableImage3File: null,
      categoryIds: project.categories ? project.categories.map((c) => c.id) : [],
      technologyIds: project.technologies ? project.technologies.map((t) => t.id) : [],
      additionalImages: project.images ? project.images.map((img) => ({ file: null, url: img.imageUrl })) : [],
    });
    setEditingProjectId(project.id);
    setShowForm(true);
    setStatusMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProject = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: `Project "${title}" deleted successfully.` });
        fetchProjects();
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        alert(data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'rapidtech_secret_key_2026'
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCategoryName('');
        setShowAddCategory(false);
        await fetchCategories();
        if (data.data?.id) {
          setFormData((prev) => ({
            ...prev,
            categoryIds: [...prev.categoryIds, data.data.id],
          }));
        }
      } else {
        alert(data.message || 'Failed to add category');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingCategory(false);
    }
  };

  const addTechnology = async () => {
    if (!newTechnologyName.trim()) return;
    setAddingTechnology(true);
    try {
      const res = await fetch('/api/technologies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'rapidtech_secret_key_2026'
        },
        body: JSON.stringify({ name: newTechnologyName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewTechnologyName('');
        setShowAddTechnology(false);
        await fetchTechnologies();
        if (data.data?.id) {
          setFormData((prev) => ({
            ...prev,
            technologyIds: [...prev.technologyIds, data.data.id],
          }));
        }
      } else {
        alert(data.message || 'Failed to add technology');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingTechnology(false);
    }
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.client && project.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.location && project.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategoryFilter === 'All' ||
        (project.categories && project.categories.some((c) => c.name === selectedCategoryFilter));

      return matchesSearch && matchesCategory;
    });
  }, [projects, searchQuery, selectedCategoryFilter]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 rounded-2xl shadow-xl text-white">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Portfolio & Case Studies</h2>
            <p className="text-slate-300 text-sm mt-1">Manage, curate, and showcase your enterprise projects and rich visual content</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
            <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold block">Total Projects</span>
            <span className="text-2xl font-bold text-teal-300">{projects.length}</span>
          </div>

          {!showForm && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create New Project
            </button>
          )}
        </div>
      </div>

      {/* Notification banner */}
      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm transition-all animate-fadeIn ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : statusMessage.type === 'error'
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : 'bg-teal-50 text-teal-800 border-teal-200'
        }`}>
          {statusMessage.type === 'success' && (
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {statusMessage.type === 'error' && (
            <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {statusMessage.type === 'info' && (
            <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          )}
          <span className="font-medium text-sm">{statusMessage.text}</span>
        </div>
      )}

      {/* Project Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-800">
                {editingProjectId ? `Editing Project: ${formData.title}` : 'Create New Portfolio Project'}
              </h3>
            </div>
            <button
              onClick={resetForm}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-10">
            {/* Section 1: Basic Information & SEO */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">1</span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Basic Information & SEO Metadata</h4>
                  <p className="text-xs text-slate-500">Define the project title, slug, and search engine optimization details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Project Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    maxLength={100}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 font-medium text-sm placeholder-slate-400"
                    placeholder="e.g. Next-Gen FinTech Trading Platform"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">{formData.title.length}/100 characters</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Slug (URL Identifier) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs text-slate-400 font-mono">/project/</span>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      maxLength={100}
                      required
                      className="w-full pl-20 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 font-mono text-sm placeholder-slate-400"
                      placeholder="fintech-trading-platform"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Clean URL key for SEO</span>
                </div>
              </div>

              {/* SEO Subgrid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Meta Keywords</label>
                  <input
                    type="text"
                    name="keyword"
                    value={formData.keyword}
                    onChange={handleInputChange}
                    maxLength={150}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="e.g. fintech, blockchain, nextjs, react"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Meta Title</label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    maxLength={70}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="FinTech Trading Platform | Case Study"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">{formData.metaTitle.length}/70 characters</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Canonical URL</label>
                  <input
                    type="url"
                    name="canonicalTag"
                    value={formData.canonicalTag}
                    onChange={handleInputChange}
                    maxLength={2000}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="https://example.com/project/fintech"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Meta Description</label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    maxLength={160}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="Comprehensive case study detailing architecture, challenges, and ROI of the trading system (150-160 characters)"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">{formData.metaDescription.length}/160 characters</span>
                </div>
              </div>
            </div>

            {/* Section 2: Core Details & Client Specs */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">2</span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Project Overview & Specifications</h4>
                  <p className="text-xs text-slate-500">Key project metadata including URLs, client name, timeline, and location</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Live Project / Demo URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="projectUrl"
                    value={formData.projectUrl}
                    onChange={handleInputChange}
                    maxLength={2000}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Client / Organization</label>
                  <input
                    type="text"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="e.g. Apex Global Markets"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Project Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="e.g. 4 Months (Q1 - Q2)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Geographic Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="e.g. New York, USA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Video Demo / Walkthrough URL</label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    maxLength={2000}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="https://youtube.com/watch?v=... or Vimeo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Short Tagline / Summary <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription || ''}
                    onChange={handleInputChange}
                    maxLength={500}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="Brief 1-2 sentence executive summary of the project..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Case Study / Blog Article</label>
                <textarea
                  name="blog"
                  value={formData.blog || ''}
                  onChange={handleInputChange}
                  maxLength={5000}
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                  placeholder="In-depth narrative of the project, user experience discovery, architectural highlights, and implementation..."
                />
              </div>
            </div>

            {/* Section 3: Visual Assets & Hero Media */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">3</span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Project Branding & Hero Assets</h4>
                  <p className="text-xs text-slate-500">Upload primary visual assets for cover cards, hero banners, and brand icons</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Project Icon */}
                <ImageUploadDropzone
                  label="Brand Icon / Logo"
                  sublabel="Square 1:1 format"
                  aspect="aspect-square max-w-[200px] mx-auto md:mx-0"
                  currentUrl={formData.projectIcon}
                  selectedFile={formData.projectIconFile}
                  onFileChange={(file) => setFormData((prev) => ({ ...prev, projectIconFile: file }))}
                  onRemove={() => setFormData((prev) => ({ ...prev, projectIcon: '', projectIconFile: null }))}
                />

                {/* Main Display Image */}
                <ImageUploadDropzone
                  label="Main Cover Image"
                  sublabel="Card thumbnail (16:9)"
                  required={!editingProjectId}
                  aspect="aspect-video"
                  currentUrl={formData.mainImage}
                  selectedFile={formData.mainImageFile}
                  onFileChange={(file) => setFormData((prev) => ({ ...prev, mainImageFile: file }))}
                  onRemove={() => setFormData((prev) => ({ ...prev, mainImage: '', mainImageFile: null }))}
                />

                {/* Hero Banner Image */}
                <ImageUploadDropzone
                  label="Hero Banner Image"
                  sublabel="Header background"
                  aspect="aspect-video"
                  currentUrl={formData.bannerImage}
                  selectedFile={formData.bannerImageFile}
                  onFileChange={(file) => setFormData((prev) => ({ ...prev, bannerImageFile: file }))}
                  onRemove={() => setFormData((prev) => ({ ...prev, bannerImage: '', bannerImageFile: null }))}
                />
              </div>
            </div>

            {/* Section 4: Journey, Challenges & Strategy */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">4</span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Project Journey, Challenges & Strategy</h4>
                  <p className="text-xs text-slate-500">Detail the business obstacles, problem statement, challenge reference images, and execution strategy</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Challenge / Problem Statement</label>
                  <textarea
                    name="challenge"
                    value={formData.challenge || ''}
                    onChange={handleInputChange}
                    maxLength={2000}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="Describe the initial bottlenecks, technical challenges, or UX pain points..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Our Strategic Approach</label>
                  <textarea
                    name="strategy"
                    value={formData.strategy || ''}
                    onChange={handleInputChange}
                    maxLength={2000}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="Describe the design thinking, technical roadmap, and architectural strategy..."
                  />
                </div>
              </div>

              {/* Challenge Reference Images (1, 2, 3) */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Challenge & Problem Reference Images (Optional)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <ImageUploadDropzone
                    label="Challenge Image 1"
                    aspect="aspect-[4/3]"
                    currentUrl={formData.challengeImage1}
                    selectedFile={formData.challengeImage1File}
                    onFileChange={(file) => setFormData((prev) => ({ ...prev, challengeImage1File: file }))}
                    onRemove={() => setFormData((prev) => ({ ...prev, challengeImage1: '', challengeImage1File: null }))}
                  />
                  <ImageUploadDropzone
                    label="Challenge Image 2"
                    aspect="aspect-[4/3]"
                    currentUrl={formData.challengeImage2}
                    selectedFile={formData.challengeImage2File}
                    onFileChange={(file) => setFormData((prev) => ({ ...prev, challengeImage2File: file }))}
                    onRemove={() => setFormData((prev) => ({ ...prev, challengeImage2: '', challengeImage2File: null }))}
                  />
                  <ImageUploadDropzone
                    label="Challenge Image 3"
                    aspect="aspect-[4/3]"
                    currentUrl={formData.challengeImage3}
                    selectedFile={formData.challengeImage3File}
                    onFileChange={(file) => setFormData((prev) => ({ ...prev, challengeImage3File: file }))}
                    onRemove={() => setFormData((prev) => ({ ...prev, challengeImage3: '', challengeImage3File: null }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Process / Journey Milestones</label>
                <textarea
                  name="processSteps"
                  value={formData.processSteps || ''}
                  onChange={handleInputChange}
                  maxLength={2000}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                  placeholder="e.g. 1. Discovery & User Research | 2. Wireframing & Prototyping | 3. Cloud Microservices Build | 4. QA & Deployment"
                />
              </div>
            </div>

            {/* Section 5: Outcomes & Innovation */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">5</span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Outcomes, Features & Success Highlights</h4>
                  <p className="text-xs text-slate-500">Highlight key features, measurable results, innovations, and success bullet points</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Key Features & Capabilities</label>
                  <textarea
                    name="features"
                    value={formData.features || ''}
                    onChange={handleInputChange}
                    maxLength={2000}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="List core functionality and modules built..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Measurable Results & Outcomes</label>
                  <textarea
                    name="results"
                    value={formData.results || ''}
                    onChange={handleInputChange}
                    maxLength={2000}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="e.g. +140% user conversion rate, 99.99% uptime, 400ms page load speeds"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Technical & Design Innovation</label>
                  <textarea
                    name="innovation"
                    value={formData.innovation || ''}
                    onChange={handleInputChange}
                    maxLength={2000}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="Unique algorithms, bespoke 3D UI, or novel integration methods..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Key Success Points</label>
                  <textarea
                    name="successPoints"
                    value={formData.successPoints || ''}
                    onChange={handleInputChange}
                    maxLength={2000}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="Bullet points summarizing the business impact and client satisfaction..."
                  />
                </div>
              </div>
            </div>

            {/* Section 6: Adaptable Design & Screenshots */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">6</span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Adaptable Design & Responsive Device Showcase</h4>
                  <p className="text-xs text-slate-500">Showcase multi-device responsive screenshots, tablet, and mobile interface views</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Showcase Section Title</label>
                  <input
                    type="text"
                    name="adaptableHeading"
                    value={formData.adaptableHeading || ''}
                    onChange={handleInputChange}
                    maxLength={200}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="e.g. Adaptive Cross-Platform Interface & Mobile Experience"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Showcase Description</label>
                  <input
                    type="text"
                    name="adaptableDescription"
                    value={formData.adaptableDescription || ''}
                    onChange={handleInputChange}
                    maxLength={500}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 text-sm placeholder-slate-400"
                    placeholder="e.g. Seamlessly adapting to ultra-wide displays down to native mobile views..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <ImageUploadDropzone
                  label="Device Screenshot 1"
                  sublabel="Desktop/Tablet view"
                  aspect="aspect-[4/3]"
                  currentUrl={formData.adaptableImage1}
                  selectedFile={formData.adaptableImage1File}
                  onFileChange={(file) => setFormData((prev) => ({ ...prev, adaptableImage1File: file }))}
                  onRemove={() => setFormData((prev) => ({ ...prev, adaptableImage1: '', adaptableImage1File: null }))}
                />
                <ImageUploadDropzone
                  label="Device Screenshot 2"
                  sublabel="Mobile/Detail view"
                  aspect="aspect-[4/3]"
                  currentUrl={formData.adaptableImage2}
                  selectedFile={formData.adaptableImage2File}
                  onFileChange={(file) => setFormData((prev) => ({ ...prev, adaptableImage2File: file }))}
                  onRemove={() => setFormData((prev) => ({ ...prev, adaptableImage2: '', adaptableImage2File: null }))}
                />
                <ImageUploadDropzone
                  label="Device Screenshot 3"
                  sublabel="Interactions/App view"
                  aspect="aspect-[4/3]"
                  currentUrl={formData.adaptableImage3}
                  selectedFile={formData.adaptableImage3File}
                  onFileChange={(file) => setFormData((prev) => ({ ...prev, adaptableImage3File: file }))}
                  onRemove={() => setFormData((prev) => ({ ...prev, adaptableImage3: '', adaptableImage3File: null }))}
                />
              </div>
            </div>

            {/* Section 7: Categories & Tech Stack */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">7</span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Project Classification & Technology Stack</h4>
                  <p className="text-xs text-slate-500">Categorize this project and select the frameworks, languages, and tools utilized</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Categories */}
                <div ref={categoryDropdownRef} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">Categories</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(!showAddCategory)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                    >
                      + New Category
                    </button>
                  </div>

                  {showAddCategory && (
                    <div className="flex gap-2 p-3 bg-teal-50/60 rounded-xl border border-teal-200">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name..."
                        className="flex-1 px-3 py-1.5 bg-white border border-teal-300 rounded-lg text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={addCategory}
                        disabled={addingCategory}
                        className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                      >
                        {addingCategory ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  )}

                  {/* Dropdown input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search and select categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      onFocus={() => setCategoryDropdownOpen(true)}
                      onClick={() => setCategoryDropdownOpen(true)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-500"
                    />

                    {categoryDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto p-1">
                        {categories
                          .filter(
                            (c) =>
                              c.name.toLowerCase().includes(categorySearch.toLowerCase()) &&
                              !formData.categoryIds.includes(c.id)
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
                              className="w-full text-left px-3 py-2 hover:bg-teal-50 text-slate-800 rounded-lg text-xs font-semibold transition"
                            >
                              + {category.name}
                            </button>
                          ))}
                        {categories.filter(
                          (c) =>
                            c.name.toLowerCase().includes(categorySearch.toLowerCase()) &&
                            !formData.categoryIds.includes(c.id)
                        ).length === 0 && (
                          <div className="p-3 text-center text-xs text-slate-400">No categories found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.categoryIds.map((id) => {
                      const cat = categories.find((c) => c.id === id);
                      return cat ? (
                        <span
                          key={id}
                          className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                        >
                          {cat.name}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                categoryIds: prev.categoryIds.filter((cId) => cId !== id),
                              }))
                            }
                            className="text-teal-600 hover:text-teal-950 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Technologies */}
                <div ref={technologyDropdownRef} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">Technologies</label>
                    <button
                      type="button"
                      onClick={() => setShowAddTechnology(!showAddTechnology)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                    >
                      + New Tech
                    </button>
                  </div>

                  {showAddTechnology && (
                    <div className="flex gap-2 p-3 bg-teal-50/60 rounded-xl border border-teal-200">
                      <input
                        type="text"
                        value={newTechnologyName}
                        onChange={(e) => setNewTechnologyName(e.target.value)}
                        placeholder="Technology name (e.g. Next.js)..."
                        className="flex-1 px-3 py-1.5 bg-white border border-teal-300 rounded-lg text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={addTechnology}
                        disabled={addingTechnology}
                        className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                      >
                        {addingTechnology ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  )}

                  {/* Dropdown input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search and select technologies..."
                      value={technologySearch}
                      onChange={(e) => setTechnologySearch(e.target.value)}
                      onFocus={() => setTechnologyDropdownOpen(true)}
                      onClick={() => setTechnologyDropdownOpen(true)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-500"
                    />

                    {technologyDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto p-1">
                        {technologies
                          .filter(
                            (t) =>
                              t.name.toLowerCase().includes(technologySearch.toLowerCase()) &&
                              !formData.technologyIds.includes(t.id)
                          )
                          .map((tech) => (
                            <button
                              key={tech.id}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  technologyIds: [...prev.technologyIds, tech.id],
                                }));
                                setTechnologySearch('');
                                setTechnologyDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-teal-50 text-slate-800 rounded-lg text-xs font-semibold transition"
                            >
                              + {tech.name}
                            </button>
                          ))}
                        {technologies.filter(
                          (t) =>
                            t.name.toLowerCase().includes(technologySearch.toLowerCase()) &&
                            !formData.technologyIds.includes(t.id)
                        ).length === 0 && (
                          <div className="p-3 text-center text-xs text-slate-400">No technologies found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.technologyIds.map((id) => {
                      const tech = technologies.find((t) => t.id === id);
                      return tech ? (
                        <span
                          key={id}
                          className="px-3 py-1 bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                        >
                          {tech.name}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                technologyIds: prev.technologyIds.filter((tId) => tId !== id),
                              }))
                            }
                            className="text-slate-500 hover:text-slate-900 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 8: Additional Gallery Images */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">8</span>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Additional Project Media Gallery</h4>
                    <p className="text-xs text-slate-500">Add any additional screenshots, mockups, and client deliverables</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalImages: [...prev.additionalImages, { file: null, url: '' }],
                    }))
                  }
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  + Add Gallery Slot
                </button>
              </div>

              {formData.additionalImages.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No additional gallery images added.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.additionalImages.map((imgItem, idx) => (
                    <div key={idx} className="relative">
                      <ImageUploadDropzone
                        label={`Gallery Image #${idx + 1}`}
                        aspect="aspect-[4/3]"
                        currentUrl={imgItem.url}
                        selectedFile={imgItem.file}
                        onFileChange={(file) => {
                          const updated = [...formData.additionalImages];
                          updated[idx] = { file, url: file.name };
                          setFormData((prev) => ({ ...prev, additionalImages: updated }));
                        }}
                        onRemove={() => {
                          const updated = formData.additionalImages.filter((_, i) => i !== idx);
                          setFormData((prev) => ({ ...prev, additionalImages: updated }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Footer Action Buttons */}
            <div className="border-t border-slate-200 pt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 hover:shadow-teal-600/40 transition text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Project & Uploading Assets...
                  </>
                ) : (
                  editingProjectId ? 'Update Project Case Study' : 'Publish New Project'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Table & List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, client or location..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-800 transition outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedCategoryFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedCategoryFilter === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategoryFilter(c.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  selectedCategoryFilter === c.name
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Project Details</th>
                <th className="py-3.5 px-4">Categories</th>
                <th className="py-3.5 px-4">Tech Stack</th>
                <th className="py-3.5 px-4">Client / Location</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="font-semibold text-slate-700">No Projects Found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or click Create New Project.</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Project Details with Thumbnails */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative shadow-xs">
                          <img
                            src={project.mainImage}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80');
                            }}
                          />
                          {project.projectIcon && (
                            <img
                              src={project.projectIcon}
                              alt=""
                              className="absolute bottom-1 right-1 w-4 h-4 rounded-xs bg-white/90 p-0.5 object-contain shadow-xs"
                            />
                          )}
                        </div>
                        <div>
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-sm text-slate-900 hover:text-teal-600 transition flex items-center gap-1"
                          >
                            {project.title}
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <span className="text-xs text-slate-400 font-mono block mt-0.5">/{project.slug}</span>
                        </div>
                      </div>
                    </td>

                    {/* Categories */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {project.categories && project.categories.length > 0 ? (
                          project.categories.map((c) => (
                            <span
                              key={c.id}
                              className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-md text-[11px] font-semibold"
                            >
                              {c.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">None</span>
                        )}
                      </div>
                    </td>

                    {/* Technologies */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {project.technologies && project.technologies.length > 0 ? (
                          project.technologies.map((t) => (
                            <span
                              key={t.id}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[11px] font-medium"
                            >
                              {t.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">None</span>
                        )}
                      </div>
                    </td>

                    {/* Client & Location */}
                    <td className="py-4 px-4 text-xs text-slate-600">
                      <div className="font-semibold text-slate-800">{project.client || 'Direct Client'}</div>
                      <div className="text-slate-400 mt-0.5">{project.location || 'Global'}</div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => editProject(project)}
                          className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                          title="Edit Project"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteProject(project.id, project.title)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Project"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
