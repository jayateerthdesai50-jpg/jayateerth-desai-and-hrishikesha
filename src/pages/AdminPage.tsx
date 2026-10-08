import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  Plus,
  Users,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Lock,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Facility, Court, Booking } from '../types.ts';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();

  const [overview, setOverview] = useState<any | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FACILITIES' | 'BOOKINGS' | 'PLAYERS'>('OVERVIEW');

  // Modals
  const [addFacilityOpen, setAddFacilityOpen] = useState(false);
  const [addCourtOpen, setAddCourtOpen] = useState(false);
  const [selectedFacilityForCourt, setSelectedFacilityForCourt] = useState<string>('');
  const [blockSlotOpen, setBlockSlotOpen] = useState(false);
  const [selectedCourtForBlock, setSelectedCourtForBlock] = useState<string>('');

  // Form states
  const [facilityName, setFacilityName] = useState('');
  const [facilityAddress, setFacilityAddress] = useState('');
  const [facilityCity, setFacilityCity] = useState('Bengaluru');
  const [facilityPriceRange, setFacilityPriceRange] = useState('₹450 - ₹750/hr');
  const [facilityDescription, setFacilityDescription] = useState('');

  const [courtNumber, setCourtNumber] = useState('');
  const [courtSurface, setCourtSurface] = useState('BWF Synthetic Mat');
  const [courtPrice, setCourtPrice] = useState(450);

  const [blockDate, setBlockDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [blockTime, setBlockTime] = useState('14:00');
  const [blockReason, setBlockReason] = useState('Net replacement & floor cleaning');

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadAdminData = () => {
    setLoading(true);
    Promise.all([
      api.admin.getOverview(),
      api.facilities.list(),
      api.bookings.list({ all: true }),
    ])
      .then(([ov, facs, bks]) => {
        setOverview(ov);
        setFacilities(facs);
        setAllBookings(bks);
        if (facs.length > 0 && !selectedFacilityForCourt) {
          setSelectedFacilityForCourt(facs[0].id);
        }
      })
      .catch((err) => console.error('Admin loading failed:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityName || !facilityAddress) return;
    setSubmitting(true);
    try {
      await api.facilities.create({
        name: facilityName,
        address: facilityAddress,
        city: facilityCity,
        priceRange: facilityPriceRange,
        description: facilityDescription,
      });
      setAddFacilityOpen(false);
      setFacilityName('');
      setFacilityAddress('');
      setMsg('Facility added successfully!');
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacilityForCourt || !courtNumber) return;
    setSubmitting(true);
    try {
      await api.courts.create({
        facilityId: selectedFacilityForCourt,
        courtNumber,
        surface: courtSurface as any,
        pricePerHour: Number(courtPrice),
      });
      setAddCourtOpen(false);
      setCourtNumber('');
      setMsg('Court created successfully!');
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourtForBlock || !blockDate || !blockTime) return;
    setSubmitting(true);
    try {
      await api.courts.blockSlot(selectedCourtForBlock, {
        date: blockDate,
        time: blockTime,
        reason: blockReason,
      });
      setBlockSlotOpen(false);
      setMsg('Slot blocked for maintenance successfully!');
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await api.bookings.updateStatus(bookingId, status);
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const metrics = overview?.metrics || {
    totalUsers: 0,
    totalFacilities: 0,
    totalCourts: 0,
    todayBookingsCount: 0,
    totalRevenue: 0,
    cancellationRate: 0,
    courtUtilizationRate: 0,
    totalMatchesRecorded: 0,
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Facility Management & Analytics</span>
            <span>·</span>
            <span>Admin Operator Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Arena & Platform Operations
          </h1>
          <p className="text-sm text-slate-400">
            Audit daily court utilization, manage BWF court inventories, block maintenance hours, and inspect platform revenues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddFacilityOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Facility</span>
          </button>
          <button
            onClick={() => setAddCourtOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Add Court</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 w-fit">
        {(['OVERVIEW', 'FACILITIES', 'BOOKINGS'] as const).map((tab) => (
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

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading admin ledger...</div>
      ) : activeTab === 'OVERVIEW' ? (
        /* Overview Dashboard */
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs font-medium text-slate-400">Today's Reservations</span>
              <div className="text-3xl font-extrabold text-white font-mono">{metrics.todayBookingsCount}</div>
              <p className="text-[11px] text-emerald-400">Live active sessions</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs font-medium text-slate-400">Cumulative Gross Revenue</span>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">₹{metrics.totalRevenue}</div>
              <p className="text-[11px] text-slate-400">Processed through mock gateway</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs font-medium text-slate-400">Court Utilization Rate</span>
              <div className="text-3xl font-extrabold text-teal-400 font-mono">{metrics.courtUtilizationRate}%</div>
              <p className="text-[11px] text-slate-400">{metrics.totalCourts} courts active</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs font-medium text-slate-400">Cancellation Rate</span>
              <div className="text-3xl font-extrabold text-white font-mono">{metrics.cancellationRate}%</div>
              <p className="text-[11px] text-slate-400">Refund threshold within limits</p>
            </div>
          </div>

          {/* Booking Trends & Popular Courts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Trend Chart (Last 7 days) */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>7-Day Reservation & Revenue Velocity</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">Daily volume</span>
              </div>

              <div className="grid grid-cols-7 gap-2 pt-4 items-end h-48">
                {overview?.dailyTrend?.map((item: any, idx: number) => {
                  const maxB = 10;
                  const heightPct = Math.min(100, Math.max(15, (item.bookings / maxB) * 100));

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{item.bookings} bks</span>
                      <div
                        className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/40 rounded-t-lg transition-all"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popular Courts */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Top Utilized Courts</span>
              </h3>

              <div className="space-y-3">
                {overview?.popularCourts?.map((c: any) => (
                  <div
                    key={c.courtId}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{c.courtName}</p>
                      <p className="text-[10px] text-slate-400">{c.facilityName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400">{c.bookingCount} bookings</span>
                      <p className="text-[10px] text-slate-400">₹{c.pricePerHour}/hr</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'FACILITIES' ? (
        /* Facilities & Courts Manager */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {facilities.map((fac) => (
              <div key={fac.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{fac.name}</h3>
                    <p className="text-xs text-slate-400">{fac.address}, {fac.city}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{fac.priceRange}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">Configured Courts</span>
                  <div className="space-y-1.5">
                    {fac.courts?.map((court) => (
                      <div
                        key={court.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-white">{court.courtNumber}</span>
                          <p className="text-[10px] text-slate-400">{court.surface} · ₹{court.pricePerHour}/hr</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCourtForBlock(court.id);
                            setBlockSlotOpen(true);
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                        >
                          Block Slot
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* All Bookings Table */
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Platform Reservations Ledger ({allBookings.length})</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Facility & Court</th>
                  <th className="py-2.5 px-3">Date & Slot</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {allBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">{b.bookingNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{b.facilityName}</div>
                      <div className="text-[10px] text-slate-400">{b.courtName}</div>
                    </td>
                    <td className="py-3 px-3 font-mono">{b.date} · {b.startTime}</td>
                    <td className="py-3 px-3 font-bold text-white font-mono">₹{b.totalAmount}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : b.status === 'Cancelled'
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'Completed')}
                          className="px-2 py-1 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        >
                          Complete
                        </button>
                      )}
                      {b.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'Cancelled')}
                          className="px-2 py-1 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Facility Modal */}
      {addFacilityOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add Badminton Facility</h3>
            <form onSubmit={handleCreateFacility} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={facilityAddress}
                  onChange={(e) => setFacilityAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    value={facilityCity}
                    onChange={(e) => setFacilityCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Price Range</label>
                  <input
                    type="text"
                    value={facilityPriceRange}
                    onChange={(e) => setFacilityPriceRange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={facilityDescription}
                  onChange={(e) => setFacilityDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddFacilityOpen(false)}
                  className="px-4 py-2 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Court Modal */}
      {addCourtOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add Court to Facility</h3>
            <form onSubmit={handleCreateCourt} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Facility</label>
                <select
                  value={selectedFacilityForCourt}
                  onChange={(e) => setSelectedFacilityForCourt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Court Name / Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Court 5 (Pro Synthetic)"
                  value={courtNumber}
                  onChange={(e) => setCourtNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Surface Type</label>
                  <select
                    value={courtSurface}
                    onChange={(e) => setCourtSurface(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="BWF Synthetic Mat">BWF Synthetic Mat</option>
                    <option value="Wooden Parquet">Wooden Parquet</option>
                    <option value="Rubberized">Rubberized</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Price per Hour (₹)</label>
                  <input
                    type="number"
                    value={courtPrice}
                    onChange={(e) => setCourtPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddCourtOpen(false)}
                  className="px-4 py-2 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
                >
                  Create Court
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Slot Modal */}
      {blockSlotOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Block Time Slot for Maintenance</span>
            </h3>
            <form onSubmit={handleBlockSlot} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Time Slot</label>
                  <input
                    type="time"
                    value={blockTime}
                    onChange={(e) => setBlockTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Reason for Closure</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockSlotOpen(false)}
                  className="px-4 py-2 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
                >
                  Block Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
