import { useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const ProfilePrompt = () => {
  const [loading, setLoading] = useState(false);

  const handleComplete = () => {
    window.location.href = '/completeprofile';
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:4500/users/skip-profile-prompt', {}, { withCredentials: true });
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error skipping profile prompt:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
        <p className="mb-6">Would you like to complete your profile now? You can always do this later.</p>
        <div className="flex justify-between">
          <Button onClick={handleComplete}>Complete Profile</Button>
          <Button variant="outline" onClick={handleSkip} disabled={loading}>
            {loading ? 'Skipping...' : 'Skip for Now'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePrompt;