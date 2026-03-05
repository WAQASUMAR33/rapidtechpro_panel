'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

interface Technology {
  id: number;
  name: string;
  icon?: string;
}

interface ProjectImage {
  id: number;
  imageUrl: string;
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
  images: ProjectImage[];
  createdAt: string;
  updatedAt: string;
}

// Custom hook for Intersection Observer
const useIntersectionObserver = (ref: React.RefObject<HTMLElement | null>, options = {}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isVisible;
};

export default function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<HTMLDivElement>(null);
  const challengeRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Intersection observer hooks
  const heroVisible = useIntersectionObserver(heroRef);
  const clientVisible = useIntersectionObserver(clientRef);
  const challengeVisible = useIntersectionObserver(challengeRef);
  const journeyVisible = useIntersectionObserver(journeyRef);
  const featuresVisible = useIntersectionObserver(featuresRef);
  const galleryVisible = useIntersectionObserver(galleryRef);
  const resultsVisible = useIntersectionObserver(resultsRef);
  const techVisible = useIntersectionObserver(techRef);
  const ctaVisible = useIntersectionObserver(ctaRef);

  useEffect(() => {
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects?slug=${slug}`, {
        headers: {
          'x-api-key': 'rapidtech_secret_key_2026'
        }
      });
      const data = await res.json();

      if (data.success && data.data) {
        setProject(data.data);
      } else {
        setError('Project not found');
      }
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link href="/" className="text-teal-600 hover:text-teal-700 font-semibold mb-4 inline-block">
            ← Back
          </Link>
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const processItems = project.processSteps
    ? project.processSteps.split('|').map((step) => step.trim())
    : [];

  const featureItems = project.features
    ? project.features.split('\n').filter((f) => f.trim())
    : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 bg-white border-b border-gray-100 backdrop-blur-sm transition-all duration-500 ${heroVisible ? 'shadow-sm' : 'shadow-lg'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
          <Link href="/" className="text-teal-600 hover:text-teal-700 font-bold transition-colors text-lg">
            ← Back
          </Link>
        </div>
      </nav>

      {/* Hero Section with Main Image */}
      <div ref={heroRef} className={`relative bg-gradient-to-b from-gray-900 via-teal-900 to-gray-800 text-white overflow-hidden transition-all duration-1000 ${heroVisible ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-6 py-32">
          <div className={heroVisible ? 'animate-slide-up' : 'opacity-0'}>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">{project.title}</h1>
            <p className="text-xl text-gray-300 max-w-2xl">{project.metaDescription}</p>
          </div>
        </div>

        {/* Hero Image */}
        {project.mainImage && (
          <div className="max-w-7xl mx-auto px-6 pb-20">
            <img
              src={project.mainImage}
              alt={project.title}
              className={`w-full h-96 object-cover rounded-2xl shadow-2xl transition-all duration-700 hover:shadow-3xl hover:scale-105 ${heroVisible ? 'animate-scale-up' : 'opacity-0'}`}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* About The Client Section */}
        {project.client && (
          <section ref={clientRef} className={`mb-20 transition-all duration-700 ${clientVisible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">About The Client</h2>
                <p className="text-lg text-gray-700 leading-relaxed">{project.client}</p>
              </div>
              {project.images.length > 0 && (
                <img
                  src={project.images[0]?.imageUrl}
                  alt="Client project"
                  className="w-full h-64 object-cover rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                />
              )}
            </div>
          </section>
        )}

        {/* Challenge Section */}
        {project.challenge && (
          <section ref={challengeRef} className={`mb-20 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-16 transition-all duration-700 ${challengeVisible ? 'animate-slide-up' : 'opacity-0 translate-y-8'}`}>
            <div className="max-w-4xl">
              <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">The Challenge</h2>
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line ">
                {project.challenge}
              </p>
            </div>
          </section>
        )}

        {/* Process/Journey Section */}
        {processItems.length > 0 && (
          <section ref={journeyRef} className={`mb-20 transition-all duration-700 ${journeyVisible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-5xl font-bold text-gray-900 mb-16 leading-tight">Our Journey</h2>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 ${journeyVisible ? 'animate-stagger' : ''}`}>
              {processItems.map((step, index) => (
                <div key={index} className="flex flex-col items-center transform transition-all duration-500 hover:scale-110">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg animate-pulse-border">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <p className="text-center font-bold text-gray-900 text-lg">{step}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Features Section */}
        {featureItems.length > 0 && (
          <section ref={featuresRef} className={`mb-20 transition-all duration-700 ${featuresVisible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-5xl font-bold text-gray-900 mb-16 leading-tight">Key Features & Capabilities</h2>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${featuresVisible ? 'animate-stagger' : ''}`}>
              {featureItems.map((feature, index) => (
                <div key={index} className="flex gap-4 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-lg hover:bg-white transition-all duration-300 hover:-translate-y-2 border border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-1 font-bold text-lg">
                    ✓
                  </div>
                  <p className="text-gray-700 font-semibold text-lg leading-relaxed">{feature}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {project.images.length > 1 && (
          <section ref={galleryRef} className={`mb-20 transition-all duration-700 ${galleryVisible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-5xl font-bold text-gray-900 mb-16 leading-tight">Project Showcase</h2>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${galleryVisible ? 'animate-stagger' : ''}`}>
              {project.images.slice(1).map((img) => (
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt={`${project.title} showcase`}
                  className="w-full h-80 object-cover rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                />
              ))}
            </div>
          </section>
        )}

        {/* Results Section */}
        {project.results && (
          <section ref={resultsRef} className={`mb-20 bg-gradient-to-r from-teal-900 via-teal-900 to-gray-900 text-white rounded-2xl p-16 transition-all duration-700 ${resultsVisible ? 'animate-slide-up' : 'opacity-0 translate-y-8'}`}>
            <div className="max-w-4xl">
              <h2 className="text-5xl font-bold mb-8 leading-tight">Results & Impact</h2>
              <p className="text-lg leading-relaxed whitespace-pre-line">
                {project.results}
              </p>
            </div>
          </section>
        )}

        {/* Blog/Additionally */}
        {project.blog && (
          <section className={`mb-20 bg-gray-50 rounded-2xl p-16 transition-all duration-700`}>
            <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">Project Details</h2>
            <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
              {project.blog}
            </div>
          </section>
        )}

        {/* Technologies Section */}
        {project.technologies.length > 0 && (
          <section ref={techRef} className={`mb-20 transition-all duration-700 ${techVisible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-5xl font-bold text-gray-900 mb-16 leading-tight">Technology Stack</h2>
            <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 ${techVisible ? 'animate-stagger' : ''}`}>
              {project.technologies.map((tech) => (
                <div
                  key={tech.id}
                  className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-lg hover:bg-white transition-all duration-300 hover:-translate-y-3 border border-gray-200 group"
                >
                  {tech.icon && (
                    <img
                      src={tech.icon}
                      alt={tech.name}
                      className="w-16 h-16 object-contain mb-4 transition-transform duration-300 group-hover:scale-110"
                    />
                  )}
                  <span className="text-sm font-bold text-gray-900 text-center">{tech.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Categories Section */}
        {project.categories.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
            <div className="flex flex-wrap gap-3">
              {project.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-block bg-teal-100 text-teal-700 px-6 py-2 rounded-full font-semibold hover:bg-teal-200 transition-colors duration-300"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* CTA Section */}
      <section ref={ctaRef} className={`bg-gradient-to-r from-teal-600 via-teal-600 to-teal-700 text-white py-32 transition-all duration-700 ${ctaVisible ? 'animate-slide-up' : 'opacity-0 translate-y-8'}`}>
        <div className={`max-w-6xl mx-auto px-6 text-center transition-all duration-700 ${ctaVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <h2 className="text-6xl font-bold mb-6 leading-tight">Ready to Bring Your Vision to Life?</h2>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">Let's create something amazing together</p>
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-12 py-4 bg-white text-teal-600 font-bold rounded-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg"
          >
            View Live Project →
          </a>
        </div>
      </section>

      {/* Footer Meta Info */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <p className="text-xs text-gray-400 mb-2 font-bold tracking-wider uppercase">Location</p>
              <p className="text-lg font-bold text-white">{project.location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2 font-bold tracking-wider uppercase">Year</p>
              <p className="text-lg font-bold text-white">
                {new Date(project.createdAt).getFullYear()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2 font-bold tracking-wider uppercase">Updated</p>
              <p className="text-lg font-bold text-white">
                {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2 font-bold tracking-wider uppercase">Website</p>
              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-teal-400 hover:text-teal-300 transition-colors">
                Visit Project
              </a>
            </div>
          </div>
          <div className="mt-16 pt-12 border-t border-gray-700 text-center text-gray-500">
            <p>&copy; 2026 RapidTechPro. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
