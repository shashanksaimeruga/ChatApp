import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-4 font-brenet-extrude">ChatApp</h3>
            <p className="text-gray-300 font-brenet-regular">Experience the future of communication</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-2xl font-bold mb-4 font-brenet-stripes">Quick Links</h3>
            <ul className="space-y-2 font-brenet-regular">
              <li><a href="#" className="hover:text-pink-400 transition-colors duration-300">Home</a></li>
              <li><a href="#features" className="hover:text-pink-400 transition-colors duration-300">Features</a></li>
              <li><a href="#testimonials" className="hover:text-pink-400 transition-colors duration-300">Testimonials</a></li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-4 font-brenet-stripes">Connect with us</h3>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-3xl hover:text-blue-400 transition-colors duration-300"><i className="fab fa-facebook"></i></a>
              <a href="#" aria-label="Twitter" className="text-3xl hover:text-blue-300 transition-colors duration-300"><i className="fab fa-twitter"></i></a>
              <a href="#" aria-label="Instagram" className="text-3xl hover:text-pink-400 transition-colors duration-300"><i className="fab fa-instagram"></i></a>
            </div>
          </motion.div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="font-brenet-regular">&copy; 2024 ChatApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;