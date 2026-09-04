import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PhoneOtpModal } from '../components/PhoneOtpModal';

export const LoginPage: React.FC = () => {
  const { user, openAuthModal, isAuthModalOpen } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const isProfessional = user.roles?.includes('PROFESSIONAL');
      navigate(isProfessional ? '/requirements' : '/dashboard', { replace: true });
    } else if (!isAuthModalOpen) {
      openAuthModal('CUSTOMER', undefined, 'LOGIN');
    }
  }, [user, isAuthModalOpen, openAuthModal, navigate]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <img src="/logo.png" alt="Vaziro" className="h-12 mx-auto mb-4 object-contain" />
        <h2 className="text-2xl font-black text-black">Sign In to Vaziro</h2>
        <p className="text-sm text-neutral-500 mt-2">
          Verify your mobile number with 1-click SMS OTP to access your account.
        </p>
        <div className="mt-6">
          <button
            onClick={() => openAuthModal('CUSTOMER', undefined, 'LOGIN')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3.5 px-6 rounded-2xl shadow-md transition cursor-pointer"
          >
            Open Sign In
          </button>
        </div>
      </div>
      <PhoneOtpModal />
    </div>
  );
};

export default LoginPage;
