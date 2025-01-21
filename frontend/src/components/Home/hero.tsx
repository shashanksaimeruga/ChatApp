import { Button } from '../ui/button';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 flex flex-col justify-center items-center text-center text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/path/to/hero-pattern.svg')] opacity-10 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900 to-transparent opacity-30"></div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 space-y-8"
      >
        <h1 className="text-8xl font-extrabold mb-4">
          <span className="font-brenet-stripes text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Welcome to
          </span>
          <br />
          <span className="font-brenet-extrude text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600">
            ChatApp
          </span>
        </h1>
        <p className="text-3xl mb-8 max-w-2xl mx-auto font-brenet-regular">
          Experience the future of communication with our cutting-edge platform
        </p>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl px-8 py-4 rounded-full hover:from-purple-600 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl font-brenet-shadow">
          Get Started
        </Button>
      </motion.div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-indigo-900 to-transparent"></div>
    </section>
  );
}

export default Hero;