import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import { AboutUsPage } from './pages/AboutUsPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { RefundPolicyPage } from './pages/RefundPolicyPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { ProfilePage } from './pages/ProfilePage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentFailedPage } from './pages/PaymentFailedPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DigiLockerCallbackPage } from './pages/DigiLockerCallbackPage';
import { PublicProfessionalProfilePage } from './pages/PublicProfessionalProfilePage';
import { BrowseProfessionalsPage } from './pages/BrowseProfessionalsPage';
import { ScrollToTop } from './components/ScrollToTop';
import { MobileBottomNav } from './components/MobileBottomNav';
import { IshaChatWidget } from './components/IshaChatWidget';
import { WorkflowPreviewPage } from './pages/WorkflowPreviewPage';

const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const hasMobileNavigation = !pathname.startsWith('/admin') && !['/login', '/signup'].includes(pathname) && !pathname.startsWith('/verify/callback');

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col overflow-x-clip text-[#1e2824] selection:bg-[#c9f27d] selection:text-[#183e33]">
          <Navbar />
          <main className={`min-w-0 flex-1 bg-[#fcfbf8] ${hasMobileNavigation ? 'pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0' : 'pb-0'}`}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/workflow-preview" element={<WorkflowPreviewPage />} />
              <Route path="/post-requirement" element={<PostRequirementPage />} />
              <Route path="/requirements" element={<BrowseRequirementsPage />} />
              <Route path="/requirements/:id" element={<RequirementDetailPage />} />
              <Route path="/jobs/:id" element={<JobTrackerPage />} />
              <Route path="/credits" element={<CreditsWalletPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/professionals" element={<BrowseProfessionalsPage />} />
              <Route path="/talent" element={<BrowseProfessionalsPage />} />
              <Route path="/professionals/:idOrSlug" element={<PublicProfessionalProfilePage />} />
              <Route path="/professional/:idOrSlug" element={<PublicProfessionalProfilePage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/failed" element={<PaymentFailedPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify/callback" element={<DigiLockerCallbackPage />} />
              
              {/* Corporate and Legal Policy Pages */}
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />

              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
      <Footer />
      <PhoneOtpModal />
      <MobileBottomNav />
      <IshaChatWidget />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppShell />
      </Router>
    </AuthProvider>
  );
};

export default App;
