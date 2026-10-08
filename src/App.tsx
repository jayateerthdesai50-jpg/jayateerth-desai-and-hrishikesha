import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { CourtsPage } from './pages/CourtsPage.tsx';
import { BookingsPage } from './pages/BookingsPage.tsx';
import { MatchesPage } from './pages/MatchesPage.tsx';
import { PlayersPage } from './pages/PlayersPage.tsx';
import { PerformancePage } from './pages/PerformancePage.tsx';
import { AchievementsPage } from './pages/AchievementsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { ResearchPage } from './pages/ResearchPage.tsx';
import { CoachPage } from './pages/CoachPage.tsx';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/courts" element={<CourtsPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppLayout />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
