import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../services/api';
import { ChatThread, Message, CallRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  initSocket,
  getSocket,
  joinConversationRoom,
  leaveConversationRoom,
  sendTypingStart,
  sendTypingStop,
} from '../services/socket';
import { CallRequestModal } from '../components/CallRequestModal';
import { ReportModal } from '../components/ReportModal';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Phone,
  User,
  Clock,
  AlertCircle,
  Paperclip,
  Check,
  CheckCheck,
  Search,
  MoreVertical,
  Flag,
  Ban,
  Archive,
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  // Navigation and data state
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [callRequests, setCallRequests] = useState<CallRequest[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  // Loading and action state
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  } | null>(null);

  // UI modals and menus
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Typing state
  const [otherIsTyping, setOtherIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const myTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DOM refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to bottom helper
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 1. Fetch thread list
  const fetchThreads = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingThreads(true);
      const res = await api.getConversations();
      if (res.data?.data) {
        setThreads(res.data.data);
        if (res.data.data.length > 0 && !selectedThread) {
          setSelectedThread(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  // 2. Fetch messages & call requests for selected thread
  const fetchMessagesAndCalls = async (threadId: string) => {
    try {
      setLoadingMessages(true);
      const [msgRes, callRes] = await Promise.all([
        api.getConversationMessages(threadId, { limit: 100 }),
        api.getCallRequests(threadId).catch(() => ({ data: { data: [] } })),
      ]);

      if (msgRes.data?.data) {
        setMessages(msgRes.data.data);
      }
      if (callRes.data?.data) {
        setCallRequests(callRes.data.data);
      }
      // Auto mark read on load
      api.markConversationRead(threadId).catch(() => {});
    } catch (err) {
      console.error('Failed to fetch conversation history:', err);
    } finally {
      setLoadingMessages(false);
      setTimeout(() => scrollToBottom('auto'), 100);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessagesAndCalls(selectedThread.id);
    } else {
      setMessages([]);
      setCallRequests([]);
    }
  }, [selectedThread?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Socket.IO Real-Time listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = initSocket();
    if (!socket) return;

    // Join room for selected thread
    if (selectedThread?.id) {
      joinConversationRoom(selectedThread.id);
    }

    const handleNewMessage = (incomingMsg: Message) => {
      // If belongs to currently viewed conversation
      if (selectedThread && incomingMsg.chatThreadId === selectedThread.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;
          return [...prev, incomingMsg];
        });
        // Auto mark as read if not sent by me
        if (incomingMsg.senderUserId !== user?.id) {
          api.markConversationRead(selectedThread.id).catch(() => {});
        }
      }

      // Update snippet in thread list
      setThreads((prevThreads) =>
        prevThreads.map((t) => {
          if (t.id === incomingMsg.chatThreadId) {
            const isCurrent = selectedThread?.id === t.id;
            return {
              ...t,
              updatedAt: incomingMsg.createdAt,
              lastMessage: {
                id: incomingMsg.id,
                content: incomingMsg.content || 'Attachment',
                messageType: incomingMsg.messageType || 'TEXT',
                createdAt: incomingMsg.createdAt,
                senderName: incomingMsg.sender?.firstName || 'User',
                isMe: incomingMsg.senderUserId === user?.id,
              },
              unreadCount: isCurrent ? 0 : (t.unreadCount || 0) + 1,
            };
          }
          return t;
        })
      );
    };

    const handleMessageRead = (data: { conversationId: string; readByUserId: string }) => {
      if (selectedThread && data.conversationId === selectedThread.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderUserId === user?.id ? { ...m, status: 'READ' } : m
          )
        );
      }
    };

    const handleTypingStart = (data: { conversationId: string; userId: string; userName?: string }) => {
      if (selectedThread && data.conversationId === selectedThread.id && data.userId !== user?.id) {
        setOtherIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setOtherIsTyping(false), 3000);
      }
    };

    const handleTypingStop = (data: { conversationId: string; userId: string }) => {
      if (selectedThread && data.conversationId === selectedThread.id && data.userId !== user?.id) {
        setOtherIsTyping(false);
      }
    };

    const handleCallUpdate = (callReq: CallRequest) => {
      if (selectedThread && callReq.chatThreadId === selectedThread.id) {
        setCallRequests((prev) => {
          const index = prev.findIndex((c) => c.id === callReq.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = callReq;
            return next;
          }
          return [callReq, ...prev];
        });
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:read', handleMessageRead);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('call-request:new', handleCallUpdate);
    socket.on('call-request:accepted', handleCallUpdate);
    socket.on('call-request:declined', handleCallUpdate);
    socket.on('call-request:cancelled', handleCallUpdate);

    return () => {
      if (selectedThread?.id) {
        leaveConversationRoom(selectedThread.id);
      }
      socket.off('message:new', handleNewMessage);
      socket.off('message:read', handleMessageRead);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('call-request:new', handleCallUpdate);
      socket.off('call-request:accepted', handleCallUpdate);
      socket.off('call-request:declined', handleCallUpdate);
      socket.off('call-request:cancelled', handleCallUpdate);
    };
  }, [selectedThread?.id, isAuthenticated, user?.id]);

  // Handle typing debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!selectedThread) return;

    sendTypingStart(selectedThread.id);
    if (myTypingTimeoutRef.current) clearTimeout(myTypingTimeoutRef.current);
    myTypingTimeoutRef.current = setTimeout(() => {
      if (selectedThread) sendTypingStop(selectedThread.id);
    }, 2000);
  };

  // Contact protection warning heuristic on user input
  const isInputTriggeringSafetyWarning = useMemo(() => {
    if (!newMessage) return false;
    const phonePattern = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{3,4}|\b\d{10}\b/;
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    return phonePattern.test(newMessage) || emailPattern.test(newMessage);
  }, [newMessage]);

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || (!newMessage.trim() && !pendingAttachment)) return;

    const messageText = newMessage.trim();
    const attachmentPayload = pendingAttachment ? { ...pendingAttachment } : undefined;

    setNewMessage('');
    setPendingAttachment(null);
    sendTypingStop(selectedThread.id);

    try {
      setSending(true);
      const res = await api.sendConversationMessage(selectedThread.id, {
        content: messageText || (attachmentPayload ? `Sent an attachment: ${attachmentPayload.fileName}` : ''),
        messageType: attachmentPayload ? (attachmentPayload.fileType.startsWith('image/') ? 'IMAGE' : 'FILE') : 'TEXT',
        attachmentUrl: attachmentPayload?.fileUrl,
        fileName: attachmentPayload?.fileName,
        fileType: attachmentPayload?.fileType,
        fileSize: attachmentPayload?.fileSize,
      });

      if (res.data?.data) {
        const sentMsg = res.data.data;
        setMessages((prev) => {
          if (prev.some((m) => m.id === sentMsg.id)) return prev;
          return [...prev, sentMsg];
        });
      }
    } catch (err: any) {
      alert('Failed to send message: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setSending(false);
      setTimeout(() => scrollToBottom(), 50);
    }
  };

  // Handle Attachment Selection
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedThread) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    try {
      setUploadingAttachment(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await api.uploadConversationAttachment(selectedThread.id, {
            fileName: file.name,
            base64Data,
          });

          if (res.data?.data) {
            setPendingAttachment({
              fileUrl: res.data.data.fileUrl,
              fileName: file.name,
              fileType: res.data.data.fileType,
              fileSize: res.data.data.fileSize,
            });
          }
        } catch (uploadErr: any) {
          alert('Upload failed: ' + (uploadErr.response?.data?.error?.message || uploadErr.message));
        } finally {
          setUploadingAttachment(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadingAttachment(false);
      alert('Error reading file: ' + err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Call actions
  const handleAcceptCall = async (callId: string) => {
    try {
      const res = await api.acceptCallRequest(callId);
      if (res.data?.data?.callRequest) {
        const updated = res.data.data.callRequest;
        setCallRequests((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      }
    } catch (err: any) {
      alert('Error accepting call request: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  const handleDeclineCall = async (callId: string) => {
    const reason = window.prompt('Optional reason for declining:');
    try {
      const res = await api.declineCallRequest(callId, reason || undefined);
      if (res.data?.data) {
        const updated = res.data.data;
        setCallRequests((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      }
    } catch (err: any) {
      alert('Error declining call request: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  const handleCancelCall = async (callId: string) => {
    if (!window.confirm('Are you sure you want to cancel this call request?')) return;
    try {
      const res = await api.cancelCallRequest(callId);
      if (res.data?.data) {
        const updated = res.data.data;
        setCallRequests((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      }
    } catch (err: any) {
      alert('Error cancelling call request: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  // Block & Archive actions
  const handleToggleArchive = async () => {
    if (!selectedThread) return;
    const isCurrentlyArchived = selectedThread.isArchived || false;
    try {
      await api.archiveConversation(selectedThread.id, !isCurrentlyArchived);
      setSelectedThread({ ...selectedThread, isArchived: !isCurrentlyArchived });
      setThreads((prev) =>
        prev.map((t) => (t.id === selectedThread.id ? { ...t, isArchived: !isCurrentlyArchived } : t))
      );
      setIsMoreMenuOpen(false);
    } catch (err: any) {
      alert('Failed to update archive status: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  const handleToggleBlock = async () => {
    if (!selectedThread) return;
    const otherParticipant = selectedThread.participants?.find((p) => p.userId !== user?.id);
    if (!otherParticipant) return;

    const isCurrentlyBlocked = selectedThread.isBlocked || false;
    try {
      if (isCurrentlyBlocked) {
        await api.unblockConversationUser(selectedThread.id, { blockedUserId: otherParticipant.userId });
        setSelectedThread({ ...selectedThread, isBlocked: false });
      } else {
        if (!window.confirm(`Are you sure you want to block ${otherParticipant.user.firstName}? You will no longer receive messages.`)) return;
        await api.blockConversationUser(selectedThread.id, { blockedUserId: otherParticipant.userId });
        setSelectedThread({ ...selectedThread, isBlocked: true });
      }
      setIsMoreMenuOpen(false);
    } catch (err: any) {
      alert('Failed to update block state: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  // Filtered threads
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const matchesArchive = tabFilter === 'ARCHIVED' ? t.isArchived : !t.isArchived;
      if (!matchesArchive) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const other = t.participants?.find((p) => p.userId !== user?.id)?.user;
      const otherName = `${other?.firstName || ''} ${other?.lastName || ''}`.toLowerCase();
      const jobTitle = (t.job?.requirement?.title || t.requirement?.title || '').toLowerCase();
      return otherName.includes(q) || jobTitle.includes(q);
    });
  }, [threads, tabFilter, searchQuery, user?.id]);

  // Derived current other party
  const activeOtherParticipant = useMemo(() => {
    if (!selectedThread) return null;
    return selectedThread.participants?.find((p) => p.userId !== user?.id);
  }, [selectedThread, user?.id]);

  const activeOtherUser = activeOtherParticipant?.user;
  const isOtherVerified =
    selectedThread?.otherParticipant?.isVerified ||
    activeOtherUser?.professionalProfile?.isVerified;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Sign In to Open Vaziro Messages</h2>
        <p className="text-xs text-gray-500 mt-2 mb-6 max-w-xs mx-auto leading-relaxed">
          Chat securely with verified professionals, discuss requirements, and schedule calls.
        </p>
        <button
          onClick={() => openAuthModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-3 rounded-xl text-xs transition shadow-md hover:shadow-lg"
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Container Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[min(780px,calc(100dvh-10rem))] min-h-[520px]">
        {/* ================= THREADS SIDEBAR ================= */}
        <div
          className={`w-full md:w-[300px] lg:w-96 border-r border-gray-200 flex flex-col shrink-0 ${
            selectedThread ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Tabs */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Messages
              </h2>
              <div className="flex bg-gray-200/80 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setTabFilter('ACTIVE')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    tabFilter === 'ACTIVE' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setTabFilter('ARCHIVED')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    tabFilter === 'ARCHIVED' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Archived
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats, jobs or names..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loadingThreads ? (
              <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span>Loading conversations...</span>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                {searchQuery
                  ? 'No conversations match your search.'
                  : tabFilter === 'ARCHIVED'
                  ? 'No archived conversations.'
                  : 'No active conversations yet. Chat opens automatically when you request quotes or receive job leads.'}
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = selectedThread?.id === thread.id;
                const other = thread.participants?.find((p) => p.userId !== user?.id)?.user;
                const otherName = `${other?.firstName || 'User'} ${other?.lastName || ''}`.trim();
                const isVerified =
                  thread.otherParticipant?.isVerified ||
                  other?.professionalProfile?.isVerified;
                const jobTitle =
                  thread.job?.requirement?.title ||
                  thread.requirement?.title ||
                  'Direct Discussion';

                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`w-full p-4 text-left transition flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-emerald-50/70 border-l-4 border-emerald-600'
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-sm relative shadow-xs">
                      {other?.firstName?.[0] || 'V'}
                      {isVerified && (
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center"
                          title="DigiLocker Verified"
                        >
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-gray-900 text-xs truncate flex items-center gap-1">
                          {otherName}
                          {isVerified && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-full">
                              Verified
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(thread.updatedAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-[11px] text-emerald-800 font-medium truncate mt-0.5">
                        {jobTitle}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-xs text-gray-500 truncate">
                          {thread.lastMessage?.content ||
                            thread.messages?.[0]?.content ||
                            'Start conversation...'}
                        </p>
                        {!!thread.unreadCount && thread.unreadCount > 0 && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center shrink-0">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================= ACTIVE CHAT PANE ================= */}
        {selectedThread ? (
          <div
            className={`flex-1 flex flex-col bg-gray-50/40 relative ${
              selectedThread ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* 1. Conversation Header */}
            <div className="p-3.5 sm:p-4 bg-white border-b border-gray-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedThread(null)}
                  className="md:hidden p-1.5 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-sm">
                  {activeOtherUser?.firstName?.[0] || 'V'}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                      {activeOtherUser?.firstName} {activeOtherUser?.lastName || ''}
                    </h3>
                    {isOtherVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded-full shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" /> DigiLocker Verified
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate flex items-center gap-2">
                    <span className="font-medium text-emerald-700 truncate">
                      {selectedThread.job?.requirement?.title ||
                        selectedThread.requirement?.title ||
                        'Direct Discussion'}
                    </span>
                    {selectedThread.job?.status && (
                      <span className="hidden sm:inline text-[10px] text-gray-400">
                        • {selectedThread.job.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Request Call Button */}
                <button
                  onClick={() => setIsCallModalOpen(true)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  title="Schedule a verified call"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Request Call</span>
                </button>

                {/* More Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isMoreMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30 text-xs animate-in fade-in zoom-in-95 duration-100">
                      <button
                        onClick={handleToggleArchive}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Archive className="w-4 h-4 text-gray-500" />
                        {selectedThread.isArchived ? 'Unarchive Chat' : 'Archive Chat'}
                      </button>
                      <button
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          setIsReportModalOpen(true);
                        }}
                        className="w-full px-4 py-2 text-left text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                      >
                        <Flag className="w-4 h-4 text-amber-600" />
                        Report Safety Issue
                      </button>
                      <button
                        onClick={handleToggleBlock}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Ban className="w-4 h-4 text-red-500" />
                        {selectedThread.isBlocked ? 'Unblock User' : 'Block User'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Privacy Redaction Notice */}
            <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 text-[11px] text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                To safeguard privacy and prevent marketplace fraud, phone numbers and emails are automatically masked until service hiring is confirmed.
              </span>
            </div>

            {/* 3. Call Requests In-Feed Section */}
            {callRequests.length > 0 && (
              <div className="p-3 bg-white/70 border-b border-gray-200/80 space-y-2">
                {callRequests.slice(0, 2).map((req) => {
                  const isRequester = req.requesterUserId === user?.id;
                  const isPending = req.status === 'PENDING';
                  const isAccepted = req.status === 'ACCEPTED';

                  return (
                    <div
                      key={req.id}
                      className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                        isAccepted
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : req.status === 'DECLINED' || req.status === 'CANCELLED'
                          ? 'bg-gray-50 border-gray-200 text-gray-500'
                          : 'bg-blue-50/60 border-blue-200 text-blue-950'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isAccepted
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            <span>
                              Call Request: {req.requestedDate} at {req.requestedStartTime}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isAccepted
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : isPending
                                  ? 'bg-blue-200 text-blue-900'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5">
                            {isAccepted
                              ? '✓ Call scheduled. Connect securely through Vaziro without sharing private numbers.'
                              : isPending
                              ? isRequester
                                ? 'Waiting for the other party to confirm this time slot.'
                                : 'Requested a call with you at this time.'
                              : `Status: ${req.status}`}
                          </p>
                          {req.message && (
                            <p className="text-[11px] italic text-gray-500 mt-0.5">
                              "{req.message}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Interactive Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {isPending && !isRequester && (
                          <>
                            <button
                              onClick={() => handleAcceptCall(req.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition shadow-xs"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineCall(req.id)}
                              className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-[11px] transition"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {isPending && isRequester && (
                          <button
                            onClick={() => handleCancelCall(req.id)}
                            className="px-2.5 py-1 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg text-[11px] font-semibold transition"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-semibold text-gray-500">No messages yet</p>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
                    Say hello or clarify job specifics. Contact information is masked until hiring is completed.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderUserId === user?.id;

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md sm:max-w-lg p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        {/* Attachments rendering */}
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="mb-2 space-y-2">
                            {m.attachments.map((att) => {
                              const isImg = att.fileType?.startsWith('image/') || att.fileUrl.match(/\.(jpeg|jpg|png|webp)$/i);
                              if (isImg) {
                                return (
                                  <div
                                    key={att.id}
                                    className="cursor-pointer overflow-hidden rounded-xl border border-black/10 bg-black/5 hover:opacity-95 transition"
                                    onClick={() => setPreviewImage(att.fileUrl)}
                                  >
                                    <img
                                      src={att.fileUrl}
                                      alt={att.fileName || 'Attachment'}
                                      className="max-h-60 w-auto rounded-lg object-cover"
                                    />
                                  </div>
                                );
                              }
                              return (
                                <a
                                  key={att.id}
                                  href={att.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                                    isMe
                                      ? 'bg-emerald-700/60 border-emerald-500 text-white hover:bg-emerald-700'
                                      : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                                  }`}
                                >
                                  <FileText className="w-4 h-4 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold truncate text-[11px]">
                                      {att.fileName || 'Document'}
                                    </div>
                                    {att.fileSize && (
                                      <div className="text-[10px] opacity-75">
                                        {(att.fileSize / 1024).toFixed(0)} KB
                                      </div>
                                    )}
                                  </div>
                                  <Download className="w-3.5 h-3.5 opacity-80" />
                                </a>
                              );
                            })}
                          </div>
                        )}

                        {/* Content text */}
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>

                        {/* Redaction Notice if masked */}
                        {m.isContactWarning && (
                          <div
                            className={`mt-2 pt-1.5 border-t text-[10px] flex items-center gap-1 font-medium ${
                              isMe
                                ? 'border-emerald-500/50 text-emerald-100'
                                : 'border-amber-200 text-amber-800'
                            }`}
                          >
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>Contact info masked for privacy</span>
                          </div>
                        )}
                      </div>

                      {/* Timestamp & Status ticks */}
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 px-1">
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && (
                          <span>
                            {m.status === 'READ' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                            ) : m.status === 'DELIVERED' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-gray-400 inline" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-gray-400 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {otherIsTyping && (
                <div className="flex items-center gap-2 text-xs text-gray-500 italic py-1 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span>{activeOtherUser?.firstName || 'Participant'} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 5. Pending Attachment Pill */}
            {pendingAttachment && (
              <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold truncate">{pendingAttachment.fileName}</span>
                  <span className="text-[10px] text-emerald-700">
                    ({(pendingAttachment.fileSize / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingAttachment(null)}
                  className="p-1 hover:bg-emerald-200/50 rounded-full text-emerald-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 6. Dynamic Typing Safety Warning */}
            {isInputTriggeringSafetyWarning && (
              <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>Safety Tip:</strong> Contact details are masked until you hire. Use Vaziro chat and Request Call for protected communication.
                </span>
              </div>
            )}

            {/* 7. Blocked Banner or Message Input */}
            {selectedThread.isBlocked ? (
              <div className="p-4 bg-gray-100 border-t border-gray-200 text-center text-xs text-gray-600 font-semibold flex items-center justify-center gap-2">
                <Ban className="w-4 h-4 text-gray-500" />
                This conversation is currently blocked. Unblock from the menu to resume messaging.
              </div>
            ) : (
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
              >
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelected}
                  accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx"
                  className="hidden"
                />

                {/* Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAttachment}
                  className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 rounded-xl transition shrink-0 disabled:opacity-50"
                  title="Attach file or photo (max 10MB)"
                >
                  {uploadingAttachment ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={sending || (!newMessage.trim() && !pendingAttachment)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Empty Selection State */
          <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 text-gray-400 text-xs">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-gray-700">Select a Conversation</h4>
            <p className="text-xs text-gray-400 max-w-xs mt-1">
              Choose a discussion thread from the left to start messaging, request calls, or share project documents.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedThread && (
        <>
          <CallRequestModal
            isOpen={isCallModalOpen}
            onClose={() => setIsCallModalOpen(false)}
            conversationId={selectedThread.id}
            otherPartyName={`${activeOtherUser?.firstName || 'Participant'} ${activeOtherUser?.lastName || ''}`.trim()}
            onSuccess={(newCall) => {
              setCallRequests((prev) => [newCall, ...prev]);
            }}
          />

          <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            conversationId={selectedThread.id}
            reportedUserId={activeOtherParticipant?.userId || ''}
            reportedUserName={`${activeOtherUser?.firstName || 'Participant'} ${activeOtherUser?.lastName || ''}`.trim()}
          />
        </>
      )}

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Enlarged preview"
              className="max-h-[85vh] w-auto rounded-lg shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
