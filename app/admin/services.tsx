'use client';

import React, { useState, useEffect } from 'react';
import { uploadImageDirect } from '@/lib/uploadImage';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ListItem { [key: string]: string }

interface Service {
    id: number;
    title: string;
    slug?: string;
    description: string;
    icon?: string;
    heroSubtitle?: string;
    heroImage?: string;
    coreOfferings?: ListItem[];
    platformExpertise?: ListItem[];
    processSteps?: ListItem[];
    industries?: ListItem[];
    maintenance?: string;
    benefits?: ListItem[];
    techStack?: ListItem[];
    timeline?: ListItem[];
    testimonials?: ListItem[];
    caseStudies?: ListItem[];
    faq?: ListItem[];
    ctaTitle?: string;
    ctaText?: string;
    ctaButtonText?: string;
    createdAt: string;
}

const EMPTY_FORM = {
    title: '',
    slug: '',
    description: '',
    icon: null as File | null,
    iconUrl: '',
    heroSubtitle: '',
    heroImage: null as File | null,
    heroImageUrl: '',
    coreOfferings: [{ title: '', description: '', icon: '' }] as ListItem[],
    platformExpertise: [{ platform: '', details: '' }] as ListItem[],
    processSteps: [{ step: '1', title: '', description: '' }] as ListItem[],
    industries: [{ name: '', icon: '' }] as ListItem[],
    maintenance: '',
    benefits: [{ title: '', description: '' }] as ListItem[],
    techStack: [{ name: '', icon: '' }] as ListItem[],
    timeline: [{ milestone: '', duration: '' }] as ListItem[],
    testimonials: [{ name: '', position: '', content: '', image: '' }] as ListItem[],
    caseStudies: [{ title: '', link: '' }] as ListItem[],
    faq: [{ question: '', answer: '' }] as ListItem[],
    ctaTitle: '',
    ctaText: '',
    ctaButtonText: '',
};

