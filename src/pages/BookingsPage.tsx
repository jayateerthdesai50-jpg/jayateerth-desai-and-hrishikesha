import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  XCircle,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Compass,
  Swords,
  Loader2,
} from 'lucide-react';
import { Booking } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { CreateMatchModal } from '../components/CreateMatchModal.tsx';

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  // Match creation prefilled from booking
  const [createMatchOpen, setCreateMatchOpen] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    api.bookings
      .list()
      .then((data) => setBookings(data))
      .catch((err) => console.error('Failed to load bookings:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') {
      return b.status === 'Confirmed' && b.date >= todayStr;
    }
    if (activeTab === 'COMPLETED') {
      return b.status === 'Completed' || (b.status === 'Confirmed' && b.date < todayStr);
    }
    if (activeTab === 'CANCELLED') {
      return b.status === 'Cancelled';
    }
    return true;
  });

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancellingId(cancelModalBooking.id);
    try {
      await api.bookings.cancel(cancelModalBooking.id);
      fetchBookings();
      setCancelModalBooking(null);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Reservation Ledger</span>
            <span>·</span>
            <span>Real-Time Status</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            My Court Reservations
          </h1>
          <p className="text-sm text-slate-400">
            Track your upcoming sessions, view booking confirmations, or cancel reservations with automated refunds.
          </p>
        </div>

        <Link
          to="/courts"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Compass className="w-4 h-4" />
          <span>Book Another Court</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 w-fit">
        {(['UPCOMING', 'ALL', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading your reservations...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 rounded-3xl border border-dashed border-slate-800 space-y-3">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Reservations Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You don't have any {activeTab.toLowerCase()} court bookings. Discover available courts across the city.
          </p>
          <Link
            to="/courts"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950"
          >
            Explore Courts & Slots
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBookings.map((b) => {
            const isUpcoming = b.status === 'Confirmed' && b.date >= todayStr;
            const isCancelled = b.status === 'Cancelled';

            return (
              <div
                key={b.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">
                        {b.bookingNumber}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-0.5">{b.facilityName}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{b.courtName} · {b.surface}</span>
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        isCancelled
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : isUpcoming
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800/80 my-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>{b.date} · {b.startTime} - {b.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>{b.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Transaction ID: <span className="font-mono text-slate-300">{b.transactionId}</span></span>
                    <span className="text-sm font-bold text-white font-mono">₹{b.totalAmount}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  {isUpcoming ? (
                    <>
                      <button
                        onClick={() => setCreateMatchOpen(true)}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Schedule Match Challenge</span>
                      </button>

                      <button
                        onClick={() => setCancelModalBooking(b)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    </>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      {isCancelled ? 'Booking was refunded.' : 'Session completed.'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Cancel Court Reservation?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to cancel booking <strong className="text-white">{cancelModalBooking.bookingNumber}</strong> at {cancelModalBooking.facilityName}? The time slot will be reopened to other players and your mock payment of ₹{cancelModalBooking.totalAmount} will be refunded.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={!!cancellingId}
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2"
              >
                {cancellingId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Cancellation & Refund</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Modal */}
      <CreateMatchModal
        isOpen={createMatchOpen}
        onClose={() => setCreateMatchOpen(false)}
        onMatchCreated={() => navigate('/matches')}
      />
    </div>
  );
};
