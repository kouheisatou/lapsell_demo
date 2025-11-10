import React, { useContext } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Loader2, CheckCircle2, Users } from 'lucide-react';
import { AppContext, WorkSlot } from '../App';
import { AppBar } from './AppBar';

interface WorkSlotGridProps {
  onCapsuleClick: (workSlot: WorkSlot) => void;
  onCreatorClick?: (creatorName: string) => void;
}

export function CapsuleGrid({ onCapsuleClick, onCreatorClick }: WorkSlotGridProps) {
  const context = useContext(AppContext);
  if (!context) return null;
  
  const { workSlots } = context;
  const formatTimeRemaining = (endTime: string, auctionEnded?: boolean) => {
    if (auctionEnded) return '終了';
    
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return '終了';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppBar title="Lapsell" />
      
      <div className="p-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {workSlots.map((capsule) => (
            <Card 
              key={capsule.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onCapsuleClick(capsule)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <ImageWithFallback
                    src={capsule.thumbnail}
                    alt={capsule.title}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  {capsule.isMyListing && (
                    <Badge 
                      className="absolute top-2 left-2 bg-purple-600 hover:bg-purple-600"
                    >
                      出品中
                    </Badge>
                  )}
                  {capsule.isOwned && !capsule.isMyListing && (
                    <Badge 
                      className="absolute top-2 left-2 bg-green-600 hover:bg-green-600"
                    >
                      所有中
                    </Badge>
                  )}
                  {capsule.isUnlocked && (
                    <Badge 
                      className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-600"
                    >
                      視聴可能
                    </Badge>
                  )}
                  {capsule.auctionEnded && !capsule.workInProgress && !capsule.workCompleted && (
                    <Badge 
                      className="absolute bottom-2 left-2 bg-gray-600 hover:bg-gray-600"
                    >
                      落札済み
                    </Badge>
                  )}
                  {capsule.workInProgress && (
                    <Badge 
                      className="absolute bottom-2 left-2 bg-orange-600 hover:bg-orange-600"
                    >
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      作業中
                    </Badge>
                  )}
                  {capsule.workCompleted && !capsule.isUnlocked && (
                    <Badge 
                      className="absolute bottom-2 left-2 bg-yellow-600 hover:bg-yellow-600"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      作業完了
                    </Badge>
                  )}
                </div>
                
                <div className="p-3">
                  <h3 className="line-clamp-1 mb-1">{capsule.title}</h3>
                  <p 
                    className="text-muted-foreground mb-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreatorClick?.(capsule.creator);
                    }}
                  >
                    {capsule.creator}
                  </p>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-primary">¥{capsule.currentPrice.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm">
                      {formatTimeRemaining(capsule.endTime, capsule.auctionEnded)}
                    </span>
                  </div>
                  
                  {capsule.maxWinners && capsule.maxWinners > 1 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>上位{capsule.maxWinners}名が落札</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}