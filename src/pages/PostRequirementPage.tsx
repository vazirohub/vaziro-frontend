import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Category, Subcategory, IndianState, City } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  ChevronRight,
  MapPin,
  IndianRupee,
  Calendar,
  ShieldCheck,
  Clock,
  HeartHandshake,
  Dumbbell,
  ChefHat,
  Cross,
  GraduationCap,
  Baby,
  Activity,
  Sparkles,
  ArrowRight,
  Star,
  AlertTriangle,
  Briefcase,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  HeartHandshake: <HeartHandshake className="w-5 h-5 text-black" />,
  Dumbbell: <Dumbbell className="w-5 h-5 text-black" />,
  ChefHat: <ChefHat className="w-5 h-5 text-black" />,
  Cross: <Cross className="w-5 h-5 text-black" />,
  GraduationCap: <GraduationCap className="w-5 h-5 text-black" />,
  Baby: <Baby className="w-5 h-5 text-black" />,
  Activity: <Activity className="w-5 h-5 text-black" />,
  Sparkles: <Sparkles className="w-5 h-5 text-black" />,
};

const categoryThumbnails: Record<string, string> = {
  'elderly-caregiver': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80',
  'fitness-trainer': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  'home-cook-chef': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80',
  'home-nurse': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=400&q=80',
  'home-tutor': 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=400&q=80',
  'nanny-baby-care': 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=400&q=80',
  'physiotherapist': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
  'yoga-instructor': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80',
};

