import React, { useState, useEffect, useRef } from 'react';
import { getApiUrl } from '../utils/api';
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Calendar,
  MapPin,
  Utensils,
  ShieldCheck,
  Plane,
  Train,
  Bus,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  History,
  Plus,
  Check,
  ArrowRight,
  RefreshCw,
  X,
  Receipt,
  Lock,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  createdAt: Date | string;
}

interface SavedConversation {
  id: string;
  title: string;
  destination?: string;
  messages: Message[];
  updatedAt?: string;
  createdAt?: string;
}

interface BookingRecord {
  bookingId: string;
  destination: string;
  amount: number;
  currency: string;
  status: string;
  travelers: number;
  duration: string;
  payment: {
    gateway: string;
    mode: string;
    orderId: string;
    paymentId: string;
    paidAt: string;
  };
  createdAt: string;
}

interface TripPlannerProps {
  initialDestination?: string;
  onOpenAuth: () => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const TripPlanner: React.FC<TripPlannerProps> = ({ initialDestination = '', onOpenAuth }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        "Namaste! ✈️ I'm Travel Genie — your pan-India AI travel companion.\n\nTell me your trip plan! Where are you starting from, where would you like to go, travel dates, traveller count, and total budget in INR?\n\nExample: *\"I want to travel from Mumbai to Varanasi for 4 days with 2 friends, budget ₹40,000\"*",
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState(initialDestination ? `I want to travel to ${initialDestination}` : '');
  const [loading, setLoading] = useState(false);
  const [transportData, setTransportData] = useState<{ flights: any[]; trains: any[]; buses: any[] } | null>(null);
  const [user, setUser] = useState<{ id?: string; email: string; name?: string } | null>(null);
  
  // Chat History State
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string>(() => `conv_${Date.now().toString(36)}`);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Active Destination and Itinerary Detection
  const [detectedDestination, setDetectedDestination] = useState<string>(initialDestination);

  // Razorpay Payment States
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{
    state: 'idle' | 'processing' | 'success' | 'failed';
    booking?: BookingRecord;
    error?: string;
  }>({ state: 'idle' });
  const [activeTab, setActiveTab] = useState<'transport' | 'bookings'>('transport');
  const [userBookings, setUserBookings] = useState<BookingRecord[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check user authentication
  const checkUserAuth = () => {
    try {
      const stored = localStorage.getItem('travelgenie_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        return parsed;
      } else {
        setUser(null);
        setConversations([]);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const currentUser = checkUserAuth();
    if (currentUser?.email) {
      loadChatHistory(currentUser.email);
      fetchUserBookings();
    }

    const handleStorageChange = () => {
      const updatedUser = checkUserAuth();
      if (updatedUser?.email) {
        loadChatHistory(updatedUser.email);
        fetchUserBookings();
      } else {
        setUser(null);
        setConversations([]);
        setUserBookings([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch real transport samples from database
  useEffect(() => {
    fetch(getApiUrl('/api/transport'))
      .then((res) => res.json())
      .then((data) => setTransportData(data))
      .catch(() => {});
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load chat history from backend
  const loadChatHistory = async (userEmail?: string) => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('travelgenie_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (userEmail) headers['x-user-email'] = userEmail;

      const res = await fetch(getApiUrl('/api/chat/history'), { headers });
      const data = await res.json();
      if (data.conversations && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        // If there's an existing conversation and no prompt yet, load the latest
        if (data.conversations.length > 0 && !initialDestination) {
          const latest = data.conversations[0];
          setActiveConvoId(latest.id);
          if (latest.destination) setDetectedDestination(latest.destination);
          if (latest.messages && latest.messages.length > 0) {
            setMessages(latest.messages);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch confirmed bookings
  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('travelgenie_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(getApiUrl('/api/bookings'), { headers });
      const data = await res.json();
      if (data.bookings) {
        setUserBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  // Switch to a previous conversation
  const handleSelectConversation = (convo: SavedConversation) => {
    setActiveConvoId(convo.id);
    setMessages(convo.messages || []);
    if (convo.destination) setDetectedDestination(convo.destination);
    setShowHistoryDropdown(false);
    setPaymentStatus({ state: 'idle' });
  };

  // Start a fresh new trip plan
  const handleStartNewTrip = () => {
    const newId = `conv_${Date.now().toString(36)}`;
    setActiveConvoId(newId);
    setDetectedDestination('');
    setPaymentStatus({ state: 'idle' });
    setMessages([
      {
        id: 'init-1',
        role: 'assistant',
        content:
          "Namaste! ✈️ I'm Travel Genie — your pan-India AI travel companion.\n\nTell me your next destination! What dates, party size, and estimated budget do you have in mind?",
        createdAt: new Date(),
      },
    ]);
    setShowHistoryDropdown(false);
  };

  const quickPrompts = [
    { label: 'Best time to visit?', query: 'What is the best time to visit this destination?', icon: Calendar },
    { label: 'How to reach?', query: 'How to reach this city by flight, train, or bus?', icon: MapPin },
    { label: 'Food & Cuisine', query: 'Recommend top local food and culinary spots', icon: Utensils },
    { label: 'Night Safety', query: 'Is it safe at night in this destination?', icon: ShieldCheck },
  ];

  // Send message
  const handleSend = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: text,
      createdAt: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('travelgenie_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversationId: activeConvoId,
          userEmail: user?.email || '',
          destination: detectedDestination,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            role: 'assistant',
            content: `⚠️ ${data.error || 'Travel engine connection error'}`,
            createdAt: new Date(),
          },
        ]);
        return;
      }

      if (data.matchedDestination) {
        setDetectedDestination(data.matchedDestination);
      } else if (!detectedDestination) {
        // Simple extract
        const match = text.match(/(?:to|in|visit)\s+([A-Z][a-zA-Z\s]{2,15})/);
        if (match && match[1]) setDetectedDestination(match[1].trim());
      }

      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: data.reply,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If user is authenticated, refresh conversation list in background
      if (user?.email) {
        loadChatHistory(user.email);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: `⚠️ Could not reach the AI service: ${err.message || 'Network error'}`,
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Determine whether an itinerary has been discussed/generated
  const hasItineraryOrPlan =
    messages.length >= 2 &&
    messages.some(
      (m) =>
        m.role === 'assistant' &&
        (m.content.toLowerCase().includes('day 1') ||
          m.content.toLowerCase().includes('day-') ||
          m.content.toLowerCase().includes('itinerary') ||
          m.content.toLowerCase().includes('budget') ||
          m.content.toLowerCase().includes('hotel') ||
          m.content.toLowerCase().includes('recommend'))
    );

  const displayDestination = detectedDestination || initialDestination || 'Custom Indian Tour';

  // Helper to ensure Razorpay checkout script is loaded
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        return resolve(true);
      }
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        if ((window as any).Razorpay) return resolve(true);
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Razorpay Test Mode Payment Handler
  const handleProceedToPayment = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatus({ state: 'processing' });

    try {
      // 1. Ensure Razorpay Checkout SDK is ready
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || typeof (window as any).Razorpay !== 'function') {
        throw new Error('Razorpay Checkout SDK could not be loaded. Please check your network connection.');
      }

      const token = localStorage.getItem('travelgenie_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 2. Create real order on backend
      const orderRes = await fetch(getApiUrl('/api/payment/create-order'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: 1499,
          destination: displayDestination,
          travelers: 2,
          duration: '4 Days / 3 Nights',
          bookingDetails: {
            destination: displayDestination,
            userEmail: user.email,
            userName: user.name || user.email.split('@')[0],
            travelers: 2,
            duration: '4 Days / 3 Nights',
            amount: 1499,
            itinerarySummary: `Personalized travel itinerary and reservations for ${displayDestination}`,
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || 'Failed to initialize payment order');
      }

      // 3. Open real Razorpay Checkout modal
      const options = {
        key: orderData.keyId || orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Travel Genie',
        description: `Advance Itinerary Lock-in · ${displayDestination}`,
        image: 'https://res.cloudinary.com/soootttd/image/upload/v1/travelgenie/logo.png',
        order_id: orderData.orderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          // 4. Verify payment on backend with cryptographic signature
          await verifyPaymentOnBackend(response, orderData);
        },
        prefill: {
          name: user.name || user.email.split('@')[0],
          email: user.email,
          contact: '9876543210',
        },
        notes: {
          destination: displayDestination,
          booking_type: 'itinerary_reservation',
        },
        theme: {
          color: '#c2410c',
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setPaymentStatus((prev) => (prev.state === 'processing' ? { state: 'idle' } : prev));
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setIsProcessingPayment(false);
        const errorMsg = response.error?.description || response.error?.reason || 'Transaction declined or cancelled';
        setPaymentStatus({ state: 'failed', error: errorMsg });

        // Record failure on backend
        fetch(getApiUrl('/api/payment/failed'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.orderId,
            error: errorMsg,
            bookingDetails: { userEmail: user.email },
          }),
        }).catch(() => {});
      });

      rzp.open();
    } catch (err: any) {
      setIsProcessingPayment(false);
      setPaymentStatus({ state: 'failed', error: err.message || 'Payment initiation error' });
    }
  };

  // Verify Razorpay payment on backend
  const verifyPaymentOnBackend = async (
    rzpResponse: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
    orderData: any
  ) => {
    setIsProcessingPayment(true);
    setPaymentStatus({ state: 'processing' });
    try {
      const token = localStorage.getItem('travelgenie_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const verifyRes = await fetch(getApiUrl('/api/payment/verify'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          razorpay_order_id: rzpResponse.razorpay_order_id,
          razorpay_payment_id: rzpResponse.razorpay_payment_id,
          razorpay_signature: rzpResponse.razorpay_signature,
          bookingDetails: {
            destination: displayDestination,
            userEmail: user?.email,
            userName: user?.name,
            travelers: 2,
            duration: '4 Days / 3 Nights',
            amount: 1499,
            itinerarySummary: `Personalized travel itinerary and hotel reservations for ${displayDestination}`,
          },
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || (!verifyData.success && !verifyData.verified)) {
        throw new Error(verifyData.error || 'Payment verification failed on the server');
      }

      setPaymentStatus({
        state: 'success',
        booking: verifyData.booking || {
          bookingId: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
          destination: displayDestination,
          amount: 1499,
          currency: 'INR',
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          payment: {
            razorpayPaymentId: rzpResponse.razorpay_payment_id,
            razorpayOrderId: rzpResponse.razorpay_order_id,
            status: 'captured',
          },
        },
      });
      fetchUserBookings();

      // Post confirmation note into chat
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: `🎉 **Booking Confirmed! (Razorpay Test Mode)**\n\n- **Destination:** ${displayDestination}\n- **Booking ID:** \`${verifyData.booking.bookingId}\`\n- **Payment ID:** \`${verifyData.booking.payment.paymentId}\`\n- **Amount Paid:** ₹1,499 INR\n\nYour travel concierge has locked in your itinerary preferences and verified transport routes. We're ready for your Indian adventure!`,
          createdAt: new Date(),
        },
      ]);
    } catch (err: any) {
      setPaymentStatus({
        state: 'failed',
        error: err.message || 'Failed to verify payment',
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row bg-[var(--color-cream)] overflow-hidden">
      {/* Left Chat Column */}
      <div className="flex-1 flex flex-col h-full bg-white border-r border-[var(--color-border)]">
        {/* Chat Header */}
        <div className="p-4 px-6 border-b border-[var(--color-border)] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-amber-300 shadow-xs">
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[var(--color-primary)]">Travel Genie Concierge</h2>
                {displayDestination && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {displayDestination}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active · Grounded Travel Intelligence
              </span>
            </div>
          </div>

          {/* User History Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-white text-xs font-semibold text-[var(--color-primary)] transition-all shadow-2xs"
                    title="View your saved chat history"
                  >
                    <History size={14} className="text-[var(--color-accent)]" />
                    <span>Saved Trips</span>
                    {conversations.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[var(--color-accent)] text-white text-[10px] flex items-center justify-center font-bold">
                        {conversations.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={handleStartNewTrip}
                    className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-white text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
                    title="Start fresh new conversation"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Dropdown for Chat History */}
                {showHistoryDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-[var(--color-border)] p-2 z-50 animate-in fade-in">
                    <div className="p-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--color-primary)]">Your Trip Histories</span>
                      <span className="text-[10px] text-gray-500">{user.email}</span>
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                      {historyLoading ? (
                        <div className="py-4 text-center text-xs text-gray-400">Loading your chats...</div>
                      ) : conversations.length === 0 ? (
                        <div className="py-4 text-center text-xs text-gray-400">
                          No previous trip chats saved yet.
                        </div>
                      ) : (
                        conversations.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleSelectConversation(c)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                              activeConvoId === c.id
                                ? 'bg-amber-50 text-[var(--color-accent)] font-semibold border border-amber-200'
                                : 'hover:bg-[var(--color-surface)] text-[var(--color-primary)]'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <p className="truncate font-medium">{c.title || 'Travel Plan'}</p>
                              <span className="text-[10px] text-[var(--color-muted)]">
                                {c.messages?.length || 0} messages
                              </span>
                            </div>
                            {activeConvoId === c.id && <Check size={14} className="text-[var(--color-accent)] shrink-0" />}
                          </button>
                        ))
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={handleStartNewTrip}
                        className="w-full py-1.5 px-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Plus size={14} />
                        <span>Plan New Destination</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1"
              >
                <Lock size={12} />
                <span>Sign In to Save Chats</span>
              </button>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === 'user' ? 'bg-amber-600 text-white' : 'bg-[var(--color-accent)] text-white'
                }`}
              >
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-amber-300" />}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-[var(--color-accent)] text-white rounded-tr-none'
                    : 'bg-[var(--color-surface)] text-[var(--color-primary)] rounded-tl-none border border-[var(--color-border)]'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] pl-11">
              <Loader2 size={16} className="animate-spin text-[var(--color-accent)]" />
              <span>Consulting destination knowledge base, routes & budget estimates...</span>
            </div>
          )}

          {/* PAYMENT OPTION PROMPT (Appears when itinerary/plan is discussed) */}
          {hasItineraryOrPlan && (
            <div className="pl-11 pt-2">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700">
                      Razorpay Test Mode Booking Flow
                    </span>
                    <h4 className="text-sm sm:text-base font-serif font-bold text-[var(--color-primary)] mt-0.5">
                      Lock In Your {displayDestination} Itinerary
                    </h4>
                    <p className="text-xs text-[var(--color-secondary)] mt-1">
                      Reserve this custom travel plan with advance booking support, verified transit coordination, and hotel allocations.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold text-amber-900 block">₹1,499</span>
                    <span className="text-[10px] text-amber-700 font-medium">Test Advance Fee</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--color-secondary)] pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>24/7 AI Grounded Concierge</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>Verified Hotel & Fare Rates</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>Sandbox Test Mode Transaction</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>100% Refundable Sandbox Deposit</span>
                  </div>
                </div>

                {/* Payment Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleProceedToPayment}
                    disabled={isProcessingPayment}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[var(--color-accent)] hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Initializing Razorpay...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={14} />
                        <span>Proceed to Payment (Razorpay Test Mode)</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Lock size={11} className="text-emerald-600" />
                    <span>Powered by Razorpay Sandbox · Test Mode</span>
                  </span>
                </div>

                {/* Error Banner if Payment Failed */}
                {paymentStatus.state === 'failed' && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Payment Failed or Declined</p>
                      <p className="text-[11px] text-red-600 mt-0.5">{paymentStatus.error}</p>
                      <button
                        onClick={handleProceedToPayment}
                        className="mt-2 text-[11px] font-bold text-red-800 underline"
                      >
                        Retry Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* Success Banner */}
                {paymentStatus.state === 'success' && paymentStatus.booking && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Payment Verified & Confirmed!</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Booking Reference: <strong>{paymentStatus.booking.bookingId}</strong> · Payment ID:{' '}
                      <code>{paymentStatus.booking.payment.paymentId}</code>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0">
          {quickPrompts.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="px-3 py-1.5 rounded-full bg-white border border-[var(--color-border)] text-xs text-[var(--color-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-primary)] transition-all flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                <Icon size={12} className="text-[var(--color-accent)]" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-[var(--color-border)] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your travel plan or question..."
              className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-2.5 text-xs sm:text-sm text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Transport & Bookings Sidebar */}
      <div className="hidden lg:flex w-96 flex-col bg-[var(--color-surface)] border-l border-[var(--color-border)] p-5 overflow-y-auto space-y-5">
        {/* Toggle between Transport Insights & User Bookings */}
        <div className="flex rounded-lg bg-white p-1 border border-[var(--color-border)] shadow-2xs">
          <button
            onClick={() => setActiveTab('transport')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'transport'
                ? 'bg-[var(--color-accent)] text-white shadow-2xs'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
            }`}
          >
            Transit Routes
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'bookings'
                ? 'bg-[var(--color-accent)] text-white shadow-2xs'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
            }`}
          >
            <Receipt size={13} />
            <span>My Bookings ({userBookings.length})</span>
          </button>
        </div>

        {activeTab === 'transport' ? (
          <>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[var(--color-accent)]">
                Verified Connections
              </span>
              <h3 className="text-base font-serif font-bold text-[var(--color-primary)] mt-1">
                Grounded Transport Routes
              </h3>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Real transit schedules and verified fare ranges.
              </p>
            </div>

            {/* Transport list */}
            {transportData && (
              <div className="space-y-4">
                {/* Flights */}
                {transportData.flights && transportData.flights.length > 0 && (
                  <div className="p-3.5 bg-white rounded-xl border border-[var(--color-border)] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)]">
                      <Plane size={14} className="text-sky-600" />
                      <span>Available Domestic Flights</span>
                    </div>
                    {transportData.flights.slice(0, 3).map((f, i) => (
                      <div key={i} className="text-xs text-[var(--color-secondary)] pt-1 border-t border-gray-100 flex justify-between">
                        <div>
                          <span className="font-semibold text-gray-800">{f.airline}</span> ({f.flightNumber})
                          <p className="text-[10px] text-gray-400">{f.departureTime} → {f.arrivalTime}</p>
                        </div>
                        <span className="font-bold text-[var(--color-accent)]">₹{f.fare?.economy?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Trains */}
                {transportData.trains && transportData.trains.length > 0 && (
                  <div className="p-3.5 bg-white rounded-xl border border-[var(--color-border)] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)]">
                      <Train size={14} className="text-emerald-600" />
                      <span>Railway Express Connections</span>
                    </div>
                    {transportData.trains.slice(0, 3).map((t, i) => (
                      <div key={i} className="text-xs text-[var(--color-secondary)] pt-1 border-t border-gray-100 flex justify-between">
                        <div>
                          <span className="font-semibold text-gray-800">{t.trainName}</span> (#{t.trainNumber})
                          <p className="text-[10px] text-gray-400">{t.departureTime} → {t.arrivalTime}</p>
                        </div>
                        <span className="font-bold text-emerald-700">₹{t.fare?.ac3tier?.toLocaleString() || t.fare?.sleeper || 800}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Buses */}
                {transportData.buses && transportData.buses.length > 0 && (
                  <div className="p-3.5 bg-white rounded-xl border border-[var(--color-border)] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)]">
                      <Bus size={14} className="text-amber-600" />
                      <span>Intercity Bus Routes</span>
                    </div>
                    {transportData.buses.slice(0, 3).map((b, i) => (
                      <div key={i} className="text-xs text-[var(--color-secondary)] pt-1 border-t border-gray-100 flex justify-between">
                        <div>
                          <span className="font-semibold text-gray-800">{b.operator}</span>
                          <p className="text-[10px] text-gray-400">{b.type || 'Sleeper'} · {b.departureTime}</p>
                        </div>
                        <span className="font-bold text-amber-800">₹{b.fare?.semi_sleeper || b.fare?.seater || 650}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Razorpay Quick Booking CTA */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-amber-700" />
                <span className="font-bold text-amber-900">Razorpay Test Mode Booking</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                Complete your conversation, then click <strong>Proceed to Payment</strong> to lock in your custom itinerary using Razorpay sandbox credentials.
              </p>
              {hasItineraryOrPlan && (
                <button
                  onClick={handleProceedToPayment}
                  disabled={isProcessingPayment}
                  className="w-full mt-2 py-2 rounded-lg bg-[var(--color-accent)] text-white font-semibold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <CreditCard size={14} />
                  <span>Pay ₹1,499 Advance (Test Mode)</span>
                </button>
              )}
            </div>
          </>
        ) : (
          /* Bookings Tab */
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
                Verified Records
              </span>
              <h3 className="text-base font-serif font-bold text-[var(--color-primary)] mt-1">
                Your Confirmed Bookings
              </h3>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Persisted in the database under your account.
              </p>
            </div>

            {userBookings.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-xl border border-[var(--color-border)] space-y-2">
                <Receipt size={24} className="text-gray-300 mx-auto" />
                <p className="text-xs font-medium text-gray-600">No confirmed bookings yet</p>
                <p className="text-[11px] text-gray-400">
                  When you complete an itinerary payment, your confirmed receipt will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userBookings.map((b) => (
                  <div key={b.bookingId} className="p-3.5 bg-white rounded-xl border border-[var(--color-border)] space-y-2 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                          Confirmed (Test Mode)
                        </span>
                        <h4 className="text-xs font-bold text-[var(--color-primary)]">{b.destination}</h4>
                      </div>
                      <span className="text-xs font-bold text-amber-800">₹{b.amount}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 space-y-0.5 pt-1 border-t border-gray-100">
                      <div>Booking ID: <code className="text-gray-800">{b.bookingId}</code></div>
                      <div>Payment ID: <code className="text-gray-800">{b.payment.paymentId}</code></div>
                      <div>Paid: {new Date(b.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
