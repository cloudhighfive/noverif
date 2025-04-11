// src/components/common/SessionWarning.tsx
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertOctagon } from 'lucide-react';

interface SessionWarningProps {
  timeRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

const SessionWarning: React.FC<SessionWarningProps> = ({ 
  timeRemaining, 
  onExtend, 
  onLogout 
}) => {
  useEffect(() => {
    // Play sound when warning appears
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
  }, []);

  // Format seconds remaining
  const secondsRemaining = Math.floor(timeRemaining / 1000);
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full bg-red-900/20 border-red-500">
        <CardContent className="p-6">
          <div className="flex items-start">
            <AlertOctagon className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Session About to Expire
              </h3>
              <p className="text-gray-300 mb-4">
                For your security, your session will expire in <span className="font-bold text-red-400">{secondsRemaining} seconds</span> due to inactivity.
              </p>
              <div className="flex space-x-3">
                <Button 
                  onClick={onExtend}
                  className="flex-1"
                >
                  Stay Signed In
                </Button>
                <Button 
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={onLogout}
                >
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionWarning;