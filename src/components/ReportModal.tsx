import React, { useState } from 'react';
import { api } from '../services/api';
import { Flag, X, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  reportedUserId: string;
  reportedUserName: string;
  messageId?: string;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  { id: 'SPAM', label: 'Spam or unsolicited advertising', desc: 'Repetitive promotional messages or unwanted solicitations' },
  { id: 'HARASSMENT', label: 'Harassment or offensive language', desc: 'Abusive language, threats, stalking, or inappropriate behavior' },
  { id: 'FRAUD_SCAM', label: 'Fraud or scam attempt', desc: 'Attempting to deceive, falsify identity, or obtain credentials' },
  { id: 'EXTERNAL_PAYMENT', label: 'Offline / External payment pressure', desc: 'Asking for unverified direct payment outside Vaziro Escrow' },
  { id: 'INAPPROPRIATE', label: 'Inappropriate content', desc: 'Content violating safety guidelines or community standards' },
  { id: 'OTHER', label: 'Other violation', desc: 'Any other safety or policy violation' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  reportedUserId,
  reportedUserName,
  messageId,
  onSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState('SPAM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.reportConversation(conversationId, {
        reportedUserId,
        messageId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Report Submitted</h3>
            <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
              Our safety and trust team will review this conversation and take required disciplinary actions.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Report Participant</h3>
                <p className="text-xs text-gray-500">Report safety concern regarding {reportedUserName}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select Violation Category
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition text-xs ${
                        selectedReason === r.id
                          ? 'border-red-500 bg-red-50/50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r.id}
                        checked={selectedReason === r.id}
                        onChange={() => setSelectedReason(r.id)}
                        className="mt-0.5 text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{r.label}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{r.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context or specific details about the violation..."
                  className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
