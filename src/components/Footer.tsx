import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin } from 'lucide-react';

const footerGroups = [
  {
    title: 'Explore services',
    links: [
      { label: 'Care & companionship', href: '/requirements' },
      { label: 'Home nursing', href: '/requirements' },
      { label: 'Physiotherapy', href: '/requirements' },
      { label: 'Cooking & household', href: '/requirements' },
      { label: 'Tutoring & fitness', href: '/requirements' },
      { label: 'Browse all requests', href: '/requirements' },
    ],
  },
  {
    title: 'For customers',
    links: [
      { label: 'Post a service request', href: '/post-requirement' },
      { label: 'Compare proposals', href: '/dashboard' },
      { label: 'Track a service', href: '/dashboard' },
      { label: 'How Vaziro works', href: '/workflow-preview' },
    ],
  },
  {
    title: 'For professionals',
    links: [
      { label: 'Find customer requests', href: '/requirements' },
      { label: 'Join as a professional', href: '/signup?role=professional' },
      { label: 'Manage your profile', href: '/profile' },
      { label: 'Credit plans', href: '/credits' },
    ],
  },
  {
    title: 'Vaziro',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'Terms & conditions', href: '/terms' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Refund policy', href: '/refund-policy' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  },
];

const serviceAreas = ['Delhi', 'Noida', 'Gurugram', 'Ghaziabad', 'Greater Noida'];

export const Footer: React.FC = () => (
  <footer className="border-t border-white/10 bg-[#183e33] pb-[calc(5rem+env(safe-area-inset-bottom))] text-[#dce5da] lg:pb-10">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-8 border-b border-white/15 py-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12 lg:py-14">
        <div className="max-w-xl">
          <Link to="/" className="inline-flex rounded-sm focus-visible:outline-white">
            <img src="/logo-white.png" alt="Vaziro" className="h-9 w-auto object-contain" />
          </Link>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#c0d0c2]">
            A local marketplace helping families and independent professionals find the right fit for home and personal care.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Current service areas">
            <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#c0d0c2]"><MapPin className="h-3.5 w-3.5 text-[#c9f27d]" /> Delhi NCR</span>
            {serviceAreas.map((area) => <span key={area} className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-[#dce5da]">{area}</span>)}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:min-w-[340px] lg:justify-end">
          <Link to="/post-requirement" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#c9f27d] px-5 text-sm font-semibold text-[#203c32] transition hover:bg-[#d7f8a0] focus-visible:outline-white">
            Post a request <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/workflow-preview" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-white">
            How it works
          </Link>
        </div>
      </div>

      <nav aria-label="Footer navigation" className="grid grid-cols-1 gap-x-8 gap-y-9 border-b border-white/15 py-9 sm:grid-cols-2 sm:py-10 lg:grid-cols-4">
        {footerGroups.map((group) => (
          <section key={group.title}>
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#c9f27d]">{group.title}</h2>
            <ul className="mt-3 space-y-1">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="inline-flex min-h-9 items-center text-sm text-[#c0d0c2] transition hover:text-white focus-visible:outline-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>

      <div className="flex flex-col gap-4 py-6 text-xs text-[#b4c5b6] sm:flex-row sm:items-center sm:justify-between">
        <p className="leading-5">© {new Date().getFullYear()} Proanta Technologies Private Limited. All rights reserved.</p>
        <a href="mailto:support@vaziro.in" className="inline-flex min-h-10 items-center gap-2 self-start font-semibold text-[#dce5da] transition hover:text-[#c9f27d] sm:self-auto">
          <Mail className="h-4 w-4 text-[#c9f27d]" /> support@vaziro.in
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
