import React, { useState } from 'react';
import { api } from '../services/api';
import { CallRequest } from '../types';
import { Phone, Calendar, Clock, X, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CallRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  otherPartyName: string;
  onSuccess: (callRequest: CallRequest) => void;
}

export const CallRequestModal: React.FC<CallRequestModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  otherPartyName,
  onSuccess,
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [requestedDate, setRequestedDate] = useState(defaultDateStr);
  const [requestedStartTime, setRequestedStartTime] = useState('04:00 PM');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:30 AM',
    '02:00 PM',
    '03:30 PM',
    '04:00 PM',
    '05:30 PM',
    '07:00 PM',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.createCallRequest(conversationId, {
        requestedDate,
        requestedStartTime,
        message: message.trim() || undefined,
      });

      if (res.data?.data) {
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to send call request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-neutral-900 tracking-tight">
              Request a Call
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Schedule a voice discussion with {otherPartyName}
            </p>
          </div>
        </div>

        {/* Privacy Shield Info Card */}
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold block text-emerald-950 mb-0.5">Contact Privacy Protected</span>
            Your real mobile number is never displayed to either party. Calls are coordinated safely through the Vaziro Bridge.
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preferred Date */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>Preferred Date</span>
            </label>
            <input
              type="date"
              value={requestedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setRequestedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Preferred Time Slots */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Preferred Time</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const isSelected = requestedStartTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setRequestedStartTime(slot)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
              Optional Discussion Note
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Would like to discuss elderly mobility routine and service timing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Call Request</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