// Complete offline-ready fallback catalog so page never displays an error even before backend wakes up
const defaultMasterCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Elderly Caregiver',
    slug: 'elderly-caregiver',
    description: 'Compassionate assistance for senior citizens, dementia care, post-op recovery',
    icon: 'HeartHandshake',
    subcategories: [
      { id: 'sub-1', name: 'Dementia Care', slug: 'dementia-care' },
      { id: 'sub-2', name: 'Elderly Companion', slug: 'elderly-companion' },
      { id: 'sub-3', name: 'Full-Time Caregiver', slug: 'full-time-caregiver' },
      { id: 'sub-4', name: 'Live-In Caregiver', slug: 'live-in-caregiver' },
      { id: 'sub-5', name: 'Part-Time Caregiver', slug: 'part-time-caregiver' },
      { id: 'sub-6', name: 'Post-Hospital Care', slug: 'post-hospital-care' },
    ],
  },
  {
    id: 'cat-2',
    name: 'Fitness Trainer',
    slug: 'fitness-trainer',
    description: 'Personalized in-home gym training, weight loss, mobility coaching',
    icon: 'Dumbbell',
    subcategories: [
      { id: 'sub-7', name: 'Personal Trainer', slug: 'personal-trainer' },
      { id: 'sub-8', name: 'Weight Loss Coach', slug: 'weight-loss-coach' },
      { id: 'sub-9', name: 'Strength Training', slug: 'strength-training' },
      { id: 'sub-10', name: 'Home Workout', slug: 'home-workout' },
      { id: 'sub-11', name: 'Senior Fitness', slug: 'senior-fitness' },
      { id: 'sub-12', name: 'Sports Conditioning', slug: 'sports-conditioning' },
    ],
  },
  {
    id: 'cat-3',
    name: 'Home Cook / Chef',
    slug: 'home-cook-chef',
    description: 'Hygienic daily meals, regional specialties, party catering',
    icon: 'ChefHat',
    subcategories: [
      { id: 'sub-13', name: 'Daily Home Cook', slug: 'daily-home-cook' },
      { id: 'sub-14', name: 'North Indian Chef', slug: 'north-indian-chef' },
      { id: 'sub-15', name: 'South Indian Cook', slug: 'south-indian-cook' },
      { id: 'sub-16', name: 'Jain Food Cook', slug: 'jain-food-cook' },
      { id: 'sub-17', name: 'Diet & Healthy Meals', slug: 'diet-healthy-meals' },
      { id: 'sub-18', name: 'Party Chef', slug: 'party-chef' },
    ],
  },
  {
    id: 'cat-4',
    name: 'Home Nurse',
    slug: 'home-nurse',
    description: 'Certified clinical nurses for injections, catheter care, post-op vitals',
    icon: 'Cross',
    subcategories: [
      { id: 'sub-19', name: 'General Nursing', slug: 'general-nursing' },
      { id: 'sub-20', name: 'Post-Operative Care', slug: 'post-operative-care' },
      { id: 'sub-21', name: 'ICU at Home', slug: 'icu-at-home' },
      { id: 'sub-22', name: 'Injection / IV Drip', slug: 'injection-iv-drip' },
      { id: 'sub-23', name: 'Wound Dressing', slug: 'wound-dressing' },
      { id: 'sub-24', name: 'Catheter & Ryles Tube', slug: 'catheter-ryles-tube' },
    ],
  },
  {
    id: 'cat-5',
    name: 'Home Tutor',
    slug: 'home-tutor',
    description: 'Expert private academic tutoring for CBSE, ICSE, IIT-JEE, and languages',
    icon: 'GraduationCap',
    subcategories: [
      { id: 'sub-25', name: 'School Tutor (1-10)', slug: 'school-tutor' },
      { id: 'sub-26', name: 'Mathematics Specialist', slug: 'mathematics' },
      { id: 'sub-27', name: 'Science & Physics', slug: 'science' },
      { id: 'sub-28', name: 'English Grammar & Lit', slug: 'english' },
      { id: 'sub-29', name: 'Competitive Exams', slug: 'competitive-exam' },
      { id: 'sub-30', name: 'Language Tutor', slug: 'language-tutor' },
    ],
  },
  {
    id: 'cat-6',
    name: 'Nanny & Baby Care',
    slug: 'nanny-baby-care',
    description: 'Police-verified newborn caregivers, babysitters, and daytime nannies',
    icon: 'Baby',
    subcategories: [
      { id: 'sub-31', name: 'Newborn Care (Japa)', slug: 'newborn-care' },
      { id: 'sub-32', name: 'Daytime Babysitter', slug: 'babysitter' },
      { id: 'sub-33', name: 'Full-Time Nanny', slug: 'full-time-nanny' },
      { id: 'sub-34', name: 'Part-Time Nanny', slug: 'part-time-nanny' },
      { id: 'sub-35', name: 'Night Baby Care', slug: 'night-care' },
    ],
  },
  {
    id: 'cat-7',
    name: 'Physiotherapist',
    slug: 'physiotherapist',
    description: 'Licensed BPT/MPT doctors for stroke, ortho, back pain, and sports recovery',
    icon: 'Activity',
    subcategories: [
      { id: 'sub-36', name: 'Home Physiotherapy', slug: 'home-physiotherapy' },
      { id: 'sub-37', name: 'Post-Surgery Rehab', slug: 'post-surgery-physiotherapy' },
      { id: 'sub-38', name: 'Back & Neck Pain', slug: 'pain-management' },
      { id: 'sub-39', name: 'Elderly Mobility Rehab', slug: 'elderly-physiotherapy' },
      { id: 'sub-40', name: 'Sports Injury Therapy', slug: 'sports-physiotherapy' },
    ],
  },
  {
    id: 'cat-8',
    name: 'Yoga Instructor',
    slug: 'yoga-instructor',
    description: 'Certified yoga masters for home classes, weight management, and prenatal yoga',
    icon: 'Sparkles',
    subcategories: [
      { id: 'sub-41', name: 'Home Yoga Session', slug: 'home-yoga' },
      { id: 'sub-42', name: 'Weight Loss Yoga', slug: 'weight-loss-yoga' },
      { id: 'sub-43', name: 'Meditation & Pranayama', slug: 'meditation' },
      { id: 'sub-44', name: 'Prenatal Yoga', slug: 'prenatal-yoga' },
      { id: 'sub-45', name: 'Senior Gentle Yoga', slug: 'senior-yoga' },
    ],
  },
];

