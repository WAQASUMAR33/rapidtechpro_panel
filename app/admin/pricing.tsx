'use client';

import React, { useState, useEffect } from 'react';

interface Service { id: number; title: string; }
interface Pricing {
    id: number;
    serviceId: number;
    service: { id: number; title: string; slug: string };
    standardName: string; standardPrice: number | null; standardPriceSuffix: string;
    standardFeatures: string[]; standardCta: string; standardIsPopular: boolean;
    premiumName: string; premiumPrice: number | null; premiumPriceSuffix: string;
    premiumFeatures: string[]; premiumCta: string; premiumIsPopular: boolean;
    customName: string; customPrice: number | null; customPriceSuffix: string;
    customPriceLabel: string; customFeatures: string[]; customCta: string; customIsPopular: boolean;
    createdAt: string;
}

const EMPTY_FORM = {
    serviceId: '',
    // Standard
    standardName: 'Standard', standardPrice: '', standardPriceSuffix: 'Per Month',
    standardFeatures: [''] as string[], standardCta: 'Book Free Consultancy', standardIsPopular: false,
    // Premium
    premiumName: 'Premium', premiumPrice: '', premiumPriceSuffix: 'Per Month',
    premiumFeatures: [''] as string[], premiumCta: 'Book Free Consultancy', premiumIsPopular: false,
    // Custom
    customName: 'Custom', customPrice: '', customPriceSuffix: 'Per Month',
    customPriceLabel: 'Contact Us', customFeatures: [''] as string[], customCta: 'Book Free Consultancy', customIsPopular: false,
};

type Tier = 'standard' | 'premium' | 'custom';

// ─── Feature list editor ─────────────────────────────────────────────────────
function FeatureEditor({ features, onChange }: { features: string[]; onChange: (f: string[]) => void }) {
    const update = (i: number, v: string) => { const c = [...features]; c[i] = v; onChange(c); };
    const add = () => onChange([...features, '']);
    const remove = (i: number) => onChange(features.filter((_, idx) => idx !== i));
    return (
        <div className="space-y-2">
            {features.map((f, i) => (
                <div key={i} className="flex gap-2">
                    <input value={f} onChange={e => update(i, e.target.value)} placeholder="Feature description..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-black outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                    {features.length > 1 && <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 px-2">✕</button>}
                </div>
            ))}
            <button type="button" onClick={add} className="text-sm text-teal-600 hover:text-teal-700 font-medium">+ Add Feature</button>
        </div>
    );
}

