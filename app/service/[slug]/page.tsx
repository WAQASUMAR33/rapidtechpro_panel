'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Types ─────────────────────────────────────────────────────────────────
interface ListItem { [key: string]: string }

interface Service {
    id: number;
    title: string;
    slug: string;
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

// ─── Intersection Observer Hook ─────────────────────────────────────────────
const useVisible = (ref: React.RefObject<HTMLElement | null>) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (!ref.current) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
        obs.observe(ref.current);
        return () => obs.disconnect();
    }, [ref]);
    return visible;
};

// ─── Section Wrapper ────────────────────────────────────────────────────────
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const v = useVisible(ref);
    return (
        <div ref={ref} className={`transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}>
            {children}
        </div>
    );
}

// ─── Section Header ─────────────────────────────────────────────────────────
function SectionHeader({ label, title }: { label: string; title: string }) {
    return (
        <div className="mb-14">
            <span className="text-teal-500 text-sm font-bold tracking-widest uppercase">{label}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 leading-tight">{title}</h2>
        </div>
    );
}

// ─── FAQ Accordion ──────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-200">
            <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-5 text-left gap-4">
                <span className="font-semibold text-gray-900 text-lg">{q}</span>
                <span className={`text-teal-500 text-xl transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
            </button>
            {open && <p className="text-gray-600 pb-5 leading-relaxed">{a}</p>}
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = React.use(params);
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/services/slug/${slug}`, {
                    headers: { 'x-api-key': 'rapidtech_secret_key_2026' }
                });
                const data = await res.json();
                if (data.success) setService(data.data);
                else setError('Service not found');
            } catch { setError('Failed to load service'); }
            finally { setLoading(false); }
        })();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading service...</p>
            </div>
        </div>
    );

    if (error || !service) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center">
                <p className="text-gray-400 text-lg mb-6">{error || 'Service not found'}</p>
                <Link href="/" className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition">← Back to Home</Link>
            </div>
        </div>
    );

    const s = service;

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* ── Navigation ── */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="text-teal-600 hover:text-teal-700 font-bold transition text-lg">← Back</Link>
                    <span className="text-sm text-gray-500 font-medium hidden md:block">{s.title}</span>
                </div>
            </nav>

            {/* ── HERO ── */}
            <div
                className="relative min-h-[80vh] flex items-center justify-center text-white overflow-hidden"
                style={{
                    background: s.heroImage
                        ? `linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(13,148,136,0.5) 100%), url(${s.heroImage}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #0f172a 100%)'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
                <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 text-center">
                    {s.icon && <img src={s.icon} alt={s.title} className="w-20 h-20 object-contain mx-auto mb-6 rounded-2xl bg-white/10 p-3 backdrop-blur-sm" />}
                    <div className="inline-block px-4 py-1.5 bg-teal-500/20 border border-teal-400/30 text-teal-300 text-sm font-semibold rounded-full mb-6 backdrop-blur-sm">
                        Our Services
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">{s.title}</h1>
                    {s.heroSubtitle && <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-4">{s.heroSubtitle}</p>}
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">{s.description}</p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#contact" className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-1">
                            {s.ctaButtonText || 'Get Started'}
                        </a>
                        <a href="#process" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-300">
                            See Our Process
                        </a>
                    </div>
                </div>
                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1.5">
                        <div className="w-1 h-2 bg-white/70 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">

                {/* ── Core Offerings ── */}
                {s.coreOfferings && s.coreOfferings.length > 0 && (
                    <section className="py-24 border-b border-gray-100">
                        <Section>
                            <SectionHeader label="What We Offer" title="Core Service Offerings" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {s.coreOfferings.map((item, i) => (
                                    <div key={i} className="group p-8 rounded-2xl border border-gray-200 hover:border-teal-400 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white">
                                        <div className="text-3xl mb-4">{item.icon || '⚙️'}</div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </section>
                )}

                {/* ── Platform Expertise ── */}
                {s.platformExpertise && s.platformExpertise.length > 0 && (
                    <section className="py-24 border-b border-gray-100">
                        <Section>
                            <SectionHeader label="Platforms" title="Platform Expertise" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {s.platformExpertise.map((item, i) => (
                                    <div key={i} className="relative p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                        <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center mb-5 text-xl font-bold">{i + 1}</div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.platform}</h3>
                                        <p className="text-gray-700">{item.details}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </section>
                )}

                {/* ── Development Process ── */}
                {s.processSteps && s.processSteps.length > 0 && (
                    <section id="process" className="py-24 border-b border-gray-100">
                        <Section>
                            <SectionHeader label="How We Work" title="Development Process" />
                            <div className="relative">
                                {/* Connecting line */}
                                <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200 z-0" />
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
                                    {s.processSteps.map((step, i) => (
                                        <div key={i} className="flex flex-col items-center text-center group">
                                            <div className="w-16 h-16 rounded-full bg-white border-4 border-teal-500 text-teal-600 flex items-center justify-center text-xl font-extrabold mb-4 shadow-lg group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                                                {step.step || String(i + 1).padStart(2, '0')}
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h4>
                                            {step.description && <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Section>
                    </section>
                )}

                {/* ── Industries ── */}
                {s.industries && s.industries.length > 0 && (
                    <section className="py-24 border-b border-gray-100">
                        <Section>
                            <SectionHeader label="Sectors" title="Industry-Specific Solutions" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {s.industries.map((item, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-300 transition-all duration-300 hover:-translate-y-1 text-center group">
                                        <span className="text-3xl mb-3">{item.icon || '🏭'}</span>
                                        <span className="font-semibold text-gray-800 group-hover:text-teal-700">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </section>
                )}

                {/* ── Post-Launch & Maintenance ── */}
                {s.maintenance && (
                    <section className="py-24 border-b border-gray-100">
                        <Section>
                            <div className="bg-gradient-to-br from-gray-900 to-teal-900 rounded-3xl p-12 md:p-16 text-white">
                                <span className="text-teal-400 text-sm font-bold tracking-widest uppercase">Ongoing Support</span>
                                <h2 className="text-4xl font-bold mt-2 mb-6">Post-Launch & Maintenance</h2>
                                <p className="text-gray-300 text-lg leading-relaxed max-w-4xl whitespace-pre-line">{s.maintenance}</p>
                            </div>
                        </Section>
                    </section>
                )}

                {/* ── Business Benefits ── */}
                {s.benefits && s.benefits.length > 0 && (
                    <section className="py-24 border-b border-gray-100">
                        <Section>
                            <SectionHeader label="Why Choose Us" title="Business Benefits" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {s.benefits.map((item, i) => (
                                    <div key={i} className="flex gap-5 p-7 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white group">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">✓</div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h4>
                                            <p className="text-gray-600">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </section>
                )}

                {/* ── Technology Stack ── */}
                {s.techStack && s.techStack.length > 0 && (
                    <section className="py-24 border-b border-gray-100">
                        <Section>
                            <SectionHeader label="Tools & Technologies" title="Technology Stack" />
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                                {s.techStack.map((item, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg border border-gray-200 hover:border-teal-300 transition-all duration-300 hover:-translate-y-2 group text-center">
                                        {item.icon ? (
                                            <img src={item.icon} alt={item.name} className="w-12 h-12 object-contain mb-3 group-hover:scale-110 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center text-xl font-bold mb-3">{item.name[0]}</div>
                                        )}
                                        <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </section>
                )}

                {/* ── Delivery Timeline ── */}
                {s.timeline && s.timeline.length > 0 && (
                    <section className="py-24 border-b border-gray-100">
                        <Section>
                            <SectionHeader label="What To Expect" title="Engagement & Delivery Timeline" />
                            <div className="space-y-4">
                                {s.timeline.map((item, i) => (
                                    <div key={i} className="flex items-center gap-6 p-6 rounded-2xl border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 group">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
                                            {String(i + 1).padStart(2, '0')}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 text-lg">{item.milestone}</h4>
                                        </div>
                                        {item.duration && (
                                            <span className="flex-shrink-0 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">{item.duration}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </section>
                )}
            </div>

            {/* ── Testimonials ── (full-width dark) */}
            {s.testimonials && s.testimonials.length > 0 && (
                <section className="py-24 bg-gray-950">
                    <div className="max-w-7xl mx-auto px-6">
                        <Section>
                            <div className="text-center mb-14">
                                <span className="text-teal-500 text-sm font-bold tracking-widest uppercase">Client Reviews</span>
                                <h2 className="text-4xl md:text-5xl font-bold text-white mt-2">What Our Clients Say</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {s.testimonials.map((t, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(5)].map((_, si) => <span key={si} className="text-teal-400">★</span>)}
                                        </div>
                                        <p className="text-gray-300 mb-6 leading-relaxed italic">"{t.content}"</p>
                                        <div className="flex items-center gap-3">
                                            {t.image ? (
                                                <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">{t.name[0]}</div>
                                            )}
                                            <div>
                                                <p className="font-bold text-white text-sm">{t.name}</p>
                                                {t.position && <p className="text-gray-400 text-xs">{t.position}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>
                </section>
            )}

            <div className="max-w-7xl mx-auto px-6">

                {/* ── Case Studies ── */}
                {s.caseStudies && s.caseStudies.length > 0 && (
                    <section className="py-24 border-b border-gray-100">
                        <Section>
                            <SectionHeader label="Our Work" title="Portfolio & Success Stories" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {s.caseStudies.map((item, i) => (
                                    <div key={i} className="group p-8 rounded-2xl border border-gray-200 hover:border-teal-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white flex justify-between items-center">
                                        <div>
                                            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center font-bold mb-4">📂</div>
                                            <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                                        </div>
                                        {item.link && (
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-4 flex-shrink-0 px-5 py-2 border border-teal-500 text-teal-600 rounded-lg font-semibold hover:bg-teal-500 hover:text-white transition-all duration-300">
                                                View →
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </section>
                )}

                {/* ── FAQ ── */}
                {s.faq && s.faq.length > 0 && (
                    <section className="py-24 border-b border-gray-100">
                        <Section>
                            <SectionHeader label="Questions" title="Frequently Asked Questions" />
                            <div className="max-w-4xl mx-auto">
                                {s.faq.map((item, i) => (
                                    <FaqItem key={i} q={item.question} a={item.answer} />
                                ))}
                            </div>
                        </Section>
                    </section>
                )}
            </div>

            {/* ── CTA ── */}
            <section id="contact" className="py-32 bg-gradient-to-br from-teal-600 to-teal-800 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <Section>
                        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                            {s.ctaTitle || 'Ready to Get Started?'}
                        </h2>
                        <p className="text-xl text-teal-100 mb-12 max-w-2xl mx-auto">
                            {s.ctaText || "Let's build something amazing together. Reach out to our team today."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/contact" className="px-10 py-4 bg-white text-teal-700 font-bold rounded-xl hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300 text-lg">
                                {s.ctaButtonText || 'Contact Us'} →
                            </Link>
                            <Link href="/" className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/30 backdrop-blur-sm transition-all duration-300 text-lg">
                                View All Services
                            </Link>
                        </div>
                    </Section>
                </div>
            </section>

            {/* ── Footer Strip ── */}
            <div className="bg-gray-950 text-gray-500 py-8 px-6 text-center text-sm">
                <p>© {new Date().getFullYear()} RapidTechPro. All rights reserved.</p>
            </div>
        </div>
    );
}
