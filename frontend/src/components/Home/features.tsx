import { Card } from "../ui/card";
import { MessageCircle, Share, Users, Shield, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { title: "Real-time Messaging", description: "Instant messaging with no delays.", icon: <MessageCircle className="h-12 w-12 text-blue-500" /> },
  { title: "Media Sharing", description: "Share photos, videos, and files effortlessly.", icon: <Share className="h-12 w-12 text-green-500" /> },
  { title: "Group Chats", description: "Create and manage group conversations easily.", icon: <Users className="h-12 w-12 text-purple-500" /> },
  { title: "End-to-End Encryption", description: "Your conversations are always secure.", icon: <Shield className="h-12 w-12 text-red-500" /> },
  { title: "Global Accessibility", description: "Connect with anyone, anywhere in the world.", icon: <Globe className="h-12 w-12 text-yellow-500" /> },
  { title: "Lightning Fast", description: "Optimized for speed and performance.", icon: <Zap className="h-12 w-12 text-orange-500" /> },
];

const Features = () => {
  return (
    <section id="features" className="py-20 relative bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900">
      <div className="absolute inset-0 bg-[url('/path/to/feature-pattern.svg')] opacity-5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-7xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-16 font-brenet-outline"
        >
          Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-200 border-opacity-20 overflow-hidden group">
                <div className="flex justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-pink-400 transition-colors duration-300 font-brenet-stripes">{feature.title}</h3>
                <p className="text-gray-300 group-hover:text-white transition-colors duration-300 font-brenet-regular">{feature.description}</p>
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900 via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;