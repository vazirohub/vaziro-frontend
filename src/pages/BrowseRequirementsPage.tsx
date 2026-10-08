import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Requirement, Category, DetailedCreditWallet } from '../types';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, ShieldCheck, Coins, Send, X, Clock, Calendar, AlertCircle, Sparkles, ArrowRight, Bookmark, BadgeCheck, CircleHelp, SlidersHorizontal } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { CategoryIcon } from '../components/CategoryIcon';
import { AddCreditsModal } from '../components/AddCreditsModal';

export const BrowseRequirementsPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [searchParams] = useSearchParams();

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallet, setWallet] = useState<DetailedCreditWallet | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState(false);
  const [categorySlugApplied, setCategorySlugApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchCity, setSearchCity] = useState<string>(() => searchParams.get('city') || '');
  const [searchText, setSearchText] = useState(() => searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<'BEST_MATCH' | 'NEWEST' | 'LOWEST_BUDGET' | 'HIGHEST_BUDGET'>('BEST_MATCH');
  const [activeTab, setActiveTab] = useState<'BEST_MATCH' | 'MOST_RECENT' | 'SAVED'>('BEST_MATCH');
  const [savedRequirementIds, setSavedRequirementIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('vaziro_saved_requirements') || '[]');
    } catch {
      return [];
    }
  });
  const [budgetFrom, setBudgetFrom] = useState('');
  const [budgetTo, setBudgetTo] = useState('');
  const [profileStrength, setProfileStrength] = useState<number | null>(null);

  // Quotation Modal State
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);
  const [proposedPrice, setProposedPrice] = useState<number>(5000);
  const [estimatedTimeline, setEstimatedTimeline] = useState('3 days');
  const [proposedStartDate, setProposedStartDate] = useState('');
  const [message, setMessage] = useState('');
  const [scopeSummary, setScopeSummary] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteSuccess, setQuoteSuccess] = useState<string | null>(null);

  const isProfessional = user?.roles?.includes('PROFESSIONAL');

  useEffect(() => {
    localStorage.setItem('vaziro_saved_requirements', JSON.stringify(savedRequirementIds));
  }, [savedRequirementIds]);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const params: any = { status: 'ALL' };
      if (selectedCategory) params.categoryId = selectedCategory;

      const [reqRes, catRes] = await Promise.all([
        api.getRequirements(params),
        api.getCategories(),
      ]);

      if (reqRes.data?.data) {
        setRequirements(reqRes.data.data);
      }
      if (catRes.data?.data) {
        setCategories(catRes.data.data);
        const categorySlug = searchParams.get('category');
        const matchingCategory = categorySlug ? catRes.data.data.find((category) => category.slug === categorySlug) : undefined;
        if (!categorySlugApplied && matchingCategory) setSelectedCategory(matchingCategory.id);
        if (!categorySlugApplied) setCategorySlugApplied(true);
      }
    } catch (err) {
      setLoadError('Could not load work requests. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    if (isAuthenticated && isProfessional) {
      try {
        setWalletLoading(true);
        setWalletError(false);
        const res = await api.getCreditWallet();
        if (res.data?.data) {
          setWallet(res.data.data);
        } else {
          setWalletError(true);
        }
      } catch {
        setWalletError(true);
      } finally {
        setWalletLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [selectedCategory]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const catSlug = searchParams.get('category');
    if (q) setSearchText(q);
    if (city) setSearchCity(city);
    if (catSlug && categories.length > 0) {
      const match = categories.find((c) => c.slug === catSlug);
      if (match && match.id !== selectedCategory) {
        setSelectedCategory(match.id);
      }
    } else if (!catSlug && selectedCategory) {
      // If user navigated back to all requirements
      setSelectedCategory('');
    }
  }, [searchParams, categories]);

  useEffect(() => {
    fetchWallet();
  }, [isAuthenticated, isProfessional]);

  useEffect(() => {
    if (!isAuthenticated || !isProfessional) return;
    api.getProfileStrength()
      .then((res) => setProfileStrength(res.data?.data?.score ?? null))
      .catch(() => setProfileStrength(null));
  }, [isAuthenticated, isProfessional]);

  const handleOpenQuoteModal = (req: Requirement) => {
    if (!isAuthenticated) {
      openAuthModal('PROFESSIONAL');
      return;
    }
    if (!isProfessional) {
      openAuthModal('PROFESSIONAL', undefined, 'SIGNUP');
      return;
    }
    setSelectedRequirement(req);
    setProposedPrice(req.budgetMin);
    setMessage(`Hello! I have reviewed your requirement for "${req.title}". With my experience in ${req.category?.name}, I am confident I can provide exceptional service for your family.`);
    setScopeSummary('Complete end-to-end service delivery adhering to all instructions and hygiene standards.');
    setQuoteError(null);
    setQuoteSuccess(null);
    setIsModalOpen(true);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequirement) return;

    try {
      setSubmittingQuote(true);
      setQuoteError(null);

      const payload = {
        requirementId: selectedRequirement.id,
        proposedPrice: Number(proposedPrice),
        estimatedTimeline,
        proposedStartDate: proposedStartDate || undefined,
        message,
        scopeSummary,
      };

      const res = await api.submitQuotation(payload);
      if (res.data?.success) {
        setQuoteSuccess(`Quotation submitted! ${res.data.data.creditsDeducted} Credits deducted.`);
        // Refresh wallet
        await fetchWallet();
        setTimeout(() => {
          setIsModalOpen(false);
          fetchRequirements();
        }, 1500);
      }
    } catch (err: any) {
      setQuoteError(err.response?.data?.error?.message || err.message || 'Failed to submit quotation');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const currentBalance = wallet?.balance ?? user?.professionalProfile?.creditWallet?.balance ?? 0;
  const toggleSaved = (requirementId: string) => {
    setSavedRequirementIds((current) => current.includes(requirementId)
      ? current.filter((id) => id !== requirementId)
      : [requirementId, ...current]);
  };
  const matchingRequirements = requirements.filter((req) => {
    const normalizedSearch = searchText.trim().toLocaleLowerCase();
    const normalizedCity = searchCity.trim().toLocaleLowerCase();
    const searchableText = `${req.title} ${req.description} ${req.category?.name || ''} ${req.subcategory?.name || ''}`.toLocaleLowerCase();
    const cityName = (req.city?.name || '').toLocaleLowerCase();
    const lowerBudget = budgetFrom ? Number(budgetFrom) : null;
    const upperBudget = budgetTo ? Number(budgetTo) : null;
    const matchesBudget = (lowerBudget === null || (req.budgetMax || req.budgetMin) >= lowerBudget) && (upperBudget === null || req.budgetMin <= upperBudget);
    const matchesSaved = activeTab !== 'SAVED' || savedRequirementIds.includes(req.id);
    const matchesCity = !normalizedCity || !cityName || cityName.includes(normalizedCity) || normalizedCity.includes(cityName);
    return (!normalizedSearch || searchableText.includes(normalizedSearch)) && matchesCity && matchesBudget && matchesSaved;
  });
  const visibleRequirements = [...matchingRequirements].sort((a, b) => {
    if (sortBy === 'LOWEST_BUDGET') return a.budgetMin - b.budgetMin;
    if (sortBy === 'HIGHEST_BUDGET') return b.budgetMin - a.budgetMin;
    if (sortBy === 'BEST_MATCH') return Number(Boolean(b.isBoosted)) - Number(Boolean(a.isBoosted)) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const hasActiveFilters = Boolean(searchText || searchCity || selectedCategory || budgetFrom || budgetTo);
  const clearFilters = () => {
    setSearchText('');
    setSearchCity('');
    setSelectedCategory('');
    setBudgetFrom('');
    setBudgetTo('');
  };

  return (
    <div className="min-h-full bg-[#f7f8f6]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-7 flex flex-col gap-5 border-b border-[#e2e8e3] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600" /> Find work
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#10241e] sm:text-4xl">Find work that fits your skills.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#52665d]">
              Browse customer requests, compare the scope and budget, then decide where to send a proposal.
            </p>
          </div>

          {isAuthenticated && isProfessional ? (
            <div className="flex items-center gap-4 rounded-2xl border border-[#dce6df] bg-white px-4 py-3 shadow-sm sm:min-w-[270px]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10241e] text-emerald-200"><Coins className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-neutral-500">Available to apply</span>
                <span className="mt-0.5 block text-xl font-black text-[#10241e]">{walletLoading ? '...' : walletError ? '—' : currentBalance} <span className="text-xs font-bold text-neutral-500">credits</span></span>
              </div>
              <Link to="/credits" className="inline-flex min-h-10 items-center rounded-lg px-3 text-xs font-extrabold text-emerald-800 transition hover:bg-emerald-50">Add credits</Link>
            </div>
          ) : (
            <button type="button" onClick={() => openAuthModal('PROFESSIONAL', undefined, 'SIGNUP')} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#10241e] px-4 text-sm font-bold text-white transition hover:bg-emerald-800 lg:self-auto">
              Join as a professional <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </header>

        {isProfessional && (
          <section className="mb-6 flex flex-col gap-4 rounded-2xl bg-[#183e33] p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#c9f27d]"><BadgeCheck className="h-5 w-5" /></span>
              <div>
                <h2 className="text-base font-semibold">Make your profile easy to evaluate</h2>
                <p className="mt-1 max-w-xl text-sm leading-5 text-[#c0d0c2]">Add your services, experience and availability so customers can compare your proposal with confidence.</p>
              </div>
            </div>
            <Link to="/profile" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-md bg-[#c9f27d] px-4 text-sm font-semibold text-[#203c32] transition hover:bg-[#d7f8a0] sm:shrink-0 sm:self-auto">
              {profileStrength === null ? 'Complete profile' : `Profile ${profileStrength}% complete`} <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        )}

        <div className="mb-7 grid gap-3 rounded-2xl border border-[#dce6df] bg-white p-3 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(220px,0.44fr)] md:p-4">
          <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#e2e8e3] bg-[#fbfcfa] px-4 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-700/10">
            <Search className="h-4 w-4 shrink-0 text-emerald-800" />
            <span className="sr-only">Search customer requests</span>
            <input type="search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search services, skills or keywords" className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400" />
          </label>
          <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#e2e8e3] bg-[#fbfcfa] px-4 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-700/10">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-800" />
            <span className="sr-only">Filter by city</span>
            <input type="search" value={searchCity} onChange={(event) => setSearchCity(event.target.value)} placeholder="City or service area" className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400" />
          </label>
        </div>

        <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[220px_minmax(0,1fr)_260px] xl:gap-6">
          <aside className="hidden min-w-0 space-y-4 xl:block">
            <section className="rounded-2xl border border-[#dce6df] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#10241e]">Service category</h2>
                {selectedCategory && <button type="button" onClick={() => setSelectedCategory('')} className="text-xs font-bold text-emerald-800 hover:underline">Clear</button>}
              </div>
              <div className="space-y-1">
                <button type="button" onClick={() => setSelectedCategory('')} aria-pressed={!selectedCategory} className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm transition ${!selectedCategory ? 'bg-[#edf4ef] font-bold text-emerald-950' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                  <span>All work</span><span className="text-xs tabular-nums text-neutral-500">{requirements.length}</span>
                </button>
                {categories.map((category) => (
                  <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)} aria-pressed={selectedCategory === category.id} className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm transition ${selectedCategory === category.id ? 'bg-[#edf4ef] font-bold text-emerald-950' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                    <CategoryIcon icon={category.icon} className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#dce6df] bg-white p-4 shadow-sm">
              <h2 className="text-sm font-extrabold text-[#10241e]">Budget range</h2>
              <p className="mt-1 text-xs leading-5 text-neutral-500">Filter by the customer’s stated budget.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="min-w-0">
                  <span className="mb-1 block text-xs font-semibold text-neutral-600">From ₹</span>
                  <input type="number" min="0" inputMode="numeric" value={budgetFrom} onChange={(event) => setBudgetFrom(event.target.value)} placeholder="Min" className="min-h-11 w-full rounded-lg border border-[#dce6df] px-2 text-sm text-neutral-900 outline-none focus:border-emerald-600" />
                </label>
                <label className="min-w-0">
                  <span className="mb-1 block text-xs font-semibold text-neutral-600">To ₹</span>
                  <input type="number" min="0" inputMode="numeric" value={budgetTo} onChange={(event) => setBudgetTo(event.target.value)} placeholder="Max" className="min-h-11 w-full rounded-lg border border-[#dce6df] px-2 text-sm text-neutral-900 outline-none focus:border-emerald-600" />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-[#dce6df] bg-[#edf4ef] p-4">
              <h2 className="text-sm font-extrabold text-[#10241e]">Before you apply</h2>
              <p className="mt-2 text-xs leading-5 text-[#52665d]">Review the customer&apos;s scope and location. Credits are deducted only when you submit a proposal.</p>
              {isAuthenticated && isProfessional && <Link to="/credits" className="mt-3 inline-flex min-h-10 items-center gap-1 text-xs font-extrabold text-emerald-900 hover:underline">Manage credits <ArrowRight className="h-3.5 w-3.5" /></Link>}
            </section>
          </aside>

          <main className="min-w-0">
            <details className="mb-3 rounded-xl border border-[#dce6df] bg-white p-3 xl:hidden">
              <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-[#344137]">
                <span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-emerald-800" /> More filters</span>
                <span className="text-xs font-medium text-neutral-500">Budget</span>
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label>
                  <span className="mb-1 block text-xs font-semibold text-neutral-600">Minimum budget (₹)</span>
                  <input type="number" min="0" inputMode="numeric" value={budgetFrom} onChange={(event) => setBudgetFrom(event.target.value)} placeholder="No minimum" className="min-h-11 w-full rounded-lg border border-[#dce6df] px-3 text-base text-neutral-900 outline-none focus:border-emerald-600" />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-semibold text-neutral-600">Maximum budget (₹)</span>
                  <input type="number" min="0" inputMode="numeric" value={budgetTo} onChange={(event) => setBudgetTo(event.target.value)} placeholder="No maximum" className="min-h-11 w-full rounded-lg border border-[#dce6df] px-3 text-base text-neutral-900 outline-none focus:border-emerald-600" />
                </label>
              </div>
              {(budgetFrom || budgetTo) && <button type="button" onClick={() => { setBudgetFrom(''); setBudgetTo(''); }} className="mt-2 min-h-10 text-sm font-semibold text-emerald-800">Clear budget</button>}
            </details>

            <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin xl:hidden" role="group" aria-label="Filter customer requests by category">
              <button type="button" onClick={() => setSelectedCategory('')} aria-pressed={!selectedCategory} className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${!selectedCategory ? 'border-[#203c32] bg-[#203c32] text-white' : 'border-[#dce6df] bg-white text-[#506057] hover:bg-[#edf4ef]'}`}>All work</button>
              {categories.map((category) => (
                <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)} aria-pressed={selectedCategory === category.id} className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition ${selectedCategory === category.id ? 'border-[#203c32] bg-[#203c32] text-white' : 'border-[#dce6df] bg-white text-[#506057] hover:bg-[#edf4ef]'}`}>
                  <CategoryIcon icon={category.icon} className="h-4 w-4" /> {category.name}
                </button>
              ))}
            </div>

            <div className="mb-4 flex items-center gap-5 overflow-x-auto border-b border-[#dce6df]" role="group" aria-label="Request feed views">
              {([
                { id: 'BEST_MATCH', label: 'Featured first' },
                { id: 'MOST_RECENT', label: 'Most recent' },
                { id: 'SAVED', label: `Saved${savedRequirementIds.length ? ` (${savedRequirementIds.length})` : ''}` },
              ] as const).map((tab) => (
                <button key={tab.id} type="button" aria-pressed={activeTab === tab.id} onClick={() => { setActiveTab(tab.id); setSortBy(tab.id === 'BEST_MATCH' ? 'BEST_MATCH' : 'NEWEST'); }} className={`relative min-h-11 shrink-0 px-1 text-sm transition ${activeTab === tab.id ? 'font-bold text-[#203c32] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#719453]' : 'font-medium text-neutral-500 hover:text-neutral-800'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-[#10241e]">Customer requests</h2>
                <p className="mt-1 text-sm text-neutral-500">{loading ? 'Updating opportunities...' : `${visibleRequirements.length} ${visibleRequirements.length === 1 ? 'request' : 'requests'}${searchCity ? ` near ${searchCity}` : ''}`}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {visibleRequirements.length > 1 && <label className="flex min-h-10 items-center gap-2 rounded-lg border border-[#dce6df] bg-white px-3 text-xs font-semibold text-neutral-600">
                  <span>Sort</span>
                  <select aria-label="Sort customer requests" value={sortBy} onChange={(event) => { const value = event.target.value as typeof sortBy; setSortBy(value); if (activeTab !== 'SAVED') setActiveTab(value === 'NEWEST' ? 'MOST_RECENT' : 'BEST_MATCH'); }} className="min-h-10 bg-transparent text-sm font-semibold text-[#344137] outline-none">
                    <option value="BEST_MATCH">Featured first</option>
                    <option value="NEWEST">Newest</option>
                    <option value="LOWEST_BUDGET">Lowest budget</option>
                    <option value="HIGHEST_BUDGET">Highest budget</option>
                  </select>
                </label>}
                {hasActiveFilters && <button type="button" onClick={clearFilters} className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">Clear filters</button>}
                <button type="button" onClick={fetchRequirements} disabled={loading} aria-label="Refresh customer requests" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#dce6df] bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:bg-[#edf4ef] disabled:opacity-60">
                  <Clock className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3" role="status" aria-label="Loading customer requests">
                {[1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl border border-[#e2e8e3] bg-white" />)}
              </div>
            ) : loadError ? (
              <div className="rounded-2xl border border-red-200 bg-white p-8 text-center" role="alert">
                <AlertCircle className="mx-auto h-9 w-9 text-red-600" />
                <h3 className="mt-3 font-bold text-neutral-900">Work requests didn&apos;t load</h3>
                <p className="mt-1 text-sm text-neutral-600">{loadError}</p>
                <button type="button" onClick={fetchRequirements} className="mt-4 min-h-11 rounded-xl bg-[#10241e] px-5 text-sm font-bold text-white hover:bg-emerald-800">Try again</button>
              </div>
            ) : visibleRequirements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#cad9ce] bg-white px-6 py-12 text-center">
                {activeTab === 'SAVED' ? <Bookmark className="mx-auto h-9 w-9 text-emerald-800" /> : <Search className="mx-auto h-9 w-9 text-emerald-800" />}
                <h3 className="mt-3 text-lg font-extrabold text-[#10241e]">{activeTab === 'SAVED' ? 'No saved requests yet' : 'No matching requests'}</h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-neutral-600">{activeTab === 'SAVED' ? 'Save a request to keep it handy while you compare opportunities.' : 'Try another keyword, city, category or budget range.'}</p>
                {activeTab === 'SAVED' ? <button type="button" onClick={() => { setActiveTab('BEST_MATCH'); setSortBy('BEST_MATCH'); }} className="mt-4 min-h-11 rounded-xl border border-[#cad9ce] px-4 text-sm font-bold text-emerald-900 hover:bg-[#edf4ef]">Browse all requests</button> : hasActiveFilters && <button type="button" onClick={clearFilters} className="mt-4 min-h-11 rounded-xl border border-[#cad9ce] px-4 text-sm font-bold text-emerald-900 hover:bg-[#edf4ef]">Clear all filters</button>}
              </div>
            ) : (
              <div className="space-y-3">
          {visibleRequirements.map((req) => {
            const reqCost = req.creditsRequired || 5;
            const remainingAfter = currentBalance - reqCost;
            return (
              <article
                key={req.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md sm:p-6 ${req.isBoosted ? 'border-amber-300' : 'border-[#e0e7e2]'}`}
              >
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_210px]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf4ef] px-2.5 py-1 text-xs font-bold text-emerald-900">
                        <CategoryIcon icon={req.category?.icon} className="h-3.5 w-3.5" /> {req.subcategory?.name || req.category?.name}
                      </span>
                      {req.isBoosted && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900"><Sparkles className="h-3 w-3" /> Featured request</span>}
                      <span className="text-xs text-neutral-400">Posted {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <button type="button" onClick={() => toggleSaved(req.id)} aria-pressed={savedRequirementIds.includes(req.id)} aria-label={savedRequirementIds.includes(req.id) ? 'Remove saved request' : 'Save request'} className={`ml-auto inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition ${savedRequirementIds.includes(req.id) ? 'border-[#bfd1a6] bg-[#f1f4e9] text-[#48633e]' : 'border-[#e7e8df] text-neutral-500 hover:bg-[#f7f7f1] hover:text-[#344137]'}`}>
                        <Bookmark className={`h-4 w-4 ${savedRequirementIds.includes(req.id) ? 'fill-current' : ''}`} /> <span className="hidden sm:inline">{savedRequirementIds.includes(req.id) ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>
                    <Link to={`/requirements/${req.id}`} className="mt-3 inline-block text-lg font-extrabold tracking-tight text-[#10241e] hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
                      {req.title}
                    </Link>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600">{req.description}</p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-neutral-600">
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-emerald-800" />{req.city?.name || 'Location not specified'}</span>
                      <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-800" />{req.customerTrust?.firstName || 'Customer'}{req.customerTrust?.jobsPostedCount ? ` · ${req.customerTrust.jobsPostedCount} requests posted` : ''}</span>
                      {req.preferredDate && <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-emerald-800" />{new Date(req.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-4 border-t border-neutral-100 pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                    <div>
                      <span className="text-xs font-semibold text-neutral-500">Customer&apos;s budget</span>
                      <p className="mt-1 text-xl font-black tabular-nums text-[#10241e]">
                        {req.budgetType === 'RANGE' && req.budgetMax ? `₹${req.budgetMin.toLocaleString('en-IN')} – ₹${req.budgetMax.toLocaleString('en-IN')}` : `₹${req.budgetMin.toLocaleString('en-IN')}`}
                      </p>
                      {isProfessional && <p className="mt-2 text-xs text-neutral-500">Apply for <strong className="text-neutral-800">{reqCost} credits</strong>{currentBalance > 0 && <span> · {Math.max(0, remainingAfter)} left after</span>}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link to={`/requirements/${req.id}`} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#d5e1d8] px-3 text-sm font-bold text-[#29463a] transition hover:bg-[#edf4ef]">View details</Link>
                      <button type="button" onClick={() => handleOpenQuoteModal(req)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#108a54] px-3 text-sm font-extrabold text-white transition hover:bg-[#087443] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
                        <Send className="h-4 w-4" /> {isProfessional ? 'Send a proposal' : isAuthenticated ? 'Join to apply' : 'Sign in to apply'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
              </div>
            )}
          </main>

          <aside className="hidden space-y-4 xl:block">
            {isProfessional && (
              <>
                <section className="rounded-2xl border border-[#dce6df] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9efdd] text-sm font-bold text-[#48633e]">{user?.firstName?.[0] || 'P'}</span>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-[#29382e]">{user?.firstName || 'Your profile'}</h2>
                      <p className="truncate text-xs text-neutral-500">{user?.professionalProfile?.title || 'Professional account'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs"><span className="text-neutral-600">Profile completion</span><span className="font-bold text-[#344137]">{profileStrength === null ? '—' : `${profileStrength}%`}</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#e9eee8]" role="progressbar" aria-label="Profile completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={profileStrength ?? 0}><div className="h-full rounded-full bg-[#78935f] transition-all" style={{ width: `${profileStrength ?? 0}%` }} /></div>
                  </div>
                  <Link to="/profile" className="mt-3 inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline">Edit profile <ArrowRight className="h-3.5 w-3.5" /></Link>
                </section>

                <section className="rounded-2xl border border-[#dce6df] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#29382e]"><Coins className="h-4 w-4 text-emerald-800" /> Proposal credits</div>
                  <p className="mt-2 text-2xl font-black text-[#203c32]">{walletLoading ? '...' : walletError ? '—' : currentBalance}</p>
                  <p className="text-xs text-neutral-500">Credits are charged when your proposal is submitted.</p>
                  {walletError && <button type="button" onClick={fetchWallet} className="mt-2 min-h-10 text-xs font-semibold text-red-700 hover:underline">Credits unavailable. Retry</button>}
                  <Link to="/credits" className="mt-3 inline-flex min-h-10 items-center text-xs font-semibold text-emerald-800 hover:underline">View credit plans <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                </section>
              </>
            )}

            <section className="rounded-2xl border border-[#dce6df] bg-[#edf4ef] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#29382e]"><CircleHelp className="h-4 w-4 text-emerald-800" /> A thoughtful proposal</div>
              <p className="mt-2 text-xs leading-5 text-[#52665d]">Refer to the customer’s request, explain your relevant experience, and include a clear price and timeline.</p>
              <Link to="/workflow-preview" className="mt-3 inline-flex min-h-10 items-center text-xs font-semibold text-emerald-900 hover:underline">How it works <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </section>
          </aside>
        </div>
      </div>

      {/* QUOTATION SUBMISSION MODAL */}
      {isModalOpen && selectedRequirement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Quotation Submission
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">
                Apply for "{selectedRequirement.title}"
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Customer Budget: ₹{selectedRequirement.budgetMin.toLocaleString('en-IN')} • {selectedRequirement.city?.name}
              </p>
            </div>

            {quoteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                {quoteError}
              </div>
            )}

            {quoteSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold">
                {quoteSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Proposed Price (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-xs font-semibold">₹</span>
                    <input
                      type="number"
                      min={100}
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Estimated Timeline *
                  </label>
                  <input
                    type="text"
                    value={estimatedTimeline}
                    onChange={(e) => setEstimatedTimeline(e.target.value)}
                    placeholder="e.g. 3 days / 2 hours daily"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Proposed Start Date
                </label>
                <input
                  type="date"
                  value={proposedStartDate}
                  onChange={(e) => setProposedStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Personal Message to Customer *
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself, your credentials, and why you are the best fit..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Scope Summary & Deliverables
                </label>
                <textarea
                  rows={2}
                  value={scopeSummary}
                  onChange={(e) => setScopeSummary(e.target.value)}
                  placeholder="Specific tasks, hygiene standards, equipment provided..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              {/* Explicit Credit Confirmation & In-Context Warning */}
              <div className={`p-3.5 rounded-xl border text-xs transition-all ${
                currentBalance < (selectedRequirement.creditsRequired || 5)
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-neutral-50 border-neutral-200'
              }`}>
                <div className="font-bold text-neutral-900 flex items-center justify-between">
                  <span>Application Credit Deduction:</span>
                  <span className="text-amber-700 font-black">{selectedRequirement.creditsRequired || 5} Credits</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-600 mt-1 font-medium">
                  <span>Current Balance: <strong>{currentBalance} cr</strong></span>
                  <span>Balance After: <strong>{Math.max(0, currentBalance - (selectedRequirement.creditsRequired || 5))} cr</strong></span>
                </div>

                {currentBalance < (selectedRequirement.creditsRequired || 5) && (
                  <div className="mt-3 pt-3 border-t border-amber-200/80">
                    <div className="flex items-start gap-2 text-amber-900 font-semibold text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        You need {selectedRequirement.creditsRequired || 5} credits to apply for this job, but your current balance is {currentBalance} credits.
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[11px] text-amber-800 font-medium">
                        Top up instantly without losing your quotation draft.
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddCreditsOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>+ Add Credit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuote || currentBalance < (selectedRequirement.creditsRequired || 5)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingQuote ? 'Deducting & Submitting...' : 'Confirm & Spend Credits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Add Credits Modal: Keeps quotation modal intact */}
      <AddCreditsModal
        isOpen={isAddCreditsOpen}
        onClose={() => setIsAddCreditsOpen(false)}
        onSuccess={async () => {
          await fetchWallet();
        }}
        creditsNeeded={selectedRequirement?.creditsRequired || 5}
        currentBalance={currentBalance}
      />
    </div>
  );
};