// ─── Tier Card Editor ────────────────────────────────────────────────────────
function TierEditor({ tier, label, color, formData, set }: {
    tier: Tier; label: string; color: string;
    formData: typeof EMPTY_FORM; set: (k: string, v: unknown) => void;
}) {
    const K = (field: string) => `${tier}${field.charAt(0).toUpperCase() + field.slice(1)}`;
    const featureKey = K('features') as keyof typeof formData;
    const features = (formData[featureKey] as string[]) || [''];

    return (
        <div className={`border-2 ${color} rounded-2xl p-6 space-y-4 bg-white`}>
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900">{label}</h4>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={formData[K('isPopular') as keyof typeof formData] as boolean}
                        onChange={e => set(K('isPopular'), e.target.checked)}
                        className="rounded accent-teal-600"
                    />
                    Mark as Popular
                </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tier Name</label>
                    <input value={formData[K('name') as keyof typeof formData] as string}
                        onChange={e => set(K('name'), e.target.value)}
                        placeholder="e.g. Standard" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Price ($)</label>
                    <input type="number" value={formData[K('price') as keyof typeof formData] as string}
                        onChange={e => set(K('price'), e.target.value)}
                        placeholder="e.g. 300" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                </div>
            </div>

            {tier === 'custom' ? (
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Price Label (shown instead of price)</label>
                    <input value={formData[K('priceLabel') as keyof typeof formData] as string}
                        onChange={e => set(K('priceLabel'), e.target.value)}
                        placeholder="e.g. Contact Us" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                </div>
            ) : (
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Price Suffix</label>
                    <input value={formData[K('priceSuffix') as keyof typeof formData] as string}
                        onChange={e => set(K('priceSuffix'), e.target.value)}
                        placeholder="e.g. Per Month" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Features (Details)</label>
                <FeatureEditor features={features} onChange={v => set(featureKey, v)} />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">CTA Button Text</label>
                <input value={formData[K('cta') as keyof typeof formData] as string}
                    onChange={e => set(K('cta'), e.target.value)}
                    placeholder="e.g. Book Free Consultancy" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
            </div>
        </div>
    );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function PricingPage() {
    const [pricingList, setPricingList] = useState<Pricing[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [filterServiceId, setFilterServiceId] = useState('');

    const API = 'rapidtech_secret_key_2026';

    useEffect(() => {
        fetchPricing();
        fetchServices();
    }, []);

    const fetchPricing = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pricing?t=' + Date.now(), { headers: { 'x-api-key': API } });
            const data = await res.json();
            setPricingList(data.success ? data.data : []);
        } catch { setMessage('Error loading pricing'); }
        finally { setLoading(false); }
    };

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/services', { headers: { 'x-api-key': API } });
            const data = await res.json();
            setServices(data.success ? data.data : []);
        } catch { }
    };

    const set = (key: string, val: unknown) => setFormData(prev => ({ ...prev, [key]: val }));

    const handleSubmit = async () => {
        if (!formData.serviceId) { setMessage('❌ Please select a service'); return; }
        setSaving(true);
        setMessage('');
        try {
            const body = {
                ...formData,
                serviceId: parseInt(formData.serviceId),
                standardFeatures: formData.standardFeatures.filter(Boolean),
                premiumFeatures: formData.premiumFeatures.filter(Boolean),
                customFeatures: formData.customFeatures.filter(Boolean),
            };
            const url = editingId ? `/api/pricing/${editingId}` : '/api/pricing';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-api-key': API },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (result.success) {
                setMessage(editingId ? '✅ Pricing updated!' : '✅ Pricing created!');
                setFormData({ ...EMPTY_FORM });
                setEditingId(null);
                setShowForm(false);
                fetchPricing();
            } else setMessage(`❌ ${result.message}`);
        } catch (e) { setMessage(`❌ ${e instanceof Error ? e.message : 'Error'}`); }
        finally { setSaving(false); }
    };

    const deletePricing = async (id: number) => {
        if (!confirm('Delete this pricing plan?')) return;
        try {
            await fetch(`/api/pricing/${id}`, { method: 'DELETE', headers: { 'x-api-key': API } });
            setPricingList(pricingList.filter(p => p.id !== id));
            setMessage('✅ Deleted');
            setTimeout(() => setMessage(''), 3000);
        } catch { setMessage('❌ Error deleting'); }
    };

    const editPricing = (p: Pricing) => {
        setFormData({
            serviceId: String(p.serviceId),
            standardName: p.standardName, standardPrice: p.standardPrice ? String(p.standardPrice) : '',
            standardPriceSuffix: p.standardPriceSuffix, standardFeatures: p.standardFeatures.length ? p.standardFeatures : [''],
            standardCta: p.standardCta, standardIsPopular: p.standardIsPopular,
            premiumName: p.premiumName, premiumPrice: p.premiumPrice ? String(p.premiumPrice) : '',
            premiumPriceSuffix: p.premiumPriceSuffix, premiumFeatures: p.premiumFeatures.length ? p.premiumFeatures : [''],
            premiumCta: p.premiumCta, premiumIsPopular: p.premiumIsPopular,
            customName: p.customName, customPrice: p.customPrice ? String(p.customPrice) : '',
            customPriceSuffix: p.customPriceSuffix, customPriceLabel: p.customPriceLabel,
            customFeatures: p.customFeatures.length ? p.customFeatures : [''],
            customCta: p.customCta, customIsPopular: p.customIsPopular,
        });
        setEditingId(p.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filtered = filterServiceId
        ? pricingList.filter(p => p.serviceId === parseInt(filterServiceId))
        : pricingList;

    if (loading) return <div className="flex items-center justify-center py-12"><p className="text-gray-600">Loading...</p></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Pricing Plans</h2>
                    <p className="text-gray-600 mt-1">Manage Standard, Premium & Custom tiers per service</p>
                </div>
                <button
                    onClick={() => { setFormData({ ...EMPTY_FORM }); setEditingId(null); setShowForm(!showForm); }}
                    className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
                >{showForm ? 'Cancel' : '+ Add Pricing'}</button>
            </div>

            {/* ── Form ── */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Pricing' : 'New Pricing Plan'}</h3>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Service *</label>
                        <select value={formData.serviceId} onChange={e => set('serviceId', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm">
                            <option value="">-- Choose a Service --</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                    </div>

                    <p className="text-sm text-gray-500 font-medium">Configure each pricing tier below. Click a tier to expand it.</p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <TierEditor tier="standard" label="📦 Standard" color="border-gray-300" formData={formData} set={set} />
                        <TierEditor tier="premium" label="⭐ Premium" color="border-teal-400" formData={formData} set={set} />
                        <TierEditor tier="custom" label="🚀 Custom" color="border-purple-400" formData={formData} set={set} />
                    </div>

                    {message && <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">{message}</div>}
                    <button onClick={handleSubmit} disabled={saving}
                        className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition text-lg">
                        {saving ? 'Saving...' : editingId ? '💾 Update Pricing' : '🚀 Create Pricing Plan'}
                    </button>
                </div>
            )}

            {!showForm && message && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-teal-800">{message}</div>
            )}

            {/* Filter by service */}
            <div className="bg-white rounded-xl p-4 shadow-sm flex gap-4 items-center">
                <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter by Service:</label>
                <select value={filterServiceId} onChange={e => setFilterServiceId(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm">
                    <option value="">All Services</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
            </div>

            {/* ── Pricing Cards ── */}
            <div className="space-y-6">
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                        <p className="text-gray-500">No pricing plans yet. Add one above.</p>
                    </div>
                ) : (
                    filtered.map(pricing => (
                        <div key={pricing.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Card header */}
                            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-100">
                                <div>
                                    <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Service</span>
                                    <h3 className="text-xl font-bold text-gray-900">{pricing.service.title}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => editPricing(pricing)}
                                        className="px-4 py-2 border border-teal-500 text-teal-600 rounded-lg text-sm font-semibold hover:bg-teal-50 transition">
                                        Edit
                                    </button>
                                    <button onClick={() => deletePricing(pricing.id)}
                                        className="px-4 py-2 border border-red-400 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50 transition">
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Three tiers preview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                {/* Standard */}
                                <TierPreview
                                    name={pricing.standardName} price={pricing.standardPrice}
                                    suffix={pricing.standardPriceSuffix} features={pricing.standardFeatures}
                                    cta={pricing.standardCta} isPopular={pricing.standardIsPopular}
                                    color="border-gray-200" badge="📦 Standard"
                                />
                                {/* Premium */}
                                <TierPreview
                                    name={pricing.premiumName} price={pricing.premiumPrice}
                                    suffix={pricing.premiumPriceSuffix} features={pricing.premiumFeatures}
                                    cta={pricing.premiumCta} isPopular={pricing.premiumIsPopular}
                                    color="border-teal-400" badge="⭐ Premium"
                                />
                                {/* Custom */}
                                <TierPreview
                                    name={pricing.customName} price={pricing.customPrice}
                                    suffix={pricing.customPriceSuffix} features={pricing.customFeatures}
                                    cta={pricing.customCta} isPopular={pricing.customIsPopular}
                                    color="border-purple-400" badge="🚀 Custom"
                                    priceLabel={pricing.customPriceLabel}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ─── Tier Preview Card (read-only view) ──────────────────────────────────────
function TierPreview({ name, price, suffix, features, cta, isPopular, color, badge, priceLabel }: {
    name: string; price: number | null; suffix: string; features: string[];
    cta: string; isPopular: boolean; color: string; badge: string; priceLabel?: string;
}) {
    return (
        <div className={`relative p-6 ${isPopular ? 'bg-teal-50' : 'bg-white'}`}>
            {isPopular && (
                <div className="absolute top-3 right-3 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">Popular</div>
            )}
            <span className="text-xs text-gray-500 font-semibold">{badge}</span>
            <h4 className="text-lg font-bold text-gray-900 mt-1 mb-3">{name}</h4>
            <div className="mb-4">
                {priceLabel && price === null ? (
                    <span className="text-2xl font-extrabold text-gray-900">{priceLabel}</span>
                ) : (
                    <>
                        <span className="text-3xl font-extrabold text-gray-900">${price ?? '—'}</span>
                        <span className="text-gray-500 text-sm ml-1">{suffix}</span>
                    </>
                )}
            </div>
            {features.length > 0 && (
                <div className="space-y-2 mb-4">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Details:</p>
                    {features.slice(0, 5).map((f, i) => (
                        <p key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-teal-500 font-bold mt-0.5">✓</span> {f}
                        </p>
                    ))}
                    {features.length > 5 && <p className="text-xs text-gray-400">+{features.length - 5} more</p>}
                </div>
            )}
            <div className="mt-auto pt-2">
                <div className="w-full py-2.5 bg-gray-900 text-white text-center text-sm font-semibold rounded-xl">{cta}</div>
            </div>
        </div>
    );
}
