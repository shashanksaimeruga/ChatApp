'use client';

import { useState, useEffect } from 'react';
import ChatWindow from "@/components/chat/chatwindow";
import Sidebar from "@/components/chat/sidebar";
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Loader2, Moon, Sparkles, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeSwitcher } from '@/components/themeswitcher';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';

export interface UserType {
  _id: string;
  username: string;
  profilePicture?: string;
}

export interface GroupType {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: UserType[];
  groupAdmin: string;
  profilePicture?: string;
  bio?: string;
}

const ChatLayout = () => {
  const { theme } = useTheme();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('selectedUser') || 'null');
    setSelectedUser(savedUser);

    const fetchCurrentUser = async () => {
      try {
        const username = localStorage.getItem("username");
        const response = await axios.get(`http://localhost:4500/users/${username}`, {
          withCredentials: true
        });
        if (response.status === 200) {
          setCurrentUser(response.data);
          console.log("Current user:", response.data);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUser({ _id: userId, username: localStorage.getItem('username') || '' });
      setIsLoading(false);
    } else {
      fetchCurrentUser();
    }
  }, []);

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
    localStorage.setItem('selectedUser', JSON.stringify(user));
  };

  const handleSelectGroup = (group: GroupType) => {
    setSelectedGroup(group);
    setSelectedUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="bg-card p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-card-foreground">Unable to fetch user data. Please try logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className={`flex h-screen overflow-hidden relative ${
        isDarkTheme
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900'
          : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
      }`}
    >
      {/* Background particles and celestial objects remain unchanged */}

      {/* Main content */}
      <motion.div 
        className="flex w-full h-full p-8 z-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`flex w-full h-full bg-opacity-10 backdrop-filter backdrop-blur-2xl rounded-3xl overflow-hidden border border-opacity-20 shadow-2xl relative ${
          isDarkTheme
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-white'
        }`}>
          {/* Enhanced glassmorphism effect */}
          <div className={`absolute inset-0 bg-gradient-to-br opacity-10 ${
            isDarkTheme
              ? 'from-gray-700 to-transparent'
              : 'from-white to-transparent'
          }`}></div>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>

          {/* Sidebar */}
          <motion.div 
            className={`w-96 border-r border-opacity-20 ${
              isDarkTheme ? 'border-gray-700' : 'border-white'
            }`}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Sidebar
              onSelectUser={handleSelectUser}
              onSelectGroup={handleSelectGroup}
              currentUser={currentUser}
            />
          </motion.div>

          {/* Main content area */}
          <motion.div 
            className="flex-1 relative"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {selectedUser || selectedGroup ? (
                <ChatWindow
                  currentUser={currentUser}
                  selectedUser={selectedUser}
                  selectedGroup={selectedGroup}
                  onBack={() => {
                    setSelectedUser(null);
                    setSelectedGroup(null);
                  }}
                />
              ) : (
                <EmptyState theme={theme} />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced theme switcher */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={`absolute top-4 right-4 z-20 bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-full p-2 ${
                isDarkTheme ? 'bg-gray-800' : 'bg-white'
              }`}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <ThemeSwitcher/>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle theme</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Decorative elements and gradient border remain unchanged */}
    </motion.div>
  );
};

const EmptyState = ({ theme }) => {
  const isDarkTheme = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center h-full"
    >
      <div className="text-center space-y-4 relative">
        <motion.div
          className={`absolute inset-0 opacity-30 blur-3xl ${
            isDarkTheme
              ? 'bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900'
              : 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300'
          }`}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
        ></motion.div>
        <motion.img
          src="/chat-illustration.svg"
          alt="Chat"
          className="w-64 h-64 mx-auto drop-shadow-2xl"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
        <motion.h2
          className={`text-3xl font-bold text-shadow-lg ${
            isDarkTheme ? 'text-gray-100' : 'text-white'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to the Chat
        </motion.h2>
        <motion.p
          className={`opacity-80 text-shadow ${
            isDarkTheme ? 'text-gray-300' : 'text-white'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.3 }}
        >
          Select a contact to start messaging
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            variant="outline" 
            className={`bg-opacity-20 hover:bg-opacity-30 backdrop-filter backdrop-blur-sm ${
              isDarkTheme
                ? 'bg-gray-800 text-gray-100'
                : 'bg-white text-white'
            }`}
          >
            Create New Chat
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChatLayout;