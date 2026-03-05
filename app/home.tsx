'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Project {
  id: number;
  title: string;
  slug: string;
  mainImage: string;
  metaDescription: string;
  categories: Array<{ name: string }>;
}

interface Service {
  id: number;
  title: string;
  description: string;
}


const useIntersectionObserver = (ref: React.RefObject<HTMLElement | null>) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return isVisible;
};

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const heroVisible = useIntersectionObserver(heroRef);
  const aboutVisible = useIntersectionObserver(aboutRef);
  const workVisible = useIntersectionObserver(workRef);
  const ctaVisible = useIntersectionObserver(ctaRef);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects?t=' + Date.now(), {
          headers: {
            'x-api-key': 'rapidtech_secret_key_2026'
          }
        });
        const data = await res.json();
        const projectsData = data.success ? data.data : (Array.isArray(data) ? data : data.data || []);
        setProjects(Array.isArray(projectsData) ? projectsData.slice(0, 6) : []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services?t=' + Date.now(), {
          headers: {
            'x-api-key': 'rapidtech_secret_key_2026'
          }
        });
        const data = await res.json();
        const servicesData = data.success ? data.data : (Array.isArray(data) ? data : data.data || []);
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchProjects();
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-600 bg-clip-text text-transparent">
            RapidTechPro
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#work" className="text-gray-700 hover:text-teal-600 transition font-medium">Work</a>
            <a href="#about" className="text-gray-700 hover:text-teal-600 transition font-medium">About</a>
            <a href="/admin/content" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium">
              Dashboard
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className={`relative pt-32 pb-24 px-6 overflow-hidden transition-all duration-1000 ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto">
          <div className={`space-y-6 transition-all duration-700 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-block px-4 py-2 bg-teal-50 border border-teal-200 rounded-full">
              <span className="text-teal-600 font-semibold text-sm">Welcome to RapidTechPro</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-tight text-gray-900">
              Build Amazing <span className="bg-gradient-to-r from-teal-600 to-teal-600 bg-clip-text text-transparent">Digital Experiences</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
              We craft exceptional digital solutions that transform your vision into reality. From concept to launch, we deliver excellence.
            </p>
            <div className="flex gap-4 pt-8">
              <a href="#work" className="px-8 py-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-all duration-300 hover:shadow-lg hover:scale-105">
                View Our Work
              </a>
              <a href="/admin/content" className="px-8 py-4 border-2 border-gray-300 text-gray-900 font-bold rounded-lg hover:border-teal-600 hover:text-teal-600 transition-all duration-300">
                Get Started
              </a>
            </div>
          </div>

          {/* Hero Image */}
          <div className={`mt-16 relative transition-all duration-1000 ${heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop"
                alt="Hero"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About/Approach Section */}
      <section ref={aboutRef} className={`py-24 px-6 bg-gradient-to-b from-gray-50 to-white transition-all duration-1000 ${aboutVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-700 ${aboutVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Our Approach
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe in combining strategic thinking with cutting-edge technology to create solutions that don't just work, but excel.
              </p>
              <ul className="space-y-4">
                {['Discovery & Strategy', 'Design Excellence', 'Development Mastery', 'Quality Assurance'].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">✓</span>
                    </div>
                    <span className="text-lg text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`transition-all duration-700 ${aboutVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=600&fit=crop"
                  alt="Approach"
                  className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section ref={workRef} id="work" className={`py-24 px-6 transition-all duration-1000 ${workVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${workVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Our Latest Work</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore the projects we're proud to have delivered
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${workVisible ? 'animate-stagger' : ''}`}>
            {projects.map((project, index) => (
              <Link key={project.id} href={`/project/${project.slug}`}>
                <div className="group cursor-pointer h-full transition-all duration-300 hover:translate-y-0">
                  <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-3xl transition-all duration-300 h-64 mb-4">
                    <img
                      src={project.mainImage}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{project.metaDescription.substring(0, 60)}...</p>
                  <div className="flex gap-2 flex-wrap">
                    {project.categories.slice(0, 2).map((cat, i) => (
                      <span key={i} className="px-3 py-1 bg-teal-50 text-teal-600 text-xs font-medium rounded-full">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className={`py-24 px-6 bg-gradient-to-r from-teal-600 to-teal-600 text-white transition-all duration-1000 ${ctaVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`max-w-4xl mx-auto text-center transition-all duration-700 ${ctaVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <h2 className="text-5xl font-bold mb-6">Ready to Build Something Great?</h2>
          <p className="text-xl opacity-90 mb-8">
            Let's collaborate and create digital experiences that make an impact
          </p>
          <a
            href="/admin/content"
            className="inline-block px-10 py-4 bg-white text-teal-600 font-bold rounded-lg hover:shadow-2xl hover:scale-110 transition-all duration-300"
          >
            Start Your Project →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-teal-400 bg-clip-text text-transparent mb-4">
                RapidTechPro
              </div>
              <p className="text-gray-400">Building digital excellence</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-4 h-4 rounded-full bg-teal-400"></div>
                <h4 className="text-xl font-bold">Services</h4>
              </div>
              <ul className="space-y-3 text-lg text-gray-400">
                {services.length > 0 ? (
                  services.map((service) => (
                    <li key={service.id}>
                      <a href="#" className="hover:text-white transition">{service.title}</a>
                    </li>
                  ))
                ) : (
                  <>
                    <li>Mobile App Solutions</li>
                    <li>Ecommerce Solutions</li>
                    <li>Website Solutions</li>
                    <li>HR Solutions</li>
                    <li>POS Solutions</li>
                    <li>UI/UX Solutions</li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 RapidTechPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

