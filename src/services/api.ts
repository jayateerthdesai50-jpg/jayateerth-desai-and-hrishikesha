import {
  User,
  PlayerProfile,
  Facility,
  Court,
  CourtAvailability,
  Booking,
  Match,
  MatchInvitation,
  Notification,
  AICoachFeedback,
  OnlineCoach,
  CoachBooking,
  AITrainingPlan,
} from '../types.ts';

const TOKEN_KEY = 'rallysphere_auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiRequest<{ token: string; user: User; profile: PlayerProfile }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    register: (userData: any) =>
      apiRequest<{ token: string; user: User; profile: PlayerProfile }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    getMe: () =>
      apiRequest<{ user: User; profile: PlayerProfile }>('/api/auth/me'),

    forgotPassword: (email: string) =>
      apiRequest<{ message: string; simulatedResetToken?: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    logout: () =>
      apiRequest<{ message: string }>('/api/auth/logout', {
        method: 'POST',
      }),
  },

  // Players
  players: {
    list: (params?: { search?: string; skillLevel?: string; playingStyle?: string; location?: string }) => {
      const qs = new URLSearchParams();
      if (params?.search) qs.append('search', params.search);
      if (params?.skillLevel) qs.append('skillLevel', params.skillLevel);
      if (params?.playingStyle) qs.append('playingStyle', params.playingStyle);
      if (params?.location) qs.append('location', params.location);
      const query = qs.toString() ? `?${qs.toString()}` : '';
      return apiRequest<PlayerProfile[]>(`/api/players${query}`);
    },

    getById: (id: string) =>
      apiRequest<PlayerProfile & { achievements: any[]; recentMatches: Match[] }>(`/api/players/${id}`),

    update: (id: string, updates: Partial<PlayerProfile>) =>
      apiRequest<PlayerProfile>(`/api/players/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
  },

  // Facilities
  facilities: {
    list: (params?: { search?: string; city?: string; amenity?: string }) => {
      const qs = new URLSearchParams();
      if (params?.search) qs.append('search', params.search);
      if (params?.city) qs.append('city', params.city);
      if (params?.amenity) qs.append('amenity', params.amenity);
      const query = qs.toString() ? `?${qs.toString()}` : '';
      return apiRequest<Facility[]>(`/api/facilities${query}`);
    },

    getById: (id: string) =>
      apiRequest<Facility & { courts: Court[]; reviews: any[] }>(`/api/facilities/${id}`),

    create: (data: Partial<Facility>) =>
      apiRequest<Facility>('/api/facilities', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Facility>) =>
      apiRequest<Facility>(`/api/facilities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiRequest<{ message: string }>(`/api/facilities/${id}`, {
        method: 'DELETE',
      }),

    addReview: (facilityId: string, review: { rating: number; comment: string }) =>
      apiRequest<any>(`/api/facilities/${facilityId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(review),
      }),
  },

  // Courts
  courts: {
    list: (facilityId?: string) => {
      const query = facilityId ? `?facilityId=${facilityId}` : '';
      return apiRequest<Court[]>(`/api/courts${query}`);
    },

    getAvailability: (courtId: string, date: string) =>
      apiRequest<CourtAvailability>(`/api/courts/${courtId}/availability?date=${date}`),

    create: (courtData: Partial<Court>) =>
      apiRequest<Court>('/api/courts', {
        method: 'POST',
        body: JSON.stringify(courtData),
      }),

    update: (id: string, courtData: Partial<Court>) =>
      apiRequest<Court>(`/api/courts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(courtData),
      }),

    delete: (id: string) =>
      apiRequest<{ message: string }>(`/api/courts/${id}`, {
        method: 'DELETE',
      }),

    blockSlot: (courtId: string, blockData: { date: string; time: string; reason: string }) =>
      apiRequest<Court>(`/api/courts/${courtId}/block-slot`, {
        method: 'POST',
        body: JSON.stringify(blockData),
      }),
  },

  // Bookings
  bookings: {
    list: (params?: { status?: string; all?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.append('status', params.status);
      if (params?.all) qs.append('all', 'true');
      const query = qs.toString() ? `?${qs.toString()}` : '';
      return apiRequest<Booking[]>(`/api/bookings${query}`);
    },

    create: (bookingData: {
      facilityId: string;
      courtId: string;
      date: string;
      startTime: string;
      durationHours?: number;
      paymentMethod?: string;
    }) =>
      apiRequest<Booking>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      }),

    cancel: (id: string) =>
      apiRequest<Booking>(`/api/bookings/${id}/cancel`, {
        method: 'PUT',
      }),

    updateStatus: (id: string, status: string) =>
      apiRequest<Booking>(`/api/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  },

  // Matches
  matches: {
    list: (params?: { all?: boolean; status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.all) qs.append('all', 'true');
      if (params?.status) qs.append('status', params.status);
      const query = qs.toString() ? `?${qs.toString()}` : '';
      return apiRequest<Match[]>(`/api/matches${query}`);
    },

    getById: (id: string) =>
      apiRequest<Match>(`/api/matches/${id}`),

    create: (matchData: Partial<Match>) =>
      apiRequest<Match>('/api/matches', {
        method: 'POST',
        body: JSON.stringify(matchData),
      }),

    submitResult: (
      id: string,
      result: {
        scores: { team1Score: number; team2Score: number }[];
        durationMinutes?: number;
        notes?: string;
      }
    ) =>
      apiRequest<Match>(`/api/matches/${id}/result`, {
        method: 'POST',
        body: JSON.stringify(result),
      }),

    getInvitations: () =>
      apiRequest<MatchInvitation[]>('/api/matches/invitations/me'),

    respondToInvitation: (invitationId: string, status: 'ACCEPTED' | 'DECLINED') =>
      apiRequest<MatchInvitation>(`/api/matches/invitations/${invitationId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

    logPast: (pastMatchData: {
      title: string;
      format?: string;
      venueName?: string;
      date: string;
      opponentNames?: string[];
      scores: { team1Score: number; team2Score: number }[];
      winnerTeam: number;
      durationMinutes?: number;
      notes?: string;
    }) =>
      apiRequest<{ match: Match; careerProfile: PlayerProfile }>('/api/matches/log-past', {
        method: 'POST',
        body: JSON.stringify(pastMatchData),
      }),
  },

  // Online Coaches & AI Training
  coaching: {
    listCoaches: () =>
      apiRequest<OnlineCoach[]>('/api/coaching/coaches'),

    getCoachById: (id: string) =>
      apiRequest<OnlineCoach>(`/api/coaching/coaches/${id}`),

    bookCoach: (data: {
      coachId: string;
      date: string;
      timeSlot: string;
      sessionType?: string;
      focusWeakpoints?: string;
    }) =>
      apiRequest<CoachBooking>('/api/coaching/book', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMyBookings: () =>
      apiRequest<CoachBooking[]>('/api/coaching/my-bookings'),

    aiTrain: (data: { weakpoints: string[]; targetArea?: string; weeklyDays?: number }) =>
      apiRequest<AITrainingPlan>('/api/coaching/ai-train', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMyPlans: () =>
      apiRequest<AITrainingPlan[]>('/api/coaching/my-plans'),

    toggleDrill: (planId: string, drillIndex: number) =>
      apiRequest<{ message: string }>(`/api/coaching/plans/${planId}/drill/${drillIndex}`, {
        method: 'PUT',
      }),
  },

  // Performance
  performance: {
    getStats: (playerId: string) =>
      apiRequest<any>(`/api/performance/${playerId}`),

    getAICoach: (playerId: string) =>
      apiRequest<AICoachFeedback>(`/api/performance/${playerId}/coach`),
  },

  // Notifications
  notifications: {
    list: () =>
      apiRequest<Notification[]>('/api/notifications'),

    markRead: (id: string) =>
      apiRequest<{ message: string }>(`/api/notifications/${id}/read`, {
        method: 'PUT',
      }),

    markAllRead: () =>
      apiRequest<{ message: string }>('/api/notifications/read-all', {
        method: 'PUT',
      }),
  },

  // Admin
  admin: {
    getOverview: () =>
      apiRequest<any>('/api/admin/overview'),
  },
};
