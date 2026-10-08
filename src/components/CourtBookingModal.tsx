import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, CreditCard, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Facility, Court, CourtSlot } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface CourtBookingModalProps {
  facility: Facility;
  initialCourt?: Court;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const CourtBookingModal: React.FC<CourtBookingModalProps> = ({
  facility,
  initialCourt,
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const { user } = useAuth();

  // Selection states
  const [selectedCourtId, setSelectedCourtId] = useState<string>(
    initialCourt?.id || (facility.courts && facility.courts[0]?.id) || ''
  );

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowStr());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card (Mock)');

  // Data fetching states
  const [slots, setSlots] = useState<CourtSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Sync initialCourt if changed
  useEffect(() => {
    if (initialCourt) {
      setSelectedCourtId(initialCourt.id);
    } else if (facility.courts && facility.courts.length > 0) {
      setSelectedCourtId(facility.courts[0].id);
    }
  }, [initialCourt, facility]);

  // Fetch slot availability when court or date changes
  useEffect(() => {
    if (!selectedCourtId || !selectedDate) return;

    let isMounted = true;
    setLoadingSlots(true);
    setError(null);
    setSelectedSlot(null);

    api.courts
      .getAvailability(selectedCourtId, selectedDate)
      .then((data) => {
        if (isMounted) {
          setSlots(data.slots || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch court time slot availability.');
        }
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCourtId, selectedDate]);

  if (!isOpen) return null;

  const currentCourt =
    facility.courts?.find((c) => c.id === selectedCourtId) || initialCourt || facility.courts?.[0];

  const pricePerHour = currentCourt?.pricePerHour || 25;
  const subtotal = pricePerHour * durationHours;
  const facilityFee = 2;
  const totalAmount = subtotal + facilityFee;

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await api.bookings.create({
        facilityId: facility.id,
        courtId: selectedCourtId,
        date: selectedDate,
        startTime: selectedSlot,
        durationHours,
        paymentMethod,
      });

      setConfirmedBooking(result);
      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      onBookingSuccess();
    } catch (err: any) {
      setError(err.message || 'Could not complete booking. Please try another slot.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <span>Court Reservation Flow</span>
              <span>·</span>
              <span>{facility.city}</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">{facility.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{facility.address}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {confirmedBooking ? (
            /* Confirmation Success Card */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white">Court Reserved Successfully!</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Your reservation is confirmed. We have sent confirmation details to your notifications.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Booking Reference:</span>
                  <span className="font-mono font-bold text-emerald-400">{confirmedBooking.bookingNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Court:</span>
                  <span className="font-semibold text-white">{currentCourt?.courtNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Surface Type:</span>
                  <span className="text-slate-300">{currentCourt?.surface}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Date & Slot:</span>
                  <span className="font-semibold text-white">
                    {confirmedBooking.date} · {confirmedBooking.startTime} - {confirmedBooking.endTime}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Total Paid (Mock):</span>
                  <span className="font-bold text-emerald-400">${confirmedBooking.totalAmount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-mono text-slate-400">{confirmedBooking.transactionId}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  View in My Bookings
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <>
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Court Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  1. Select Court
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {facility.courts && facility.courts.length > 0 ? (
                    facility.courts.map((court) => (
                      <button
                        key={court.id}
                        type="button"
                        onClick={() => setSelectedCourtId(court.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedCourtId === court.id
                            ? 'bg-emerald-500/10 border-emerald-500/60 text-white shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-xs text-white">{court.courtNumber}</p>
                          <span className="text-xs font-bold text-emerald-400">${court.pricePerHour}/hr</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {court.type} · {court.surface}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-xs text-slate-400">No courts listed for this facility.</div>
                  )}
                </div>
              </div>

              {/* Step 2: Date Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Booking Date</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Duration</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDurationHours(1)}
                      className={`py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        durationHours === 1
                          ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      1 Hour
                    </button>
                    <button
                      type="button"
                      onClick={() => setDurationHours(2)}
                      className={`py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        durationHours === 2
                          ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      2 Hours
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3: Available Time Slots */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    3. Select Time Slot
                  </label>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-600" /> Booked
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> Maintenance
                    </span>
                  </div>
                </div>

                {loadingSlots ? (
                  <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Checking live court schedule...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {slots.map((s) => {
                      const isAvailable = s.status === 'AVAILABLE';
                      const isSelected = selectedSlot === s.time;

                      return (
                        <button
                          key={s.time}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => setSelectedSlot(s.time)}
                          className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 font-bold ring-2 ring-emerald-400 shadow-md shadow-emerald-500/30'
                              : isAvailable
                              ? 'bg-slate-950 border border-slate-800 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800'
                              : s.status === 'BLOCKED'
                              ? 'bg-amber-950/20 border border-amber-900/30 text-amber-500/60 cursor-not-allowed'
                              : 'bg-slate-950/40 border border-slate-900 text-slate-600 cursor-not-allowed line-through'
                          }`}
                        >
                          {s.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 4: Payment Summary & Mock Checkout */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Court Fee ({durationHours} hr @ ₹{pricePerHour}/hr):</span>
                  <span className="font-semibold text-white">₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Amenities & Lighting Fee:</span>
                  <span className="font-semibold text-white">₹{facilityFee}</span>
                </div>
                <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-white">Total Amount:</span>
                  <span className="font-bold text-emerald-400 text-base">₹{totalAmount}</span>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3 text-emerald-400" />
                    <span>Payment Method (Indian UPI & Cards Sandbox)</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="UPI (GPay / PhonePe / Paytm)">UPI (GPay / PhonePe / Paytm Mock)</option>
                    <option value="Credit/Debit Card (RuPay / Visa)">RuPay / Visa / Mastercard</option>
                    <option value="Net Banking (SBI / HDFC / ICICI)">Net Banking (SBI / HDFC / ICICI)</option>
                    <option value="Pay at Badminton Club Counter">Pay at Venue Counter</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Backend Anti-Double Booking Guard Active</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedSlot || submitting}
                    onClick={handleConfirmBooking}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                      selectedSlot && !submitting
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{submitting ? 'Confirming Reservation...' : 'Confirm & Reserve Slot'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
