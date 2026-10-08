import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { PublicProfessionalProfile } from '../types';
import {
  ShieldCheck,
  Star,
  MapPin,
  Briefcase,
  Clock,
  Check,
  CheckCircle2,
  Calendar,
  Languages,
  Award,
  Sparkles,
  ArrowRight,
  Share2,
  AlertCircle,
  Loader2,
  ChevronRight,
  User as UserIcon,
  MessageSquare,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';

export const PublicProfessionalProfilePage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<PublicProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!idOrSlug) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.getPublicProfessionalProfile(idOrSlug);
        if (res.data?.data) {
          setProfile(res.data.data);
          // Set SEO Title
          const title = `${res.data.data.name} — Verified ${res.data.data.title || 'Professional'} | Vaziro`;
          document.title = title;
        } else {
          setError('Profile not found');
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'This professional profile is currently private or does not exist.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [idOrSlug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading professional profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Profile Unavailable</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {error || 'This professional profile cannot be displayed.'}
          </p>
          <div className="pt-2">
            <Link
              to="/requirements"
              className="inline-flex items-center justify-center w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    name,
    title,
    bio,
    avatarUrl,
    yearsOfExperience,
    hourlyRate,
    currency,
    category,
    subcategory,
    serviceDescription,
    experienceDescription,
    qualifications,
    workingPreferences,
    languages,
    availabilityStatus,
    workingDays,
    workingHours,
    rating,
    reviewsCount,
    completedJobsCount,
    isVerified,
    verificationBadge,
    skills,
    serviceAreas,
    trustSummary,
    reviews,
  } = profile;

  // Availability badge
  const getAvailabilityBadge = () => {
    if (availabilityStatus === 'AVAILABLE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Available for Hire
        </span>
      );
    }
    if (availabilityStatus === 'BUSY') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Busy (Limited Slots)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        Not Available
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/requirements" className="hover:text-slate-900 transition">Professionals</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold truncate">{name}</span>
        </nav>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Profile Avatar */}
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-slate-100 shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center border-2 border-slate-200 shadow-inner">
                    <UserIcon className="w-12 h-12" />
                  </div>
                )}
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-xl shadow-md border-2 border-white" title="Verified via DigiLocker">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Name, Headline, Badges */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{name}</h1>
                  {getAvailabilityBadge()}
                </div>

                <p className="text-sm font-semibold text-emerald-700">{title}</p>

                {/* Verified Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Verified via DigiLocker
                    </span>
                  )}
                  {trustSummary.mobileVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
                      <Check className="w-3 h-3 text-sky-600" />
                      Mobile Verified
                    </span>
                  )}
                  {trustSummary.emailVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                      <Check className="w-3 h-3 text-indigo-600" />
                      Email Verified
                    </span>
                  )}
                </div>

                {/* Category & Location */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  {category && (
                    <span className="flex items-center gap-1 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {category.name}
                    </span>
                  )}
                  {serviceAreas.length > 0 && (
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {serviceAreas.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="text-left sm:text-right">
                {hourlyRate > 0 && (
                  <div className="text-xs text-slate-500 font-medium">
                    Rate: <span className="text-base font-black text-slate-900">₹{hourlyRate}</span>/hr
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                  title="Share Profile"
                  aria-label="Share Profile"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <Link
                  to={`/post-requirement?prefProfessional=${profile.id}&category=${category?.name || ''}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  <span>Request Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {copied && <span className="text-[11px] font-semibold text-emerald-600">Link copied!</span>}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Customer Rating</div>
              <div className="text-base font-black text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {rating > 0 ? rating.toFixed(1) : 'New'}
                <span className="text-xs text-slate-400 font-normal">({reviewsCount})</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Completed Jobs</div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {completedJobsCount} Jobs
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Experience</div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {yearsOfExperience} Years
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Trust Profile</div>
              <div className="text-xs font-black text-emerald-700 mt-1">
                {trustSummary.badgeText}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Me */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-3">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-emerald-600" />
                About Me
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {bio || 'Experienced professional dedicated to delivering reliable and trustworthy services.'}
              </p>
            </div>

            {/* Services Offered */}
            {(category || subcategory || serviceDescription) && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-3">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  Services Offered
                </h2>
                <div className="space-y-2">
                  {category && (
                    <div className="text-sm font-bold text-slate-800">
                      Primary Category: <span className="text-emerald-700">{category.name}</span>
                      {subcategory && <span className="text-slate-500 font-medium"> ({subcategory.name})</span>}
                    </div>
                  )}
                  {serviceDescription && (
                    <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                      {serviceDescription}
                    </p>
                  )}
                  {workingPreferences && (
                    <div className="text-xs text-slate-500 font-medium pt-1">
                      Working Preferences: <span className="text-slate-700 font-semibold">{workingPreferences}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Experience & Qualifications */}
            {(experienceDescription || qualifications || yearsOfExperience > 0) && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-3">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Experience & Qualifications
                </h2>
                <div className="space-y-3">
                  {qualifications && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 font-medium">
                      <div className="font-bold text-emerald-950 mb-0.5">Verified Qualifications / Certifications</div>
                      {qualifications}
                    </div>
                  )}
                  {experienceDescription && (
                    <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                      {experienceDescription}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-3">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Skills & Expertise
                </h2>
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-2xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Client Reviews */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  Client Reviews ({reviewsCount})
                </h2>
                {rating > 0 && (
                  <span className="text-xs font-bold text-slate-600">
                    Average: <span className="text-slate-900 font-black">{rating.toFixed(1)} / 5.0</span>
                  </span>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 font-medium">
                  No client reviews yet. Be the first to hire and leave a review for {name}!
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{rev.customerName}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-xs text-slate-700 leading-relaxed font-normal">{rev.comment}</p>
                      )}
                      <div className="text-[10px] text-slate-400 font-medium pt-1">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column (1 col) */}
          <div className="space-y-6">
            {/* Contact Details Card: Visible only when hired by customer */}
            {profile.isHiredByCurrentUser && (profile.phone || profile.email) ? (
              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Direct Contact (Unlocked)
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  You have hired {name}. Direct phone and email communication are now available.
                </p>
                <div className="space-y-2 pt-1">
                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border border-emerald-300 text-xs font-bold text-emerald-950 hover:bg-emerald-100/50 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>{profile.phone}</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 underline">Call</span>
                    </a>
                  )}
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border border-emerald-300 text-xs font-bold text-emerald-950 hover:bg-emerald-100/50 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        <span className="truncate max-w-[160px]">{profile.email}</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 underline">Email</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Contact Details Protected
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Mobile Phone</span>
                    <span className="font-mono font-bold tracking-widest text-slate-400">••••••••••</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Email Address</span>
                    <span className="font-mono font-bold tracking-widest text-slate-400">•••••••••••••</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Phone and email are hidden to prevent spam and maintain Vaziro Payment Protection. Details unlock automatically once you hire {name}.
                </p>
                <Link
                  to={`/post-requirement?prefProfessional=${profile.id}&category=${category?.name || ''}`}
                  className="inline-flex items-center justify-center w-full bg-[#108a00] hover:bg-[#14a800] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Hire to Unlock Contact
                </Link>
              </div>
            )}

            {/* Trust & Verification Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Trust & Verification
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-600 font-medium">Government ID (DigiLocker)</span>
                  <span className={`font-bold ${isVerified ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {isVerified ? '✓ Confirmed' : 'Pending'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-600 font-medium">Mobile Phone</span>
                  <span className="font-bold text-emerald-700">✓ OTP Verified</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-600 font-medium">Email Address</span>
                  <span className={`font-bold ${trustSummary.emailVerified ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {trustSummary.emailVerified ? '✓ Confirmed' : 'Not Provided'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed font-normal pt-1">
                {trustSummary.tooltipText}
              </p>
            </div>

            {/* Availability & Working Hours */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3 text-xs">
              <div className="flex items-center gap-2 font-black uppercase tracking-wider text-slate-900">
                <Clock className="w-4 h-4 text-emerald-600" />
                Availability & Schedule
              </div>

              <div className="space-y-2 pt-1">
                <div>
                  <span className="text-slate-500 font-medium">Working Days:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{workingDays || 'Monday - Saturday'}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Working Hours:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{workingHours || '09:00 AM - 06:00 PM'}</div>
                </div>
                {languages && (
                  <div>
                    <span className="text-slate-500 font-medium">Languages Spoken:</span>
                    <div className="font-semibold text-slate-800 mt-0.5">{languages}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Service Areas */}
            {serviceAreas.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3 text-xs">
                <div className="flex items-center gap-2 font-black uppercase tracking-wider text-slate-900">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Service Areas
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {serviceAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 font-medium text-[11px]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hire Banner CTA */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white space-y-3 shadow-md">
              <h3 className="text-base font-black tracking-tight">Need service from {name}?</h3>
              <p className="text-xs text-emerald-50 leading-relaxed font-normal">
                Post your requirement and receive direct quotes with Vaziro Payment Protection.
              </p>
              <Link
                to={`/post-requirement?prefProfessional=${profile.id}&category=${category?.name || ''}`}
                className="inline-flex items-center justify-center w-full bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs uppercase tracking-wider py-3 rounded-2xl shadow transition cursor-pointer"
              >
                Hire / Request Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
