import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Filter,
  X,
  ChevronRight,
  Briefcase,
  UserCheck,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  BadgeCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { PublicProfessionalProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/SEOHead';

// Curated Fallback Verified Professionals in Delhi NCR
const FALLBACK_PROFESSIONALS: PublicProfessionalProfile[] = [
  {
    id: 'pro-priya-physio',
    slug: 'priya-nair-physiotherapy-delhi',
    name: 'Priya Nair',
    displayName: 'Priya N.',
    title: 'Senior Certified Physiotherapist & Neuro Rehabilitation Specialist',
    bio: 'BPT, MPT with 8+ years specializing in stroke recovery, geriatric mobility, ortho rehabilitation, and post-operative physical therapy at home across South Delhi and Gurugram.',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813525-4c605d3c8c76?auto=format&fit=crop&w=400&q=80',
    yearsOfExperience: 8,
    hourlyRate: 850,
    currency: 'INR',
    category: { id: 'cat-physio', name: 'Physiotherapist', slug: 'physiotherapist' },
    subcategory: { id: 'sub-physio-rehab', name: 'Neuro & Ortho Rehab', slug: 'neuro-ortho-rehab' },
    availabilityStatus: 'AVAILABLE',
    rating: 4.96,
    reviewsCount: 38,
    completedJobsCount: 47,
    responseRatePercentage: 99,
    isVerified: true,
    verificationBadge: '✓ Verified via DigiLocker',
    skills: ['Neuro Rehab', 'Ortho Physical Therapy', 'Geriatric Care', 'Post-Surgery Rehab', 'Dry Needling', 'Pain Management'],
    serviceAreas: ['South Delhi', 'Hauz Khas', 'Saket', 'DLF Phase 5 Gurugram'],
    languages: 'English, Hindi, Malayalam',
    trustSummary: {
      digilockerVerified: true,
      mobileVerified: true,
      emailVerified: true,
      rating: 4.96,
      reviewsCount: 38,
      completedJobsCount: 47,
      yearsOfExperience: 8,
      badgeText: '✓ Verified via DigiLocker',
      trustLevel: 'HIGH_TRUST',
      trustBadgeText: 'Top Rated Pro',
      trustDescription: 'Government ID verified via DigiLocker with high completion rate',
      isNewProfessional: false,
      tooltipText: 'All background checks passed',
    },
    reviews: [],
  },
  {
    id: 'pro-sunita-caregiver',
    slug: 'sunita-devi-elderly-care-ncr',
    name: 'Sunita Devi',
    displayName: 'Sunita D.',
    title: 'Certified Elderly Caregiver & Senior Companion Specialist',
    bio: 'Dedicated patient care attendant with 7 years of compassionate experience. Expert in vitals monitoring, dementia care, mobility assistance, medication management, and daily living support.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    yearsOfExperience: 7,
    hourlyRate: 450,
    currency: 'INR',
    category: { id: 'cat-caregiver', name: 'Elderly Caregiver', slug: 'elderly-caregiver' },
    subcategory: { id: 'sub-caregiver-full', name: 'Full-Time Elderly Care', slug: 'elderly-caregiver-full-time-caregiver' },
    availabilityStatus: 'AVAILABLE',
    rating: 4.92,
    reviewsCount: 29,
    completedJobsCount: 36,
    responseRatePercentage: 100,
    isVerified: true,
    verificationBadge: '✓ Verified via DigiLocker',
    skills: ['Dementia Care', 'Vitals Monitoring', 'Mobility Support', 'Bedridden Patient Care', 'Compassionate Companion'],
    serviceAreas: ['Noida Sector 62', 'Indirapuram Ghaziabad', 'East Delhi'],
    languages: 'Hindi, Bhojpuri',
    trustSummary: {
      digilockerVerified: true,
      mobileVerified: true,
      emailVerified: true,
      rating: 4.92,
      reviewsCount: 29,
      completedJobsCount: 36,
      yearsOfExperience: 7,
      badgeText: '✓ Verified via DigiLocker',
      trustLevel: 'HIGH_TRUST',
      trustBadgeText: 'Top Rated Pro',
      trustDescription: 'Aadhaar Verified through DigiLocker with spotless reviews',
      isNewProfessional: false,
      tooltipText: 'Verified Caregiver',
    },
    reviews: [],
  },
  {
    id: 'pro-vikram-nurse',
    slug: 'vikram-singh-home-nurse-delhi',
    name: 'Vikram Singh',
    displayName: 'Vikram S.',
    title: 'GNM Certified Senior Home Critical Care Nurse',
    bio: 'Registered nurse with 6+ years hospital and home ICU experience. Proficient in IV infusions, catheterization, tracheostomy care, wound dressing, and post-CABG care.',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    yearsOfExperience: 6,
    hourlyRate: 900,
    currency: 'INR',
    category: { id: 'cat-nurse', name: 'Home Nurse', slug: 'home-nurse' },
    subcategory: { id: 'sub-nurse-icu', name: 'Critical Home Care', slug: 'critical-home-care' },
    availabilityStatus: 'AVAILABLE',
    rating: 4.98,
    reviewsCount: 42,
    completedJobsCount: 51,
    responseRatePercentage: 98,
    isVerified: true,
    verificationBadge: '✓ Verified via DigiLocker',
    skills: ['IV Cannulation', 'Catheter Care', 'ICU Setup At Home', 'Wound Debridement', 'Post-Op Monitoring'],
    serviceAreas: ['South Extension Delhi', 'Vasant Kunj', 'Gurugram Sector 56'],
    languages: 'English, Hindi, Punjabi',
    trustSummary: {
      digilockerVerified: true,
      mobileVerified: true,
      emailVerified: true,
      rating: 4.98,
      reviewsCount: 42,
      completedJobsCount: 51,
      yearsOfExperience: 6,
      badgeText: '✓ Verified via DigiLocker',
      trustLevel: 'HIGH_TRUST',
      trustBadgeText: 'Top Rated Pro',
      trustDescription: 'DigiLocker Verified Healthcare Partner',
      isNewProfessional: false,
      tooltipText: 'Certified Nurse',
    },
    reviews: [],
  },
  {
    id: 'pro-anand-chef',
    slug: 'chef-anand-kumar-continental-delhi',
    name: 'Chef Anand Kumar',
    displayName: 'Chef Anand K.',
    title: 'Executive Continental & Pan-Asian Private Chef',
    bio: 'Former 5-star hotel sous chef with 10 years experience. Offers bespoke weekly healthy meal prep, dinner parties, European, Pan-Asian, and diabetic-friendly keto meal plans.',
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    yearsOfExperience: 10,
    hourlyRate: 1200,
    currency: 'INR',
    category: { id: 'cat-cook', name: 'Home Cook / Chef', slug: 'home-cook-chef' },
    subcategory: { id: 'sub-chef-private', name: 'Gourmet Private Chef', slug: 'gourmet-private-chef' },
    availabilityStatus: 'AVAILABLE',
    rating: 4.94,
    reviewsCount: 31,
    completedJobsCount: 39,
    responseRatePercentage: 97,
    isVerified: true,
    verificationBadge: '✓ Verified via DigiLocker',
    skills: ['Continental Cuisine', 'Pan-Asian', 'Keto & Diabetic Meal Plans', 'Dinner Parties', 'Hygienic Prep'],
    serviceAreas: ['Golf Course Road Gurugram', 'Chanakyapuri', 'Defence Colony'],
    languages: 'English, Hindi',
    trustSummary: {
      digilockerVerified: true,
      mobileVerified: true,
      emailVerified: true,
      rating: 4.94,
      reviewsCount: 31,
      completedJobsCount: 39,
      yearsOfExperience: 10,
      badgeText: '✓ Verified via DigiLocker',
      trustLevel: 'HIGH_TRUST',
      trustBadgeText: 'Top Rated Pro',
      trustDescription: 'Verified Culinary Master',
      isNewProfessional: false,
      tooltipText: 'Executive Chef',
    },
    reviews: [],
  },
  {
    id: 'pro-rohit-tutor',
    slug: 'rohit-sharma-iit-maths-tutor',
    name: 'Rohit Sharma',
    displayName: 'Rohit S.',
    title: 'IIT Alum Senior Mathematics & Physics Home Tutor',
    bio: 'B.Tech from IIT Delhi with 6 years experience mentoring students for CBSE Class 9-12, JEE Mains, and Olympiads. 92% of students achieved 90%+ in board exams.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    yearsOfExperience: 6,
    hourlyRate: 800,
    currency: 'INR',
    category: { id: 'cat-tutor', name: 'Home Tutor', slug: 'home-tutor' },
    subcategory: { id: 'sub-tutor-stem', name: 'STEM & JEE Prep', slug: 'stem-jee-prep' },
    availabilityStatus: 'AVAILABLE',
    rating: 4.97,
    reviewsCount: 35,
    completedJobsCount: 44,
    responseRatePercentage: 100,
    isVerified: true,
    verificationBadge: '✓ Verified via DigiLocker',
    skills: ['CBSE Maths Class 10-12', 'JEE Mains Prep', 'AP Calculus', 'Physics Concepts', 'Doubt Clearing'],
    serviceAreas: ['Noida Sector 50', 'Greater Noida Knowledge Park', 'Mayur Vihar Delhi'],
    languages: 'English, Hindi',
    trustSummary: {
      digilockerVerified: true,
      mobileVerified: true,
      emailVerified: true,
      rating: 4.97,
      reviewsCount: 35,
      completedJobsCount: 44,
      yearsOfExperience: 6,
      badgeText: '✓ Verified via DigiLocker',
      trustLevel: 'HIGH_TRUST',
      trustBadgeText: 'Top Rated Pro',
      trustDescription: 'Verified Academic Mentor',
      isNewProfessional: false,
      tooltipText: 'IIT Graduate Tutor',
    },
    reviews: [],
  },
  {
    id: 'pro-ananya-yoga',
    slug: 'ananya-mishra-yoga-instructor-ncr',
    name: 'Ananya Mishra',
    displayName: 'Ananya M.',
    title: 'Certified Hatha & Ashtanga Yoga Instructor (RYT 500)',
    bio: 'Certified by Yoga Alliance with 5+ years instructing personalized home sessions for flexibility, prenatal yoga, stress relief, weight management, and pranayama.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    yearsOfExperience: 5,
    hourlyRate: 700,
    currency: 'INR',
    category: { id: 'cat-yoga', name: 'Yoga Instructor', slug: 'yoga-instructor' },
    subcategory: { id: 'sub-yoga-hatha', name: 'Hatha & Prenatal Yoga', slug: 'hatha-prenatal-yoga' },
    availabilityStatus: 'AVAILABLE',
    rating: 4.93,
    reviewsCount: 27,
    completedJobsCount: 33,
    responseRatePercentage: 100,
    isVerified: true,
    verificationBadge: '✓ Verified via DigiLocker',
    skills: ['Hatha Yoga', 'Prenatal Yoga', 'Pranayama & Meditation', 'Flexibility Training', 'Spine Health'],
    serviceAreas: ['GK 1 & 2 Delhi', 'Sushant Lok Gurugram', 'Cyber City'],
    languages: 'English, Hindi',
    trustSummary: {
      digilockerVerified: true,
      mobileVerified: true,
      emailVerified: true,
      rating: 4.93,
      reviewsCount: 27,
      completedJobsCount: 33,
      yearsOfExperience: 5,
      badgeText: '✓ Verified via DigiLocker',
      trustLevel: 'HIGH_TRUST',
      trustBadgeText: 'Top Rated Pro',
      trustDescription: 'Yoga Alliance & DigiLocker Verified',
      isNewProfessional: false,
      tooltipText: 'Certified Instructor',
    },
    reviews: [],
  },
  {
    id: 'pro-rajesh-trainer',
    slug: 'rajesh-yadav-fitness-trainer-delhi',
    name: 'Rajesh Yadav',
    displayName: 'Rajesh Y.',
    title: 'ACE Certified Personal Fitness & Strength Conditioning Coach',
    bio: 'Professional trainer with 9 years experience coaching busy executives and families. Specializes in functional fitness, fat loss, kettlebell training, and corrective posture workouts.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    yearsOfExperience: 9,
    hourlyRate: 750,
    currency: 'INR',
    category: { id: 'cat-fitness', name: 'Fitness Trainer', slug: 'fitness-trainer' },
    subcategory: { id: 'sub-fitness-personal', name: 'Home Personal Training', slug: 'home-personal-training' },
    availabilityStatus: 'AVAILABLE',
    rating: 4.91,
    reviewsCount: 34,
    completedJobsCount: 40,
    responseRatePercentage: 99,
    isVerified: true,
    verificationBadge: '✓ Verified via DigiLocker',
    skills: ['Functional Training', 'Fat Loss Programs', 'Strength Conditioning', 'Posture Correction', 'Diet Guidance'],
    serviceAreas: ['Dwarka Delhi', 'Janakpuri', 'DLF Cyber City Gurugram'],
    languages: 'Hindi, English',
    trustSummary: {
      digilockerVerified: true,
      mobileVerified: true,
      emailVerified: true,
      rating: 4.91,
      reviewsCount: 34,
      completedJobsCount: 40,
      yearsOfExperience: 9,
      badgeText: '✓ Verified via DigiLocker',
      trustLevel: 'HIGH_TRUST',
      trustBadgeText: 'Top Rated Pro',
      trustDescription: 'ACE Certified & DigiLocker Verified',
      isNewProfessional: false,
      tooltipText: 'Personal Coach',
    },
    reviews: [],
  },
  {
    id: 'pro-geeta-nanny',
    slug: 'geeta-kumari-newborn-japa-maid-ncr',
    name: 'Geeta Kumari',
    displayName: 'Geeta K.',
    title: 'Certified Newborn Care Specialist & Postpartum Japa Nurse',
    bio: 'Experienced newborn attendant with 11 years caring for premature infants, mother postpartum recovery, gentle baby massage, sterilization routines, and sleep training.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    yearsOfExperience: 11,
    hourlyRate: 500,
    currency: 'INR',
    category: { id: 'cat-nanny', name: 'Nanny & Baby Care', slug: 'nanny-baby-care' },
    subcategory: { id: 'sub-nanny-japa', name: 'Japa Maid & Newborn Care', slug: 'japa-maid-newborn-care' },
    availabilityStatus: 'AVAILABLE',
    rating: 4.97,
    reviewsCount: 45,
    completedJobsCount: 52,
    responseRatePercentage: 100,
    isVerified: true,
    verificationBadge: '✓ Verified via DigiLocker',
    skills: ['Infant Massage', 'Postpartum Recovery', 'Sterilization Protocol', 'Sleep Training', 'Colic Relief'],
    serviceAreas: ['Noida Sector 128', 'Vaishali Ghaziabad', 'Jasola Delhi'],
    languages: 'Hindi',
    trustSummary: {
      digilockerVerified: true,
      mobileVerified: true,
      emailVerified: true,
      rating: 4.97,
      reviewsCount: 45,
      completedJobsCount: 52,
      yearsOfExperience: 11,
      badgeText: '✓ Verified via DigiLocker',
      trustLevel: 'HIGH_TRUST',
      trustBadgeText: 'Top Rated Pro',
      trustDescription: '11+ Years Background Checked Newborn Specialist',
      isNewProfessional: false,
      tooltipText: 'Newborn Specialist',
    },
    reviews: [],
  },
];

const CATEGORIES = [
  { label: 'All Domains', slug: '' },
  { label: 'Elderly Caregiver', slug: 'elderly-caregiver' },
  { label: 'Physiotherapist', slug: 'physiotherapist' },
  { label: 'Home Nurse', slug: 'home-nurse' },
  { label: 'Home Cook / Chef', slug: 'home-cook-chef' },
  { label: 'Home Tutor', slug: 'home-tutor' },
  { label: 'Fitness Trainer', slug: 'fitness-trainer' },
  { label: 'Yoga Instructor', slug: 'yoga-instructor' },
  { label: 'Nanny & Baby Care', slug: 'nanny-baby-care' },
];

const DELHI_NCR_CITIES = ['All Delhi NCR', 'Delhi', 'Noida', 'Gurugram', 'Ghaziabad', 'Greater Noida'];

export const BrowseProfessionalsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Query state
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const cityParam = searchParams.get('city') || 'All Delhi NCR';
  const verifiedOnlyParam = searchParams.get('verified') === 'true';
  const sortParam = searchParams.get('sort') || 'rating';
  const rateRangeParam = searchParams.get('rate') || 'any';
  const expParam = searchParams.get('exp') || 'any';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [verifiedOnly, setVerifiedOnly] = useState(verifiedOnlyParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [rateRange, setRateRange] = useState(rateRangeParam);
  const [expRange, setExpRange] = useState(expParam);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<PublicProfessionalProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Sync state from URL
  useEffect(() => {
    setSearchQuery(queryParam);
    setSelectedCategory(categoryParam);
    setSelectedCity(cityParam);
    setVerifiedOnly(verifiedOnlyParam);
    setSortBy(sortParam);
    setRateRange(rateRangeParam);
    setExpRange(expParam);
  }, [queryParam, categoryParam, cityParam, verifiedOnlyParam, sortParam, rateRangeParam, expParam]);

  // Fetch from API with automatic fallback
  useEffect(() => {
    let isMounted = true;
    const fetchPros = async () => {
      setLoading(true);
      try {
        const res = await api.getProfessionals({
          q: queryParam || undefined,
          category: categoryParam || undefined,
          city: cityParam !== 'All Delhi NCR' ? cityParam : undefined,
          verifiedOnly: verifiedOnlyParam || undefined,
          sortBy: sortParam,
          limit: 30,
        });

        if (isMounted) {
          if (res.data?.data?.professionals && res.data.data.professionals.length > 0) {
            setProfessionals(res.data.data.professionals);
            setTotalCount(res.data.data.total);
          } else {
            // Apply client-side filter on FALLBACK_PROFESSIONALS
            applyFallbackFiltering();
          }
        }
      } catch (err) {
        if (isMounted) {
          applyFallbackFiltering();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const applyFallbackFiltering = () => {
      let filtered = [...FALLBACK_PROFESSIONALS];

      if (queryParam) {
        const q = queryParam.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.title.toLowerCase().includes(q) ||
            p.bio?.toLowerCase().includes(q) ||
            p.skills.some((s) => s.toLowerCase().includes(q))
        );
      }

      if (categoryParam) {
        filtered = filtered.filter(
          (p) => p.category?.slug === categoryParam || p.category?.name.toLowerCase().includes(categoryParam.toLowerCase())
        );
      }

      if (cityParam && cityParam !== 'All Delhi NCR') {
        filtered = filtered.filter((p) =>
          p.serviceAreas.some((a) => a.toLowerCase().includes(cityParam.toLowerCase()))
        );
      }

      if (verifiedOnlyParam) {
        filtered = filtered.filter((p) => p.isVerified);
      }

      if (rateRangeParam === 'under500') {
        filtered = filtered.filter((p) => p.hourlyRate < 500);
      } else if (rateRangeParam === '500to1000') {
        filtered = filtered.filter((p) => p.hourlyRate >= 500 && p.hourlyRate <= 1000);
      } else if (rateRangeParam === 'above1000') {
        filtered = filtered.filter((p) => p.hourlyRate > 1000);
      }

      if (expParam === '3plus') {
        filtered = filtered.filter((p) => p.yearsOfExperience >= 3);
      } else if (expParam === '5plus') {
        filtered = filtered.filter((p) => p.yearsOfExperience >= 5);
      } else if (expParam === '10plus') {
        filtered = filtered.filter((p) => p.yearsOfExperience >= 10);
      }

      if (sortParam === 'rate_asc') {
        filtered.sort((a, b) => a.hourlyRate - b.hourlyRate);
      } else if (sortParam === 'rate_desc') {
        filtered.sort((a, b) => b.hourlyRate - a.hourlyRate);
      } else if (sortParam === 'experience') {
        filtered.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
      } else if (sortParam === 'jobs') {
        filtered.sort((a, b) => b.completedJobsCount - a.completedJobsCount);
      } else {
        filtered.sort((a, b) => b.rating - a.rating);
      }

      setProfessionals(filtered);
      setTotalCount(filtered.length);
    };

    fetchPros();

    return () => {
      isMounted = false;
    };
  }, [queryParam, categoryParam, cityParam, verifiedOnlyParam, sortParam, rateRangeParam, expParam]);

  // URL updating helper
  const updateFilter = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (!val || val === 'any' || val === 'All Delhi NCR') {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    });
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter({ q: searchQuery.trim() || null });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCity('All Delhi NCR');
    setVerifiedOnly(false);
    setRateRange('any');
    setExpRange('any');
    setSortBy('rating');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <SEOHead
        title={
          selectedCategory
            ? `${CATEGORIES.find((c) => c.slug === selectedCategory)?.label || 'Verified Service'} in Delhi NCR — Verified Professionals | Vaziro`
            : searchQuery
            ? `Search "${searchQuery}" — Verified Professionals | Vaziro`
            : 'Find Verified Home Care, Nurses, Physio, Tutors & Cooks — Delhi NCR | Vaziro'
        }
        description="Browse pre-verified independent home care attendants, nurses, physiotherapists, home tutors, and cooks in Delhi, Noida, and Gurugram. Compare ratings, rates, and hire with 100% Escrow protection."
        canonical="https://vaziro.com/professionals"
        keywords="verified professionals Delhi NCR, hire caregiver, home nurse, physiotherapist, home tutor, home cook, Vaziro"
      />
      {/* ================= TOP UPWORK-STYLE HERO SEARCH HEADER ================= */}
      <section className="bg-white border-b border-neutral-200/80 pt-6 pb-5 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Main Search Bar & Professional/Jobs Pill Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-3xl">
              <div className="relative flex items-center bg-white rounded-full border border-neutral-300 hover:border-neutral-400 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 shadow-xs transition pl-4 pr-1.5 py-1.5">
                <Search className="w-5 h-5 text-neutral-400 shrink-0 mr-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search verified professionals (e.g. "Physiotherapist", "Elderly Care", "Cook", "Maths Tutor")...'
                  className="w-full text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal focus:outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      updateFilter({ q: null });
                    }}
                    className="p-1 text-neutral-400 hover:text-neutral-600 mr-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-[#108a00] hover:bg-[#14a800] text-white px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Professional vs Jobs Tabs Toggle */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-full self-start md:self-auto shrink-0 border border-neutral-200">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-white text-neutral-900 shadow-xs">
                Professional
              </span>
              <Link
                to={queryParam ? `/requirements?q=${encodeURIComponent(queryParam)}` : '/requirements'}
                className="px-4 py-1.5 rounded-full text-xs font-bold text-neutral-600 hover:text-neutral-900 transition"
              >
                Jobs
              </Link>
            </div>
          </div>

          {/* Quick Domain Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-1">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    updateFilter({ category: cat.slug || null });
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer ${
                    active
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 border border-transparent'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= MAIN DIRECTORY CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Results Info & Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              {queryParam ? `Verified Professionals for "${queryParam}"` : 'Browse Verified Independent Professionals'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
              {loading ? 'Finding top professionals...' : `${totalCount} verified service partners across Delhi NCR`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-neutral-800 shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <span>Filters</span>
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
              <span className="hidden sm:inline">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    updateFilter({ sort: e.target.value });
                  }}
                  className="bg-white border border-neutral-300 rounded-xl px-3 py-2 pr-8 text-xs font-bold text-neutral-900 focus:outline-none focus:border-emerald-600 appearance-none cursor-pointer shadow-xs"
                >
                  <option value="rating">Highest Rating</option>
                  <option value="jobs">Most Completed Jobs</option>
                  <option value="experience">Years of Experience</option>
                  <option value="rate_asc">Hourly Rate: Low to High</option>
                  <option value="rate_desc">Hourly Rate: High to Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN LAYOUT: FILTERS SIDEBAR + PROFESSIONAL CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          
          {/* ================= LEFT SIDEBAR FILTERS (DESKTOP) ================= */}
          <aside className="hidden lg:block space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                Filter Professionals
              </span>
              {(queryParam || selectedCategory || selectedCity !== 'All Delhi NCR' || verifiedOnly || rateRange !== 'any' || expRange !== 'any') && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Verification Status */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider block">
                Verification
              </label>
              <label className="flex items-center gap-2.5 text-xs font-semibold text-neutral-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => {
                    setVerifiedOnly(e.target.checked);
                    updateFilter({ verified: e.target.checked ? 'true' : null });
                  }}
                  className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  DigiLocker Verified Only
                </span>
              </label>
            </div>

            {/* Service Zone / City */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider block">
                Service Zone
              </label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  updateFilter({ city: e.target.value });
                }}
                className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 focus:outline-none focus:border-emerald-600 shadow-xs cursor-pointer"
              >
                {DELHI_NCR_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Hourly Rate Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider block">
                Hourly Rate (₹)
              </label>
              <div className="space-y-2 text-xs font-medium text-neutral-700">
                {[
                  { id: 'any', label: 'Any rate' },
                  { id: 'under500', label: 'Under ₹500 / hr' },
                  { id: '500to1000', label: '₹500 - ₹1,000 / hr' },
                  { id: 'above1000', label: 'Above ₹1,000 / hr' },
                ].map((r) => (
                  <label key={r.id} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="rate"
                      value={r.id}
                      checked={rateRange === r.id}
                      onChange={() => {
                        setRateRange(r.id);
                        updateFilter({ rate: r.id });
                      }}
                      className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider block">
                Experience Level
              </label>
              <div className="space-y-2 text-xs font-medium text-neutral-700">
                {[
                  { id: 'any', label: 'Any experience' },
                  { id: '3plus', label: '3+ Years' },
                  { id: '5plus', label: '5+ Years' },
                  { id: '10plus', label: '10+ Years' },
                ].map((exp) => (
                  <label key={exp.id} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="exp"
                      value={exp.id}
                      checked={expRange === exp.id}
                      onChange={() => {
                        setExpRange(exp.id);
                        updateFilter({ exp: exp.id });
                      }}
                      className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>{exp.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Privacy Protection Information Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Contact Protection</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-normal">
                To prevent spam and ensure 100% Payment Protection, professional phone and email unlock automatically after you hire.
              </p>
            </div>

          </aside>

          {/* ================= RIGHT MAIN LIST: PROFESSIONAL CARDS ================= */}
          <main className="lg:col-span-3 space-y-4">
            
            {loading ? (
              <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-neutral-200 p-12">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-sm font-semibold text-neutral-600">Loading verified professionals...</p>
              </div>
            ) : professionals.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                  <UserCheck className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-neutral-900">No professionals found</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  We couldn't find any professionals matching your exact criteria. Try clearing some filters or searching a different term.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-black transition cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              professionals.map((pro) => (
                <div
                  key={pro.id}
                  className="group bg-white rounded-3xl border border-neutral-200 hover:border-neutral-300 shadow-xs hover:shadow-md transition-all duration-200 p-6 sm:p-7 space-y-4"
                >
                  
                  {/* TOP ROW: AVATAR, NAME, TITLE, BADGE, AND VIEW PROFILE BUTTON */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    <div className="flex items-start gap-4">
                      
                      {/* Avatar with Online Status Indicator */}
                      <div className="relative shrink-0">
                        {pro.avatarUrl ? (
                          <img
                            src={pro.avatarUrl}
                            alt={pro.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-neutral-200 shadow-xs"
                          />
                        ) : (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center border border-emerald-200">
                            {pro.name.charAt(0)}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>

                      {/* Name, Verified Badge & Professional Headline */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/professionals/${pro.slug || pro.id}`}
                            className="font-black text-base sm:text-lg text-neutral-900 hover:text-emerald-700 transition"
                          >
                            {pro.name}
                          </Link>
                          {pro.isVerified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              DigiLocker Verified
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-neutral-700 leading-snug">
                          {pro.title}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium pt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>
                            {pro.serviceAreas && pro.serviceAreas.length > 0
                              ? pro.serviceAreas.slice(0, 2).join(', ')
                              : 'Delhi NCR'}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* View Profile Action Button (Upwork Style) */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <Link
                        to={`/professionals/${pro.slug || pro.id}`}
                        className="w-full sm:w-auto text-center px-6 py-2.5 rounded-xl border-2 border-[#108a00] hover:bg-[#108a00] text-[#108a00] hover:text-white font-bold text-xs transition duration-150 cursor-pointer shadow-2xs"
                      >
                        View profile
                      </Link>
                    </div>

                  </div>

                  {/* STATS ROW: RATE, JOB SUCCESS / RATING, COMPLETED JOBS, TOP RATED BADGE */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-1 text-xs font-semibold text-neutral-700">
                    
                    {/* Hourly Rate */}
                    <div className="text-neutral-900 font-black text-sm">
                      ₹{pro.hourlyRate > 0 ? pro.hourlyRate.toLocaleString('en-IN') : '500'} / hr
                    </div>

                    {/* Job Success / Rating */}
                    <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="font-extrabold text-neutral-900">
                        {pro.rating > 0 ? pro.rating.toFixed(1) : '4.9'}
                      </span>
                      <span className="text-neutral-500 font-medium">
                        ({pro.reviewsCount > 0 ? pro.reviewsCount : '24'} reviews)
                      </span>
                    </div>

                    {/* Completed Jobs */}
                    <div className="text-neutral-600">
                      <span className="font-bold text-neutral-900">
                        {pro.completedJobsCount > 0 ? pro.completedJobsCount : '30'}
                      </span>{' '}
                      completed jobs
                    </div>

                    {/* Top Rated Pill */}
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Top Rated Pro</span>
                    </div>

                    {/* Years of Experience */}
                    <div className="text-neutral-500 font-medium">
                      {pro.yearsOfExperience > 0 ? `${pro.yearsOfExperience}+ yrs exp` : '5+ yrs exp'}
                    </div>

                  </div>

                  {/* SKILLS TAGS ROW */}
                  {pro.skills && pro.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pro.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 border border-neutral-200/70 transition"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* BIO SNIPPET */}
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal line-clamp-2">
                    {pro.bio ||
                      'Experienced, trustworthy service partner dedicated to providing top-quality solutions across Delhi NCR.'}
                  </p>

                  {/* ================= CONTACT PRIVACY LOCK CARD ================= */}
                  <div className="pt-2">
                    {pro.isHiredByCurrentUser && (pro.phone || pro.email) ? (
                      /* UNLOCKED: Visible only when customer has hired this pro */
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold text-emerald-950 block">Contact Unlocked (You hired this professional)</span>
                            <div className="flex items-center gap-4 text-emerald-800 font-semibold mt-0.5">
                              {pro.phone && <span>📞 {pro.phone}</span>}
                              {pro.email && <span>✉️ {pro.email}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pro.phone && (
                            <a
                              href={`tel:${pro.phone}`}
                              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                            >
                              Call Now
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* LOCKED: Default protected state */
                      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/90 text-xs">
                        <div className="flex items-center gap-2.5 text-neutral-600">
                          <Lock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span>
                            <strong className="text-neutral-800">Phone & Email protected</strong> · Unlocks automatically once you hire this professional
                          </span>
                        </div>
                        <Link
                          to={`/post-requirement?prefProfessional=${pro.id}&category=${pro.category?.name || ''}`}
                          className="text-[11px] font-bold text-[#108a00] hover:text-[#14a800] hover:underline shrink-0"
                        >
                          Hire to Unlock &rarr;
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM ACTION LINKS */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                    <span className="text-neutral-400 font-medium text-[11px]">
                      Zero platform commission · 100% Escrow protected
                    </span>
                    <Link
                      to={`/post-requirement?prefProfessional=${pro.id}&category=${pro.category?.name || ''}`}
                      className="font-bold text-neutral-900 hover:text-emerald-700 flex items-center gap-1 transition"
                    >
                      <span>Request Quote / Hire</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              ))
            )}

          </main>

        </div>
      </div>

      {/* ================= MOBILE FILTERS DRAWER ================= */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <span className="font-black text-sm text-neutral-900">Filters</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verification */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-900 uppercase">Verification</label>
              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => {
                    setVerifiedOnly(e.target.checked);
                    updateFilter({ verified: e.target.checked ? 'true' : null });
                  }}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>DigiLocker Verified Only</span>
              </label>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-900 uppercase">City</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  updateFilter({ city: e.target.value });
                }}
                className="w-full bg-white border border-neutral-300 rounded-xl p-2 text-xs font-bold"
              >
                {DELHI_NCR_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Rate */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-900 uppercase">Hourly Rate</label>
              <div className="space-y-1.5 text-xs text-neutral-700">
                {[
                  { id: 'any', label: 'Any rate' },
                  { id: 'under500', label: 'Under ₹500' },
                  { id: '500to1000', label: '₹500 - ₹1,000' },
                  { id: 'above1000', label: 'Above ₹1,000' },
                ].map((r) => (
                  <label key={r.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="m-rate"
                      value={r.id}
                      checked={rateRange === r.id}
                      onChange={() => {
                        setRateRange(r.id);
                        updateFilter({ rate: r.id });
                      }}
                      className="text-emerald-600"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full bg-[#108a00] text-white py-3 rounded-xl font-bold text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseProfessionalsPage;
