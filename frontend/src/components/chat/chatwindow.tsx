import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import io from 'socket.io-client';

import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Send, ArrowLeft, Phone, Video, MoreVertical, Paperclip, Smile, Pause, Play } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Sparkles, Mic, Camera } from 'lucide-react';
import { useHover } from '@react-aria/interactions';
import { Slider } from '../ui/slider';
const socket = io('http://localhost:4500'); // Replace with your backend URL

export interface UserType {
  bio: string;
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

interface MessageType {
  createdAt: any;
  _id: string;
  sender: string;
  content: string;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: string;
}

interface ChatWindowProps {
  currentUser: UserType;
  selectedUser: UserType | null;
  selectedGroup: GroupType | null;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, selectedUser, selectedGroup, onBack }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef(messages);
  const [parent] = useAutoAnimate();
  const { hoverProps, isHovered } = useHover({});
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const renderMessageBubble = (msg: MessageType) => {
    const isCurrentUser = msg.sender === currentUser._id;
   
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-xs md:max-w-md lg:max-w-lg p-4 rounded-2xl shadow-lg ${
            isCurrentUser 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
              : 'bg-white bg-opacity-20 text-white'
          }`}
        >
          <div>{renderMessageContent(msg)}</div>
          <p className="text-xs mt-2 text-right opacity-80">{format(new Date(msg.createdAt), 'hh:mm a')}</p>
        </div>
      </motion.div>
    );
  };
  useEffect(() => {
    socket.on('msg-recieve', (message: MessageType) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });
  
    return () => {
      socket.off('msg-recieve');
    };
  }, []);
  useEffect(() => {
    if (selectedUser || selectedGroup) {
      fetchMessages();
      socket.emit('add-user', currentUser._id);
    }
  }, [selectedUser, selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState<UserType | null>(null);

  const fetchUserProfile = async (username: string) => {
    try {
      const response = await axios.get(`http://localhost:4500/users/${username}`, { withCredentials: true });
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewProfile = () => {
    if (selectedUser) {
      fetchUserProfile(selectedUser.username);
      setIsProfileOpen(true);
    }
  };
  const fetchMessages = async () => {
    if (!selectedUser && !selectedGroup) return;
    setIsLoading(true);
    try {
      const chatId = selectedUser ? selectedUser._id : selectedGroup?._id;
      const response = await axios.get(`http://localhost:4500/api/messages/${chatId}`, { withCredentials: true });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch messages. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!selectedUser && !selectedGroup) || !newMessage.trim() || !currentUser) return;

    setIsSending(true);

    const now = new Date();
    const tempMessage: MessageType = {
      _id: now.getTime().toString(),
      sender: currentUser._id,
      content: newMessage,
      createdAt: now.toISOString(),
      timestamp: now,
    };

    setMessages(prevMessages => [...prevMessages, tempMessage]);
    setNewMessage('');

    try {
      const payload = {
        from: currentUser._id,
        to: selectedUser ? selectedUser._id : selectedGroup?._id,
        content: newMessage,
        isGroupChat: !!selectedGroup,
      };

      const response = await axios.post('http://localhost:4500/api/messages', payload, { withCredentials: true });

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === tempMessage._id ? { ...msg, ...response.data.data, createdAt: new Date(response.data.data.createdAt) } : msg
        )
      );

