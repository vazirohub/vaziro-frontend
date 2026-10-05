import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User as UserIcon,
  ShieldCheck,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Briefcase,
  IndianRupee,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Clock,
  Layers,
  Award,
  Globe,
  Sliders,
  Eye,
  BookOpen,
} from 'lucide-react';
import { ProfileVerificationCard } from '../components/ProfileVerificationCard';
import { ProfileStrengthCard } from '../components/ProfileStrengthCard';
import { TrustScoreCard } from '../components/TrustScoreCard';
import { Category, ProfileStrengthResult, TrustScoreResult } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, updateUser, openAuthModal } = useAuth();

  const isProfessional = user?.roles?.includes('PROFESSIONAL');
  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'about' | 'services' | 'experience' | 'availability' | 'areas' | 'preferences' | 'verification' | 'security'
  >('overview');

  // Categories & Subcategories
  const [categories, setCategories] = useState<Category[]>([]);

  // Personal Info Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [city, setCity] = useState('Delhi');

  // Professional Details Form
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>(3);
  const [languages, setLanguages] = useState('Hindi, English');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [experienceDescription, setExperienceDescription] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<'AVAILABLE' | 'BUSY' | 'NOT_AVAILABLE'>('AVAILABLE');
  const [workingDays, setWorkingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [workingHours, setWorkingHours] = useState('09:00 AM - 06:00 PM');
  const [workingPreferences, setWorkingPreferences] = useState('In-person, At customer premises');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'HIDDEN'>('PUBLIC');
  const [slug, setSlug] = useState('');

  // Strength & Trust score states
  const [strength, setStrength] = useState<ProfileStrengthResult | null>(null);
  const [trust, setTrust] = useState<TrustScoreResult | null>(null);

  // Password Change Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Preset Avatars
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=300&q=80',
  ];

  const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load Categories & Profile Data
  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;

    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');

    const savedAvatar = localStorage.getItem(`vaziro_avatar_${user.id}`);
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    } else if (user.professionalProfile?.avatarUrl) {
      setAvatarUrl(user.professionalProfile.avatarUrl);
    }

    if (isProfessional) {
      // Load full professional profile with computed strength & trust
      api.getProfessionalMe().then((res) => {
        if (res.data?.data) {
          const p = res.data.data;
          setTitle(p.title || '');
          setBio(p.bio || '');
          setHourlyRate(p.hourlyRate || '');
          setYearsOfExperience(p.yearsOfExperience ?? 3);
          setLanguages(p.languages || 'Hindi, English');
          setCategoryId(p.categoryId || '');
          setSubcategoryId(p.subcategoryId || '');
          setServiceDescription(p.serviceDescription || '');
          setExperienceDescription(p.experienceDescription || '');
          setQualifications(p.qualifications || '');
          setAvailabilityStatus(p.availabilityStatus || 'AVAILABLE');
          setWorkingHours(p.workingHours || '09:00 AM - 06:00 PM');
          setWorkingPreferences(p.workingPreferences || 'In-person, At customer premises');
          setVisibility(p.visibility || 'PUBLIC');
          setSlug(p.slug || '');
          if (p.avatarUrl) setAvatarUrl(p.avatarUrl);

          if (p.workingDays) {
            const daysArr = p.workingDays.split(',').map((d: string) => d.trim()).filter(Boolean);
            if (daysArr.length > 0) setWorkingDays(daysArr);
          }

          if (Array.isArray(p.skills)) {
            const sNames = p.skills.map((s: any) => s.skill?.name || s.name).filter(Boolean);
            setSkillsText(sNames.join(', '));
          }

          if (p.profileStrength) setStrength(p.profileStrength);
          if (p.trustScore) setTrust(p.trustScore);
        }
      }).catch((err) => {
        console.error('Failed to load professional profile details:', err);
      });
    }
  }, [user, isProfessional]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 bg-neutral-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-black">
            <UserIcon className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-black">Sign In to View Profile</h2>
          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
            Please sign in to manage your professional profile, identity verification, and credentials.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => openAuthModal('CUSTOMER', undefined, 'LOGIN')}
              className="flex-1 bg-black hover:bg-neutral-800 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('CUSTOMER', undefined, 'SIGNUP')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Action Key Click from ProfileStrengthCard
  const handleSectionJump = (actionKey: string) => {
    switch (actionKey) {
      case 'photo':
      case 'name':
      case 'payouts':
        setActiveTab('overview');
        break;
      case 'bio':
        setActiveTab('about');
        break;
      case 'category':
      case 'hourlyRate':
        setActiveTab('services');
        break;
      case 'experience':
      case 'experienceDescription':
      case 'skills':
      case 'qualifications':
      case 'languages':
        setActiveTab('experience');
        break;
      case 'availability':
      case 'workingDays':
        setActiveTab('availability');
        break;
      case 'location':
        setActiveTab('areas');
        break;
      case 'verification':
        setActiveTab('verification');
        break;
      default:
        setActiveTab('overview');
        break;
    }

    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Toggle Working Day
  const handleToggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      if (workingDays.length > 1) {
        setWorkingDays(workingDays.filter((d) => d !== day));
      }
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  // Handle Photo File Upload
  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3.5 * 1024 * 1024) {
      alert('Photo must be smaller than 3.5 MB');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setAvatarUrl(base64Data);
        localStorage.setItem(`vaziro_avatar_${user.id}`, base64Data);

        if (isProfessional) {
          try {
            await api.uploadAvatar(base64Data);
            // Refresh strength & trust
            const stRes = await api.getProfileStrength();
            if (stRes.data?.data) setStrength(stRes.data.data);
          } catch (err) {
            console.error('Avatar sync error:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      if (avatarUrl) {
        localStorage.setItem(`vaziro_avatar_${user.id}`, avatarUrl);
      }

      // 1. Update basic user details
      const userRes = await api.updateProfile({
        firstName,
        lastName,
        email,
        phone,
      });

      if (userRes.data?.data?.user) {
        updateUser(userRes.data.data.user);
      }

      // 2. If professional, update professional profile fields
      if (isProfessional) {
        const skillsArray = skillsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const profRes = await api.updateProfessionalProfile({
          title,
          bio,
          yearsOfExperience: Number(yearsOfExperience || 1),
          hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
          languages,
          avatarUrl,
          categoryId: categoryId || undefined,
          subcategoryId: subcategoryId || undefined,
          serviceDescription,
          experienceDescription,
          qualifications,
          availabilityStatus,
          workingDays: workingDays.join(', '),
          workingHours,
          workingPreferences,
          visibility,
          skills: skillsArray,
        });

        if (profRes.data?.data) {
          const updated = profRes.data.data;
          if (updated.profileStrength) setStrength(updated.profileStrength);
          if (updated.trustScore) setTrust(updated.trustScore);
          if (updated.slug) setSlug(updated.slug);
        }
      }

      setSuccessMessage('Your profile changes have been saved successfully!');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || err.message || 'Failed to save profile changes.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await api.changePassword({
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        setPasswordSuccess('Password changed successfully! You can use your new password on your next login.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.error?.message || err.message || 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
      setTimeout(() => setPasswordSuccess(null), 5000);
    }
  };

  const handleCopyProfileLink = () => {
    const publicUrl = `${window.location.origin}/professionals/${slug || user?.professionalProfile?.id || user?.id}`;
    navigator.clipboard.writeText(publicUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handlePreviewPublicProfile = () => {
    const url = `/professionals/${slug || user?.professionalProfile?.id || user?.id}`;
    window.open(url, '_blank');
  };

  const userInitials = `${firstName[0] || 'V'}${lastName[0] || ''}`.toUpperCase();
  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <div className="bg-neutral-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={firstName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-neutral-200"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black text-white flex items-center justify-center font-black text-3xl shadow-lg ring-2 ring-neutral-200">
                    {userInitials}
                  </div>
                )}
                {isProfessional && user?.professionalProfile?.isVerified && (
                  <div className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 rounded-full text-white shadow-md border-2 border-white" title="Verified via DigiLocker">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Meta */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                    {firstName} {lastName}
                  </h1>
                  {isAdmin && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2.5 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                  {isProfessional ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      Verified Partner
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-300">
                      Customer
                    </span>
                  )}
                  {isProfessional && visibility === 'PUBLIC' ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200">
                      Public Profile
                    </span>
                  ) : isProfessional ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-300">
                      Hidden
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-neutral-500 font-medium">
                  {email || 'No email provided'} • {phone || '+91 Mobile User'}
                </p>

                {isProfessional && (
                  <p className="text-xs font-semibold text-emerald-700 mt-1">
                    {title || 'Professional Service Partner'}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions (Preview Public Profile & Copy Link) */}
            {isProfessional && (
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePreviewPublicProfile}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Public Profile</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </button>

                <button
                  type="button"
                  onClick={handleCopyProfileLink}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-bold transition cursor-pointer"
                  title="Copy public profile URL"
                >
                  {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-600" />}
                  <span>{linkCopied ? 'Link Copied!' : 'Share'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Badges row */}
          <div className="flex flex-wrap items-center gap-3 pt-4 text-xs font-semibold text-neutral-600">
            <div className="flex items-center gap-1.5 text-neutral-700">
              <MapPin className="w-3.5 h-3.5 text-black" />
              <span>{city} NCR (Active)</span>
            </div>

            {isProfessional && user?.professionalProfile?.isVerified ? (
              <div className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>✓ Verified via DigiLocker</span>
              </div>
            ) : isProfessional ? (
              <button
                type="button"
                onClick={() => setActiveTab('verification')}
                className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-200 transition cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>DigiLocker Unverified (Verify Now)</span>
              </button>
            ) : null}

            {phone && (
              <div className="flex items-center gap-1 font-medium text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Mobile Verified</span>
              </div>
            )}

            {email && (
              <div className="flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Email Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Professional Metrics: Profile Strength & Trust Score */}
        {isProfessional && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfileStrengthCard
              strength={strength}
              onSelectSection={handleSectionJump}
            />
            <TrustScoreCard
              trust={trust}
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-1.5 border border-neutral-200 shadow-xs overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 min-w-max">
            {isProfessional ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-3.5 py-2 text-xs font-black rounded-xl transition ${
                    activeTab === 'overview' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  Basic Info & Photo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('about')}
                  className={`px-3.5 py-2 text-xs font-black rounded-xl transition ${
                    activeTab === 'about' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  About Me (Bio)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={`px-3.5 py-2 text-xs font-black rounded-xl transition ${
                    activeTab === 'services' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  Services & Category
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('experience')}
                  className={`px-3.5 py-2 text-xs font-black rounded-xl transition ${
                    activeTab === 'experience' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  Experience & Skills
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('availability')}
                  className={`px-3.5 py-2 text-xs font-black rounded-xl transition ${
                    activeTab === 'availability' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  Availability
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('areas')}
                  className={`px-3.5 py-2 text-xs font-black rounded-xl transition ${
                    activeTab === 'areas' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  Service Areas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preferences')}
                  className={`px-3.5 py-2 text-xs font-black rounded-xl transition ${
                    activeTab === 'preferences' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  Preferences & Visibility
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('verification')}
                  className={`px-3.5 py-2 text-xs font-black rounded-xl transition ${
                    activeTab === 'verification' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  DigiLocker Verification
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`px-3.5 py-2 text-xs font-black rounded-xl transition ${
                    activeTab === 'security' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  Password
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2.5 text-xs font-black rounded-xl transition ${
                    activeTab === 'overview' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Personal Information
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`px-4 py-2.5 text-xs font-black rounded-xl transition ${
                    activeTab === 'security' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Password & Security
                </button>
              </>
            )}
          </div>
        </div>

        {/* Global Success / Error Banners */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB CONTENTS */}
        <form onSubmit={handleSaveProfile} className="space-y-6">

          {/* TAB 1: OVERVIEW & BASIC INFO */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-black text-neutral-900">Personal Information & Photo</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Your identity details, profile photo, and registered contact information.
                </p>
              </div>

              {/* Photo Upload & Presets */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Profile Photo (Photo adds +10% to profile strength)
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-neutral-300 ring-2 ring-emerald-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-bold">
                      {userInitials}
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold cursor-pointer transition border border-neutral-300">
                      <Camera className="w-4 h-4 text-neutral-600" />
                      <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Image from Computer / Phone'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-neutral-500">Max size 3.5MB. PNG, JPG or WebP supported.</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-bold text-neutral-600">Or choose a professional avatar preset:</div>
                  <div className="flex flex-wrap items-center gap-3">
                    {presetAvatars.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAvatarUrl(url)}
                        className={`relative rounded-full overflow-hidden w-11 h-11 border-2 transition cursor-pointer ${
                          avatarUrl === url ? 'ring-2 ring-black border-black scale-105' : 'border-neutral-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="url"
                    placeholder="Or enter direct image URL (https://...)"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Mobile Number (India +91)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Headline for Professional */}
              {isProfessional && (
                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Professional Headline / Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Certified Elderly Care Specialist, Senior Home Physiotherapist"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ABOUT ME (BIO) */}
          {activeTab === 'about' && isProfessional && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-black text-neutral-900">About Me & Bio</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Introduce yourself to prospective clients. Explain your background, work approach, and dedication to excellence.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Bio Description
                  </label>
                  <span
                    className={`text-xs font-bold ${
                      bio.length >= 500 && bio.length <= 1000
                        ? 'text-emerald-700'
                        : bio.length > 1000
                        ? 'text-red-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {bio.length} / 1000 characters (Recommended: 500–1000)
                  </span>
                </div>

                <textarea
                  rows={8}
                  placeholder="Tell clients about your experience, certifications, values, and why they should choose you for their care or home service needs..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
                />

                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-600 space-y-1">
                  <div className="font-bold text-neutral-800">Tips for a high-converting profile bio:</div>
                  <ul className="list-disc list-inside text-neutral-600 space-y-0.5 text-[11px]">
                    <li>Highlight your verified experience (e.g. "Over 5 years of experience in patient rehabilitation").</li>
                    <li>State your care philosophy and professionalism.</li>
                    <li>Do not share personal bank details, Aadhaar numbers, or external phone numbers in your bio.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES & CATEGORY */}
          {activeTab === 'services' && isProfessional && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-black text-neutral-900">Services & Category</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Select your primary service vertical and define what offerings you provide to customers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Primary Service Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setSubcategoryId('');
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Subcategory / Specific Service
                  </label>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    disabled={!categoryId}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer bg-white disabled:opacity-50"
                  >
                    <option value="">Select Subcategory</option>
                    {selectedCategoryObj?.subcategories?.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Standard Hourly Rate (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-500">₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 800"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : '')}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Detailed Service Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Outline the scope of your services, what is included in your sessions, equipment you bring, etc."
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          )}

          {/* TAB 4: EXPERIENCE & SKILLS */}
          {activeTab === 'experience' && isProfessional && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-black text-neutral-900">Experience, Skills & Qualifications</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Demonstrate your track record, verified training, and specialized competencies.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Total Experience (Years) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    placeholder="e.g. 5"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Languages Spoken
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hindi, English, Punjabi"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Specialized Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Post-Surgery Rehab, Stroke Recovery, Elderly Mobility, CPR Certified"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-[11px] text-neutral-500 mt-1">Separate tags with commas. Each skill will appear as a pill badge on your public profile.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Degrees, Certifications & Training
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Bachelor of Physiotherapy (BPT), Certified Geriatric Caregiver, Red Cross First Aid"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Experience Summary & Past Employers / Institutions
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your previous roles, hospital/clinic associations, or years of private practice..."
                  value={experienceDescription}
                  onChange={(e) => setExperienceDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          )}

          {/* TAB 5: AVAILABILITY */}
          {activeTab === 'availability' && isProfessional && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-black text-neutral-900">Working Availability & Schedule</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Configure your availability status, working days of the week, and preferred working hours.
                </p>
              </div>

              {/* Status Radio */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                  Current Availability Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setAvailabilityStatus('AVAILABLE')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                      availabilityStatus === 'AVAILABLE'
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      Available Now
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-1">Ready to receive customer leads and book appointments.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvailabilityStatus('BUSY')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                      availabilityStatus === 'BUSY'
                        ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-600'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Busy / Limited
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-1">Accepting inquiries for future dates only.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvailabilityStatus('NOT_AVAILABLE')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                      availabilityStatus === 'NOT_AVAILABLE'
                        ? 'border-neutral-800 bg-neutral-100 ring-2 ring-neutral-800'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-neutral-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                      Not Available
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-1">On leave or temporarily paused.</p>
                  </button>
                </div>
              </div>

              {/* Working Days */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                  Working Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_LIST.map((day) => {
                    const active = workingDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          active
                            ? 'bg-black text-white border-black'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Working Hours
                </label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 AM - 06:00 PM"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          )}

          {/* TAB 6: SERVICE AREAS */}
          {activeTab === 'areas' && isProfessional && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-black text-neutral-900">Service Location & Operating Zones</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Define your primary operating cities and coverage areas across Delhi NCR.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Primary NCR Zone / City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer bg-white"
                  >
                    <option value="Delhi">Delhi (South, North, East, West, Central)</option>
                    <option value="Noida">Noida & Noida Extension</option>
                    <option value="Gurugram">Gurugram (Cyber City, Golf Course, Sohna)</option>
                    <option value="Ghaziabad">Ghaziabad (Indirapuram, Vaishali)</option>
                    <option value="Greater Noida">Greater Noida</option>
                    <option value="Faridabad">Faridabad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    State / Union Territory
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Delhi NCR / Haryana / Uttar Pradesh"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-500 bg-neutral-50"
                  />
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-600 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-800">Dynamic Matching Enabled: </span>
                  Customers in {city} and surrounding Delhi NCR localities will be matched with your profile when searching for services.
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: WORK PREFERENCES & VISIBILITY */}
          {activeTab === 'preferences' && isProfessional && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-black text-neutral-900">Work Preferences & Profile Visibility</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Control how your profile appears in search results and specify how you fulfill engagements.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Work Engagement Preferences
                </label>
                <input
                  type="text"
                  placeholder="e.g. In-person visits, Home care shifts, Weekend appointments"
                  value={workingPreferences}
                  onChange={(e) => setWorkingPreferences(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                  Marketplace Profile Visibility
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setVisibility('PUBLIC')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                      visibility === 'PUBLIC'
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      <span>Public (Recommended)</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-1">
                      Your profile appears in public search, category listings, and customer quotation shortlists.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility('HIDDEN')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                      visibility === 'HIDDEN'
                        ? 'border-neutral-800 bg-neutral-100 ring-2 ring-neutral-800'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="font-bold text-xs text-neutral-800 flex items-center gap-1.5">
                      <span>Hidden / Unlisted</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-1">
                      Your profile is paused from public search. Only direct link holders can view it.
                    </p>
                  </button>
                </div>
              </div>

              {slug && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                    Your Canonical Profile URL
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-neutral-100 rounded-xl border border-neutral-300 text-xs font-mono text-neutral-800">
                    <Globe className="w-4 h-4 text-neutral-600 shrink-0" />
                    <span className="truncate">{window.location.origin}/professionals/{slug}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: DIGILOCKER VERIFICATION */}
          {activeTab === 'verification' && isProfessional && (
            <div className="space-y-6">
              <ProfileVerificationCard />
            </div>
          )}

          {/* TAB 9: PASSWORD & SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-black text-neutral-900">Change Password</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Protect your account and booking history with a secure password.
                </p>
              </div>

              {passwordSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    New Password * (Min 6 chars)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="bg-black hover:bg-neutral-800 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Password</span>}
                </button>
              </div>
            </div>
          )}

          {/* Bottom Save Action Bar */}
          {activeTab !== 'verification' && activeTab !== 'security' && (
            <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-neutral-500 font-medium text-center sm:text-left">
                Ensure all details are accurate before saving. Changes immediately reflect on your public profile.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Profile Changes</span>}
                </button>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