const defaultCities: City[] = [
  { id: 'ce9d2ca4-1e47-473b-bab1-6d97c53bc61b', stateId: '88c64a19-46e0-4f7d-baad-e1fc477c519b', name: 'Delhi', slug: 'delhi', isActive: true },
  { id: '0453b9b5-db67-493c-8aae-21eaf9f4c787', stateId: '88c64a19-46e0-4f7d-baad-e1fc477c519b', name: 'Noida', slug: 'noida', isActive: true },
  { id: '95a27243-a6db-47d6-bcef-60e7ee5cbc2f', stateId: '88c64a19-46e0-4f7d-baad-e1fc477c519b', name: 'Gurugram', slug: 'gurugram', isActive: true },
  { id: '419869db-1287-493b-9bc7-7ab69a6b7c66', stateId: '88c64a19-46e0-4f7d-baad-e1fc477c519b', name: 'Ghaziabad', slug: 'ghaziabad', isActive: true },
  { id: 'c7578c55-b999-4554-8e3e-9ed23cffbf41', stateId: '88c64a19-46e0-4f7d-baad-e1fc477c519b', name: 'Greater Noida', slug: 'greater-noida', isActive: true },
];

export const PostRequirementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [searchParams] = useSearchParams();
  const cityQuery = searchParams.get('city');
  const matchedCity = defaultCities.find(
    (c) => c.name.toLowerCase() === cityQuery?.toLowerCase() || c.slug === cityQuery?.toLowerCase()
  );

  const [categories, setCategories] = useState<Category[]>(defaultMasterCategories);
  const [cities, setCities] = useState<City[]>(defaultCities);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<Category>(defaultMasterCategories[0]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory>(defaultMasterCategories[0].subcategories[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetType, setBudgetType] = useState<'FIXED' | 'RANGE'>('FIXED');
  const [budgetMin, setBudgetMin] = useState<number>(5000);
  const [budgetMax, setBudgetMax] = useState<number>(8000);
  const [selectedCityId, setSelectedCityId] = useState(matchedCity ? matchedCity.id : defaultCities[0].id);
  const [pincode, setPincode] = useState('110001');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (9 AM - 12 PM)');
  const [frequency, setFrequency] = useState('ONE_TIME');
  const [genderPreference, setGenderPreference] = useState('NO_PREFERENCE');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Step wizard: 1 = Service, 2 = Details & Location, 3 = Budget & Timeline
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Attempt to load dynamic data from API; if not responding, fallback seamlessly
    api.getCategories()
      .then((catRes) => {
        if (catRes.data?.data && catRes.data.data.length > 0) {
          setCategories(catRes.data.data);
          setSelectedCategory(catRes.data.data[0]);
          if (catRes.data.data[0].subcategories?.length > 0) {
            setSelectedSubcategory(catRes.data.data[0].subcategories[0]);
          }
        }
      })
      .catch(() => {
        // Retain default master catalog silently
      });

    api.getCities()
      .then((cRes) => {
        if (cRes.data?.data && cRes.data.data.length > 0) {
          const ncrSlugs = ['delhi', 'new-delhi', 'noida', 'gurugram', 'ghaziabad', 'greater-noida'];
          const ncrCities = cRes.data.data.filter((c: any) =>
            ncrSlugs.includes(c.slug?.toLowerCase()) ||
            ncrSlugs.some((s) => c.name?.toLowerCase().includes(s.replace('-', ' ')))
          );
          const finalCities = ncrCities.length > 0 ? ncrCities : cRes.data.data;
          setCities(finalCities);

          const queryCity = new URLSearchParams(window.location.search).get('city');
          if (queryCity) {
            const matched = finalCities.find((c: any) =>
              c.name.toLowerCase() === queryCity.toLowerCase() ||
              c.slug.toLowerCase() === queryCity.toLowerCase()
            );
            if (matched) {
              setSelectedCityId(matched.id);
              return;
            }
          }
          setSelectedCityId(finalCities[0].id);
        }
      })
      .catch(() => {
        // Retain default cities with real seeded UUIDs
      });
  }, []);

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    if (cat.subcategories && cat.subcategories.length > 0) {
      setSelectedSubcategory(cat.subcategories[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('CUSTOMER');
      return;
    }

    if (!selectedCategory || !selectedSubcategory || !title.trim() || !description.trim() || !selectedCityId) {
      setError('Please fill all mandatory fields marked with an asterisk (*).');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        categoryId: selectedCategory.id,
        subcategoryId: selectedSubcategory.id,
        title: title.trim(),
        description: description.trim(),
        budgetType,
        budgetMin: Number(budgetMin),
        budgetMax: budgetType === 'RANGE' ? Number(budgetMax) : Number(budgetMin),
        cityId: selectedCityId,
        pincode: pincode || '560038',
        preferredDate: preferredDate || undefined,
        preferredTime,
        frequency,
        genderPreference,
        specialInstructions,
      };

      const res = await api.createRequirement(payload);
      if (res.data?.success && res.data?.data) {
        navigate(`/requirements/${res.data.data.id}`);
      } else {
        setError('Could not publish requirement. Please try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to post requirement.';
      setError(msg);
      if (
        err.response?.status === 401 ||
        msg.toLowerCase().includes('token') ||
        msg.toLowerCase().includes('expired') ||
        msg.toLowerCase().includes('auth')
      ) {
        openAuthModal('CUSTOMER');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isProfessional = user?.roles?.includes('PROFESSIONAL');
  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));

  // Service Professionals apply for jobs; they do not post requirements
  if (isAuthenticated && isProfessional && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 bg-neutral-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Service Professional Account
            </span>
            <h1 className="text-2xl font-black text-black tracking-tight mt-3">
              Partners Apply for Customer Jobs
            </h1>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed font-medium">
              You are currently logged in as a verified service professional. Requirements are posted by customers seeking your services.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/requirements"
              className="w-full bg-black hover:bg-neutral-800 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
            >
              Browse Open Jobs in Delhi NCR
            </Link>
            <Link
              to="/credits"
              className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-3 rounded-2xl font-bold text-xs transition cursor-pointer"
            >
              Manage My Credit Wallet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-black bg-neutral-100 px-3.5 py-1.5 rounded-full mb-3 border border-neutral-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Direct Quotes • Zero Middleman Fee</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
          Post Your Service Requirement
        </h1>
        <p className="mt-2 text-sm text-neutral-600 font-medium">
          State your scope, set your budget in ₹ INR, and receive competitive quotes from verified independent professionals.
        </p>

        {/* Step Indicator (Urban Company Minimalist) */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setStep(1)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              step === 1 ? 'bg-black text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            1. Select Category
          </button>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <button
            onClick={() => setStep(2)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              step === 2 ? 'bg-black text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            2. Scope & Location
          </button>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <button
            onClick={() => setStep(3)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              step === 3 ? 'bg-black text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            3. Budget & Schedule
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-red-800 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          {(error.toLowerCase().includes('expired') ||
            error.toLowerCase().includes('token') ||
            error.toLowerCase().includes('authentication') ||
            !isAuthenticated) && (
            <button
              type="button"
              onClick={() => openAuthModal('CUSTOMER')}
              className="shrink-0 px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-black shadow transition cursor-pointer"
            >
              Sign In & Publish
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-6 sm:p-8">
        
        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-black">Choose a Service Category</h2>
              <p className="text-xs text-neutral-500 mt-1">Select from our 8 verified home and healthcare disciplines.</p>
            </div>

            {/* 8 Photo / Icon Category Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                const photo = categoryThumbnails[cat.slug] || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80';

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`rounded-2xl overflow-hidden border-2 text-left flex flex-col justify-between transition-all group ${
                      isSelected
                        ? 'border-black bg-neutral-50 shadow-lg ring-2 ring-black/10'
                        : 'border-neutral-200 hover:border-neutral-400 bg-white'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative h-28 w-full overflow-hidden bg-neutral-100">
                      <img
                        src={photo}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      <div className="absolute bottom-2 left-2.5 right-2 flex items-center justify-between text-white">
                        <div className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center">
                          {iconMap[cat.icon] || <Sparkles className="w-4 h-4 text-black" />}
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Text Details */}
                    <div className="p-3">
                      <div className="font-black text-black text-xs group-hover:text-neutral-900 leading-tight">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-1 font-semibold">
                        {cat.subcategories?.length || 6} options
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Subcategories */}
            {selectedCategory && selectedCategory.subcategories && (
              <div className="mt-8 pt-6 border-t border-neutral-100">
                <h3 className="text-sm font-black text-black mb-3">
                  Specific Subdiscipline for {selectedCategory.name} *
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {selectedCategory.subcategories.map((sub) => {
                    const isSubSelected = selectedSubcategory?.id === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                          isSubSelected
                            ? 'border-black bg-black text-white shadow-sm'
                            : 'border-neutral-200 text-neutral-800 hover:bg-neutral-50'
                        }`}
                      >
                        <span>{sub.name}</span>
                        {isSubSelected && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-sm"
              >
                <span>Continue to Scope & Location</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SCOPE & LOCATION */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-black">Requirement Details & Location</h2>
              <p className="text-xs text-neutral-500 mt-1">Provide clear expectations so professionals can quote accurately.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Requirement Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Experienced Home Physiotherapist needed for post-knee surgery rehabilitation"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-xs font-semibold text-black placeholder:text-neutral-400 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Detailed Scope & Instructions *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe daily responsibilities, patient/household condition, timing flexibility, and any specific preferences..."
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-xs font-semibold text-black placeholder:text-neutral-400 transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  City *
                </label>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-xs font-bold text-black bg-white"
                  required
                >
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  6-Digit Pincode *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="560038"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-xs font-bold text-black"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-neutral-600 hover:text-black py-2.5 px-4"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!title.trim() || !description.trim()) {
                    setError('Please fill in title and detailed description.');
                    return;
                  }
                  setError(null);
                  setStep(3);
                }}
                className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-sm"
              >
                <span>Continue to Budget & Schedule</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BUDGET & SCHEDULE */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-black">Budget & Service Schedule</h2>
              <p className="text-xs text-neutral-500 mt-1">Set your transparent price expectation in Indian Rupees (₹).</p>
            </div>

            {/* Budget Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl max-w-sm">
              <button
                type="button"
                onClick={() => setBudgetType('FIXED')}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  budgetType === 'FIXED' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Fixed Budget (₹)
              </button>
              <button
                type="button"
                onClick={() => setBudgetType('RANGE')}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  budgetType === 'RANGE' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
                }`}
              >
                Budget Range (Min - Max)
              </button>
            </div>

            {/* Budget Inputs */}
            {budgetType === 'FIXED' ? (
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Target Budget Amount (₹ INR) *
                </label>
                <div className="relative flex items-center max-w-sm">
                  <span className="absolute left-4 text-neutral-500 font-bold">₹</span>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-sm font-black text-black"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Minimum Budget (₹) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-neutral-500 font-bold">₹</span>
                    <input
                      type="number"
                      min={500}
                      step={100}
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-sm font-black text-black"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                    Maximum Budget (₹) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-neutral-500 font-bold">₹</span>
                    <input
                      type="number"
                      min={budgetMin}
                      step={100}
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-sm font-black text-black"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preferred Date & Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Expected Start Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-xs font-bold text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Preferred Time Window
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-xs font-bold text-black bg-white"
                >
                  <option value="Morning (8 AM - 12 PM)">Morning (8 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                  <option value="Full Day (24x7 / Live-in)">Full Day (24x7 / Live-in)</option>
                </select>
              </div>
            </div>

            {/* Service Frequency */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                Engagement Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'ONE_TIME', label: 'One-Time Visit' },
                  { key: 'WEEKLY', label: 'Weekly Sessions' },
                  { key: 'MONTHLY', label: 'Monthly Contract' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFrequency(item.key)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                      frequency === item.key
                        ? 'border-black bg-black text-white shadow-sm'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex justify-between pt-6 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-neutral-600 hover:text-black py-2.5 px-4"
              >
                ← Back
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition shadow-md disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Publish Requirement & Receive Quotes'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};
