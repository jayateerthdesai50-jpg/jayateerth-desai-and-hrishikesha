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
  passwordHash: string;
  role: UserRole;
  createdAt: string;
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
  // Averages & historical metrics
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
  createdAt: string;
}

export interface Court {
  id: string;
  facilityId: string;
  courtNumber: string;
  type: 'Indoor' | 'Outdoor';
  surface: 'BWF Synthetic Mat' | 'Wooden Parquet' | 'Rubberized';
  pricePerHour: number; // in INR ₹
  isActive: boolean;
  blockedSlots?: { date: string; time: string; reason: string }[];
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  facilityId: string;
  courtId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "18:00"
  endTime: string; // e.g. "19:00"
  durationHours: number;
  totalAmount: number; // in INR ₹
  status: BookingStatus;
  paymentStatus: 'PAID' | 'REFUNDED' | 'PENDING';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
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
  opponentNames?: string[]; // for manual previous match records
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

export interface DatabaseSchema {
  users: User[];
  playerProfiles: PlayerProfile[];
  facilities: Facility[];
  courts: Court[];
  bookings: Booking[];
  matches: Match[];
  matchInvitations: MatchInvitation[];
  notifications: Notification[];
  achievements: Achievement[];
  playerAchievements: PlayerAchievement[];
  reviews: Review[];
  onlineCoaches: OnlineCoach[];
  coachBookings: CoachBooking[];
  trainingPlans: AITrainingPlan[];
}
