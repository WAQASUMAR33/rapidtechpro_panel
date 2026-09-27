'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getImageUrl } from '@/lib/uploadImage';
import ContentPage from './content';
import CategoriesPage from './categories';
import TechnologiesPage from './technologies';
import ServicesPage from './services';
import PricingPage from './pricing';
import TeamsPage from './teams';
import TestimonialsPage from './testimonials';
import TopProgressBar from '@/components/TopProgressBar';

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

type PageType =
  | 'dashboard'
  | 'content'
  | 'categories'
  | 'technologies'
  | 'services'
  | 'pricing'
  | 'teams'
  | 'testimonials'
  | 'profile';

interface MenuItem {
  id: PageType;
  label: string;
  section?: 'main' | 'cms' | 'business' | 'system';
  badge?: number | string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigation & Layout State
  const initialTab = (searchParams.get('tab') as PageType) || 'dashboard';
  const [currentPage, setCurrentPage] = useState<PageType>(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data & Caching State (for instant switching & high performance)
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [servicesCount, setServicesCount] = useState<number>(0);
  const [teamsCount, setTeamsCount] = useState<number>(0);
  const [testimonialsCount, setTestimonialsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@company.com');

  // Interactive Dashboard Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Load Admin Email from LocalStorage/Cookie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('adminEmail');
      if (savedEmail) setAdminEmail(savedEmail);
    }
  }, []);

  // Sync tab with URL searchParams
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as PageType;
    if (tabFromUrl && tabFromUrl !== currentPage) {
      setCurrentPage(tabFromUrl);
    } else if (!tabFromUrl && currentPage !== 'dashboard') {
      setCurrentPage('dashboard');
    }
  }, [searchParams]);

  // Update Page Title
  useEffect(() => {
    const titleMap: Record<PageType, string> = {
      dashboard: 'Executive Dashboard',
      content: 'Projects & Portfolio',
      categories: 'Categories Manager',
      technologies: 'Technologies & Stack',
      services: 'Services Management',
      pricing: 'Pricing & Packages',
      teams: 'Team Members',
      testimonials: 'Client Reviews',
      profile: 'System Settings',
    };
    document.title = `${titleMap[currentPage] || 'Admin'} | RapidTechPro`;
  }, [currentPage]);

  // Fetch all metrics concurrently on mount
  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    const headers = { 'x-api-key': 'rapidtech_secret_key_2026' };

    try {
      const [projRes, catRes, techRes, servRes, teamRes, testRes] = await Promise.allSettled([
        fetch('/api/projects', { headers }),
        fetch('/api/categories', { headers }),
        fetch('/api/technologies', { headers }),
        fetch('/api/services', { headers }),
        fetch('/api/teams', { headers }),
        fetch('/api/testimonials', { headers }),
      ]);

      if (projRes.status === 'fulfilled' && projRes.value.ok) {
        const data = await projRes.value.json();
        setProjects(Array.isArray(data) ? data : data.data || []);
      }

      if (catRes.status === 'fulfilled' && catRes.value.ok) {
        const data = await catRes.value.json();
        const catList = data.success ? data.data : (Array.isArray(data) ? data : data.data || []);
        setCategories(Array.isArray(catList) ? catList : []);
      }

      if (techRes.status === 'fulfilled' && techRes.value.ok) {
        const data = await techRes.value.json();
        const techList = data.success ? data.data : (Array.isArray(data) ? data : data.data || []);
        setTechnologies(Array.isArray(techList) ? techList : []);
      }

      if (servRes.status === 'fulfilled' && servRes.value.ok) {
        const data = await servRes.value.json();
        const servList = data.data || (Array.isArray(data) ? data : []);
        setServicesCount(servList.length);
      }

      if (teamRes.status === 'fulfilled' && teamRes.value.ok) {
        const data = await teamRes.value.json();
        const teamList = data.data || (Array.isArray(data) ? data : []);
        setTeamsCount(teamList.length);
      }

      if (testRes.status === 'fulfilled' && testRes.value.ok) {
        const data = await testRes.value.json();
        const testList = data.data || (Array.isArray(data) ? data : []);
        setTestimonialsCount(testList.length);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Tab Navigation Handler
  const handleTabChange = (pageId: PageType) => {
    if (pageId === currentPage) return;
    setIsNavigating(true);
    setCurrentPage(pageId);
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      setIsNavigating(false);
    }, 350);
    if (pageId === 'dashboard') {
      router.push('/admin');
    } else {
      router.push(`/admin?tab=${pageId}`);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      document.cookie = 'adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      router.push('/');
    }
  };

  // Filtered Projects for the Interactive Overview
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategoryFilter === 'all' ||
        p.categories?.some((c) => c.name.toLowerCase() === selectedCategoryFilter.toLowerCase());
      return matchesSearch && matchesCat;
    });
  }, [projects, searchQuery, selectedCategoryFilter]);

  // Dynamic Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Menu items with counts
  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'OVERVIEW',
      items: [{ id: 'dashboard', label: 'Dashboard' }],
    },
    {
      title: 'PORTFOLIO & CMS',
      items: [
        { id: 'content', label: 'Projects', badge: projects.length || undefined },
        { id: 'categories', label: 'Categories', badge: categories.length || undefined },
        { id: 'technologies', label: 'Tech Stack', badge: technologies.length || undefined },
      ],
    },
    {
      title: 'COMPANY & AGENCY',
      items: [
        { id: 'services', label: 'Services', badge: servicesCount || undefined },
        { id: 'pricing', label: 'Pricing Plans' },
        { id: 'teams', label: 'Team Members', badge: teamsCount || undefined },
        { id: 'testimonials', label: 'Testimonials', badge: testimonialsCount || undefined },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [{ id: 'profile', label: 'System Settings' }],
    },
  ];

  // Modern SVG Icons for Sidebar
  const renderMenuIcon = (id: PageType) => {
    switch (id) {
      case 'dashboard':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-4a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8z" />
          </svg>
        );
      case 'content':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'categories':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'technologies':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'services':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'pricing':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'teams':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'testimonials':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'profile':
        return (
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Viewport Glowing Loading Bar */}
      <TopProgressBar isLoading={loading || refreshing || isNavigating} />

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* ========================================================================= */}
      {/* SIDEBAR NAVIGATION */}
      {/* ========================================================================= */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0B132B] text-slate-300 border-r border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out shadow-2xl ${
          isSidebarOpen ? 'w-72' : 'w-20'
        } ${isMobileMenuOpen ? 'translate-x-0 !w-72' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center p-0.5 shadow-lg shadow-teal-500/20 shrink-0">
              <img
                src="https://rapidtechpro.com/company/logo.png"
                alt="RapidTechPro"
                className="w-full h-full object-contain rounded-lg bg-white p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-white text-lg tracking-tight">RapidTechPro</span>
                <span className="text-[11px] font-medium text-teal-400 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  Admin Suite v2.0
                </span>
              </div>
            )}
          </div>

          {/* Collapse Button (Desktop) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition"
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Close Button (Mobile) */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 custom-scrollbar">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {isSidebarOpen ? (
                <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {section.title}
                </div>
              ) : (
                <div className="border-t border-slate-800 my-2" />
              )}

              {section.items.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                    }`}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {renderMenuIcon(item.id)}
                    </span>

                    {isSidebarOpen && (
                      <div className="flex-1 flex items-center justify-between text-left truncate">
                        <span className="truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-800 text-teal-400 border border-slate-700/60'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Active Indicator Bar */}
                    {isActive && !isSidebarOpen && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-400 rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Profile & Sign Out */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
              {adminEmail.slice(0, 2).toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 truncate">
                <p className="text-xs font-semibold text-white truncate">{adminEmail}</p>
                <p className="text-[10px] text-teal-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Master Access
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT */}
      {/* ========================================================================= */}
      <main
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:pl-72' : 'lg:pl-20'
        }`}
      >
        {/* Sticky Glass Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb & Welcome */}
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>RapidTechPro</span>
                <span>/</span>
                <span className="text-teal-600 font-semibold capitalize">{currentPage}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {currentPage === 'dashboard'
                  ? `${greeting}, Admin 👋`
                  : currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Refresh Button */}
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="p-2 sm:px-3 sm:py-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 border border-slate-200 rounded-xl font-medium text-xs flex items-center gap-1.5 transition disabled:opacity-50"
              title="Refresh all metrics"
            >
              <svg
                className={`w-4 h-4 ${refreshing ? 'animate-spin text-teal-600' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden md:inline">{refreshing ? 'Syncing...' : 'Sync'}</span>
            </button>

            {/* View Live Website Button */}
            <a
              href="https://rapidtechpro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
            >
              <span>Live Site</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Quick Action Button: New Project */}
            <button
              onClick={() => handleTabChange('content')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-teal-600/20 transition active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Project</span>
            </button>
          </div>
        </header>

        {/* Tab View Container */}
        <div className="flex-1 p-5 sm:p-8">
          {/* CONTENT ROUTING */}
          {currentPage === 'content' ? (
            <ContentPage />
          ) : currentPage === 'categories' ? (
            <CategoriesPage />
          ) : currentPage === 'technologies' ? (
            <TechnologiesPage />
          ) : currentPage === 'services' ? (
            <ServicesPage />
          ) : currentPage === 'pricing' ? (
            <PricingPage />
          ) : currentPage === 'teams' ? (
            <TeamsPage />
          ) : currentPage === 'testimonials' ? (
            <TestimonialsPage />
          ) : currentPage === 'profile' ? (
            /* System & Profile Settings View */
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-teal-500/20">
                    {adminEmail.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Admin Account Profile</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Master administrator of RapidTechPro panel</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Primary Email</span>
                    <p className="text-base font-bold text-slate-800 mt-1">{adminEmail}</p>
                    <p className="text-xs text-slate-500 mt-1">Configured via environment / DB credentials</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security Tier</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-base font-bold text-slate-800">Super Administrator</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Full read, write, update, delete permissions</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Asset Delivery</span>
                    <p className="text-sm font-semibold text-teal-700 mt-1 truncate">https://files.rapidtechpro.com</p>
                    <p className="text-xs text-slate-500 mt-1">WebP high performance image CDN</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Database Link</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="text-sm font-semibold text-slate-800">Hostinger Enterprise MySQL</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">195.35.59.84:3306 (Secure Channel)</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm text-slate-500">
                    Need to change credentials? Update <code className="bg-slate-100 px-2 py-0.5 rounded text-teal-700 font-mono text-xs">ADMIN_EMAIL</code> and <code className="bg-slate-100 px-2 py-0.5 rounded text-teal-700 font-mono text-xs">ADMIN_PASSWORD</code> in <code className="bg-slate-100 px-2 py-0.5 rounded text-teal-700 font-mono text-xs">.env</code>.
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition"
                  >
                    Terminate Session
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* =============================================================== */
            /* EXECUTIVE DASHBOARD HOME */
            /* =============================================================== */
            <div className="space-y-8">
              {/* Hero Banner with Quick Stats & Shortcuts */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B132B] to-teal-950 p-6 sm:p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-48 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="max-w-xl">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                      Live Control Center
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                      Empowering RapidTechPro Digital Presence
                    </h2>
                    <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                      Manage all portfolio projects, technical capabilities, corporate services, pricing tiers, and team profiles from one high-speed dashboard.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => handleTabChange('content')}
                      className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 transition active:scale-95 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Project
                    </button>
                    <button
                      onClick={() => handleTabChange('categories')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 backdrop-blur-sm transition active:scale-95"
                    >
                      Categories ({categories.length})
                    </button>
                    <button
                      onClick={() => handleTabChange('technologies')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 backdrop-blur-sm transition active:scale-95"
                    >
                      Stack ({technologies.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Metrics Grid (6 Interactive Metric Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
                {/* 1. Projects */}
                <div
                  onClick={() => handleTabChange('content')}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {loading ? '...' : projects.length}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">Portfolio Projects</div>
                </div>

                {/* 2. Categories */}
                <div
                  onClick={() => handleTabChange('categories')}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Taxonomy</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {loading ? '...' : categories.length}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">Categories</div>
                </div>

                {/* 3. Tech Stack */}
                <div
                  onClick={() => handleTabChange('technologies')}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-violet-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">Skills</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {loading ? '...' : technologies.length}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">Tech Stack</div>
                </div>

                {/* 4. Services */}
                <div
                  onClick={() => handleTabChange('services')}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Services</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {loading ? '...' : servicesCount}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">Core Offerings</div>
                </div>

                {/* 5. Team Members */}
                <div
                  onClick={() => handleTabChange('teams')}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Roster</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {loading ? '...' : teamsCount}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">Team Members</div>
                </div>

                {/* 6. Testimonials */}
                <div
                  onClick={() => handleTabChange('testimonials')}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-pink-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">5.0 ★</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {loading ? '...' : testimonialsCount}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">Client Reviews</div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* INTERACTIVE PROJECTS EXPLORER */}
              {/* =================================================================== */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                {/* Header with Search & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Projects Directory</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Showing {filteredProjects.length} of {projects.length} portfolio items
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Live Search */}
                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                      />
                      <svg
                        className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-lg text-xs font-medium transition ${
                          viewMode === 'grid' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Grid View"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`p-1.5 rounded-lg text-xs font-medium transition ${
                          viewMode === 'table' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Table View"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={() => handleTabChange('content')}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline px-2 py-1"
                    >
                      Manage All →
                    </button>
                  </div>
                </div>

                {/* Category Filter Chips */}
                {categories.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategoryFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                        selectedCategoryFilter === 'all'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All Projects ({projects.length})
                    </button>
                    {categories.map((cat) => {
                      const count = projects.filter((p) =>
                        p.categories?.some((c) => c.id === cat.id || c.name === cat.name)
                      ).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategoryFilter(cat.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                            selectedCategoryFilter.toLowerCase() === cat.name.toLowerCase()
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              selectedCategoryFilter.toLowerCase() === cat.name.toLowerCase()
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Loading Skeleton */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
                        <div className="w-full h-44 bg-slate-200 rounded-xl" />
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredProjects.length === 0 ? (
                  /* Empty State */
                  <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                    <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="text-base font-bold text-slate-800">No projects found</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchQuery
                        ? `No results matching "${searchQuery}". Try a different keyword.`
                        : 'No projects added yet in this category.'}
                    </p>
                    <button
                      onClick={() => handleTabChange('content')}
                      className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
                    >
                      + Create Project
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  /* Grid Card View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col"
                      >
                        {/* Image Banner */}
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          {project.mainImage ? (
                            <img
                              src={getImageUrl(project.mainImage)}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                              No Image Available
                            </div>
                          )}

                          {/* Category Badge overlay */}
                          {project.categories?.[0] && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white font-semibold text-[11px] shadow-sm">
                              {project.categories[0].name}
                            </span>
                          )}

                          {/* Quick CMS Edit Jump Button */}
                          <button
                            onClick={() => handleTabChange('content')}
                            className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-teal-600 shadow-md transition opacity-0 group-hover:opacity-100"
                            title="Edit in CMS"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h4 className="font-bold text-slate-900 text-base group-hover:text-teal-600 transition line-clamp-1">
                              {project.title}
                            </h4>
                            <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                              /{project.slug}
                            </p>

                            {/* Tech Stack Pills */}
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {project.technologies.slice(0, 3).map((tech) => (
                                  <span
                                    key={tech.id}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                                  >
                                    {tech.name}
                                  </span>
                                ))}
                                {project.technologies.length > 3 && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px]">
                                    +{project.technologies.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Footer Info */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                              {new Date(project.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>

                            <div className="flex items-center gap-2">
                              {project.projectUrl && (
                                <a
                                  href={project.projectUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-500 hover:text-teal-600 font-semibold flex items-center gap-1 transition"
                                >
                                  <span>Preview</span>
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              )}
                              <button
                                onClick={() => handleTabChange('content')}
                                className="text-teal-600 hover:text-teal-700 font-bold"
                              >
                                Edit →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Compact Table View */
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Project</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Technologies</th>
                          <th className="py-3 px-4">Created Date</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {filteredProjects.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img
                                src={getImageUrl(p.mainImage)}
                                alt={p.title}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{p.title}</p>
                                <p className="text-[11px] text-slate-400 font-mono">/{p.slug}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold text-[10px]">
                                {p.categories?.[0]?.name || 'Uncategorized'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                {p.technologies?.slice(0, 2).map((t) => (
                                  <span key={t.id} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                                    {t.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleTabChange('content')}
                                className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold transition mr-2"
                              >
                                Edit
                              </button>
                              {p.projectUrl && (
                                <a
                                  href={p.projectUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-slate-700"
                                >
                                  ↗
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Taxonomy Breakdown & Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Categories Breakdown */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Categories Distribution</h4>
                      <p className="text-xs text-slate-500">Overview of project coverage by category</p>
                    </div>
                    <button
                      onClick={() => handleTabChange('categories')}
                      className="text-xs font-bold text-teal-600 hover:underline"
                    >
                      Manage
                    </button>
                  </div>

                  <div className="space-y-3">
                    {categories.slice(0, 5).map((category) => {
                      const count = projects.filter((p) =>
                        p.categories?.some((c) => c.id === category.id)
                      ).length;
                      const percentage = projects.length > 0 ? Math.round((count / projects.length) * 100) : 0;

                      return (
                        <div key={category.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">{category.name}</span>
                            <span className="text-slate-400 font-medium">
                              {count} {count === 1 ? 'project' : 'projects'} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tech Stack Matrix */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Active Technical Stack</h4>
                      <p className="text-xs text-slate-500">Frameworks and tools deployed across projects</p>
                    </div>
                    <button
                      onClick={() => handleTabChange('technologies')}
                      className="text-xs font-bold text-teal-600 hover:underline"
                    >
                      Manage
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech) => {
                      const count = projects.filter((p) =>
                        p.technologies?.some((t) => t.id === tech.id)
                      ).length;
                      return (
                        <div
                          key={tech.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition"
                        >
                          <span className="w-2 h-2 rounded-full bg-teal-500" />
                          <span className="text-xs font-semibold text-slate-800">{tech.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({count})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
