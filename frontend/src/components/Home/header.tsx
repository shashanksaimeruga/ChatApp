'use client'
import Link from 'next/link';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';

interface HeaderProps {
  openLoginModal: () => void;
  openRegisterModal: () => void;
}

const Header = ({ openLoginModal, openRegisterModal }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`transition-all duration-300 ${isScrolled ? 'bg-opacity-95 py-2' : 'bg-opacity-70 py-6'} bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white flex justify-between items-center shadow-lg fixed w-full z-50 backdrop-blur-md`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold">
          <span className="font-brenet-outline text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 hover:from-purple-600 hover:to-blue-400 transition-all duration-300">
            ChatApp
          </span>
        </h1>
        <nav>
          <ul className="flex space-x-8">
            {['Home', 'Features', 'Testimonials'].map((item) => (
              <li key={item}>
                <Link href={`#${item.toLowerCase()}`} className="text-lg font-semibold hover:text-pink-400 transition-colors duration-300 relative group font-brenet-regular">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={openLoginModal}
                className="text-lg font-semibold hover:text-pink-400 transition-colors duration-300 font-brenet-regular"
              >
                Login
              </button>
            </li>
          </ul>
        </nav>
        <Button
          onClick={openRegisterModal}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full hover:from-purple-600 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-brenet-stripes"
        >
          Get Started
        </Button>
      </div>
    </header>
  );
}

export default Header;