// components/CardModal.tsx
import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import AuthHeader from "./auth-header";
import BackButton from "./back-button";
import ForgotPasswordButton from "./forgotpasswordbutton";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  title: string;
  openLoginModal?: () => void;
  openRegisterModal?: () => void;
  openForgotPasswordModal?: () => void;
  children: ReactNode;
}

const CardModal = ({
  isOpen,
  onClose,
  label,
  title,
  openLoginModal,
  openRegisterModal,
  openForgotPasswordModal,
  children,
}: CardModalProps) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isOpen) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [isOpen, controls]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="w-full max-w-lg mx-4 z-10"
          >
            <Card className="overflow-hidden shadow-2xl bg-white dark:bg-gray-800 rounded-3xl border-2 border-purple-500 dark:border-purple-400">
              <CardHeader className="relative p-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
                <motion.div
                  initial="hidden"
                  animate={controls}
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: -20 },
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <AuthHeader label={label} title={title}  />
                </motion.div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-white hover:text-gray-200 transition-all duration-300 rounded-full hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transform hover:rotate-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-800 to-transparent"></div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <motion.div
                  initial="hidden"
                  animate={controls}
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 },
                  }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {children}
                </motion.div>
              </CardContent>
              <CardFooter className="flex justify-between p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                {openLoginModal && (
                  <BackButton 
                    label="Back" 
                    onClick={openLoginModal}
                    className="px-6 py-3 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                  />
                )}
                {openForgotPasswordModal && (
                  <ForgotPasswordButton
                    label="Forgot Password?"
                    onClick={openForgotPasswordModal}
                    className="px-6 py-3 text-sm font-medium text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900 hover:bg-pink-200 dark:hover:bg-pink-800 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
                  />
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CardModal;