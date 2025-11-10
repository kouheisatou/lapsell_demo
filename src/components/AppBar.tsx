import React from 'react';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { UserSwitcher } from './UserSwitcher';

interface AppBarProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function AppBar({ title, showBackButton = false, onBack }: AppBarProps) {
  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/50 z-40">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {showBackButton && onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {title && <h2 className="text-lg font-medium">{title}</h2>}
        </div>
        
        <UserSwitcher />
      </div>
    </div>
  );
}