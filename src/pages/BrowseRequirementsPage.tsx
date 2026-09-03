import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Requirement, Category, CreditWallet } from '../types';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, IndianRupee, ShieldCheck, Coins, Send, X, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BrowseRequirementsPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallet, setWallet] = useState<CreditWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchCity, setSearchCity] = useState<string>('');

  // Quotation Modal State
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposedPrice, setProposedPrice] = useState<number>(5000);
  const [estimatedTimeline, setEstimatedTimeline] = useState('3 days');
  const [proposedStartDate, setProposedStartDate] = useState('');
  const [message, setMessage] = useState('');
  const [scopeSummary, setScopeSummary] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteSuccess, setQuoteSuccess] = useState<string | null>(null);

  const isProfessional = user?.roles?.includes('PROFESSIONAL');

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory) params.categoryId = selectedCategory;
      if (searchCity) params.cityId = searchCity;

      const [reqRes, catRes] = await Promise.all([
        api.getRequirements(params),
        api.getCategories(),
      ]);

      if (reqRes.data?.data) {
        setRequirements(reqRes.data.data);
      }
      if (catRes.data?.data) {
        setCategories(catRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    if (isAuthenticated && isProfessional) {
      try {
        const res = await api.getCreditWallet();
        if (res.data?.data) {
          setWallet(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [selectedCategory]);

  useEffect(() => {
    fetchWallet();
  }, [isAuthenticated, isProfessional]);

  const handleOpenQuoteModal = (req: Requirement) => {
    if (!isAuthenticated) {
      openAuthModal('PROFESSIONAL');
      return;
    }
    if (!isProfessional) {
      alert('Only registered professionals can submit quotations. Please switch to a Professional account.');
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

  const currentBalance = wallet?.balance ?? 10;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header & Wallet Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Discover Customer Requirements
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse live verified job requirements across India. Pay Credits only when you choose to submit a quotation.
          </p>
        </div>

        {isAuthenticated && isProfessional && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4 shrink-0 shadow-sm">
            <div className="p-2.5 bg-emerald-600 rounded-lg text-white">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">Credit Wallet</div>
              <div className="text-xl font-extrabold text-emerald-950">
                {currentBalance} <span className="text-xs font-normal text-emerald-700">Credits Available</span>
              </div>
            </div>
            <Link
              to="/credits"
              className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
            >
              Buy Plans
            </Link>
          </div>
        )}
      </div>

      {/* Category Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
            selectedCategory === ''
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Categories ({requirements.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{cat.icon || '💼'}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Requirement List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent"></div>
          <p className="mt-3 text-sm text-gray-500 font-medium">Finding requirements in your area...</p>
        </div>
      ) : requirements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900">No Requirements Found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            There are currently no active requirements matching this filter. Try selecting "All Categories".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requirements.map((req) => {
            const reqCost = req.creditsRequired || 5;
            const remainingAfter = currentBalance - reqCost;
            const canAfford = currentBalance >= reqCost;

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {req.category?.icon || '💼'} {req.subcategory?.name || req.category?.name}
                    </span>
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">
                    {req.title}
                  </h3>
                  <p className="text-gray-600 text-xs line-clamp-3 mb-4 leading-relaxed">
                    {req.description}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Stated Budget:
                      </span>
                      <span className="font-bold text-gray-900">
                        {req.budgetType === 'RANGE' && req.budgetMax
                          ? `₹${req.budgetMin.toLocaleString('en-IN')} - ₹${req.budgetMax.toLocaleString('en-IN')}`
                          : `₹${req.budgetMin.toLocaleString('en-IN')}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" /> Location:
                      </span>
                      <span className="font-medium text-gray-800">
                        {req.city?.name || 'India'}, {req.pincodeId || '560038'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Posted By:
                      </span>
                      <span className="font-medium text-gray-800">
                        {req.customerTrust?.firstName || 'Verified Customer'} ({req.customerTrust?.jobsPostedCount || 1} jobs)
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Dynamic Credit Fee Box (Section 17 & 18) */}
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 mb-3 text-xs">
                    <div className="flex items-center justify-between text-amber-900 font-semibold mb-1">
                      <span className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-amber-600" /> Application Cost:
                      </span>
                      <span className="text-sm font-extrabold text-amber-950">{reqCost} Credits</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-amber-800">
                      <span>Your Balance: <strong>{currentBalance} cr</strong></span>
                      <span>Remaining: <strong className={remainingAfter < 0 ? 'text-red-600' : 'text-emerald-700'}>{remainingAfter} cr</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/requirements/${req.id}`}
                      className="flex-1 py-2 px-3 border border-gray-300 text-center rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleOpenQuoteModal(req)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-center rounded-lg text-xs font-bold text-white transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Apply & Quote
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

              {/* Explicit Credit Confirmation (Section 17) */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <div className="font-semibold text-amber-950 flex items-center justify-between">
                  <span>Application Credit Deduction:</span>
                  <span className="text-amber-700 font-extrabold">{selectedRequirement.creditsRequired || 5} Credits</span>
                </div>
                <div className="flex justify-between text-[11px] text-amber-800 mt-1">
                  <span>Current Balance: {currentBalance} cr</span>
                  <span>Balance After: {currentBalance - (selectedRequirement.creditsRequired || 5)} cr</span>
                </div>
                {currentBalance < (selectedRequirement.creditsRequired || 5) && (
                  <p className="text-red-600 font-semibold mt-1">
                    Insufficient credits. Please purchase a credit pack to apply.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuote || currentBalance < (selectedRequirement.creditsRequired || 5)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingQuote ? 'Deducting & Submitting...' : 'Confirm & Spend Credits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
