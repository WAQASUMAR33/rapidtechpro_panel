'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { uploadImageDirect } from '@/lib/uploadImage';

interface TeamMember {
    id: number;
    name: string;
    designation: string;
    role: string;
    linkedinUrl?: string | null;
    portfolioUrl?: string | null;
    image: string;
    createdAt?: string;
}

const COMMON_ROLES = [
    'Leadership',
    'Engineering',
    'Design',
    'Product Management',
    'DevOps & Cloud',
    'Quality Assurance',
    'Marketing & Growth'
];

export default function TeamsPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

    // Form states
    const [name, setName] = useState('');
    const [designation, setDesignation] = useState('');
    const [role, setRole] = useState('');
    const [customRole, setCustomRole] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    // Clean up preview object URL if generated from local File
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const fetchTeamMembers = async () => {
        try {
            const res = await fetch('/api/teams', {
                headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
            });
            if (res.ok) {
                const data = await res.json();
                setTeamMembers(data.success ? data.data : (Array.isArray(data) ? data : data.data || []));
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
            setStatusMessage({ type: 'error', text: 'Failed to load team members. Please check database connection.' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setDesignation('');
        setRole('');
        setCustomRole('');
        setLinkedinUrl('');
        setPortfolioUrl('');
        setImageFile(null);
        setImagePreview('');
        setEditingMember(null);
        setShowAddForm(false);
        setStatusMessage(null);
    };

    const handleEditClick = (member: TeamMember) => {
        setEditingMember(member);
        setName(member.name);
        setDesignation(member.designation);
        
        if (COMMON_ROLES.includes(member.role)) {
            setRole(member.role);
            setCustomRole('');
        } else {
            setRole('Other');
            setCustomRole(member.role);
        }

        setLinkedinUrl(member.linkedinUrl || '');
        setPortfolioUrl(member.portfolioUrl || '');
        setImagePreview(member.image);
        setImageFile(null);
        setShowAddForm(true);
        setStatusMessage(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setStatusMessage({ type: 'error', text: 'Please select a valid image file (JPG, PNG, WebP).' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setStatusMessage({ type: 'error', text: 'Image size exceeds 5MB limit.' });
            return;
        }
        setImageFile(file);
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        setStatusMessage(null);
    };

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
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalRole = role === 'Other' ? customRole.trim() : role.trim();

        if (!name.trim() || !designation.trim() || !finalRole) {
            setStatusMessage({ type: 'error', text: 'Please complete all required fields (*).' });
            return;
        }

        if (!editingMember && !imageFile && !imagePreview) {
            setStatusMessage({ type: 'error', text: 'Please upload a professional profile photo for the team member.' });
            return;
        }

        try {
            setSubmitting(true);
            let finalImageUrl = imagePreview;

            if (imageFile) {
                setStatusMessage({ type: 'info', text: 'Uploading high-resolution profile photo...' });
                finalImageUrl = await uploadImageDirect(imageFile);
            }

            setStatusMessage({ type: 'info', text: editingMember ? 'Updating profile details...' : 'Saving team member...' });

            const payload = {
                name: name.trim(),
                designation: designation.trim(),
                role: finalRole,
                linkedinUrl: linkedinUrl.trim() || null,
                portfolioUrl: portfolioUrl.trim() || null,
                image: finalImageUrl,
            };

            const endpoint = editingMember ? `/api/teams/${editingMember.id}` : '/api/teams';
            const method = editingMember ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'rapidtech_secret_key_2026'
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const result = await res.json();
                const savedMember = result.success ? result.data : result;

                if (editingMember) {
                    setTeamMembers(prev => prev.map(m => m.id === savedMember.id ? savedMember : m));
                    setStatusMessage({ type: 'success', text: 'Team member updated successfully!' });
                } else {
                    setTeamMembers(prev => [savedMember, ...prev]);
                    setStatusMessage({ type: 'success', text: 'New team member added successfully!' });
                }

                setTimeout(() => {
                    resetForm();
                }, 1200);
            } else {
                const err = await res.json();
                setStatusMessage({ type: 'error', text: err.message || 'Failed to save team member.' });
            }
        } catch (error: any) {
            console.error(error);
            setStatusMessage({ type: 'error', text: error.message || 'Error saving team member' });
        } finally {
            setSubmitting(false);
        }
    };

    const deleteTeamMember = async (id: number, memberName: string) => {
        if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) return;

        try {
            const res = await fetch(`/api/teams/${id}`, {
                method: 'DELETE',
                headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
            });

            if (res.ok) {
                setTeamMembers(prev => prev.filter(m => m.id !== id));
                setStatusMessage({ type: 'success', text: `${memberName} has been removed.` });
                setTimeout(() => setStatusMessage(null), 3000);
            } else {
                alert('Error deleting team member');
            }
        } catch (error) {
            console.error('Error deleting team member:', error);
            alert('Failed to delete team member');
        }
    };

    // Filtered members
    const filteredMembers = useMemo(() => {
        return teamMembers.filter(member => {
            const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.role.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = selectedRoleFilter === 'All' || member.role === selectedRoleFilter;
            return matchesSearch && matchesRole;
        });
    }, [teamMembers, searchQuery, selectedRoleFilter]);

    // Unique roles for filter chips
    const allRoles = useMemo(() => {
        const roles = new Set<string>();
        teamMembers.forEach(m => {
            if (m.role) roles.add(m.role);
        });
        return ['All', ...Array.from(roles)];
    }, [teamMembers]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[350px] space-y-4">
                <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Loading team directory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 rounded-2xl shadow-xl text-white">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </span>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Team Management</h2>
                            <p className="text-slate-300 text-sm mt-1">Showcase your organization's leadership, developers, and talent</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
                        <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold block">Total Members</span>
                        <span className="text-2xl font-bold text-teal-300">{teamMembers.length}</span>
                    </div>

                    {!showAddForm && (
                        <button
                            onClick={() => {
                                resetForm();
                                setShowAddForm(true);
                            }}
                            className="flex items-center gap-2 px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Team Member
                        </button>
                    )}
                </div>
            </div>

            {/* Notification alert */}
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

            {/* Add / Edit Form Modal/Card */}
            {showAddForm && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingMember ? `Edit Member: ${editingMember.name}` : 'Create New Team Member Profile'}
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

                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Column: Image Upload Dropzone & Live Preview */}
                            <div className="lg:col-span-4 flex flex-col items-center justify-start space-y-4 bg-slate-50/70 p-6 rounded-2xl border border-dashed border-slate-300">
                                <label className="block text-sm font-bold text-slate-700 text-center">
                                    Profile Picture <span className="text-rose-500">*</span>
                                </label>

                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative w-44 h-44 rounded-2xl overflow-hidden border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer group shadow-inner ${
                                        isDragging
                                            ? 'border-teal-500 bg-teal-50 scale-105'
                                            : imagePreview
                                            ? 'border-teal-600 bg-slate-100'
                                            : 'border-slate-300 bg-white hover:border-teal-400 hover:bg-teal-50/30'
                                    }`}
                                    onClick={() => document.getElementById('team-image-input')?.click()}
                                >
                                    {imagePreview ? (
                                        <>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col items-center justify-center text-white p-2">
                                                <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                </svg>
                                                <span className="text-xs font-semibold">Change Photo</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-4 flex flex-col items-center justify-center text-slate-400 group-hover:text-teal-600 transition">
                                            <div className="p-3 bg-slate-100 rounded-full group-hover:bg-teal-100 mb-2 transition">
                                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-teal-700">Click or Drag & Drop</span>
                                            <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WebP (Max 5MB)</span>
                                        </div>
                                    )}
                                </div>

                                <input
                                    id="team-image-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleFileSelect(e.target.files[0]);
                                        }
                                    }}
                                    className="hidden"
                                />

                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImageFile(null);
                                            setImagePreview('');
                                        }}
                                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline flex items-center gap-1"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Remove Photo
                                    </button>
                                )}

                                <p className="text-[12px] text-slate-400 text-center max-w-[200px] leading-tight">
                                    Square 1:1 aspect ratio recommended for optimal layout display.
                                </p>
                            </div>

                            {/* Right Column: Member Details */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Full Name <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder-slate-400 font-medium transition text-sm"
                                                placeholder="e.g. Alex Morgan"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Designation */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Designation / Job Title <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                value={designation}
                                                onChange={(e) => setDesignation(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder-slate-400 font-medium transition text-sm"
                                                placeholder="e.g. Principal AI Engineer / CTO"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Role & Department */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Department / Role Category <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {COMMON_ROLES.map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => {
                                                    setRole(r);
                                                    setCustomRole('');
                                                }}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                                                    role === r
                                                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                                }`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setRole('Other')}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                                                role === 'Other'
                                                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                            }`}
                                        >
                                            Custom Role...
                                        </button>
                                    </div>

                                    {role === 'Other' && (
                                        <input
                                            type="text"
                                            value={customRole}
                                            onChange={(e) => setCustomRole(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder-slate-400 font-medium transition text-sm"
                                            placeholder="Enter custom role / department name"
                                            required
                                        />
                                    )}
                                </div>

                                <div className="border-t border-slate-200 pt-5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                                        Professional & Social Links
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* LinkedIn */}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">LinkedIn Profile</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="url"
                                                    value={linkedinUrl}
                                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition text-sm"
                                                    placeholder="https://linkedin.com/in/username"
                                                />
                                            </div>
                                        </div>

                                        {/* Portfolio / Website */}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Portfolio / Personal Website</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-600">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="url"
                                                    value={portfolioUrl}
                                                    onChange={(e) => setPortfolioUrl(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition text-sm"
                                                    placeholder="https://portfolio-or-github.com"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions bar */}
                        <div className="border-t border-slate-200 pt-6 flex flex-wrap items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={submitting}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-7 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 hover:shadow-teal-600/40 transition text-sm"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    editingMember ? 'Update Member Profile' : 'Save Team Member'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
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
                        placeholder="Search by name, role or title..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-800 transition outline-none"
                    />
                </div>

                {/* Role Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {allRoles.map(roleName => (
                        <button
                            key={roleName}
                            onClick={() => setSelectedRoleFilter(roleName)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                                selectedRoleFilter === roleName
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {roleName}
                        </button>
                    ))}
                </div>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-1">No Team Members Found</h4>
                        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                            {searchQuery || selectedRoleFilter !== 'All'
                                ? 'No team members matched your current filter criteria. Try resetting search.'
                                : 'Get started by creating your organization team directory.'}
                        </p>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowAddForm(true);
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition shadow"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add First Team Member
                        </button>
                    </div>
                ) : (
                    filteredMembers.map((member) => (
                        <div
                            key={member.id}
                            className="bg-white border border-slate-200 hover:border-teal-300 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative"
                        >
                            {/* Card Image Header */}
                            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        // Fallback avatar if link broken
                                        (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80');
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />

                                {/* Role Badge floating */}
                                <div className="absolute top-3 left-3">
                                    <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-teal-300 text-xs font-semibold rounded-full border border-teal-500/30">
                                        {member.role}
                                    </span>
                                </div>

                                {/* Actions hover overlay buttons */}
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition duration-200">
                                    <button
                                        onClick={() => handleEditClick(member)}
                                        className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-xl shadow-md transition hover:scale-105"
                                        title="Edit Profile"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => deleteTeamMember(member.id, member.name)}
                                        className="p-2 bg-rose-500/90 hover:bg-rose-600 text-white rounded-xl shadow-md transition hover:scale-105"
                                        title="Delete Member"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Name & designation at bottom of cover */}
                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                    <h3 className="font-bold text-lg leading-tight drop-shadow-sm">{member.name}</h3>
                                    <p className="text-teal-300 font-medium text-xs mt-0.5 drop-shadow-sm">{member.designation}</p>
                                </div>
                            </div>

                            {/* Card Footer with Social Links */}
                            <div className="p-4 bg-white flex items-center justify-between border-t border-slate-100 mt-auto">
                                <div className="flex items-center gap-2">
                                    {member.linkedinUrl && (
                                        <a
                                            href={member.linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="View LinkedIn Profile"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                        </a>
                                    )}
                                    {member.portfolioUrl && (
                                        <a
                                            href={member.portfolioUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                                            title="View Portfolio"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </a>
                                    )}
                                    {!member.linkedinUrl && !member.portfolioUrl && (
                                        <span className="text-xs text-slate-400 italic">No social links</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleEditClick(member)}
                                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 group/btn"
                                >
                                    Edit Details
                                    <svg className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
