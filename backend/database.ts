import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  DatabaseSchema,
  User,
  PlayerProfile,
  Facility,
  Court,
  Booking,
  Match,
  MatchInvitation,
  Notification,
  Achievement,
  PlayerAchievement,
  Review,
  OnlineCoach,
  CoachBooking,
  AITrainingPlan,
} from './types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'rallysphere_db.json');

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_smash',
    code: 'FIRST_SMASH',
    title: 'First Rocket Smash 🚀',
    description: 'Played and recorded your first competitive badminton match.',
    icon: 'Zap',
    category: 'MATCHES',
  },
  {
    id: 'ach_century_rally',
    code: 'CENTURY_RALLY',
    title: 'Century Rally Champion 🏆',
    description: 'Participated in 10 or more competitive badminton matches.',
    icon: 'Trophy',
    category: 'MATCHES',
  },
  {
    id: 'ach_unstoppable',
    code: 'UNSTOPPABLE',
    title: 'Unstoppable Fire Streak 🔥',
    description: 'Achieved an active 3+ match win streak in singles or doubles.',
    icon: 'Flame',
    category: 'STREAKS',
  },
  {
    id: 'ach_prime_booker',
    code: 'PRIME_BOOKER',
    title: 'Court Master Booker 🏸',
    description: 'Reserved 3 or more badminton court sessions at partner arenas.',
    icon: 'Calendar',
    category: 'BOOKINGS',
  },
  {
    id: 'ach_doubles_maestro',
    code: 'DOUBLES_MAESTRO',
    title: 'Doubles Desi Maestro 🤝',
    description: 'Won 3 competitive doubles matches partnering with club players.',
    icon: 'Users',
    category: 'MATCHES',
  },
  {
    id: 'ach_elite_rating',
    code: 'ELITE_RATING',
    title: 'Bharat Shuttler Elite ⭐',
    description: 'Achieved a RallySphere Performance Score above 80.0.',
    icon: 'ShieldCheck',
    category: 'PERFORMANCE',
  },
];

const INITIAL_COACHES: OnlineCoach[] = [
  {
    id: 'coach_raghuveer',
    name: 'Coach Raghuveer Murthy',
    title: 'BWF Level 3 High-Performance Coach',
    bio: 'Former Indian National circuit medalist with 14+ years experience. Specializes in steep cross-court smashes, biomechanical wrist flick drills, and tournament mental conditioning.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    badge: 'BWF Certified Master 🇮🇳',
    experienceYears: 14,
    specializations: ['Steep Baseline Smashes', 'Third-Set Stamina Pacing', 'Singles Footwork'],
    hourlyRateINR: 999,
    rating: 4.95,
    sessionsCompleted: 340,
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    location: 'Hyderabad (Gopichand Academy Hub)',
  },
  {
    id: 'coach_ananya',
    name: 'Coach Ananya Sen',
    title: 'National Doubles Specialist & Tactical Analyst',
    bio: 'Padukone-Dravid Centre certified coach. Master of front-court interception, deceptive reverse-sliced tumbling drops, and double service variations.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    badge: 'Former National Top 10 🏸',
    experienceYears: 10,
    specializations: ['Net Deception & Brush Kills', 'Doubles Rotations', 'Serve-Return Attacks'],
    hourlyRateINR: 850,
    rating: 4.92,
    sessionsCompleted: 280,
    availableDays: ['Tue', 'Thu', 'Sat', 'Sun'],
    location: 'Bengaluru (Indiranagar / Whitefield)',
  },
  {
    id: 'coach_vikramaditya',
    name: 'Coach Vikramaditya Rao',
    title: 'State Elite Youth Coach & Stroke Doctor',
    bio: 'Specialist in correcting structural technical weakpoints: backhand recovery clears, round-the-head placement, and explosive split-step agility.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    badge: 'Biomechanics Specialist ⚡',
    experienceYears: 12,
    specializations: ['Backhand Clear Recovery', 'Explosive Split-Step', 'Agility Conditioning'],
    hourlyRateINR: 750,
    rating: 4.88,
    sessionsCompleted: 215,
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    location: 'Mumbai (Andheri Sports Hub)',
  },
];

class DatabaseEngine {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        // Verify if seeded with Indian data
        if (parsed.users && parsed.facilities && parsed.facilities[0]?.priceRange?.includes('₹')) {
          if (!parsed.onlineCoaches) parsed.onlineCoaches = INITIAL_COACHES;
          if (!parsed.coachBookings) parsed.coachBookings = [];
          if (!parsed.trainingPlans) parsed.trainingPlans = [];
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading DB file, seeding fresh database:', err);
    }

