import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Requirement, Quotation } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  MapPin,
  IndianRupee,
  Star,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Phone,
  Clock,
  Briefcase,
  AlertCircle,
  ThumbsUp,
  XCircle,
} from 'lucide-react';

export const RequirementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState<string | null>(null);
  const [usePaymentProtection, setUsePaymentProtection] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [reqRes, quotesRes] = await Promise.all([
        api.getRequirementById(id),
        api.getQuotationsForRequirement(id),
      ]);

      if (reqRes.data?.data) {
        setRequirement(reqRes.data.data);
      }
      if (quotesRes.data?.data) {
        setQuotations(quotesRes.data.data);
      }
    } catch (err: any) {
      setError('Failed to load requirement details or quotations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleHire = async (quotationId: string) => {
    try {
      setHiring(quotationId);
      setError(null);

      const res = await api.hireProfessional(quotationId, usePaymentProtection);
      if (res.data?.success && res.data?.data) {
        navigate(`/jobs/${res.data.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to hire professional.');
    } finally {
      setHiring(null);
    }
  };

  const handleShortlist = async (quoteId: string) => {
    try {
      await api.shortlistQuotation(quoteId);
      fetchDetails();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleReject = async (quoteId: string) => {
    try {
      await api.rejectQuotation(quoteId);
      fetchDetails();
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading requirement and comparing quotations...</p>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-900">Requirement Not Found</h2>
        <Link to="/requirements" className="mt-4 inline-block text-emerald-600 font-semibold hover:underline">
          Browse all requirements →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner: Requirement Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {requirement.category?.icon} {requirement.category?.name} • {requirement.subcategory?.name}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Status: {requirement.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {requirement.title}
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-3xl leading-relaxed">
              {requirement.description}
            </p>
          </div>

          {/* Budget Badge */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shrink-0 text-right">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Posted Budget</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">
              {requirement.budgetType === 'RANGE' && requirement.budgetMax
                ? `₹${requirement.budgetMin.toLocaleString('en-IN')} - ₹${requirement.budgetMax.toLocaleString('en-IN')}`
                : `₹${requirement.budgetMin.toLocaleString('en-IN')}`}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 flex items-center justify-end gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {requirement.city?.name || 'Bengaluru'}, {requirement.pincodeId || '560038'}
            </div>
          </div>
        </div>

        {/* Payment Protection Option Toggle (Section 34) */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>Vaziro Payment Protection</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Optional & Recommended
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Funds are secured upon hiring and released to the professional only after you approve completion. Platform fee: 6%.
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={usePaymentProtection}
              onChange={(e) => setUsePaymentProtection(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
            />
            <span className="text-xs font-bold text-emerald-950">Enable Protection</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Quotation Comparison Section (Section 24 & 25) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Received Quotations ({quotations.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Side-by-side comparison powered by DigiLocker credentials and AI Match Scores.
            </p>
          </div>
        </div>

        {quotations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">Waiting for Quotations</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Local professionals in your area are evaluating your requirement. You will receive quotation proposals shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {quotations.map((q) => {
              const prof = q.professional;
              const ai = q.aiMatch;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition ${
                    q.status === 'SHORTLISTED'
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : q.status === 'REJECTED'
                      ? 'border-gray-200 opacity-60'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div>
                    {/* Professional Header & DigiLocker Badge */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base">
                          {prof?.user?.firstName?.[0] || 'P'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-gray-900 text-base">
                              {prof?.user?.firstName} {prof?.user?.lastName ? prof.user.lastName[0] + '.' : ''}
                            </h3>
                            {prof?.isVerified && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                ✓ Verified via DigiLocker
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{prof?.title || 'Professional Service Partner'}</p>
                        </div>
                      </div>

                      {/* AI Match Score Badge (Section 26) */}
                      {ai && (
                        <div className="text-right">
                          <div className="inline-flex items-center gap-1 bg-violet-50 text-violet-800 border border-violet-200 px-2.5 py-1 rounded-full text-xs font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                            {ai.score}% Match
                          </div>
                          <div className="text-[10px] text-violet-700 mt-0.5 font-medium">{ai.ratingGrade} FIT</div>
                        </div>
                      )}
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-center text-xs mb-4">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Rating</span>
                        <span className="font-bold text-gray-900 flex items-center justify-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {prof?.rating || 5.0}★ ({prof?.reviewsCount || 0})
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Experience</span>
                        <span className="font-bold text-gray-900">{prof?.yearsOfExperience || 3} Years</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Jobs Won</span>
                        <span className="font-bold text-gray-900">{prof?.completedJobsCount || 0}</span>
                      </div>
                    </div>

                    {/* Quoted Pricing & Timeline (Section 23) */}
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl mb-4 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-emerald-800 font-semibold uppercase block">Quoted Price</span>
                        <span className="text-xl font-extrabold text-emerald-950">
                          ₹{q.proposedPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-emerald-800 font-semibold uppercase block">Timeline</span>
                        <span className="text-sm font-bold text-emerald-950 flex items-center gap-1 justify-end">
                          <Clock className="w-3.5 h-3.5" />
                          {q.estimatedTimeline}
                        </span>
                      </div>
                    </div>

                    {/* Message & Scope */}
                    <div className="space-y-2 text-xs text-gray-700 mb-4">
                      {q.message && (
                        <p className="bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                          "{q.message}"
                        </p>
                      )}
                      {q.scopeSummary && (
                        <div className="text-[11px] text-gray-500">
                          <span className="font-semibold text-gray-700">Scope:</span> {q.scopeSummary}
                        </div>
                      )}
                    </div>

                    {/* AI Match Rationale (Section 26) */}
                    {ai?.reasons && ai.reasons.length > 0 && (
                      <div className="mb-4 p-2.5 bg-violet-50/50 rounded-lg border border-violet-100 text-[11px] space-y-1 text-violet-900">
                        <span className="font-semibold block text-violet-950">Why this match?</span>
                        {ai.reasons.map((r, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions (Section 27: Hire) */}
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
                    {q.status !== 'REJECTED' && (
                      <>
                        <button
                          onClick={() => handleShortlist(q.id)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 text-xs font-semibold flex items-center gap-1"
                          title="Shortlist"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                          Shortlist
                        </button>

                        <button
                          onClick={() => handleReject(q.id)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 text-xs font-semibold flex items-center gap-1"
                          title="Reject"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleHire(q.id)}
                      disabled={hiring === q.id || q.status === 'REJECTED' || requirement.status === 'HIRED'}
                      className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {hiring === q.id ? 'Hiring...' : 'Hire Professional'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
