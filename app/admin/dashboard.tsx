'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContentPage from './content';
import CategoriesPage from './categories';
import TechnologiesPage from './technologies';

interface Project {
  id: number;
  title: string;
  slug: string;
  mainImage: string;
  projectUrl: string;
  createdAt: string;
  categories: Category[];
  technologies: Technology[];
}

interface Category {
  id: number;
  name: string;
}

interface Technology {
  id: number;
  name: string;
}

type PageType = 'dashboard' | 'content' | 'categories' | 'technologies' | 'profile';

export default function AdminDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    fetchCategories();
    fetchTechnologies();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', {
        headers: {
          'x-api-key': 'rapidtech_secret_key_2026'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', {
        headers: {
          'x-api-key': 'rapidtech_secret_key_2026'
        }
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
      const res = await fetch('/api/technologies', {
        headers: {
          'x-api-key': 'rapidtech_secret_key_2026'
        }
      });
      const data = await res.json();
      const technologiesData = data.success ? data.data : (Array.isArray(data) ? data : data.data || []);
      setTechnologies(Array.isArray(technologiesData) ? technologiesData : []);
    } catch (error) {
      console.error('Error fetching technologies:', error);
    }
  };

  const handleLogout = () => {
    // Clear session
    document.cookie = 'adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    router.push('/');
  };

  const menuItems = [
    { label: 'Dashboard', id: 'dashboard' as PageType },
    { label: 'Content', id: 'content' as PageType },
    { label: 'Categories', id: 'categories' as PageType },
    { label: 'Technologies', id: 'technologies' as PageType },
    { label: 'Profile', id: 'profile' as PageType },
  ];

  return (
    <div className="min-h-screen bg-blue-50 flex">
      {/* Sidebar */}
      <aside className={`w-64 bg-teal-700 text-white p-6 fixed h-screen overflow-y-auto transition-all duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-64'}`}>
        <div className="flex items-center gap-3 mb-8">
          <img
            src="https://rapidtechpro.com/company/logo.png"
            alt="Logo"
            className="w-10 h-10 object-contain bg-white rounded p-1"
          />
          <h1 className="text-xl font-bold">RapidTechPro</h1>
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === item.id
                  ? 'bg-teal-600 font-semibold'
                  : 'hover:bg-teal-600 text-teal-100'
                }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-teal-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Navigation */}
        <header className="bg-blue-100 border-b border-blue-200 px-8 py-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-teal-700">Welcome back!</p>
            <h2 className="text-3xl font-bold text-gray-800">
              {menuItems.find((m) => m.id === currentPage)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-blue-200 rounded-lg transition"
            >
              ☰
            </button>
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
              R
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {currentPage === 'content' ? (
            <ContentPage />
          ) : currentPage === 'categories' ? (
            <CategoriesPage />
          ) : currentPage === 'technologies' ? (
            <TechnologiesPage />
          ) : currentPage === 'dashboard' ? (
            <>
              {/* Categories Cards - Only those with projects */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Categories</h3>
                {categories.filter(cat => projects.some(p => p.categories?.some(c => c.id === cat.id))).length === 0 ? (
                  <p className="text-gray-600">No categories with projects yet</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories
                      .filter(cat => projects.some(p => p.categories?.some(c => c.id === cat.id)))
                      .map((category) => {
                        const projectCount = projects.filter(p =>
                          p.categories?.some(c => c.id === category.id)
                        ).length;

                        return (
                          <div
                            key={category.id}
                            className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200 hover:shadow-lg transition"
                          >
                            <h4 className="text-lg font-semibold text-teal-900">{category.name}</h4>
                            <p className="text-sm text-teal-700 mt-2">
                              {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Technologies Cards - Only those with projects */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Technologies</h3>
                {technologies.filter(tech => projects.some(p => p.technologies?.some(t => t.id === tech.id))).length === 0 ? (
                  <p className="text-gray-600">No technologies with projects yet</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {technologies
                      .filter(tech => projects.some(p => p.technologies?.some(t => t.id === tech.id)))
                      .map((technology) => {
                        const projectCount = projects.filter(p =>
                          p.technologies?.some(t => t.id === technology.id)
                        ).length;

                        return (
                          <div
                            key={technology.id}
                            className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200 hover:shadow-lg transition"
                          >
                            <h4 className="text-lg font-semibold text-teal-900">{technology.name}</h4>
                            <p className="text-sm text-teal-700 mt-2">
                              {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Recent Projects Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Recent Projects</h3>
                  <a href="#" className="text-teal-600 hover:text-teal-700 text-sm font-semibold">
                    View all →
                  </a>
                </div>
                {loading ? (
                  <p className="text-gray-600">Loading projects...</p>
                ) : projects.length === 0 ? (
                  <p className="text-gray-600">No projects yet</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.slice(0, 6).map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                        {project.mainImage && (
                          <img
                            src={project.mainImage}
                            alt={project.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-800 line-clamp-2">{project.title}</h4>
                          <p className="text-xs text-gray-500 mt-2">{new Date(project.createdAt).toLocaleDateString()}</p>
                          <a
                            href={`/project/${project.slug}`}
                            className="mt-3 inline-block text-sm text-teal-600 hover:text-teal-700 font-semibold"
                          >
                            View Project →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <p className="text-gray-600 text-lg">This page is under development. Coming soon!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