    const seeded = this.generateSeedData();
    this.saveDatabaseSync(seeded);
    return seeded;
  }

  private saveDatabaseSync(data: DatabaseSchema) {
    try {
      this.ensureDataDir();
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to sync DB to disk:', err);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveDatabaseSync(this.data);
      this.saveTimeout = null;
    }, 100);
  }

  private generateSeedData(): DatabaseSchema {
    const salt = bcrypt.genSaltSync(10);
    const standardPasswordHash = bcrypt.hashSync('password123', salt);

    // 1. Users
    const users: User[] = [
      {
        id: 'usr_player_demo',
        email: 'demo.player@rallysphere.com',
        passwordHash: standardPasswordHash,
        role: 'PLAYER',
        createdAt: '2026-01-10T08:00:00.000Z',
      },
      {
        id: 'usr_admin_demo',
        email: 'demo.admin@rallysphere.com',
        passwordHash: standardPasswordHash,
        role: 'ADMIN',
        createdAt: '2026-01-01T08:00:00.000Z',
      },
      {
        id: 'usr_player_rohit',
        email: 'rohit.sharma@rallysphere.com',
        passwordHash: standardPasswordHash,
        role: 'PLAYER',
        createdAt: '2026-01-12T09:30:00.000Z',
      },
      {
        id: 'usr_player_ananya',
        email: 'ananya.reddy@rallysphere.com',
        passwordHash: standardPasswordHash,
        role: 'PLAYER',
        createdAt: '2026-01-15T10:15:00.000Z',
      },
      {
        id: 'usr_player_arjun',
        email: 'arjun.nair@rallysphere.com',
        passwordHash: standardPasswordHash,
        role: 'PLAYER',
        createdAt: '2026-01-20T14:00:00.000Z',
      },
      {
        id: 'usr_player_deepika',
        email: 'deepika.padukone.fan@rallysphere.com',
        passwordHash: standardPasswordHash,
        role: 'PLAYER',
        createdAt: '2026-02-01T11:20:00.000Z',
      },
    ];

    // 2. Player Profiles (with Indian context & career point averages)
    const playerProfiles: PlayerProfile[] = [
      {
        id: 'prof_player_demo',
        userId: 'usr_player_demo',
        name: 'Aarav Patel',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Aggressive tournament singles and doubles shuttler. Big fan of Lakshya Sen and Viktor Axelsen. Loves fast net drives and cross-court jump smashes.',
        age: 24,
        location: 'Bengaluru (Indiranagar / Koramangala)',
        skillLevel: 'Advanced',
        playingStyle: 'Aggressive Attacker',
        preferredPosition: 'Doubles Front',
        matchesPlayed: 14,
        matchesWon: 10,
        matchesLost: 4,
        winPercentage: 71.4,
        gamesWon: 22,
        gamesLost: 11,
        performanceScore: 84.5,
        currentStreak: 3,
        bestStreak: 5,
        averageScore: 19.8,
        averagePointsConceded: 16.4,
        totalPointsScored: 654,
        careerPointMargin: +112,
        createdAt: '2026-01-10T08:00:00.000Z',
        updatedAt: '2026-03-28T16:00:00.000Z',
      },
      {
        id: 'prof_player_rohit',
        userId: 'usr_player_rohit',
        name: 'Rohit Varma',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        bio: 'Heavy baseline smasher trained at Hyderabad academy. Exceptional power and stamina in prolonged rubber sets.',
        age: 27,
        location: 'Hyderabad (Gachibowli Sports Hub)',
        skillLevel: 'Professional',
        playingStyle: 'Aggressive Attacker',
        preferredPosition: 'Doubles Back',
        matchesPlayed: 20,
        matchesWon: 16,
        matchesLost: 4,
        winPercentage: 80.0,
        gamesWon: 34,
        gamesLost: 12,
        performanceScore: 89.2,
        currentStreak: 4,
        bestStreak: 8,
        averageScore: 20.4,
        averagePointsConceded: 15.6,
        totalPointsScored: 938,
        careerPointMargin: +220,
        createdAt: '2026-01-12T09:30:00.000Z',
        updatedAt: '2026-03-29T12:00:00.000Z',
      },
      {
        id: 'prof_player_ananya',
        userId: 'usr_player_ananya',
        name: 'Ananya Reddy',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        bio: 'Tactical deception specialist with razor-sharp reverse slices and spinning net shots. Available for mixed doubles fixtures.',
        age: 23,
        location: 'Bengaluru (Whitefield Club)',
        skillLevel: 'Intermediate',
        playingStyle: 'Tactical Deceiver',
        preferredPosition: 'Doubles Front',
        matchesPlayed: 12,
        matchesWon: 7,
        matchesLost: 5,
        winPercentage: 58.3,
        gamesWon: 17,
        gamesLost: 13,
        performanceScore: 72.8,
        currentStreak: 1,
        bestStreak: 4,
        averageScore: 18.2,
        averagePointsConceded: 17.5,
        totalPointsScored: 546,
        careerPointMargin: +21,
        createdAt: '2026-01-15T10:15:00.000Z',
        updatedAt: '2026-03-25T18:00:00.000Z',
      },
      {
        id: 'prof_player_arjun',
        userId: 'usr_player_arjun',
        name: 'Arjun Nair',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        bio: 'Lightning fast net interceptor and flat drive master. Inspired by Satwik & Chirag doubles chemistry.',
        age: 26,
        location: 'Mumbai (Andheri Racquet Club)',
        skillLevel: 'Professional',
        playingStyle: 'Fast-Paced Net Dominator',
        preferredPosition: 'Doubles Front',
        matchesPlayed: 25,
        matchesWon: 21,
        matchesLost: 4,
        winPercentage: 84.0,
        gamesWon: 44,
        gamesLost: 15,
        performanceScore: 92.4,
        currentStreak: 6,
        bestStreak: 10,
        averageScore: 20.6,
        averagePointsConceded: 14.8,
        totalPointsScored: 1215,
        careerPointMargin: +342,
        createdAt: '2026-01-20T14:00:00.000Z',
        updatedAt: '2026-03-30T10:00:00.000Z',
      },
      {
        id: 'prof_player_deepika',
        userId: 'usr_player_deepika',
        name: 'Deepika Iyer',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        bio: 'Tenacious retriever and counter-puncher. Never gives up on a shuttle, solid cross-court defensive lifts.',
        age: 25,
        location: 'Delhi NCR (Siri Fort Complex)',
        skillLevel: 'Intermediate',
        playingStyle: 'Defensive Counter-Puncher',
        preferredPosition: 'Singles',
        matchesPlayed: 9,
        matchesWon: 5,
        matchesLost: 4,
        winPercentage: 55.6,
        gamesWon: 12,
        gamesLost: 10,
        performanceScore: 68.9,
        currentStreak: -1,
        bestStreak: 3,
        averageScore: 17.8,
        averagePointsConceded: 18.0,
        totalPointsScored: 391,
        careerPointMargin: -5,
        createdAt: '2026-02-01T11:20:00.000Z',
        updatedAt: '2026-03-22T14:00:00.000Z',
      },
    ];

    // 3. Indian Facilities (with Indian Rupee Pricing ₹)
    const facilities: Facility[] = [
      {
        id: 'fac_apex_badminton',
        name: 'Apex Badminton Arena 🇮🇳',
        description: 'Premier 8-court BWF certified international facility equipped with anti-glare high-lux LED lights, Yonex certified stringing lounge, and centralized climate control.',
        address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
        city: 'Bengaluru',
        imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
        phone: '+91 98450 28921',
        operatingHours: '05:30 AM – 11:00 PM',
        amenities: [
          'BWF Certified Mat',
          'Air Conditioning',
          'Yonex Stringing Pro Shop',
          'Locker & Hot Showers',
          'Free Mineral Water & Cafeteria',
          'Spectator Gallery',
          'Fast WiFi & Power Backup',
        ],
        rating: 4.9,
        reviewCount: 248,
        priceRange: '₹550 - ₹850/hr',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'fac_shuttle_hub',
        name: 'Gachibowli Smash Academy Hub 🏸',
        description: 'World-class badminton complex adjacent to Hyderabad sports corridor with cushion spring wooden parquet, multi-shuttle feeders, and video camera motion analysis.',
        address: 'Old Mumbai Highway, Gachibowli',
        city: 'Hyderabad',
        imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
        phone: '+91 91770 12341',
        operatingHours: '06:00 AM – 10:30 PM',
        amenities: [
          'Wooden Parquet',
          'Video Analysis Ready',
          'Ice Bath & Physiotherapy',
          'Energy Shake Bar',
          'Shuttlecock Dispensers',
          'Free Two-Wheeler / Car Parking',
        ],
        rating: 4.8,
        reviewCount: 184,
        priceRange: '₹500 - ₹750/hr',
        createdAt: '2026-01-05T00:00:00.000Z',
      },
      {
        id: 'fac_olympia_racquet',
        name: 'Siri Fort Badminton Pavilion 🏅',
        description: 'Elite historic sports complex in Delhi NCR featuring 6 international tournament courts, warm-up sprint track, and certified national coaching staff.',
        address: 'August Kranti Marg, Siri Fort Institutional Area',
        city: 'Delhi NCR',
        imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
        phone: '+91 98110 94400',
        operatingHours: '06:00 AM – 10:30 PM',
        amenities: [
          'BWF Synthetic Mat',
          'Steam & Sauna',
          'Coaching Camps',
          'Pro Racquet Customization',
          'Spacious Dressing Rooms',
          'Metro Station Connectivity',
        ],
        rating: 4.9,
        reviewCount: 312,
        priceRange: '₹650 - ₹950/hr',
        createdAt: '2026-01-08T00:00:00.000Z',
      },
      {
        id: 'fac_metro_smash',
        name: 'Andheri Sports Arena Club ⚡',
        description: 'Energetic, accessible badminton club in Western Mumbai with 4 tournament-grade courts, lively evening ladder challenge matches, and modern changing rooms.',
        address: 'Veera Desai Road, Andheri West',
        city: 'Mumbai',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
        phone: '+91 98200 44908',
        operatingHours: '06:00 AM – 11:30 PM',
        amenities: [
          'Rubberized Floor',
          'Sports Drinks Vending',
          'Locker Cubbies',
          'Electronic Scoreboards',
          'Coaching for Beginners',
        ],
        rating: 4.7,
        reviewCount: 156,
        priceRange: '₹600 - ₹800/hr',
        createdAt: '2026-01-10T00:00:00.000Z',
      },
    ];

    // 4. Courts (Hourly rates in INR ₹)
    const courts: Court[] = [
      // Apex Badminton Arena Bengaluru (4 courts)
      {
        id: 'crt_apex_1',
        facilityId: 'fac_apex_badminton',
        courtNumber: 'Court 1 (Yonex International Tournament)',
        type: 'Indoor',
        surface: 'BWF Synthetic Mat',
        pricePerHour: 750,
        isActive: true,
      },
      {
        id: 'crt_apex_2',
        facilityId: 'fac_apex_badminton',
        courtNumber: 'Court 2 (Li-Ning Elite Mat)',
        type: 'Indoor',
        surface: 'BWF Synthetic Mat',
        pricePerHour: 700,
        isActive: true,
      },
      {
        id: 'crt_apex_3',
        facilityId: 'fac_apex_badminton',
        courtNumber: 'Court 3 (Victor Champion Mat)',
        type: 'Indoor',
        surface: 'BWF Synthetic Mat',
        pricePerHour: 650,
        isActive: true,
      },
      {
        id: 'crt_apex_4',
        facilityId: 'fac_apex_badminton',
        courtNumber: 'Court 4 (Practice Wooden Floor)',
        type: 'Indoor',
        surface: 'Wooden Parquet',
        pricePerHour: 550,
        isActive: true,
      },
      // Gachibowli Smash Academy Hub Hyderabad (3 courts)
      {
        id: 'crt_shuttle_1',
        facilityId: 'fac_shuttle_hub',
        courtNumber: 'Court Alpha (Teakwood Spring)',
        type: 'Indoor',
        surface: 'Wooden Parquet',
        pricePerHour: 700,
        isActive: true,
      },
      {
        id: 'crt_shuttle_2',
        facilityId: 'fac_shuttle_hub',
        courtNumber: 'Court Beta (High-Speed Cam)',
        type: 'Indoor',
        surface: 'Wooden Parquet',
        pricePerHour: 750,
        isActive: true,
      },
      {
        id: 'crt_shuttle_3',
        facilityId: 'fac_shuttle_hub',
        courtNumber: 'Court Gamma (BWF Synthetic)',
        type: 'Indoor',
        surface: 'BWF Synthetic Mat',
        pricePerHour: 600,
        isActive: true,
      },
      // Siri Fort Pavilion Delhi (3 courts)
      {
        id: 'crt_olympia_1',
        facilityId: 'fac_olympia_racquet',
        courtNumber: 'Central Stadium Court 1',
        type: 'Indoor',
        surface: 'BWF Synthetic Mat',
        pricePerHour: 900,
        isActive: true,
      },
      {
        id: 'crt_olympia_2',
        facilityId: 'fac_olympia_racquet',
        courtNumber: 'Tournament Court 2',
        type: 'Indoor',
        surface: 'BWF Synthetic Mat',
        pricePerHour: 850,
        isActive: true,
      },
      {
        id: 'crt_olympia_3',
        facilityId: 'fac_olympia_racquet',
        courtNumber: 'Court 3 (Shock-Absorption)',
        type: 'Indoor',
        surface: 'Rubberized',
        pricePerHour: 650,
        isActive: true,
      },
      // Andheri Sports Arena Mumbai (2 courts)
      {
        id: 'crt_metro_1',
        facilityId: 'fac_metro_smash',
        courtNumber: 'Court A (Premium Mat)',
        type: 'Indoor',
        surface: 'Rubberized',
        pricePerHour: 750,
        isActive: true,
      },
      {
        id: 'crt_metro_2',
        facilityId: 'fac_metro_smash',
        courtNumber: 'Court B (Club Standard)',
        type: 'Indoor',
        surface: 'Rubberized',
        pricePerHour: 650,
        isActive: true,
      },
    ];

    const today = new Date();
    const formatDate = (offsetDays: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    // 5. Bookings (in INR ₹)
    const bookings: Booking[] = [
      {
        id: 'bk_demo_upcoming_1',
        bookingNumber: 'RSB-IN-9041',
        userId: 'usr_player_demo',
        facilityId: 'fac_apex_badminton',
        courtId: 'crt_apex_1',
        date: formatDate(1),
        startTime: '18:00',
        endTime: '19:00',
        durationHours: 1,
        totalAmount: 750,
        status: 'Confirmed',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI (Google Pay)',
        transactionId: 'UPI-MOCK-99120',
        createdAt: '2026-03-29T10:00:00.000Z',
      },
      {
        id: 'bk_demo_upcoming_2',
        bookingNumber: 'RSB-IN-9088',
        userId: 'usr_player_demo',
        facilityId: 'fac_shuttle_hub',
        courtId: 'crt_shuttle_2',
        date: formatDate(3),
        startTime: '19:00',
        endTime: '21:00',
        durationHours: 2,
        totalAmount: 1500,
        status: 'Confirmed',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI (PhonePe)',
        transactionId: 'UPI-MOCK-99188',
        createdAt: '2026-03-30T14:30:00.000Z',
      },
      {
        id: 'bk_demo_completed_1',
        bookingNumber: 'RSB-IN-8821',
        userId: 'usr_player_demo',
        facilityId: 'fac_apex_badminton',
        courtId: 'crt_apex_2',
        date: formatDate(-3),
        startTime: '17:00',
        endTime: '18:00',
        durationHours: 1,
        totalAmount: 700,
        status: 'Completed',
        paymentStatus: 'PAID',
        paymentMethod: 'Paytm UPI',
        transactionId: 'UPI-MOCK-88210',
        createdAt: '2026-03-24T09:00:00.000Z',
      },
    ];

    // 6. Matches
    const matches: Match[] = [
      {
        id: 'mtch_completed_1',
        title: 'Bengaluru Badminton League - Round 4',
        format: 'SINGLES',
        courtId: 'crt_apex_1',
        facilityId: 'fac_apex_badminton',
        venueName: 'Apex Badminton Arena - Court 1',
        date: formatDate(-2),
        time: '18:00',
        creatorId: 'usr_player_demo',
        status: 'COMPLETED',
        team1PlayerIds: ['usr_player_demo'],
        team2PlayerIds: ['usr_player_deepika'],
        scores: [
          { setNumber: 1, team1Score: 21, team2Score: 16 },
          { setNumber: 2, team1Score: 19, team2Score: 21 },
          { setNumber: 3, team1Score: 21, team2Score: 17 },
        ],
        winnerTeam: 1,
        durationMinutes: 52,
        notes: 'Thrilling 3-setter! Cross-court smash down the line in the final set decider.',
        createdAt: '2026-03-26T12:00:00.000Z',
      },
      {
        id: 'mtch_completed_2',
        title: 'Hyderabad Smash Doubles Derby',
        format: 'DOUBLES',
        courtId: 'crt_shuttle_1',
        facilityId: 'fac_shuttle_hub',
        venueName: 'Gachibowli Smash Academy Hub',
        date: formatDate(-5),
        time: '19:00',
        creatorId: 'usr_player_demo',
        status: 'COMPLETED',
        team1PlayerIds: ['usr_player_demo', 'usr_player_rohit'],
        team2PlayerIds: ['usr_player_arjun', 'usr_player_ananya'],
        scores: [
          { setNumber: 1, team1Score: 21, team2Score: 18 },
          { setNumber: 2, team1Score: 22, team2Score: 20 },
        ],
        winnerTeam: 1,
        durationMinutes: 44,
        notes: 'Fast paced net kills and rapid rotations. Solid defense against Arjun.',
        createdAt: '2026-03-22T10:00:00.000Z',
      },
      {
        id: 'mtch_completed_3',
        title: 'Friday Ladder Challenge',
        format: 'SINGLES',
        courtId: 'crt_olympia_2',
        facilityId: 'fac_olympia_racquet',
        venueName: 'Siri Fort Badminton Pavilion',
        date: formatDate(-9),
        time: '17:30',
        creatorId: 'usr_player_rohit',
        status: 'COMPLETED',
        team1PlayerIds: ['usr_player_demo'],
        team2PlayerIds: ['usr_player_rohit'],
        scores: [
          { setNumber: 1, team1Score: 17, team2Score: 21 },
          { setNumber: 2, team1Score: 18, team2Score: 21 },
        ],
        winnerTeam: 2,
        durationMinutes: 48,
        notes: 'Rohit overwhelmed with heavy steep baseline smashes.',
        createdAt: '2026-03-18T15:00:00.000Z',
      },
      {
        id: 'mtch_scheduled_1',
        title: 'Evening Sparring - Competitive Singles',
        format: 'SINGLES',
        courtId: 'crt_apex_1',
        facilityId: 'fac_apex_badminton',
        venueName: 'Apex Badminton Arena - Court 1',
        date: formatDate(1),
        time: '18:00',
        creatorId: 'usr_player_demo',
        status: 'SCHEDULED',
        team1PlayerIds: ['usr_player_demo'],
        team2PlayerIds: ['usr_player_ananya'],
        scores: [],
        winnerTeam: null,
        durationMinutes: 60,
        notes: 'Confirmed match for tomorrow evening session.',
        createdAt: '2026-03-29T10:15:00.000Z',
      },
    ];

    // 7. Match Invitations
    const matchInvitations: MatchInvitation[] = [
      {
        id: 'inv_1',
        matchId: 'mtch_scheduled_1',
        senderId: 'usr_player_demo',
        receiverId: 'usr_player_ananya',
        status: 'ACCEPTED',
        createdAt: '2026-03-29T10:15:00.000Z',
      },
      {
        id: 'inv_2',
        matchId: 'mtch_scheduled_1',
        senderId: 'usr_player_arjun',
        receiverId: 'usr_player_demo',
        status: 'PENDING',
        createdAt: '2026-03-30T16:00:00.000Z',
      },
    ];

    // 8. Notifications
    const notifications: Notification[] = [
      {
        id: 'notif_1',
        userId: 'usr_player_demo',
        title: 'Booking Confirmed! 🎟️',
        message: 'Your reservation at Apex Badminton Arena (Court 1) for tomorrow at 18:00 is confirmed (₹750 paid via UPI).',
        type: 'BOOKING',
        read: false,
        link: '/bookings',
        createdAt: '2026-03-29T10:01:00.000Z',
      },
      {
        id: 'notif_2',
        userId: 'usr_player_demo',
        title: 'Match Invitation Accepted 🏸',
        message: 'Ananya Reddy accepted your invitation for the Singles match tomorrow at 18:00.',
        type: 'MATCH',
        read: false,
        link: '/matches',
        createdAt: '2026-03-29T11:20:00.000Z',
      },
      {
        id: 'notif_3',
        userId: 'usr_player_demo',
        title: 'Trophy Unlocked: Fire Streak! 🔥',
        message: 'You have achieved a 3-match win streak! Check out your profile trophy showcase.',
        type: 'ACHIEVEMENT',
        read: true,
        link: '/achievements',
        createdAt: '2026-03-26T19:00:00.000Z',
      },
    ];

    // 9. Player Achievements
    const playerAchievements: PlayerAchievement[] = [
      {
        id: 'pa_demo_1',
        playerId: 'prof_player_demo',
        achievementId: 'ach_first_smash',
        unlockedAt: '2026-01-20T12:00:00.000Z',
      },
      {
        id: 'pa_demo_2',
        playerId: 'prof_player_demo',
        achievementId: 'ach_century_rally',
        unlockedAt: '2026-03-15T18:00:00.000Z',
      },
      {
        id: 'pa_demo_3',
        playerId: 'prof_player_demo',
        achievementId: 'ach_unstoppable',
        unlockedAt: '2026-03-26T19:00:00.000Z',
      },
      {
        id: 'pa_demo_4',
        playerId: 'prof_player_demo',
        achievementId: 'ach_prime_booker',
        unlockedAt: '2026-03-28T14:00:00.000Z',
      },
    ];

    // 10. Reviews
    const reviews: Review[] = [
      {
        id: 'rev_1',
        facilityId: 'fac_apex_badminton',
        userId: 'usr_player_demo',
        userName: 'Aarav Patel',
        rating: 5,
        comment: 'Superb BWF synthetic mats in Indiranagar! Yonex BG65 stringing completed in under 20 mins.',
        createdAt: '2026-03-20T14:00:00.000Z',
      },
      {
        id: 'rev_2',
        facilityId: 'fac_shuttle_hub',
        userId: 'usr_player_rohit',
        userName: 'Rohit Varma',
        rating: 5,
        comment: 'High spring wooden courts in Gachibowli are gentle on the knees during 3-setter weekend tourneys.',
        createdAt: '2026-03-18T18:30:00.000Z',
      },
    ];

    // 11. Coach Bookings & Training Plans
    const coachBookings: CoachBooking[] = [
      {
        id: 'cbk_demo_1',
        bookingRef: 'COACH-RS-7812',
        userId: 'usr_player_demo',
        coachId: 'coach_raghuveer',
        date: formatDate(2),
        timeSlot: '07:00 AM - 08:00 AM',
        sessionType: '1-on-1 Online Video Analysis',
        focusWeakpoints: 'Third-set stamina and steep cross-court smash angles',
        priceINR: 999,
        status: 'Confirmed',
        paymentStatus: 'PAID',
        meetingLink: 'https://meet.google.com/rs-badminton-coach-raghu',
        createdAt: '2026-03-28T14:00:00.000Z',
      },
    ];

    const trainingPlans: AITrainingPlan[] = [
      {
        id: 'tp_demo_1',
        userId: 'usr_player_demo',
        weakpoints: [
          'Backhand clear depth from deep rearcourt',
          'Fatigue and unforced errors in deciding 3rd set',
          'Vulnerability to tight net tumbling spin',
        ],
        targetArea: 'Rear-Court Recovery & Aerobic Stamina',
        weeklySchedule: '3 Sessions/Week (45 mins)',
        planTitle: 'Elite Power & Rear-Court Agility Masterplan',
        coachAdvice:
          'Your offensive smash rate is strong, but you lose court geometry when pressed into your backhand corner. Focus on round-the-head scissor kicks instead of weak backhand clears.',
        drills: [
          {
            title: 'Corner Shadow Multi-Shuttle (6-Point Footwork)',
            description: 'Explosive split-step recovery from center to all 6 corners with 15-second rest intervals.',
            setsAndReps: '4 sets × 12 repetitions',
            focusCue: 'Keep center of gravity low and land softly on forefoot',
            completed: true,
          },
          {
            title: 'Round-The-Head Scissor Kick Smash & Net Brush',
            description: 'Feeder drops high rear-court lift; execute jump smash followed by rapid dash to net brush.',
            setsAndReps: '5 sets × 10 shuttles',
            focusCue: 'Hit at the highest contact point with pronation',
            completed: false,
          },
          {
            title: 'Rubber Set Pressure Simulation (18-18 Scoreboard)',
            description: 'Sparring match starting at 18-all. Zero unforced error penalty rule.',
            setsAndReps: '3 tiebreaker games',
            focusCue: 'Breathe deeply between rallies and maintain high racket carriage',
            completed: false,
          },
        ],
        recoveryAdvice: '15-minute foam rolling on quads and calves, followed by hydration electrolytes.',
        createdAt: '2026-03-29T10:00:00.000Z',
      },
    ];

    return {
      users,
      playerProfiles,
      facilities,
      courts,
      bookings,
      matches,
      matchInvitations,
      notifications,
      achievements: INITIAL_ACHIEVEMENTS,
      playerAchievements,
      reviews,
      onlineCoaches: INITIAL_COACHES,
      coachBookings,
      trainingPlans,
    };
  }

  // --- User Queries ---
  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // --- Player Profiles ---
  public getPlayerProfileByUserId(userId: string): PlayerProfile | undefined {
    return this.data.playerProfiles.find((p) => p.userId === userId);
  }

  public getPlayerProfileById(id: string): PlayerProfile | undefined {
    return this.data.playerProfiles.find((p) => p.id === id);
  }

  public getAllPlayerProfiles(): PlayerProfile[] {
    return this.data.playerProfiles;
  }

  public createPlayerProfile(profile: PlayerProfile): PlayerProfile {
    this.data.playerProfiles.push(profile);
    this.save();
    return profile;
  }

  public updatePlayerProfile(id: string, updates: Partial<PlayerProfile>): PlayerProfile | undefined {
    const index = this.data.playerProfiles.findIndex((p) => p.id === id || p.userId === id);
    if (index === -1) return undefined;

    this.data.playerProfiles[index] = {
      ...this.data.playerProfiles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.playerProfiles[index];
  }

  // --- Facilities ---
  public getAllFacilities(): Facility[] {
    return this.data.facilities;
  }

  public getFacilityById(id: string): Facility | undefined {
    return this.data.facilities.find((f) => f.id === id);
  }

  public createFacility(facility: Facility): Facility {
    this.data.facilities.push(facility);
    this.save();
    return facility;
  }

  public updateFacility(id: string, updates: Partial<Facility>): Facility | undefined {
    const idx = this.data.facilities.findIndex((f) => f.id === id);
    if (idx === -1) return undefined;
    this.data.facilities[idx] = { ...this.data.facilities[idx], ...updates };
    this.save();
    return this.data.facilities[idx];
  }

  public deleteFacility(id: string): boolean {
    const prevLen = this.data.facilities.length;
    this.data.facilities = this.data.facilities.filter((f) => f.id !== id);
    this.data.courts = this.data.courts.filter((c) => c.facilityId !== id);
    if (this.data.facilities.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Courts ---
  public getCourtsByFacilityId(facilityId: string): Court[] {
    return this.data.courts.filter((c) => c.facilityId === facilityId);
  }

  public getAllCourts(): Court[] {
    return this.data.courts;
  }

  public getCourtById(id: string): Court | undefined {
    return this.data.courts.find((c) => c.id === id);
  }

  public createCourt(court: Court): Court {
    this.data.courts.push(court);
    this.save();
    return court;
  }

  public updateCourt(id: string, updates: Partial<Court>): Court | undefined {
    const idx = this.data.courts.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.courts[idx] = { ...this.data.courts[idx], ...updates };
    this.save();
    return this.data.courts[idx];
  }

  public deleteCourt(id: string): boolean {
    const prev = this.data.courts.length;
    this.data.courts = this.data.courts.filter((c) => c.id !== id);
    if (this.data.courts.length !== prev) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Bookings ---
  public getAllBookings(): Booking[] {
    return this.data.bookings;
  }

  public getBookingsByUserId(userId: string): Booking[] {
    return this.data.bookings.filter((b) => b.userId === userId);
  }

  public getBookingById(id: string): Booking | undefined {
    return this.data.bookings.find((b) => b.id === id);
  }

  public isCourtSlotAvailable(courtId: string, date: string, startTime: string): boolean {
    const court = this.getCourtById(courtId);
    if (!court || !court.isActive) return false;

    if (court.blockedSlots && court.blockedSlots.some((s) => s.date === date && s.time === startTime)) {
      return false;
    }

    const hasConflict = this.data.bookings.some(
      (b) =>
        b.courtId === courtId &&
        b.date === date &&
        b.startTime === startTime &&
        b.status !== 'Cancelled'
    );

    return !hasConflict;
  }

  public createBooking(booking: Booking): Booking {
    this.data.bookings.unshift(booking);
    this.save();
    return booking;
  }

  public updateBooking(id: string, updates: Partial<Booking>): Booking | undefined {
    const idx = this.data.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    this.data.bookings[idx] = { ...this.data.bookings[idx], ...updates };
    this.save();
    return this.data.bookings[idx];
  }

  // --- Matches ---
  public getAllMatches(): Match[] {
    return this.data.matches;
  }

  public getMatchById(id: string): Match | undefined {
    return this.data.matches.find((m) => m.id === id);
  }

  public getMatchesForUser(userId: string): Match[] {
    return this.data.matches.filter(
      (m) =>
        m.creatorId === userId ||
        m.team1PlayerIds.includes(userId) ||
        m.team2PlayerIds.includes(userId)
    );
  }

  public createMatch(match: Match): Match {
    this.data.matches.unshift(match);
    this.save();
    return match;
  }

  public updateMatch(id: string, updates: Partial<Match>): Match | undefined {
    const idx = this.data.matches.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.data.matches[idx] = { ...this.data.matches[idx], ...updates };
    this.save();
    return this.data.matches[idx];
  }

  public deleteMatch(id: string): boolean {
    const prev = this.data.matches.length;
    this.data.matches = this.data.matches.filter((m) => m.id !== id);
    if (this.data.matches.length !== prev) {
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Recalculates full player statistics, including average score per game,
   * average points conceded, point margin, and average win rate across all career matches!
   */
  public updatePlayerStatsAfterMatch(match: Match) {
    if (match.status !== 'COMPLETED' || !match.winnerTeam) return;

    const allInvolvedPlayerUserIds = [...match.team1PlayerIds, ...match.team2PlayerIds];

    for (const userId of allInvolvedPlayerUserIds) {
      const profile = this.getPlayerProfileByUserId(userId);
      if (!profile) continue;

      const userMatches = this.data.matches.filter(
        (m) =>
          m.status === 'COMPLETED' &&
          (m.team1PlayerIds.includes(userId) || m.team2PlayerIds.includes(userId))
      );

      let matchesWon = 0;
      let matchesLost = 0;
      let gamesWon = 0;
      let gamesLost = 0;
      let totalPointsScored = 0;
      let totalPointsConceded = 0;
      let totalSetsCount = 0;

      const sortedMatches = [...userMatches].sort(
        (a, b) =>
          new Date(`${a.date}T${a.time || '00:00'}`).getTime() -
          new Date(`${b.date}T${b.time || '00:00'}`).getTime()
      );

      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;

      for (const m of sortedMatches) {
        const isTeam1 = m.team1PlayerIds.includes(userId);
        const won = (isTeam1 && m.winnerTeam === 1) || (!isTeam1 && m.winnerTeam === 2);

        if (won) {
          matchesWon++;
          tempStreak = tempStreak > 0 ? tempStreak + 1 : 1;
        } else {
          matchesLost++;
          tempStreak = tempStreak < 0 ? tempStreak - 1 : -1;
        }

        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }

        for (const s of m.scores) {
          totalSetsCount++;
          const myScore = isTeam1 ? s.team1Score : s.team2Score;
          const oppScore = isTeam1 ? s.team2Score : s.team1Score;

          totalPointsScored += myScore;
          totalPointsConceded += oppScore;

          if (myScore > oppScore) {
            gamesWon++;
          } else if (oppScore > myScore) {
            gamesLost++;
          }
        }
      }

      currentStreak = tempStreak;
      const totalMatches = matchesWon + matchesLost;
      const winPercentage = totalMatches > 0 ? Number(((matchesWon / totalMatches) * 100).toFixed(1)) : 0;

      const averageScore = totalSetsCount > 0 ? Number((totalPointsScored / totalSetsCount).toFixed(1)) : 0;
      const averagePointsConceded =
        totalSetsCount > 0 ? Number((totalPointsConceded / totalSetsCount).toFixed(1)) : 0;
      const careerPointMargin = totalPointsScored - totalPointsConceded;

      const last5 = sortedMatches.slice(-5);
      let recentWins = 0;
      for (const m of last5) {
        const isTeam1 = m.team1PlayerIds.includes(userId);
        if ((isTeam1 && m.winnerTeam === 1) || (!isTeam1 && m.winnerTeam === 2)) {
          recentWins++;
        }
      }
      const recentFormFactor = last5.length > 0 ? (recentWins / last5.length) * 100 : winPercentage;

      const totalGames = gamesWon + gamesLost;
      const gameMargin = totalGames > 0 ? (gamesWon / totalGames) * 100 : 50;
      const consistency = Math.min(100, Math.max(40, 50 + totalMatches * 2));

      const performanceScore = Number(
        (winPercentage * 0.40 + recentFormFactor * 0.25 + consistency * 0.20 + gameMargin * 0.15).toFixed(1)
      );

      this.updatePlayerProfile(profile.id, {
        matchesPlayed: totalMatches,
        matchesWon,
        matchesLost,
        winPercentage,
        gamesWon,
        gamesLost,
        currentStreak,
        bestStreak: Math.max(bestStreak, profile.bestStreak || 0),
        performanceScore,
        averageScore,
        averagePointsConceded,
        totalPointsScored,
        careerPointMargin,
      });

      this.evaluateAchievementsForPlayer(profile.id, {
        totalMatches,
        currentStreak,
        performanceScore,
      });
    }
  }

  // --- Achievements ---
  public evaluateAchievementsForPlayer(
    playerId: string,
    stats: { totalMatches: number; currentStreak: number; performanceScore: number }
  ) {
    const existing = this.data.playerAchievements.filter((pa) => pa.playerId === playerId);
    const existingCodes = new Set(
      existing.map((pa) => {
        const ach = this.data.achievements.find((a) => a.id === pa.achievementId);
        return ach ? ach.code : '';
      })
    );

    const unlock = (code: string) => {
      const ach = this.data.achievements.find((a) => a.code === code);
      if (ach && !existingCodes.has(code)) {
        this.data.playerAchievements.push({
          id: `pa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          playerId,
          achievementId: ach.id,
          unlockedAt: new Date().toISOString(),
        });
        existingCodes.add(code);

        const prof = this.getPlayerProfileById(playerId);
        if (prof) {
          this.createNotification({
            id: `notif_${Date.now()}`,
            userId: prof.userId,
            title: `Trophy Milestone Unlocked: ${ach.title}!`,
            message: ach.description,
            type: 'ACHIEVEMENT',
            read: false,
            link: '/achievements',
            createdAt: new Date().toISOString(),
          });
        }
      }
    };

    if (stats.totalMatches >= 1) unlock('FIRST_SMASH');
    if (stats.totalMatches >= 10) unlock('CENTURY_RALLY');
    if (stats.currentStreak >= 3) unlock('UNSTOPPABLE');
    if (stats.performanceScore >= 80) unlock('ELITE_RATING');

    this.save();
  }

  public getPlayerAchievements(playerId: string): (PlayerAchievement & { achievement: Achievement })[] {
    const playerAch = this.data.playerAchievements.filter((pa) => pa.playerId === playerId);
    return playerAch
      .map((pa) => {
        const achievement = this.data.achievements.find((a) => a.id === pa.achievementId);
        if (!achievement) return null;
        return {
          ...pa,
          achievement,
        };
      })
      .filter((item): item is PlayerAchievement & { achievement: Achievement } => item !== null);
  }

  public getAllAchievements(): Achievement[] {
    return this.data.achievements;
  }

  // --- Notifications ---
  public getNotificationsByUserId(userId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(notif: Notification): Notification {
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  public markNotificationRead(id: string): boolean {
    const n = this.data.notifications.find((notif) => notif.id === id);
    if (n) {
      n.read = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId: string): boolean {
    let updated = false;
    for (const n of this.data.notifications) {
      if (n.userId === userId && !n.read) {
        n.read = true;
        updated = true;
      }
    }
    if (updated) {
      this.save();
    }
    return updated;
  }

  // --- Reviews ---
  public getReviewsByFacilityId(facilityId: string): Review[] {
    return this.data.reviews
      .filter((r) => r.facilityId === facilityId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createReview(review: Review): Review {
    this.data.reviews.unshift(review);
    const facilityReviews = this.getReviewsByFacilityId(review.facilityId);
    const sum = facilityReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / facilityReviews.length).toFixed(1));
    this.updateFacility(review.facilityId, {
      rating: avg,
      reviewCount: facilityReviews.length,
    });
    this.save();
    return review;
  }

  // --- Match Invitations ---
  public getInvitationsForUser(userId: string): MatchInvitation[] {
    return this.data.matchInvitations.filter((inv) => inv.receiverId === userId);
  }

  public createInvitation(inv: MatchInvitation): MatchInvitation {
    this.data.matchInvitations.push(inv);
    this.save();
    return inv;
  }

  public updateInvitation(id: string, status: 'ACCEPTED' | 'DECLINED'): MatchInvitation | undefined {
    const inv = this.data.matchInvitations.find((i) => i.id === id);
    if (!inv) return undefined;
    inv.status = status;
    this.save();
    return inv;
  }

  // --- Online Coaches & Sessions ---
  public getAllCoaches(): OnlineCoach[] {
    return this.data.onlineCoaches || INITIAL_COACHES;
  }

  public getCoachById(id: string): OnlineCoach | undefined {
    return this.getAllCoaches().find((c) => c.id === id);
  }

  public getCoachBookings(userId: string): CoachBooking[] {
    return (this.data.coachBookings || []).filter((b) => b.userId === userId);
  }

  public createCoachBooking(booking: CoachBooking): CoachBooking {
    if (!this.data.coachBookings) this.data.coachBookings = [];
    this.data.coachBookings.unshift(booking);
    this.save();
    return booking;
  }

  // --- AI Training Plans ---
  public getTrainingPlansForUser(userId: string): AITrainingPlan[] {
    return (this.data.trainingPlans || []).filter((p) => p.userId === userId);
  }

  public saveTrainingPlan(plan: AITrainingPlan): AITrainingPlan {
    if (!this.data.trainingPlans) this.data.trainingPlans = [];
    this.data.trainingPlans.unshift(plan);
    this.save();
    return plan;
  }

  public toggleDrillCompleted(planId: string, drillIndex: number): boolean {
    const plan = (this.data.trainingPlans || []).find((p) => p.id === planId);
    if (plan && plan.drills[drillIndex]) {
      plan.drills[drillIndex].completed = !plan.drills[drillIndex].completed;
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new DatabaseEngine();
