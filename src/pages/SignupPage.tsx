import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PhoneOtpModal } from '../components/PhoneOtpModal';

export const SignupPage: React.FC = () => {
  const { user, openAuthModal, isAuthModalOpen } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  useEffect(() => {
    if (user) {
      const isProfessional = user.roles?.includes('PROFESSIONAL');
      navigate(isProfessional ? '/requirements' : '/dashboard', { replace: true });
    } else if (!isAuthModalOpen) {
      const targetRole = roleParam?.toUpperCase() === 'PROFESSIONAL' ? 'PROFESSIONAL' : 'CUSTOMER';
      openAuthModal(targetRole);
    }
  }, [user, isAuthModalOpen, openAuthModal, navigate, roleParam]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <img src="/logo.png" alt="Vaziro" className="h-12 mx-auto mb-4 object-contain" />
        <h2 className="text-2xl font-black text-black">Create Your Vaziro Account</h2>
        <p className="text-sm text-neutral-500 mt-2">
          Join India's trusted services marketplace as a customer or service professional.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => openAuthModal('CUSTOMER')}
            className="bg-black hover:bg-neutral-800 text-white font-black text-sm py-3 px-5 rounded-2xl shadow-md transition cursor-pointer"
          >
            Join as Customer
          </button>
          <button
            onClick={() => openAuthModal('PROFESSIONAL')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3 px-5 rounded-2xl shadow-md transition cursor-pointer"
          >
            Join as Professional (+10 Free Credits)
          </button>
        </div>
      </div>
      <PhoneOtpModal />
    </div>
  );
};

export default SignupPage;
