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
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isAccountSpecific?: boolean;
}

const DEFAULT_QUESTIONS = [
  'How does payment protection & escrow work?',
  'What is the 0% commission policy?',
  'How do credits and auto-refunds work?',
  'How do I post a requirement and get quotes?',
];

export const GeminiChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasOpenedBefore, setHasOpenedBefore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
  }, [messages, isOpen]);

  // Global event listener to open Gemini Chat from Navbar or other buttons
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
          ? `👋 Hi ${user.firstName}! I'm your Vaziro AI Assistant, powered by Google Gemini.\n\nI can help you understand how payments, escrow protection, 0% commission, and credit refunds work. You can also ask me to check your account status, active jobs, or wallet balance!`
          : `👋 Hello! I'm your Vaziro AI Assistant, powered by Google Gemini.\n\nI can answer questions about how Vaziro works, our 0% commission policy, escrow payment protection, and how to find verified professionals or post requirements. How can I help you today?`;

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

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
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
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('No reply from AI service');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text:
          err.response?.data?.error?.message ||
          "I'm temporarily having trouble connecting to Google Gemini. Please try asking again in a moment, or visit our Help Center.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
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
            aria-label="Open Vaziro Gemini AI Support"
          >
            {/* Pulsing indicator */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>

            <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="font-extrabold text-xs tracking-wide">Ask Vaziro AI</span>
            <span className="text-[10px] bg-white/20 text-neutral-200 px-1.5 py-0.5 rounded font-mono hidden sm:inline">
              Gemini
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[420px] max-w-[420px] h-[560px] max-h-[calc(100vh-120px)] bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-neutral-900 text-white p-4 flex items-center justify-between border-b border-neutral-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-extrabold text-sm text-white">
                  <span>Vaziro AI Assistant</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-1.5 py-0.2 rounded font-mono">
                    Gemini
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">24/7 Verified Marketplace Helper</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                title="Restart conversation"
                aria-label="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
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
                  <span>Vaziro AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Pills */}
          {messages.length <= 3 && !isLoading && (
            <div className="px-3 py-2 bg-white border-t border-neutral-100 flex flex-wrap gap-1.5 shrink-0">
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
                placeholder="Ask about payments, escrow, credits, jobs..."
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
              <span>Powered by Gemini</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
