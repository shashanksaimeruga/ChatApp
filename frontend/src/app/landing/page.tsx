// components/LandingPage.tsx
'use client';
import Features from "@/components/Home/features";
import Footer from "@/components/Home/footer";
import Header from "@/components/Home/header";
import Hero from "@/components/Home/hero";
import Testimonials from "@/components/Home/tesimonials";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import LoginForm from "@/components/Home/login";
import RegisterForm from "@/components/Home/register";
import ForgotPasswordForm from "@/components/Home/forgotpassword";

const LandingPage = () => {
  const [activeModal, setActiveModal] = useState<'login' | 'register' | 'forgotPassword' | null>(null);
  const { scrollY } = useScroll();

  const heroY = useTransform(scrollY, [0, 500], [0, -150]);
  const featuresY = useTransform(scrollY, [0, 500], [0, -50]);
  const testimonialsY = useTransform(scrollY, [0, 500], [0, -25]);

  const openLoginModal = () => setActiveModal('login');
  const openRegisterModal = () => setActiveModal('register');
  const openForgotPasswordModal = () => setActiveModal('forgotPassword');
  const closeModal = () => setActiveModal(null);
  const openLoginModalAfterRegistration = () => {
    closeModal();
    setActiveModal('login');
  };

  return (
    <div className="relative overflow-hidden">
      <Header openLoginModal={openLoginModal} openRegisterModal={openRegisterModal} />
      <motion.div style={{ y: heroY }}>
        <Hero />
      </motion.div>
      <motion.div style={{ y: featuresY }}>
        <Features />
      </motion.div>
      <motion.div style={{ y: testimonialsY }}>
        <Testimonials />
      </motion.div>
      <Footer />

      <LoginForm
        isOpen={activeModal === 'login'}
        onClose={closeModal}
        openRegisterModal={openRegisterModal}
        openForgotPasswordModal={openForgotPasswordModal}
      />

      <RegisterForm
        isOpen={activeModal === 'register'}
        onClose={closeModal}
        openLoginModal={openLoginModal}
        openLoginModalAfterRegistration={openLoginModalAfterRegistration}  // Add this line
      />

      <ForgotPasswordForm
        isOpen={activeModal === 'forgotPassword'}
        onClose={closeModal}
        openLoginModal={openLoginModal}
      />
      
      {/* Decorative elements */}
      <div className="fixed top-1/4 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="fixed top-1/3 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-1/4 left-1/4 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
  );
}

export default LandingPage;
