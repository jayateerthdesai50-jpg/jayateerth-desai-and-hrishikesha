import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Star,
  Compass,
  Calendar,
  Check,
  Filter,
  DollarSign,
  Shield,
  Layers,
  Sparkles,
  Phone,
  Clock,
} from 'lucide-react';
import { Facility, Court } from '../types.ts';
import { api } from '../services/api.ts';
import { CourtBookingModal } from '../components/CourtBookingModal.tsx';

export const CourtsPage: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedSurface, setSelectedSurface] = useState('ALL');
  const [selectedAmenity, setSelectedAmenity] = useState('ALL');

  // Booking modal
  const [bookingModalFacility, setBookingModalFacility] = useState<Facility | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court | undefined>(undefined);

  const fetchFacilities = () => {
    setLoading(true);
    api.facilities
      .list({
        search: search || undefined,
        city: selectedCity !== 'ALL' ? selectedCity : undefined,
        amenity: selectedAmenity !== 'ALL' ? selectedAmenity : undefined,
      })
      .then((data) => {
        // Also fetch detailed court items for each facility
        Promise.all(data.map((f) => api.facilities.getById(f.id))).then((detailed) => {
          setFacilities(detailed);
        });
      })
      .catch((err) => console.error('Failed to load facilities:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFacilities();
  }, [selectedCity, selectedAmenity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFacilities();
  };

  // Filter facilities by surface if specified
  const filteredFacilities = facilities.filter((f) => {
    if (selectedSurface === 'ALL') return true;
    return f.courts?.some((c) => c.surface.toLowerCase().includes(selectedSurface.toLowerCase()));
  });

  const allCities = ['ALL', 'Metropolis', 'North Bay', 'Westside', 'Downtown'];
  const allSurfaces = ['ALL', 'BWF Synthetic Mat', 'Wooden Parquet', 'Rubberized'];
  const allAmenities = [
    'ALL',
    'BWF Certified Mat',
    'Air Conditioning',
    'Pro Shop & Stringing',
    'Locker & Hot Showers',
    'Video Analysis Ready',
    'Free High-Speed WiFi',
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Court Discovery Engine</span>
          <span>·</span>
          <span>Real-Time Reservation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Badminton Facilities & Courts
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Search BWF-approved badminton courts, inspect available hourly slots, and reserve your court with automated anti-double booking protection.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by facility name, address, or amenities..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          {/* City Filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              {allCities.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Locations' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Surface Filter */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={selectedSurface}
              onChange={(e) => setSelectedSurface(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              {allSurfaces.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Court Surfaces' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Amenity Filter */}
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              {allAmenities.map((a) => (
                <option key={a} value={a}>
                  {a === 'ALL' ? 'All Amenities' : a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading badminton courts and facilities...
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
          No facilities found matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFacilities.map((fac) => (
            <div
              key={fac.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Image & Header */}
              <div>
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={fac.imageUrl}
                    alt={fac.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{fac.rating}</span>
                    <span className="text-slate-400 text-[10px]">({fac.reviewCount})</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        {fac.city}
                      </span>
                      <h3 className="text-xl font-bold text-white leading-tight">{fac.name}</h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>{fac.address}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-400 font-mono">
                        {fac.priceRange}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">{fac.description}</p>

                  {/* Operational details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-2 border-y border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{fac.operatingHours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{fac.phone}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Facility Amenities
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {fac.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Courts list preview */}
                  {fac.courts && fac.courts.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Available Courts ({fac.courts.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {fac.courts.map((court) => (
                          <div
                            key={court.id}
                            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-semibold text-white">{court.courtNumber}</p>
                              <p className="text-[10px] text-slate-400">
                                {court.surface} · {court.type}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-emerald-400 font-mono">
                              ₹{court.pricePerHour}/hr
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    setBookingModalFacility(fac);
                    setSelectedCourt(fac.courts?.[0]);
                  }}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Check Availability & Book Court</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalFacility && (
        <CourtBookingModal
          facility={bookingModalFacility}
          initialCourt={selectedCourt}
          isOpen={!!bookingModalFacility}
          onClose={() => setBookingModalFacility(null)}
          onBookingSuccess={() => {
            fetchFacilities();
          }}
        />
      )}
    </div>
  );
};
