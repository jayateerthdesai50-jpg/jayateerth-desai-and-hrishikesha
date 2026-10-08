export type UserRole = 'PLAYER' | 'ADMIN';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';

export type PlayingStyle =
  | 'Aggressive Attacker'
  | 'Tactical Deceiver'
  | 'Defensive Counter-Puncher'
  | 'All-Rounder'
  | 'Fast-Paced Net Dominator';

export type PreferredPosition =
  | 'Singles'
  | 'Doubles Front'
  | 'Doubles Back'
  | 'Doubles Universal';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type MatchFormat = 'SINGLES' | 'DOUBLES';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface PlayerProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  bio: string;
  age: number;
  location: string;
  skillLevel: SkillLevel;
  playingStyle: PlayingStyle;
  preferredPosition: PreferredPosition;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  winPercentage: number;
  gamesWon: number;
  gamesLost: number;
  performanceScore: number;
  currentStreak: number;
  bestStreak: number;
  averageScore?: number;
  averagePointsConceded?: number;
  totalPointsScored?: number;
  careerPointMargin?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  imageUrl: string;
  phone: string;
  operatingHours: string;
  amenities: string[];
  rating: number;
  reviewCount: number;
  priceRange: string;
  courtsCount?: number;
  courts?: Court[];
  reviews?: Review[];
}

export interface Court {
  id: string;
  facilityId: string;
  courtNumber: string;
  type: 'Indoor' | 'Outdoor';
  surface: 'BWF Synthetic Mat' | 'Wooden Parquet' | 'Rubberized';
  pricePerHour: number; // ₹ INR
  isActive: boolean;
  blockedSlots?: { date: string; time: string; reason: string }[];
}

export interface CourtSlot {
  time: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  price?: number;
  reason?: string;
  bookingId?: string;
}

export interface CourtAvailability {
  courtId: string;
  courtName: string;
  date: string;
  pricePerHour: number;
  slots: CourtSlot[];
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  facilityId: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalAmount: number; // ₹ INR
  status: BookingStatus;
  paymentStatus: 'PAID' | 'REFUNDED' | 'PENDING';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  facilityName?: string;
  facilityCity?: string;
  courtName?: string;
  surface?: string;
}

export interface MatchSet {
  setNumber: number;
  team1Score: number;
  team2Score: number;
}

export interface Match {
  id: string;
  title: string;
  format: MatchFormat;
  courtId?: string;
  facilityId?: string;
  venueName: string;
  date: string;
  time: string;
  creatorId: string;
  status: MatchStatus;
  team1PlayerIds: string[];
  team2PlayerIds: string[];
  opponentNames?: string[];
  team1Players?: PlayerProfile[];
  team2Players?: PlayerProfile[];
  scores: MatchSet[];
  winnerTeam: 1 | 2 | null;
  durationMinutes: number;
  notes?: string;
  isPastRecord?: boolean;
  createdAt: string;
}

export interface MatchInvitation {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  match?: Match;
  sender?: PlayerProfile;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'MATCH' | 'ACHIEVEMENT' | 'COACHING' | 'SYSTEM';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: 'MATCHES' | 'BOOKINGS' | 'STREAKS' | 'PERFORMANCE';
}

export interface PlayerAchievement {
  id: string;
  playerId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: Achievement;
}

export interface Review {
  id: string;
  facilityId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AICoachFeedback {
  coachSummary: string;
  strengths: string[];
  weaknesses: string[];
  suggestedTrainingAreas: string[];
  matchImprovementSuggestions: string[];
  consistencyAnalysis: string;
  personalizedPracticeRecommendations: string[];
  source: 'gemini' | 'rule-based';
}

export interface OnlineCoach {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  badge: string;
  experienceYears: number;
  specializations: string[];
  hourlyRateINR: number;
  rating: number;
  sessionsCompleted: number;
  availableDays: string[];
  location: string;
}

export interface CoachBooking {
  id: string;
  bookingRef: string;
  userId: string;
  coachId: string;
  coach?: OnlineCoach;
  date: string;
  timeSlot: string;
  sessionType: '1-on-1 Online Video Analysis' | 'Live Stroke Drill Correction' | 'Tactical Strategy Session';
  focusWeakpoints: string;
  priceINR: number;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  paymentStatus: 'PAID' | 'REFUNDED';
  meetingLink: string;
  createdAt: string;
}

export interface AITrainingPlan {
  id: string;
  userId: string;
  weakpoints: string[];
  targetArea: string;
  weeklySchedule: string;
  planTitle: string;
  coachAdvice: string;
  drills: {
    title: string;
    description: string;
    setsAndReps: string;
    focusCue: string;
    completed: boolean;
  }[];
  recoveryAdvice: string;
  createdAt: string;
}
