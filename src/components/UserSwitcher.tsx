import React, { useContext } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { ChevronDown, User } from 'lucide-react';
import { AppContext } from '../App';

export function UserSwitcher() {
  const context = useContext(AppContext);
  if (!context) return null;
  
  const { currentUser, users, switchUser } = context;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-background/95 backdrop-blur-sm border-border/50"
        >
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs">
            {currentUser.charAt(0)}
          </div>
          <span className="max-w-20 truncate">{currentUser}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {users.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => {
              if (user.name !== currentUser) {
                switchUser(user.id);
              }
            }}
            disabled={user.name === currentUser}
            className="flex flex-col items-start gap-1 p-3 h-auto"
          >
            <div className="flex items-center gap-2 w-full">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs">
                {user.name.charAt(0)}
              </div>
              <span className="flex-1">{user.name}</span>
              {user.name === currentUser && (
                <Badge variant="secondary" className="text-xs">
                  現在
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground ml-8">
              {user.role} • {user.description}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}