      socket.emit('send-msg', {
        to: selectedUser ? selectedUser._id : selectedGroup?._id,
        msg: response.data.data,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg._id !== tempMessage._id)
      );
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendMedia = async (file: File) => {
    setIsSending(true);
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('from', currentUser._id);
    formData.append('to', selectedUser ? selectedUser._id : selectedGroup?._id || '');
    formData.append('isGroupChat', String(!!selectedGroup));
  
    try {
      const response = await axios.post('http://localhost:4500/api/messages/media', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const newMessage: MessageType = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
      };
  
      setMessages(prevMessages => [...prevMessages, newMessage]);
  
      socket.emit('send-msg', {
        to: selectedUser ? selectedUser._id : selectedGroup?._id,
        msg: newMessage,
      });
    } catch (error) {
      console.error('Error sending media:', error);
      toast({
        title: 'Error',
        description: 'Failed to send media. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendMedia(file);
    }
  };


  const handleEmojiSelect = (emojiData: EmojiClickData, event: MouseEvent) => {
    setNewMessage(prevMessage => prevMessage + emojiData.emoji);
  };

  const renderMessageContent = (msg: MessageType) => {
    if (msg.mediaUrl) {
      if (msg.mediaType?.startsWith('image')) {
        return <img src={`http://localhost:4500${msg.mediaUrl}`} alt="Shared image" className="max-w-full rounded-lg" />;
      } else if (msg.mediaType?.startsWith('video')) {
        return (
          <video controls className="max-w-full rounded-lg">
            <source src={`http://localhost:4500${msg.mediaUrl}`} type={msg.mediaType} />
            Your browser does not support the video tag.
          </video>
        );
      } else {
        return <a href={`http://localhost:4500${msg.mediaUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Download file</a>;
      }
    }
    return <p className="text-sm">{msg.content}</p>;
  };

  if (!selectedUser && !selectedGroup) {
    return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center h-full"
        >
          <p className="text-2xl text-gray-500 font-brenet-regular">Select a user or group to start chatting</p>
        </motion.div>
    );
  }

  const chatName = selectedUser ? selectedUser.username : selectedGroup?.chatName ?? 'Unknown';
  const chatImage = selectedUser ? selectedUser.profilePicture : selectedGroup?.profilePicture;
  const playPauseAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const clearChat = async () => {
    try {
      const chatId = selectedUser ? selectedUser._id : selectedGroup?._id;
      await axios.delete(`http://localhost:4500/api/messages/${chatId}`, { withCredentials: true });
      setMessages([]);
      toast({
        title: 'Success',
        description: 'Chat cleared successfully.',
      });
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear chat. Please try again.',
        variant: 'destructive',
      });
    }
  };
  const onAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
  };

  const onAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress((audioRef.current.currentTime / audioDuration) * 100);
    }
  };

  const setAudioTime = (value: number) => {
    if (audioRef.current) {
      const time = (value / 100) * audioDuration;
      audioRef.current.currentTime = time;
      setAudioProgress(value);
    }
  };

  function handleSendMessage(event: FormEvent<HTMLFormElement>): void {
    throw new Error('Function not implemented.');
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>): void {
    throw new Error('Function not implemented.');
  }

  return (
    <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col h-full bg-transparent backdrop-filter backdrop-blur-lg rounded-3xl overflow-hidden relative"
  >
    {/* Decorative elements */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 pointer-events-none"></div>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500"></div>
    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500"></div>
    <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500 via-pink-500 to-purple-500"></div>

    {/* Floating particles */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 10 + 5}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        ></div>
      ))}
    </div>

    {/* Chat header */}
    <Card className="bg-white/10 border-none rounded-none backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden text-white hover:bg-white/20">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Avatar className="h-12 w-12 ring-2 ring-white/60">
            <AvatarImage src={`http://localhost:4500/uploads/${selectedUser?.profilePicture || selectedGroup?.profilePicture || 'default.jpg'}`} />
            <AvatarFallback>{selectedUser?.username?.[0] || selectedGroup?.chatName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-white">{selectedUser?.username || selectedGroup?.chatName}</h2>
            <p className="text-sm text-white/70">{selectedGroup ? `${selectedGroup.users.length} members` : 'Online'}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Phone className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start voice call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Video className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start video call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white/10 backdrop-blur-md border-white/20">
          <DropdownMenuItem className="text-white hover:bg-white/20" onSelect={handleViewProfile}>View Profile</DropdownMenuItem>
          <DropdownMenuItem className="text-white hover:bg-white/20">Mute Notifications</DropdownMenuItem>
          <DropdownMenuItem className="text-white hover:bg-white/20">Block User</DropdownMenuItem>
          <DropdownMenuItem className="text-white hover:bg-white/20" onSelect={clearChat}>Clear Chat</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-md border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">User Profile</DialogTitle>
          </DialogHeader>
          {profileData && (
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 ring-2 ring-white/60">
                <AvatarImage src={`http://localhost:4500/uploads/${profileData.profilePicture || 'default.jpg'}`} />
                <AvatarFallback>{profileData.username[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-white">{profileData.username}</h2>
              <p className="text-white/70">{profileData.bio || 'No bio available'}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </div>
      </CardHeader>
    </Card>

    {/* Chat messages */}
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
      <AnimatePresence>
        {messages.map((message) => renderMessageBubble(message))}
      </AnimatePresence>
    </ScrollArea>

    {/* Audio player */}
    {audioURL && (
      <Card className="bg-white/10 border-none backdrop-blur-md">
        <CardContent className="p-2 flex items-center space-x-2">
          <Button size="icon" variant="ghost" onClick={playPauseAudio} className="text-white hover:bg-white/20">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Slider
            value={[audioProgress]}
            max={100}
            step={1}
            onValueChange={(value) => setAudioTime(value[0])}
            className="flex-1"
          />
          <audio
            ref={audioRef}
            src={audioURL}
            onEnded={onAudioEnded}
            onTimeUpdate={onAudioTimeUpdate}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setAudioDuration(audioRef.current.duration);
              }
            }}
          />
        </CardContent>
      </Card>
    )}

<Card className="bg-white bg-opacity-10 border-none rounded-none">
        <CardFooter>
          <form onSubmit={sendMessage} className="w-full">
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white hover:bg-opacity-20">
                    <Smile className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <EmojiPicker onEmojiClick={handleEmojiSelect} />
                </PopoverContent>
              </Popover>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white hover:bg-opacity-20">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                  </DialogHeader>
                  <Input type="file" onChange={handleFileSelection} />
                  
                </DialogContent>
              </Dialog>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 bg-white bg-opacity-20 border-white border-opacity-20 text-white placeholder-white placeholder-opacity-60"
              />
              <Button variant="ghost" size="icon" className="text-white hover:bg-white hover:bg-opacity-20" onClick={() => setIsRecording(!isRecording)}>
                <Mic className="h-5 w-5" />
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </CardFooter>
      </Card>
  </motion.div>
);
};

export default ChatWindow;