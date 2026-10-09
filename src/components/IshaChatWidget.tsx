import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User as UserIcon,
  ShieldCheck,
  Coins,
  Headphones,
  PhoneCall,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isAccountSpecific?: boolean;
  suggestHandover?: boolean;
}

const DEFAULT_QUESTIONS = [
  'How does payment protection & escrow work?',
  'What is the 0% commission policy?',
  'How do credits and auto-refunds work?',
  'How do I post a requirement and get quotes?',
];

export const IshaChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasOpenedBefore, setHasOpenedBefore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Human Support Handover States
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [handoverPhone, setHandoverPhone] = useState('');
  const [handoverName, setHandoverName] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [isSubmittingHandover, setIsSubmittingHandover] = useState(false);
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isOpen, showHandoverForm]);

  // Sync user info into handover fields when user changes
  useEffect(() => {
    if (user) {
      if (user.phone) setHandoverPhone(user.phone);
      setHandoverName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
    }
  }, [user]);

  // Global event listener to open Isha Chat from Navbar or other buttons
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
    };

    window.addEventListener('vaziro:open_ai_chat', handleOpenChat);
    return () => {
      window.removeEventListener('vaziro:open_ai_chat', handleOpenChat);
    };
  }, []);

  // Initialize welcome message upon first open
  useEffect(() => {
    if (isOpen && !hasOpenedBefore) {
      setHasOpenedBefore(true);
      if (messages.length === 0) {
        const welcomeText = user
          ? `👋 Hi ${user.firstName}! I'm Isha, your Vaziro Virtual Assistant.\n\nI can help you understand how payments, escrow protection, 0% commission, and credit refunds work. You can also ask me to check your account status, active jobs, or wallet balance!\n\nNeed to speak with our support team? You can also transfer to a human specialist anytime.`
          : `👋 Hello! I'm Isha, your Vaziro Virtual Assistant.\n\nI can answer questions about how Vaziro works, our 0% commission policy, escrow payment protection, and how to find verified professionals or post requirements.\n\nYou can also request a transfer to a real support specialist at any point!`;

        setMessages([
          {
            id: 'welcome-1',
            sender: 'assistant',
            text: welcomeText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [isOpen, hasOpenedBefore, user, messages.length]);

  const handleRequestHumanSupport = () => {
    setShowHandoverForm(true);
    const handoverPromptMsg: ChatMessage = {
      id: `handover-prompt-${Date.now()}`,
      sender: 'assistant',
      text: 'Transferring to human support specialist...\n\nAll our support executives are currently assisting other members. Please confirm your details below and a senior executive will call you back shortly.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestHandover: true,
    };
    setMessages((prev) => [...prev, handoverPromptMsg]);
  };

  const handleSubmitCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverPhone.trim()) return;

    setIsSubmittingHandover(true);
    try {
      const transcript = messages.map((m) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');
      const res = await api.requestSupportCallback({
        phone: handoverPhone.trim(),
        name: handoverName.trim() || undefined,
        notes: handoverNotes.trim() || undefined,
        transcript,
      });

      const confirmationMsg: ChatMessage = {
        id: `callback-confirmed-${Date.now()}`,
        sender: 'assistant',
        text: `✅ ${res.data?.message || 'All executives are currently busy assisting other members right now. Your priority callback request has been logged! You will receive a call back shortly at ' + handoverPhone + '.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, confirmationMsg]);
      setHandoverSuccess(true);
      setShowHandoverForm(false);
      setHandoverNotes('');
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `callback-fallback-${Date.now()}`,
        sender: 'assistant',
        text: `All our support executives are currently busy right now assisting other members. Your priority callback request for ${handoverPhone} has been noted. You will receive a call back in a short while.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setShowHandoverForm(false);
    } finally {
      setIsSubmittingHandover(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    // Check if user is asking for human agent
    const lower = text.toLowerCase();
    const isHumanRequest =
      lower.includes('human') ||
      lower.includes('real person') ||
      lower.includes('agent') ||
      lower.includes('executive') ||
      lower.includes('transfer') ||
      lower.includes('call back') ||
      lower.includes('callback') ||
      lower.includes('talk to someone') ||
      lower.includes('support team') ||
      lower.includes('customer care');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    if (isHumanRequest) {
      handleRequestHumanSupport();
      return;
    }

    setIsLoading(true);

    try {
      // Build conversation history for context
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await api.aiChat(text, history);

      if (res.data?.success && res.data.data?.reply) {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: res.data.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAccountSpecific: res.data.data.isAccountSpecific,
          suggestHandover: res.data.data.suggestHandover,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (res.data.data.suggestHandover) {
          setShowHandoverForm(true);
        }
      } else {
        throw new Error('No reply from assistant service');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text:
          err.response?.data?.error?.message ||
          "I'm temporarily having trouble connecting. Please try asking again in a moment, or visit our Help Center.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setShowHandoverForm(false);
    setHandoverSuccess(false);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Conversation reset. How else can I assist you with Vaziro today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleQuickQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 bg-neutral-900 hover:bg-black text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl border border-neutral-700 transition-all duration-300 active:scale-95 cursor-pointer"
            aria-label="Ask Isha"
          >
            {/* Pulsing indicator */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>

            <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="font-extrabold text-xs tracking-wide">Ask Isha</span>
          </button>
        </div>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[420px] max-w-[420px] h-[580px] max-h-[calc(100vh-120px)] bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-neutral-900 text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-neutral-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-extrabold text-sm text-white">
                  <span>Isha</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-1.5 py-0.2 rounded font-medium">
                    Assistant
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">24/7 Verified Marketplace Helper</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Transfer to Human Support button */}
              <button
                type="button"
                onClick={handleRequestHumanSupport}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 hover:text-emerald-300 text-[11px] font-bold transition cursor-pointer"
                title="Transfer chat to real person from support team"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">Human Support</span>
              </button>

              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                title="Restart conversation"
                aria-label="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-neutral-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-neutral-900 text-white rounded-br-xs shadow-sm'
                      : 'bg-white text-neutral-800 rounded-bl-xs border border-neutral-200/80 shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-neutral-400' : 'text-neutral-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Support Executive Callback Form Card */}
            {showHandoverForm && (
              <div className="bg-white rounded-2xl p-4 border border-emerald-300 shadow-md space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#108a00] flex items-center justify-center shrink-0">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-neutral-900 flex items-center gap-1.5">
                      <span>Priority Support Specialist Handover</span>
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      All our support executives are currently assisting other members. Please confirm your details below and an executive will call you back shortly.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmitCallback} className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                      Your Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={handoverPhone}
                      onChange={(e) => setHandoverPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                      Issue / Reason for Callback (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Payment inquiry, job contract, dispute, etc."
                      value={handoverNotes}
                      onChange={(e) => setHandoverNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108a00]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowHandoverForm(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingHandover || !handoverPhone.trim()}
                      className="px-4 py-1.5 bg-[#108a00] hover:bg-[#14a800] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{isSubmittingHandover ? 'Logging request...' : 'Request Callback'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-neutral-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white rounded-2xl p-3 border border-neutral-200 text-xs text-neutral-500 flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                  <span>Isha is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Pills */}
          {messages.length <= 4 && !isLoading && !showHandoverForm && (
            <div className="px-3 py-2 bg-white border-t border-neutral-100 flex flex-wrap gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleRequestHumanSupport}
                className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1.5 rounded-xl transition text-left cursor-pointer active:scale-95 flex items-center gap-1"
              >
                <Headphones className="w-3 h-3 text-emerald-700" />
                <span>Talk to Support Executive</span>
              </button>

              {DEFAULT_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickQuestionClick(q)}
                  className="text-[11px] font-semibold text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200/80 px-2.5 py-1.5 rounded-xl transition text-left cursor-pointer active:scale-95"
                >
                  {q}
                </button>
              ))}

              {user && (
                <button
                  type="button"
                  onClick={() => handleQuickQuestionClick('Check my account and wallet status')}
                  className="text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-xl transition text-left cursor-pointer active:scale-95 flex items-center gap-1"
                >
                  <Coins className="w-3 h-3 text-amber-600" />
                  <span>Check my wallet & jobs</span>
                </button>
              )}
            </div>
          )}

          {/* Input Box & Actions */}
          <div className="p-3 bg-white border-t border-neutral-200/80 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Isha or type 'talk to agent'..."
                className="flex-1 bg-neutral-100 text-neutral-900 text-xs rounded-xl px-3.5 py-2.5 border border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none transition"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-neutral-900 hover:bg-black disabled:opacity-40 text-white p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-neutral-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Escrow & 0% Commission Protected</span>
              </span>
              <button
                type="button"
                onClick={handleRequestHumanSupport}
                className="text-emerald-700 hover:underline font-bold cursor-pointer flex items-center gap-0.5"
              >
                <Headphones className="w-3 h-3" />
                <span>Support Handover</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IshaChatWidget;
