import React, { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Package, ShoppingBag } from 'lucide-react';
import { AppContext, WorkSlot } from '../App';
import { AppBar } from './AppBar';

interface ProfileProps {
  onBack: () => void;
  onCapsuleClick: (workSlot: WorkSlot) => void;
}

export function Profile({ onBack, onCapsuleClick }: ProfileProps) {
  const context = useContext(AppContext);
  if (!context) return null;
  
  const { workSlots, currentUser } = context;
  
  const myListedWorkSlots = workSlots.filter(workSlot => workSlot.isMyListing);
  const myPurchasedWorkSlots = workSlots.filter(workSlot => workSlot.isOwned && !workSlot.isMyListing);
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

  const WorkSlotList = ({ workSlots, showOwnershipBadges = true }: { workSlots: WorkSlot[], showOwnershipBadges?: boolean }) => (
    <div className="grid grid-cols-2 gap-4">
      {workSlots.map((workSlot) => (
        <Card 
          key={workSlot.id} 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onCapsuleClick(workSlot)}
        >
          <CardContent className="p-0">
            <div className="relative">
              <ImageWithFallback
                src={workSlot.thumbnail}
                alt={workSlot.title}
                className="w-full h-32 object-cover rounded-t-lg"
              />
              {showOwnershipBadges && workSlot.isUnlocked && (
                <Badge 
                  className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-600"
                >
                  視聴可能
                </Badge>
              )}
              
              {workSlot.auctionEnded && (
                <Badge 
                  className="absolute bottom-2 left-2 bg-gray-600 hover:bg-gray-600"
                >
                  終了
                </Badge>
              )}
            </div>
            
            <div className="p-3">
              <h3 className="line-clamp-1 mb-1">{workSlot.title}</h3>
              <p className="text-muted-foreground mb-2">{workSlot.creator}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-primary">¥{workSlot.currentPrice.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm">
                  {formatTimeRemaining(workSlot.endTime, workSlot.auctionEnded)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AppBar title="プロフィール" showBackButton onBack={onBack} />
      
      <div className="p-4">
        {/* User Info */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-primary-foreground text-2xl">
              {currentUser.charAt(0)}
            </div>
            <h3>{currentUser}</h3>
            <p className="text-muted-foreground">クリエイター/コレクター</p>
          </CardContent>
        </Card>



        {/* Tabs */}
        <Tabs defaultValue="purchased" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="purchased" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              購入済み
            </TabsTrigger>
            <TabsTrigger value="listed" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              出品中
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="purchased" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3>購入した作業枠</h3>
                <Badge variant="secondary">{myPurchasedWorkSlots.length}個</Badge>
              </div>
              
              {myPurchasedWorkSlots.length > 0 ? (
                <WorkSlotList workSlots={myPurchasedWorkSlots} />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    まだ作業枠を購入していません
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="listed" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3>出品中の作業枠</h3>
                <Badge variant="secondary">{myListedWorkSlots.length}個</Badge>
              </div>
              
              {myListedWorkSlots.length > 0 ? (
                <WorkSlotList workSlots={myListedWorkSlots} showOwnershipBadges={false} />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    まだ作業枠を出品していません
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}