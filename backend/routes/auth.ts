import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database.ts';
import { generateToken, requireAuth, AuthenticatedRequest } from '../middleware/auth.ts';
import { User, PlayerProfile } from '../types.ts';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res: Response) => {
  try {
    const { email, password, name, role = 'PLAYER', skillLevel = 'Intermediate', playingStyle = 'All-Rounder', preferredPosition = 'Singles', age = 25, location = 'City Center' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please provide email, password, and name.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newUser: User = {
      id: userId,
      email: email.trim().toLowerCase(),
      passwordHash,
      role: role === 'ADMIN' ? 'ADMIN' : 'PLAYER',
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    // Create player profile
    const profileId = `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newProfile: PlayerProfile = {
      id: profileId,
      userId: newUser.id,
      name: name.trim(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      bio: `Badminton enthusiast ready to rally.`,
      age: Number(age) || 25,
      location: location || 'City Center',
      skillLevel: skillLevel,
      playingStyle: playingStyle,
      preferredPosition: preferredPosition,
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      winPercentage: 0,
      gamesWon: 0,
      gamesLost: 0,
      performanceScore: 50.0,
      currentStreak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createPlayerProfile(newProfile);

    // Create welcome notification
    db.createNotification({
      id: `notif_${Date.now()}`,
      userId: newUser.id,
      title: 'Welcome to RallySphere! 🏸',
      message: 'Your account is ready. Discover courts, schedule matches, and track your badminton performance.',
      type: 'SYSTEM',
      read: false,
      link: '/courts',
      createdAt: new Date().toISOString(),
    });

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      profile: newProfile,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email.trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const profile = db.getPlayerProfileByUserId(user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = db.getUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const profile = db.getPlayerProfileByUserId(user.id);

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    profile,
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const user = db.getUserByEmail(email.trim());
  if (!user) {
    // Return friendly generic message for security
    return res.json({ message: 'If an account exists with this email, password reset instructions have been sent.' });
  }

  return res.json({
    message: 'Password reset link and temporary security code have been dispatched to your email.',
    simulatedResetToken: `RST-${Date.now().toString(36).toUpperCase()}`,
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res: Response) => {
  return res.json({ message: 'Logged out successfully.' });
});

export default router;
