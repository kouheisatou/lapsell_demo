import React, { useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, User, Calendar, Eye, Users, Trophy, Play } from 'lucide-react';
import { AppContext, WorkSlot } from '../App';
import { AppBar } from './AppBar';

interface CreatorDetailProps {
  creatorName: string;
  onBack: () => void;
  onCapsuleClick: (workSlot: WorkSlot) => void;
}

export function CreatorDetail({ creatorName, onBack, onCapsuleClick }: CreatorDetailProps) {
  const context = useContext(AppContext);
  if (!context) return null;
  
  const { workSlots } = context;
  
  // Get creator's work slots
  const creatorWorkSlots = workSlots.filter(workSlot => workSlot.creator === creatorName);
  const completedWorkSlots = creatorWorkSlots.filter(workSlot => workSlot.workCompleted);
  const activeWorkSlots = creatorWorkSlots.filter(workSlot => !workSlot.auctionEnded);
  
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

  const handleWorkSlotClick = (workSlot: WorkSlot) => {
    onCapsuleClick(workSlot);
  };

  const handleSamplePlay = (workSlot: WorkSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    alert('サンプル動画を再生中...\n（制作過程の最初の30秒間をお楽しみください）');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppBar title="クリエイター詳細" showBackButton onBack={onBack} />
      
      <div className="p-4 space-y-6">
        {/* Creator Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-6 w-6" />
              <span>{creatorName}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold text-primary">{creatorWorkSlots.length}</p>
                <p className="text-sm text-muted-foreground">総出品数</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-green-600">{completedWorkSlots.length}</p>
                <p className="text-sm text-muted-foreground">完了作品</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-blue-600">{activeWorkSlots.length}</p>
                <p className="text-sm text-muted-foreground">開催中</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Auctions */}
        {activeWorkSlots.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">開催中のオークション</h3>
            <div className="grid gap-4">
              {activeWorkSlots.map((workSlot) => (
                <Card key={workSlot.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4" onClick={() => handleWorkSlotClick(workSlot)}>
                    <div className="flex gap-4">
                      <div className="relative">
                        <ImageWithFallback
                          src={workSlot.thumbnail}
                          alt={workSlot.title}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        {workSlot.sampleVideoUrl && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute inset-0 m-auto w-8 h-8 rounded-full p-0"
                            onClick={(e) => handleSamplePlay(workSlot, e)}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{workSlot.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {workSlot.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm font-medium text-primary">
                            ¥{workSlot.currentPrice.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatTimeRemaining(workSlot.endTime, workSlot.auctionEnded)}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            上位{workSlot.maxWinners}名
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Works */}
        {completedWorkSlots.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              完了作品（サンプル視聴可能）
            </h3>
            <div className="grid gap-4">
              {completedWorkSlots.map((workSlot) => (
                <Card key={workSlot.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4" onClick={() => handleWorkSlotClick(workSlot)}>
                    <div className="flex gap-4">
                      <div className="relative">
                        <ImageWithFallback
                          src={workSlot.thumbnail}
                          alt={workSlot.title}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        {workSlot.sampleVideoUrl && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute inset-0 m-auto w-8 h-8 rounded-full p-0"
                            onClick={(e) => handleSamplePlay(workSlot, e)}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        <div className="absolute -top-1 -right-1">
                          <Badge className="bg-green-600 hover:bg-green-600 text-xs px-2 py-0.5">
                            完了
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{workSlot.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {workSlot.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm font-medium text-green-600">
                            最終価格: ¥{workSlot.currentPrice.toLocaleString()}
                          </span>
                          {workSlot.winners && workSlot.winners.length > 0 && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {workSlot.winners.length}名が視聴可能
                            </span>
                          )}
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-blue-50 border-blue-200 text-blue-600"
                          >
                            サンプル視聴可
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other Works */}
        {creatorWorkSlots.filter(workSlot => workSlot.auctionEnded && !workSlot.workCompleted).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">その他の作品</h3>
            <div className="grid gap-4">
              {creatorWorkSlots
                .filter(workSlot => workSlot.auctionEnded && !workSlot.workCompleted)
                .map((workSlot) => (
                <Card key={workSlot.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4" onClick={() => handleWorkSlotClick(workSlot)}>
                    <div className="flex gap-4">
                      <ImageWithFallback
                        src={workSlot.thumbnail}
                        alt={workSlot.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{workSlot.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {workSlot.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            落札価格: ¥{workSlot.currentPrice.toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {workSlot.workInProgress ? '作業中' : '落札済'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {creatorWorkSlots.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">まだ出品されている作業枠はありません</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}