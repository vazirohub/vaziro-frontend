import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PhoneOtpModal } from './components/PhoneOtpModal';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { PostRequirementPage } from './pages/PostRequirementPage';
import { BrowseRequirementsPage } from './pages/BrowseRequirementsPage';
import { RequirementDetailPage } from './pages/RequirementDetailPage';
import { JobTrackerPage } from './pages/JobTrackerPage';
import { CreditsWalletPage } from './pages/CreditsWalletPage';
import { ChatPage } from './pages/ChatPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/post-requirement" element={<PostRequirementPage />} />
              <Route path="/requirements" element={<BrowseRequirementsPage />} />
              <Route path="/requirements/:id" element={<RequirementDetailPage />} />
              <Route path="/jobs/:id" element={<JobTrackerPage />} />
              <Route path="/credits" element={<CreditsWalletPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
          <PhoneOtpModal />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
