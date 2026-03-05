'use client';

import React, { useState, useEffect } from 'react';
import { uploadImageDirect } from '@/lib/uploadImage';

interface TeamMember {
    id: number;
    name: string;
    designation: string;
    role: string;
    linkedinUrl?: string | null;
    portfolioUrl?: string | null;
    image: string;
}

export default function TeamsPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [message, setMessage] = useState('');
    const [adding, setAdding] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [designation, setDesignation] = useState('');
    const [role, setRole] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingImage, setExistingImage] = useState('');

    useEffect(() => {
        fetchTeamMembers();
    }, []);

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
            setMessage('Failed to load team members. Please check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setDesignation('');
        setRole('');
        setLinkedinUrl('');
        setPortfolioUrl('');
        setImageFile(null);
        setExistingImage('');
        setEditingMember(null);
        setShowAddForm(false);
        setMessage('');
    };

    const handleEditClick = (member: TeamMember) => {
        setEditingMember(member);
        setName(member.name);
        setDesignation(member.designation);
        setRole(member.role);
        setLinkedinUrl(member.linkedinUrl || '');
        setPortfolioUrl(member.portfolioUrl || '');
        setExistingImage(member.image);
        setImageFile(null);
        setShowAddForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !designation.trim() || !role.trim()) {
            setMessage('Name, designation, and role are required.');
            return;
        }

        if (!editingMember && !imageFile) {
            setMessage('Please select an image for the new team member.');
            return;
        }

        try {
            setAdding(true);
            setMessage('Uploading image...');

            let imageUrl = existingImage;

            if (imageFile) {
                imageUrl = await uploadImageDirect(imageFile);
            }

            setMessage(editingMember ? 'Updating team member...' : 'Adding team member...');

            const payload = {
                name: name.trim(),
                designation: designation.trim(),
                role: role.trim(),
                linkedinUrl: linkedinUrl.trim() || null,
                portfolioUrl: portfolioUrl.trim() || null,
                image: imageUrl,
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
                const updatedMember = result.success ? result.data : result;

                if (editingMember) {
                    setTeamMembers(teamMembers.map(m => m.id === updatedMember.id ? updatedMember : m));
                    setMessage('Team member updated successfully!');
                } else {
                    setTeamMembers([updatedMember, ...teamMembers]);
                    setMessage('Team member added successfully!');
                }

                setTimeout(() => resetForm(), 1500);
            } else {
                const err = await res.json();
                setMessage(`Error: ${err.message || 'Failed to save'}`);
            }
        } catch (error) {
            console.error(error);
            setMessage('Error saving team member');
        } finally {
            setAdding(false);
        }
    };

    const deleteTeamMember = async (id: number) => {
        if (!confirm('Are you sure you want to delete this team member?')) return;

        try {
            const res = await fetch(`/api/teams/${id}`, {
                method: 'DELETE',
                headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
            });

            if (res.ok) {
                setTeamMembers(teamMembers.filter(m => m.id !== id));
            } else {
                alert('Error deleting team member');
            }
        } catch (error) {
            console.error('Error deleting team member:', error);
            alert('Error deleting team member');
        }
    };

    if (loading) return <div className="text-gray-600">Loading team members...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition text-sm font-semibold"
                    >
                        + Add Team Member
                    </button>
                )}
            </div>

            {showAddForm ? (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                                <input
                                    type="text"
                                    value={designation}
                                    onChange={(e) => setDesignation(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="e.g. CEO, Senior Developer"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="e.g. Leadership, Engineering"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio/Website URL</label>
                                <input
                                    type="url"
                                    value={portfolioUrl}
                                    onChange={(e) => setPortfolioUrl(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image {editingMember ? '(Leave blank to keep current)' : '*'}</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                    required={!editingMember}
                                />
                                {existingImage && !imageFile && (
                                    <img src={existingImage} alt="Current" className="mt-2 h-16 w-16 object-cover rounded-full" />
                                )}
                            </div>
                        </div>

                        {message && (
                            <p className={`text-sm ${message.includes('Error') || message.includes('required') ? 'text-red-600' : 'text-teal-600'}`}>
                                {message}
                            </p>
                        )}

                        <div className="flex gap-2 pt-4">
                            <button
                                type="submit"
                                disabled={adding}
                                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg transition text-sm font-semibold"
                            >
                                {adding ? 'Saving...' : (editingMember ? 'Update Member' : 'Add Member')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={adding}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {teamMembers.length === 0 ? (
                        <div className="col-span-full py-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">No team members added yet.</p>
                        </div>
                    ) : (
                        teamMembers.map((member) => (
                            <div key={member.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition group">
                                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
                                        <button
                                            onClick={() => handleEditClick(member)}
                                            className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition"
                                            title="Edit"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => deleteTeamMember(member.id)}
                                            className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition"
                                            title="Delete"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                                    <p className="text-teal-600 font-medium text-sm">{member.designation}</p>
                                    <p className="text-gray-500 text-xs mt-1">{member.role}</p>

                                    <div className="flex justify-center gap-3 mt-4">
                                        {member.linkedinUrl && (
                                            <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                </svg>
                                            </a>
                                        )}
                                        {member.portfolioUrl && (
                                            <a href={member.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-600 transition">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
