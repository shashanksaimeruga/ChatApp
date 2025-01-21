import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, UserCircleIcon, Search, X, Plus, Badge, Settings, LogOut, Users, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ThemeSwitcher } from '../themeswitcher';

export interface UserType {
  isOnline: any;
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

interface SidebarProps {
  onSelectUser: (user: UserType) => void;
  onSelectGroup: (group: GroupType) => void;
  currentUser: UserType;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectUser, onSelectGroup, currentUser }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [activeChats, setActiveChats] = useState<(UserType | GroupType)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupBio, setNewGroupBio] = useState('');
  const [newGroupProfilePic, setNewGroupProfilePic] = useState<File | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<UserType[]>([]);
  const [currentTab, setCurrentTab] = useState('recent');
  const { toast } = useToast();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    fetchUsers();
    fetchGroups();
    loadActiveChats();
    
    socketRef.current = io('http://localhost:4500');

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
      socketRef.current.emit('add-user', currentUser._id);
    });

    socketRef.current.on('user-online', (userId: string) => {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, isOnline: true } : user
        )
      );
    });

    socketRef.current.on('user-offline', (userId: string) => {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, isOnline: false } : user
        )
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser._id]);

  useEffect(() => {
    if (currentTab === 'groups') {
      fetchGroups();
    }
  }, [currentTab]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:4500/users/all', { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to fetch users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    console.log('Fetching groups...');
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:4500/api/messages/all', { withCredentials: true });
      console.log('Groups received:', response.data);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error.response?.data || error.message);
      setError('Failed to fetch groups. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to fetch groups. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveChats = () => {
    const savedChats = JSON.parse(localStorage.getItem('activeChats') || '[]');
    setActiveChats(savedChats);
  };

  const handleSelectUser = (user: UserType) => {
    onSelectUser(user);
    saveActiveChat(user);
  };

  const handleSelectGroup = (group: GroupType) => {
    onSelectGroup(group);
    saveActiveChat(group);
  };

  const saveActiveChat = (chat: UserType | GroupType) => {
    const updatedChats = [...activeChats.filter(c => c._id !== chat._id), chat];
    setActiveChats(updatedChats);
    localStorage.setItem('activeChats', JSON.stringify(updatedChats));
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || selectedMembers.length < 2) {
      toast({
        title: 'Error',
        description: 'Please provide a group name and select at least 2 members.',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('name', newGroupName);
    formData.append('bio', newGroupBio);
    selectedMembers.forEach(member => formData.append('members', member._id));
    if (newGroupProfilePic) {
      formData.append('profilePicture', newGroupProfilePic);
    }

    try {
      const response = await axios.post('http://localhost:4500/api/messages/groups', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      const newGroup = response.data;
      setGroups(prevGroups => [...prevGroups, newGroup]);
      handleSelectGroup(newGroup);  // Automatically select the newly created group
      toast({
        title: 'Success',
        description: 'Group created successfully!',
      });
      setIsCreateGroupOpen(false);
      resetGroupCreationForm();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: 'Error',
        description: 'Failed to create group. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetGroupCreationForm = () => {
    setNewGroupName('');
    setNewGroupBio('');
    setNewGroupProfilePic(null);
    setSelectedMembers([]);
  };

 
  const renderUserList = (userList: UserType[]) => {
    const filteredUsers = userList.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filteredUsers.map((user) => (
      <motion.div
        key={user._id}
        onClick={() => handleSelectUser(user)}
        className="p-2 hover:bg-accent cursor-pointer transition-colors duration-200 ease-in-out rounded-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-2 flex items-center space-x-3">
            <Avatar className="w-10 h-10 rounded-full shadow-md">
              <AvatarImage 
                src={`http://localhost:4500/uploads/${user.profilePicture || 'default.jpg'}`} 
                alt={user.username} 
              />
              <AvatarFallback className="bg-secondary font-brenet-regular">{user.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="font-medium text-white font-brenet-shadow">{user.username}</p>
              <p className="text-xs text-white text-opacity-60 font-brenet-regular">Last message...</p>
            </div>
            {user.isOnline && (
              <Badge className="bg-green-500 text-white shadow-md" size="sm">
                Online
              </Badge>
            )}
          </CardContent>
        </Card>
      </motion.div>
    ));
  };

  const renderGroupList = (groupList: GroupType[]) => {
    const filteredGroups = groupList.filter((group) =>
      group.chatName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filteredGroups.map((group) => (
      <motion.div
        key={group._id}
        onClick={() => handleSelectGroup(group)}
        className="p-2 hover:bg-accent cursor-pointer transition-colors duration-200 ease-in-out rounded-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-2 flex items-center space-x-3">
            <Avatar className="w-10 h-10 rounded-full shadow-md">
              <AvatarImage 
                src={`http://localhost:4500/uploads/${group.profilePicture || 'default.jpg'}`} 
                alt={group.chatName} 
              />
              <AvatarFallback className="bg-secondary font-brenet-regular">{group.chatName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="font-medium text-white font-brenet-shadow">{group.chatName}</p>
              <p className="text-xs text-white text-opacity-60 font-brenet-regular">{group.bio || 'No bio available'}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ));
  };

  const renderActiveChats = () => {
    const filteredChats = activeChats.filter((chat) => {
      if ('username' in chat) {
        return chat.username.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        return chat.chatName.toLowerCase().includes(searchTerm.toLowerCase());
      }
    });

    return filteredChats.map((chat) => (
      <motion.div
        key={chat._id}
        onClick={() => ('username' in chat ? handleSelectUser(chat) : handleSelectGroup(chat))}
        className="p-2 hover:bg-accent cursor-pointer transition-colors duration-200 ease-in-out rounded-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-2 flex items-center space-x-3">
            <Avatar className="w-10 h-10 rounded-full shadow-md">
              <AvatarImage 
                src={`http://localhost:4500/uploads/${('username' in chat ? chat.profilePicture : chat.profilePicture) || 'default.jpg'}`} 
                alt={('username' in chat ? chat.username : chat.chatName)} 
              />
              <AvatarFallback className="bg-secondary font-brenet-regular">{('username' in chat ? chat.username : chat.chatName).charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="font-medium text-white font-brenet-shadow">{'username' in chat ? chat.username : chat.chatName}</p>
              <p className="text-xs text-white text-opacity-60 font-brenet-regular">{'username' in chat ? 'Last message...' : chat.bio || 'No bio available'}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ));
  };

  return (
    <div className="h-full bg-transparent backdrop-filter backdrop-blur-lg p-6 relative overflow-hidden border-r border-white border-opacity-20">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-pink-500 via-purple-500 to-blue-500"></div>

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

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center justify-between"
      >
        <h2 className="text-3xl font-bold text-white">Chats</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white border-white border-opacity-20"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 backdrop-filter backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Create New Chat</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateGroup(); }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    placeholder="Enter group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="border-accent text-accent-foreground shadow-inner"
                  />
                </div>
                <div>
                  <Label htmlFor="group-bio">Group Bio</Label>
                  <Textarea
                    id="group-bio"
                    placeholder="Enter group bio"
                    value={newGroupBio}
                    onChange={(e) => setNewGroupBio(e.target.value)}
                    className="border-accent text-accent-foreground shadow-inner"
                  />
                </div>
                <div>
                  <Label htmlFor="group-profile-pic">Group Profile Picture</Label>
                  <Input
                    id="group-profile-pic"
                    type="file"
                    onChange={(e) => setNewGroupProfilePic(e.target.files?.[0] || null)}
                    className="border-accent text-accent-foreground shadow-inner"
                  />
                </div>
                <div>
                  <Label>Select Members</Label>
                  <ScrollArea className="h-32 border rounded-lg shadow-inner border-accent">
                    {users.map((user) => (
                      <div key={user._id} className="flex items-center space-x-3 p-2 hover:bg-accent cursor-pointer transition-colors duration-200 ease-in-out rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedMembers.some((member) => member._id === user._id)}
                          onChange={() => {
                            setSelectedMembers((prev) =>
                              prev.some((member) => member._id === user._id)
                                ? prev.filter((member) => member._id !== user._id)
                                : [...prev, user]
                            );
                          }}
                          className="form-checkbox border-accent text-accent-foreground"
                        />
                        <Avatar className="w-8 h-8 rounded-full shadow-md">
                          <AvatarImage 
                            src={`http://localhost:4500/uploads/${user.profilePicture || 'default.jpg'}`} 
                            alt={user.username} 
                          />
                          <AvatarFallback className="bg-secondary font-brenet-regular">{user.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-foreground font-brenet-regular">{user.username}</span>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => setIsCreateGroupOpen(false)} className="text-accent-foreground">Cancel</Button>
                <Button type="submit" className="bg-accent text-accent-foreground">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative mb-6"
      >
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder-white placeholder-opacity-60 pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white opacity-60" />
      </motion.div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-white bg-opacity-10 rounded-full p-1">
          <TabsTrigger value="recent" className="rounded-full text-white">
            <Clock className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger value="contacts" className="rounded-full text-white">
            <User className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger value="groups" className="rounded-full text-white">
            <Users className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full text-white">
            <Settings className="h-5 w-5" />
          </TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <TabsContent value="recent">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                {renderActiveChats()}
              </ScrollArea>
            </motion.div>
          </TabsContent>
          <TabsContent value="contacts">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                {renderUserList(users)}
              </ScrollArea>
            </motion.div>
          </TabsContent>
          <TabsContent value="groups">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                {renderGroupList(groups)}
              </ScrollArea>
            </motion.div>
          </TabsContent>
          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <ThemeSwitcher />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white"
                  onClick={() => {/* Add logout functionality */}}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

export default Sidebar;