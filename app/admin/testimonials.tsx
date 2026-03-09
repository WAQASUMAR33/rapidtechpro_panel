'use client';

import React, { useState, useEffect } from 'react';
import { uploadImageDirect } from '@/lib/uploadImage';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    image: string;
    review: string;
    ratings: number;
}

const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type="button"
                onClick={() => onChange && onChange(star)}
                className={`text-2xl transition ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
            >
                ★
            </button>
        ))}
    </div>
);

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [review, setReview] = useState('');
    const [ratings, setRatings] = useState(5);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [existingImage, setExistingImage] = useState('');

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch('/api/testimonials', {
                headers: { 'x-api-key': 'rapidtech_secret_key_2026' },
            });
            if (res.ok) {
                const data = await res.json();
                setTestimonials(data.success ? data.data : []);
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            setMessage('Failed to load testimonials.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setRole('');
        setReview('');
        setRatings(5);
        setImageFile(null);
        setImagePreview('');
        setExistingImage('');
        setEditingItem(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleEdit = (item: Testimonial) => {
        setEditingItem(item);
        setName(item.name);
        setRole(item.role);
        setReview(item.review);
        setRatings(item.ratings);
        setExistingImage(item.image);
        setImagePreview(item.image);
        setImageFile(null);
        setShowAddForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            const res = await fetch(`/api/testimonials/${id}`, {
                method: 'DELETE',
                headers: { 'x-api-key': 'rapidtech_secret_key_2026' },
            });
            if (res.ok) {
                setMessage('Testimonial deleted successfully.');
                fetchTestimonials();
            } else {
                setMessage('Failed to delete testimonial.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            setMessage('Failed to delete testimonial.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            let imageUrl = existingImage;

            if (imageFile) {
                const uploadResult = await uploadImageDirect(imageFile);
                if (!uploadResult.success) {
                    setMessage(uploadResult.error || 'Image upload failed.');
                    setSaving(false);
                    return;
                }
                imageUrl = uploadResult.url!;
            }

            if (!imageUrl) {
                setMessage('Please upload a client photo.');
                setSaving(false);
                return;
            }

            const payload = { name, role, image: imageUrl, review, ratings };
            const url = editingItem ? `/api/testimonials/${editingItem.id}` : '/api/testimonials';
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'rapidtech_secret_key_2026',
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setMessage(editingItem ? 'Testimonial updated!' : 'Testimonial added!');
                resetForm();
                setShowAddForm(false);
                fetchTestimonials();
            } else {
                const data = await res.json();
                setMessage(data.message || 'Failed to save testimonial.');
            }
        } catch (error) {
            console.error('Save error:', error);
            setMessage('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Testimonials</h2>
                <button
                    onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-lg transition"
                >
                    {showAddForm ? '✕ Cancel' : '+ Add Testimonial'}
                </button>
            </div>

            {message && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${message.includes('success') || message.includes('added') || message.includes('updated') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {message}
                </div>
            )}

            {/* Add / Edit Form */}
            {showAddForm && (
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-teal-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-5">
                        {editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Review */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Review *</label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                rows={4}
                                placeholder="Enter the client review..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                required
                                disabled={saving}
                            />
                        </div>

                        {/* Client Photo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client Photo *</label>
                            <div className="flex items-center gap-4">
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-16 h-16 rounded-full object-cover border-2 border-teal-200"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Name & Role */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Jackie Dallas"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Designation *</label>
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="e.g. Director at Acme Corp"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Star Ratings */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                            <StarRating value={ratings} onChange={setRatings} />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : editingItem ? 'Update Testimonial' : 'Add Testimonial'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { resetForm(); setShowAddForm(false); }}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Testimonials List */}
            {loading ? (
                <p className="text-gray-600">Loading testimonials...</p>
            ) : testimonials.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
                    <p className="text-gray-500 text-lg">No testimonials yet. Add your first one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {testimonials.map((item) => (
                        <div key={item.id} className="bg-gray-900 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between gap-4">
                            {/* Review Text */}
                            <p className="text-gray-300 italic leading-relaxed text-sm">
                                &quot;{item.review}&quot;
                            </p>

                            {/* Client Info */}
                            <div className="flex items-center gap-3 mt-2">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-teal-500"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-lg">
                                        {item.name.slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-white">{item.name}, <span className="font-normal text-gray-300">{item.role}</span></p>
                                    <div className="flex gap-0.5 mt-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <span key={s} className={s <= item.ratings ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t border-gray-700">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-1.5 rounded-lg transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-1.5 rounded-lg transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
