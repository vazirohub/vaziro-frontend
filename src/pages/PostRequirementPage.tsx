import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Category, Subcategory, IndianState, City } from '../types';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ChevronRight, MapPin, IndianRupee, Calendar, ShieldCheck, Clock } from 'lucide-react';

export const PostRequirementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<IndianState[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetType, setBudgetType] = useState<'FIXED' | 'RANGE'>('FIXED');
  const [budgetMin, setBudgetMin] = useState<number>(5000);
  const [budgetMax, setBudgetMax] = useState<number>(8000);
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [pincode, setPincode] = useState('560038');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (9 AM - 12 PM)');
  const [frequency, setFrequency] = useState('ONE_TIME');
  const [genderPreference, setGenderPreference] = useState('NO_PREFERENCE');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Step wizard: 1 = Service, 2 = Details & Location, 3 = Budget & Timeline
  const [step, setStep] = useState(1);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setLoading(true);
        const [catRes, stateRes] = await Promise.all([
          api.getCategories(),
          api.getStates(),
        ]);
        if (catRes.data?.data) {
          setCategories(catRes.data.data);
          if (catRes.data.data.length > 0) {
            setSelectedCategory(catRes.data.data[0]);
            if (catRes.data.data[0].subcategories?.length > 0) {
              setSelectedSubcategory(catRes.data.data[0].subcategories[0]);
            }
          }
        }
        if (stateRes.data?.data) {
          setStates(stateRes.data.data);
          if (stateRes.data.data.length > 0) {
            setSelectedStateId(stateRes.data.data[0].id);
            const cityRes = await api.getCitiesByState(stateRes.data.data[0].id);
            if (cityRes.data?.data) {
              setCities(cityRes.data.data);
              if (cityRes.data.data.length > 0) {
                setSelectedCityId(cityRes.data.data[0].id);
              }
            }
          }
        }
      } catch (err: any) {
        setError('Failed to load category and location catalog.');
      } finally {
        setLoading(false);
      }
    };
    loadMasterData();
  }, []);

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = e.target.value;
    setSelectedStateId(stateId);
    try {
      const cityRes = await api.getCitiesByState(stateId);
      if (cityRes.data?.data) {
        setCities(cityRes.data.data);
        if (cityRes.data.data.length > 0) {
          setSelectedCityId(cityRes.data.data[0].id);
        }
      }
    } catch {
      // fallback
    }
  };

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    if (cat.subcategories && cat.subcategories.length > 0) {
      setSelectedSubcategory(cat.subcategories[0]);
    } else {
      setSelectedSubcategory(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('CUSTOMER');
      return;
    }

    if (!selectedCategory || !selectedSubcategory || !title || !description || !selectedCityId) {
      setError('Please fill all mandatory fields marked with an asterisk (*).');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        categoryId: selectedCategory.id,
        subcategoryId: selectedSubcategory.id,
        title,
        description,
        budgetType,
        budgetMin: Number(budgetMin),
        budgetMax: budgetType === 'RANGE' ? Number(budgetMax) : Number(budgetMin),
        stateId: selectedStateId || undefined,
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
      setError(err.response?.data?.error?.message || err.message || 'Failed to post requirement.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading Vaziro service catalog...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-3 border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Zero Upfront Booking Fee • Verified Professionals
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
          Post Your Requirement
        </h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
          Describe what you need, set your budget in INR, and receive tailored quotations from verified professionals across India.
        </p>
      </div>

      {/* Steps Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              step === 1 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>1. Service Category</span>
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              step === 2 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>2. Scope & Location</span>
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              step === 3 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>3. Budget & Schedule</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Select Service Category</h2>
              <p className="text-sm text-gray-500">Choose one of the 8 verified Vaziro service domains.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedCategory?.id === cat.id
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{cat.icon || '💼'}</div>
                  <div className="font-semibold text-gray-900 text-sm">{cat.name}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-1">{cat.subcategories?.length || 6} options</div>
                </button>
              ))}
            </div>

            {selectedCategory && selectedCategory.subcategories && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Specific Subcategory for {selectedCategory.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedCategory.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`p-3 rounded-lg border text-left text-sm transition flex items-center justify-between ${
                        selectedSubcategory?.id === sub.id
                          ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{sub.name}</span>
                      {selectedSubcategory?.id === sub.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
              >
                Continue to Scope & Location
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SCOPE & LOCATION */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Requirement Details & Location</h2>
              <p className="text-sm text-gray-500">Provide clear instructions so professionals can quote accurately.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Requirement Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Experienced Home Physiotherapist needed for post-surgery rehabilitation"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Detailed Scope & Instructions *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe your patient/home situation, daily responsibilities, specific skills required, preferred timings, and any relevant details..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  State / UT *
                </label>
                <select
                  value={selectedStateId}
                  onChange={handleStateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  City *
                </label>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Pincode (6-Digit) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560038"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Gender Preference
                </label>
                <select
                  value={genderPreference}
                  onChange={(e) => setGenderPreference(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="NO_PREFERENCE">No Preference</option>
                  <option value="FEMALE_ONLY">Female Professional Preferred</option>
                  <option value="MALE_ONLY">Male Professional Preferred</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Service Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="ONE_TIME">One-Time Service</option>
                  <option value="DAILY">Daily Service (Monthly Subscription)</option>
                  <option value="WEEKLY">Weekly Sessions</option>
                  <option value="MONTHLY">Monthly Retainer</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
              >
                Continue to Budget & Schedule
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BUDGET & SCHEDULE */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Set Your Budget & Timeline</h2>
              <p className="text-sm text-gray-500">
                Vaziro is a quotation marketplace. State your expected budget in INR (₹) to guide professional proposals.
              </p>
            </div>

            {/* Budget Mode Toggle */}
            <div className="flex gap-4">
              <label
                className={`flex-1 p-4 rounded-xl border cursor-pointer transition ${
                  budgetType === 'FIXED'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="budgetType"
                  value="FIXED"
                  checked={budgetType === 'FIXED'}
                  onChange={() => setBudgetType('FIXED')}
                  className="sr-only"
                />
                <div className="font-semibold text-gray-900 text-sm">Fixed Budget</div>
                <p className="text-xs text-gray-500 mt-1">Specific target amount in INR (e.g. ₹10,000)</p>
              </label>

              <label
                className={`flex-1 p-4 rounded-xl border cursor-pointer transition ${
                  budgetType === 'RANGE'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="budgetType"
                  value="RANGE"
                  checked={budgetType === 'RANGE'}
                  onChange={() => setBudgetType('RANGE')}
                  className="sr-only"
                />
                <div className="font-semibold text-gray-900 text-sm">Budget Range</div>
                <p className="text-xs text-gray-500 mt-1">Flexible span in INR (e.g. ₹8,000 – ₹12,000)</p>
              </label>
            </div>

            {/* Budget Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {budgetType === 'FIXED' ? 'Budget Amount (₹ INR) *' : 'Minimum Budget (₹ INR) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-semibold text-sm">₹</span>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              {budgetType === 'RANGE' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Maximum Budget (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      min={budgetMin}
                      step={100}
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Dates & Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Preferred Start Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Preferred Time Slot
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    placeholder="e.g. Morning 8 AM - 11 AM"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Trust Assurance Banner */}
            <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 leading-relaxed">
                <span className="font-semibold text-emerald-900 block mb-0.5">Vaziro Buyer Protection Guarantee</span>
                Your requirement will be broadcast to verified local professionals. You can compare profiles, check DigiLocker credentials, and hire only when satisfied. You pay nothing to receive quotes.
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg shadow-md transition disabled:opacity-50"
              >
                {submitting ? 'Publishing Requirement...' : 'Publish Requirement (Get Quotes)'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
