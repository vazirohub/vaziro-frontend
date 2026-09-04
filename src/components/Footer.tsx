import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Mail, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-neutral-400 pt-16 pb-12 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP ROW: Brand and NCR Availability Banner */}
        <div className="pb-12 border-b border-neutral-850 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <Link to="/" className="inline-block">
              <img
                src="/logo-white.png"
                alt="Vaziro"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-neutral-400 max-w-md leading-relaxed font-medium">
              Operated by <strong>Proanta Technologies Private Limited</strong>. India’s trusted marketplace for background-checked personal care, healthcare, and domestic professionals.
            </p>
          </div>

          <div className="lg:col-span-6 flex items-center justify-start lg:justify-end">
            <Link
              to="/post-requirement"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition flex items-center gap-2 shrink-0 shadow-md"
            >
              <span>Post Requirement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* MIDDLE ROW: 4 Structured Columns */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Categories */}
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Verified Categories</span>
            </div>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link to="/post-requirement" className="hover:text-emerald-400 transition-colors">
                  Elderly Caregiver
                </Link>
              </li>
              <li>
                <Link to="/post-requirement" className="hover:text-emerald-400 transition-colors">
                  Fitness Trainer
                </Link>
              </li>
              <li>
                <Link to="/post-requirement" className="hover:text-emerald-400 transition-colors">
                  Home Cook / Chef
                </Link>
              </li>
              <li>
                <Link to="/post-requirement" className="hover:text-emerald-400 transition-colors">
                  Home Nurse (Clinical)
                </Link>
              </li>
              <li>
                <Link to="/post-requirement" className="hover:text-emerald-400 transition-colors">
                  Home Tutor (CBSE / ICSE)
                </Link>
              </li>
              <li>
                <Link to="/post-requirement" className="hover:text-emerald-400 transition-colors">
                  Nanny & Baby Care (Japa)
                </Link>
              </li>
              <li>
                <Link to="/post-requirement" className="hover:text-emerald-400 transition-colors">
                  Physiotherapist (BPT / MPT)
                </Link>
              </li>
              <li>
                <Link to="/post-requirement" className="hover:text-emerald-400 transition-colors">
                  Yoga Instructor
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Service Locations (Delhi NCR) */}
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Delhi NCR Coverage</span>
            </div>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Delhi (South, Central, West, East)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Noida (Sectors 18 to 150)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Gurugram (DLF, Golf Course Rd)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ghaziabad (Indirapuram, Vaishali)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Greater Noida (Pari Chowk, West)</span>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
              <span className="text-emerald-400 font-bold block mb-0.5">Need service today?</span>
              Quotes delivered to your phone in &lt; 15 mins.
            </div>
          </div>

          {/* Col 3: Trust & Escrow Guarantee */}
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Trust & Security</span>
            </div>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>DigiLocker Aadhaar KYC</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Escrow Protection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>0% Commission on Worker Wages</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Privacy-Masked Telephony</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Official GST Invoices in ₹ INR</span>
              </li>
            </ul>
          </div>

          {/* Col 4: REPLACED "Official Inquiries" with Company & Legal Pages */}
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Company & Legal</span>
            </div>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-emerald-400 transition-colors font-medium">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-emerald-400 transition-colors font-medium">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-emerald-400 transition-colors font-medium">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-emerald-400 transition-colors font-medium">
                  Disclaimer & Platform Notice
                </Link>
              </li>
              <li className="pt-2 border-t border-neutral-800">
                <Link to="/login" className="hover:text-white transition-colors font-medium">
                  Customer / Pro Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 transition-colors font-bold">
                  Sign Up & Register Free
                </Link>
              </li>
              <li className="pt-2 flex items-center gap-1.5 text-neutral-300">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <a href="mailto:support@vaziro.in" className="hover:underline text-emerald-400 font-bold">
                  support@vaziro.in
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM ROW: Corporate Copyright & Compliance */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} <strong className="text-neutral-300">Proanta Technologies Private Limited</strong>. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-neutral-400">
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <span>•</span>
            <Link to="/refund-policy" className="hover:text-white transition">Refunds</Link>
            <span>•</span>
            <Link to="/disclaimer" className="hover:text-white transition">Disclaimer</Link>
            <span>•</span>
            <span className="text-emerald-400 font-bold">vaziro.in</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