// ─── Dynamic JSON Section Builder ─────────────────────────────────────────────
function JsonSection({
    label,
    fields,
    items,
    onChange,
}: {
    label: string;
    fields: string[];
    items: ListItem[];
    onChange: (items: ListItem[]) => void;
}) {
    const update = (idx: number, key: string, val: string) => {
        const copy = items.map((it, i) => (i === idx ? { ...it, [key]: val } : it));
        onChange(copy);
    };
    const add = () => onChange([...items, Object.fromEntries(fields.map(f => [f, '']))]);
    const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">{label}</p>
                <button type="button" onClick={add} className="text-xs px-3 py-1 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition font-medium">+ Add</button>
            </div>
            {items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 space-y-2 relative border border-gray-200">
                    {fields.map(f => (
                        <div key={f}>
                            <label className="block text-xs text-gray-500 mb-1 capitalize">{f}</label>
                            <input
                                type="text"
                                value={item[f] || ''}
                                onChange={e => update(idx, f, e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-black outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                                placeholder={f}
                            />
                        </div>
                    ))}
                    {items.length > 1 && (
                        <button type="button" onClick={() => remove(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-xs">✕</button>
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Section Wrapper with Toggle ──────────────────────────────────────────────
function FormSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition text-left"
            >
                <span className="flex items-center gap-2 font-semibold text-gray-800">
                    <span className="text-lg">{icon}</span> {title}
                </span>
                <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
            </button>
            {open && <div className="px-5 py-4 bg-white border-t border-gray-100 space-y-4">{children}</div>}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/services?t=' + Date.now(), {
                headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
            });
            if (res.ok) {
                const data = await res.json();
                const list = data.success ? data.data : (Array.isArray(data) ? data : data.data || []);
                setServices(Array.isArray(list) ? list : []);
            }
        } catch (e) {
            setMessage('Error loading services');
        } finally {
            setLoading(false);
        }
    };

    const uploadFile = async (file: File): Promise<string> => {
        const url = await uploadImageDirect(file);
        return url;
    };

    const set = (key: string, val: unknown) => setFormData(prev => ({ ...prev, [key]: val }));

    const handleSubmit = async () => {
        if (!formData.title.trim()) { setMessage('❌ Title is required'); return; }
        if (!formData.description.trim()) { setMessage('❌ Description is required'); return; }

        setSaving(true);
        setMessage('');

        try {
            let iconUrl = formData.iconUrl;
            let heroImageUrl = formData.heroImageUrl;

            if (formData.icon) iconUrl = await uploadFile(formData.icon);
            if (formData.heroImage) heroImageUrl = await uploadFile(formData.heroImage);

            const slug = formData.slug.trim() || formData.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');

            const body = {
                title: formData.title,
                slug,
                description: formData.description,
                icon: iconUrl || null,
                heroSubtitle: formData.heroSubtitle || null,
                heroImage: heroImageUrl || null,
                coreOfferings: formData.coreOfferings.filter(o => o.title),
                platformExpertise: formData.platformExpertise.filter(o => o.platform),
                processSteps: formData.processSteps.filter(o => o.title),
                industries: formData.industries.filter(o => o.name),
                maintenance: formData.maintenance || null,
                benefits: formData.benefits.filter(o => o.title),
                techStack: formData.techStack.filter(o => o.name),
                timeline: formData.timeline.filter(o => o.milestone),
                testimonials: formData.testimonials.filter(o => o.name),
                caseStudies: formData.caseStudies.filter(o => o.title),
                faq: formData.faq.filter(o => o.question),
                ctaTitle: formData.ctaTitle || null,
                ctaText: formData.ctaText || null,
                ctaButtonText: formData.ctaButtonText || null,
            };

            const url = editingId ? `/api/services/${editingId}` : '/api/services';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-api-key': 'rapidtech_secret_key_2026' },
                body: JSON.stringify(body),
            });
            const result = await res.json();

            if (result.success) {
                setMessage(editingId ? '✅ Service updated!' : '✅ Service created!');
                setFormData({ ...EMPTY_FORM });
                setEditingId(null);
                setShowForm(false);
                fetchServices();
            } else {
                setMessage(`❌ ${result.message}`);
            }
        } catch (e) {
            setMessage(`❌ ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    const editService = (s: Service) => {
        setFormData({
            title: s.title,
            slug: s.slug || '',
            description: s.description,
            icon: null,
            iconUrl: s.icon || '',
            heroSubtitle: s.heroSubtitle || '',
            heroImage: null,
            heroImageUrl: s.heroImage || '',
            coreOfferings: (s.coreOfferings as ListItem[]) || [{ title: '', description: '', icon: '' }],
            platformExpertise: (s.platformExpertise as ListItem[]) || [{ platform: '', details: '' }],
            processSteps: (s.processSteps as ListItem[]) || [{ step: '1', title: '', description: '' }],
            industries: (s.industries as ListItem[]) || [{ name: '', icon: '' }],
            maintenance: s.maintenance || '',
            benefits: (s.benefits as ListItem[]) || [{ title: '', description: '' }],
            techStack: (s.techStack as ListItem[]) || [{ name: '', icon: '' }],
            timeline: (s.timeline as ListItem[]) || [{ milestone: '', duration: '' }],
            testimonials: (s.testimonials as ListItem[]) || [{ name: '', position: '', content: '', image: '' }],
            caseStudies: (s.caseStudies as ListItem[]) || [{ title: '', link: '' }],
            faq: (s.faq as ListItem[]) || [{ question: '', answer: '' }],
            ctaTitle: s.ctaTitle || '',
            ctaText: s.ctaText || '',
            ctaButtonText: s.ctaButtonText || '',
        });
        setEditingId(s.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteService = async (id: number) => {
        if (!confirm('Delete this service?')) return;
        try {
            const res = await fetch(`/api/services/${id}`, {
                method: 'DELETE',
                headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
            });
            if (res.ok) {
                setServices(services.filter(s => s.id !== id));
                setMessage('✅ Service deleted');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch { setMessage('❌ Error deleting service'); }
    };

    const filteredServices = services.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center py-12"><p className="text-gray-600">Loading...</p></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Services</h2>
                    <p className="text-gray-600 mt-1">Manage what you offer</p>
                </div>
                <button
                    onClick={() => { setFormData({ ...EMPTY_FORM }); setEditingId(null); setShowForm(!showForm); }}
                    className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
                >
                    {showForm ? 'Cancel' : '+ Add Service'}
                </button>
            </div>

            {/* ─── Full Form ─── */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                    <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Service' : 'New Service'}</h3>

                    {/* ── Section 1: Basic Info ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Service Title *</label>
                            <input value={formData.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Mobile App Development" className="input-base" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Slug (auto-generated if empty)</label>
                            <input value={formData.slug} onChange={e => set('slug', e.target.value)} placeholder="mobile-app-development" className="input-base" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Short Description *</label>
                        <textarea value={formData.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Brief overview of the service..." className="input-base" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Service Icon</label>
                            <input type="file" accept="image/*" onChange={e => set('icon', e.target.files?.[0] || null)} className="input-base" />
                            {formData.iconUrl && <img src={formData.iconUrl} alt="icon" className="mt-2 w-10 h-10 rounded object-cover" />}
                        </div>
                    </div>

                    {/* ── Section 2: Hero ── */}
                    <FormSection title="Hero Section" icon="🚀">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Subtitle</label>
                            <input value={formData.heroSubtitle} onChange={e => set('heroSubtitle', e.target.value)} placeholder="Compelling one-liner..." className="input-base" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Image</label>
                            <input type="file" accept="image/*" onChange={e => set('heroImage', e.target.files?.[0] || null)} className="input-base" />
                            {formData.heroImageUrl && <img src={formData.heroImageUrl} alt="hero" className="mt-2 h-24 rounded object-cover" />}
                        </div>
                    </FormSection>

                    {/* ── Section 3: Core Offerings ── */}
                    <FormSection title="Core Service Offerings" icon="⚙️">
                        <JsonSection label="Offerings" fields={['title', 'description', 'icon']} items={formData.coreOfferings} onChange={v => set('coreOfferings', v)} />
                    </FormSection>

                    {/* ── Section 4: Platform Expertise ── */}
                    <FormSection title="Platform Expertise" icon="📱">
                        <JsonSection label="Platforms" fields={['platform', 'details']} items={formData.platformExpertise} onChange={v => set('platformExpertise', v)} />
                    </FormSection>

                    {/* ── Section 5: Development Process ── */}
                    <FormSection title="Development Process" icon="🗺️">
                        <JsonSection label="Process Steps" fields={['step', 'title', 'description']} items={formData.processSteps} onChange={v => set('processSteps', v)} />
                    </FormSection>

                    {/* ── Section 6: Industries ── */}
                    <FormSection title="Industry-Specific Solutions" icon="🏭">
                        <JsonSection label="Industries" fields={['name', 'icon']} items={formData.industries} onChange={v => set('industries', v)} />
                    </FormSection>

                    {/* ── Section 7: Post-Launch & Maintenance ── */}
                    <FormSection title="Post-Launch & Maintenance" icon="🔧">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Maintenance Description</label>
                        <textarea value={formData.maintenance} onChange={e => set('maintenance', e.target.value)} rows={4} placeholder="Describe ongoing support, security updates, performance monitoring..." className="input-base" />
                    </FormSection>

                    {/* ── Section 8: Business Benefits ── */}
                    <FormSection title="Business Benefits" icon="💡">
                        <JsonSection label="Benefits" fields={['title', 'description']} items={formData.benefits} onChange={v => set('benefits', v)} />
                    </FormSection>

                    {/* ── Section 9: Technology Stack ── */}
                    <FormSection title="Technology Stack" icon="🛠️">
                        <JsonSection label="Technologies" fields={['name', 'icon']} items={formData.techStack} onChange={v => set('techStack', v)} />
                    </FormSection>

                    {/* ── Section 10: Engagement & Timeline ── */}
                    <FormSection title="Engagement / Delivery Timeline" icon="📅">
                        <JsonSection label="Milestones" fields={['milestone', 'duration']} items={formData.timeline} onChange={v => set('timeline', v)} />
                    </FormSection>

                    {/* ── Section 11: Testimonials ── */}
                    <FormSection title="Client Testimonials" icon="⭐">
                        <JsonSection label="Testimonials" fields={['name', 'position', 'content', 'image']} items={formData.testimonials} onChange={v => set('testimonials', v)} />
                    </FormSection>

                    {/* ── Section 12: Case Studies / Portfolio ── */}
                    <FormSection title="Portfolio / Success Stories" icon="📂">
                        <JsonSection label="Case Studies" fields={['title', 'link']} items={formData.caseStudies} onChange={v => set('caseStudies', v)} />
                    </FormSection>

                    {/* ── Section 13: FAQ ── */}
                    <FormSection title="FAQ" icon="❓">
                        <JsonSection label="Questions & Answers" fields={['question', 'answer']} items={formData.faq} onChange={v => set('faq', v)} />
                    </FormSection>

                    {/* ── CTA ── */}
                    <FormSection title="Call to Action (CTA)" icon="📣">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">CTA Title</label>
                            <input value={formData.ctaTitle} onChange={e => set('ctaTitle', e.target.value)} placeholder="Ready to Start?" className="input-base" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">CTA Text</label>
                            <textarea value={formData.ctaText} onChange={e => set('ctaText', e.target.value)} rows={2} placeholder="Compelling CTA description..." className="input-base" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Button Text</label>
                            <input value={formData.ctaButtonText} onChange={e => set('ctaButtonText', e.target.value)} placeholder="Contact Us" className="input-base" />
                        </div>
                    </FormSection>

                    {/* Submit */}
                    {message && <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">{message}</div>}
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition text-lg"
                    >
                        {saving ? 'Saving...' : editingId ? '💾 Update Service' : '🚀 Create Service'}
                    </button>
                </div>
            )}

            {/* Global Message */}
            {!showForm && message && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-teal-800">{message}</div>
            )}

            {/* Search */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search services..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none text-black bg-white placeholder-gray-500"
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredServices.length === 0 ? (
                    <div className="col-span-full bg-white rounded-lg p-8 shadow-sm text-center">
                        <p className="text-gray-600">No services yet. Add one to get started.</p>
                    </div>
                ) : (
                    filteredServices.map(service => (
                        <div key={service.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition border border-gray-200 relative group">
                            <div className="flex gap-4">
                                {service.icon && (
                                    <div className="flex-shrink-0">
                                        <img src={service.icon} alt={service.title} className="w-12 h-12 object-contain bg-gray-50 rounded" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{service.title}</h3>
                                    {service.slug && <p className="text-xs text-teal-600 mb-2">/{service.slug}</p>}
                                    <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                                    {/* Section badges */}
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {service.processSteps && (service.processSteps as ListItem[]).length > 0 && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Process</span>}
                                        {service.techStack && (service.techStack as ListItem[]).length > 0 && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Tech Stack</span>}
                                        {service.testimonials && (service.testimonials as ListItem[]).length > 0 && <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">Reviews</span>}
                                        {service.faq && (service.faq as ListItem[]).length > 0 && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">FAQ</span>}
                                    </div>
                                </div>
                            </div>
                            {/* Actions */}
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                    onClick={() => editService(service)}
                                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                                    title="Edit"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button
                                    onClick={() => deleteService(service.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                    title="Delete"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .input-base {
                    width: 100%;
                    padding: 0.5rem 1rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    outline: none;
                    color: #111827;
                    background: white;
                    font-size: 0.875rem;
                }
                .input-base:focus {
                    ring: 2px;
                    border-color: #0d9488;
                    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
                }
                textarea.input-base {
                    resize: vertical;
                }
            `}</style>
        </div>
    );
}
