import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ChatThread, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, ShieldCheck, Phone, User, Clock, AlertCircle } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchThreads = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.getChatThreads();
      if (res.data?.data) {
        setThreads(res.data.data);
        if (res.data.data.length > 0 && !selectedThread) {
          setSelectedThread(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const res = await api.getChatMessages(threadId);
      if (res.data?.data) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
      const interval = setInterval(() => fetchMessages(selectedThread.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedThread?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !newMessage.trim()) return;

    try {
      setSending(true);
      const res = await api.sendMessage(selectedThread.id, newMessage);
      if (res.data?.data) {
        setMessages((prev) => [...prev, res.data!.data!]);
        setNewMessage('');
      }
    } catch (err: any) {
      alert('Failed to send message: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <MessageSquare className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Please Sign In to Access Chat</h2>
        <p className="text-xs text-gray-500 mt-1 mb-4">
          Chat securely with customers and service professionals on Vaziro.
        </p>
        <button
          onClick={() => openAuthModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[750px]">
        {/* Thread List Sidebar */}
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Messages</h2>
            <p className="text-xs text-gray-500 mt-0.5">Active customer & professional discussions</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {threads.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No active conversations yet. Chat opens automatically when you hire or receive quotes.
              </div>
            ) : (
              threads.map((thread) => {
                const isSelected = selectedThread?.id === thread.id;
                const otherParticipant = thread.participants?.find((p) => p.userId !== user?.id);

                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`w-full p-4 text-left transition flex items-start gap-3 ${
                      isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-sm">
                      {otherParticipant?.user?.firstName?.[0] || 'V'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-xs truncate">
                          {otherParticipant?.user?.firstName} {otherParticipant?.user?.lastName || ''}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(thread.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 font-medium truncate mt-0.5">
                        {thread.job?.requirement?.title || 'Contract Chat'}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {thread.messages?.[0]?.content || 'Start conversation...'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Active Conversation Pane */}
        {selectedThread ? (
          <div className="flex-1 flex flex-col bg-gray-50/30">
            {/* Conversation Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {selectedThread.job?.requirement?.title || 'Direct Conversation'}
                </h3>
                <span className="text-[11px] text-gray-500 block">
                  Status: {selectedThread.job?.status || 'Active'} • Contract Price: ₹{selectedThread.job?.agreedPrice || '0'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Privacy Shield Active
                </span>
              </div>
            </div>

            {/* Privacy Redaction Notice (Section 52) */}
            <div className="bg-amber-50/80 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                To safeguard privacy and prevent scams, phone numbers and emails are automatically masked until service hiring is confirmed.
              </span>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => {
                const isMe = m.senderUserId === user?.id;

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p>{m.content}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Message Input Field */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8 text-gray-400 text-xs">
            Select a conversation on the left to start messaging.
          </div>
        )}
      </div>
    </div>
  );
};
