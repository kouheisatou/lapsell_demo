import React, { useState } from 'react';
import { Button } from './ui/button';
import { User, Plus, Settings, Menu } from 'lucide-react';

interface FloatingActionButtonProps {
  onProfileClick: () => void;
  onNewCapsuleClick: () => void;
  onSettingsClick: () => void;
}

export function FloatingActionButton({ 
  onProfileClick, 
  onNewCapsuleClick, 
  onSettingsClick 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen && (
        <div className="flex flex-col-reverse gap-3 mb-3">
          <Button
            onClick={() => {
              onProfileClick();
              setIsOpen(false);
            }}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
          >
            <User className="h-6 w-6" />
          </Button>
          <Button
            onClick={() => {
              onNewCapsuleClick();
              setIsOpen(false);
            }}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
          >
            <Plus className="h-6 w-6" />
          </Button>
          <Button
            onClick={() => {
              onSettingsClick();
              setIsOpen(false);
            }}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      )}
      <Button
        onClick={toggleMenu}
        size="lg"
        className="rounded-full h-16 w-16 shadow-lg bg-primary hover:bg-primary/90"
      >
        <Menu className="h-6 w-6" />
      </Button>
    </div>
  );
}