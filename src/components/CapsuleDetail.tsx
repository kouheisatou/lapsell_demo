import React, { useState, useContext, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Play, Clock, User, DollarSign, Unlock, PlayCircle, CheckCircle2, Loader2, Camera, Video, Users, Trophy, Crown, Upload } from 'lucide-react';
import { AppContext, WorkSlot } from '../App';
import { AppBar } from './AppBar';

interface WorkSlotDetailProps {
  capsule: WorkSlot;
  onBack: () => void;
  onCreatorClick?: (creatorName: string) => void;
}

export function CapsuleDetail({ capsule, onBack, onCreatorClick }: WorkSlotDetailProps) {
  const context = useContext(AppContext);
  if (!context) return null;
  
  const { placeBid, endAuction, startWork, completeWork, unlockVideo, getVideoUrl, getVideoSegment, currentUser } = context;
  const [bidAmount, setBidAmount] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const formatWorkSchedule = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return '未設定';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const formatDate = (date: Date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}/${day} ${hours}:${minutes}`;
    };
    
    return `${formatDate(start)} 〜 ${formatDate(end)}`;
  };

  const handleBid = () => {
    const amount = parseInt(bidAmount);
    if (amount > capsule.currentPrice) {
      placeBid(capsule.id, amount, currentUser);
      setBidAmount('');
      alert(`¥${amount.toLocaleString()}で入札しました！`);
    }
  };

  const handleEndAuction = () => {
    if (confirm('オークションを終了しますか？')) {
      endAuction(capsule.id);
      alert('オークションが終了しました！');
    }
  };

  const handleStartWork = () => {
    if (confirm('作業を開始しますか？タイムラプス録画が始まります。')) {
      startWork(capsule.id);
      alert('作業を開始しました！タイムラプス録画中です。');
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        alert('動画ファイルを選択してください');
        return;
      }
      
      // Check file size (limit to 100MB for demo purposes)
      if (file.size > 100 * 1024 * 1024) {
        alert('ファイルサイズは100MB以下にしてください');
        return;
      }
      
      setSelectedVideoFile(file);
      alert(`動画がアップロードされました: ${file.name}`);
    }
  };

  const handleCompleteWork = () => {
    if (!selectedVideoFile) {
      alert('まずタイムラプス動画をアップロードしてください');
      return;
    }
    
    if (confirm('作業を完了しますか？アップロードした動画がタイムラプス録画として登録されます。')) {
      completeWork(capsule.id, selectedVideoFile);
      alert('作業が完了しました！タイムラプス動画の解禁が可能になりました。');
    }
  };

  const handleUnlockVideo = () => {
    if (confirm('タイムラプス動画を解禁しますか？落札者が視聴できるようになります。')) {
      unlockVideo(capsule.id);
      alert('タイムラプス動画を解禁しました！');
    }
  };

  const handleWatchVideo = () => {
    setShowVideo(true);
  };

  const getCurrentVideoUrl = () => {
    return getVideoUrl(capsule.id);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getUserVideoSegment = () => {
    return getVideoSegment(capsule.id, currentUser);
  };

  // Handle video loading to set segment boundaries
  const handleVideoLoad = () => {
    if (!videoRef.current) return;
    
    const segment = getUserVideoSegment();
    if (segment && capsule.maxWinners && capsule.maxWinners > 1) {
      // Set video to start at the user's segment
      videoRef.current.currentTime = segment.startTime;
    }
  };

  // Handle video time update to enforce segment boundaries
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const segment = getUserVideoSegment();
    if (segment && capsule.maxWinners && capsule.maxWinners > 1) {
      // Enforce segment boundaries
      if (videoRef.current.currentTime < segment.startTime) {
        videoRef.current.currentTime = segment.startTime;
      } else if (videoRef.current.currentTime >= segment.endTime) {
        videoRef.current.pause();
        videoRef.current.currentTime = segment.startTime; // Reset to beginning of segment
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppBar title="作業枠詳細" showBackButton onBack={onBack} />
      
      <div className="p-4 space-y-6">
        {/* Main Content Area - Responsive Layout */}
        <div className="flex flex-col lg:flex-row lg:gap-6 space-y-6 lg:space-y-0">
          {/* Image/Video Section */}
          <div className="lg:flex-1 lg:max-w-2xl">
            <Card>
              <CardContent className="p-0">
                {showVideo && getCurrentVideoUrl() ? (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video 
                      ref={videoRef}
                      controls 
                      className="w-full h-full object-contain"
                      src={getCurrentVideoUrl()}
                      onLoadedData={handleVideoLoad}
                      onTimeUpdate={handleTimeUpdate}
                      onError={() => {
                        // If video fails to load, show placeholder
                        setShowVideo(false);
                        alert('動画の再生に失敗しました');
                      }}
                    >
                      <source src={getCurrentVideoUrl()} type="video/mp4" />
                      お使いのブラウザは動画の再生に対応していません。
                    </video>
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-600/90 hover:bg-red-600/90">
                        タイムラプス動画
                      </Badge>
                    </div>
                    {/* Show user's segment info for multi-winner auctions */}
                    {capsule.maxWinners && capsule.maxWinners > 1 && getUserVideoSegment() && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-blue-600/90 hover:bg-blue-600/90">
                          あなたの視聴区間: {formatDuration(getUserVideoSegment()?.startTime || 0)} - {formatDuration(getUserVideoSegment()?.endTime || 0)}
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : capsule.workInProgress ? (
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    {/* Recording background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-gray-900/30"></div>
                    
                    {/* Simulated workspace with the original image dimmed */}
                    <ImageWithFallback
                      src={capsule.thumbnail}
                      alt={capsule.title}
                      className="w-full h-full object-cover opacity-40"
                    />
                    
                    {/* Recording UI overlay */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4">
                      {/* Top bar with recording indicator */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 bg-red-600/90 px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span className="text-white text-sm">REC</span>
                        </div>
                      </div>
                      
                      {/* Center camera icon */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="bg-black/40 backdrop-blur-sm rounded-full p-6">
                          <Video className="h-12 w-12 text-white/80" />
                        </div>
                      </div>
                      
                      {/* Bottom info */}
                      <div className="text-center">
                        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
                          <p className="text-white text-sm">タイムラプス録画中</p>
                          <p className="text-white/70 text-xs">作業の様子を記録しています</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <ImageWithFallback
                      src={capsule.thumbnail}
                      alt={capsule.title}
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    {((capsule.isUnlocked && getCurrentVideoUrl()) || 
                      (capsule.workCompleted && capsule.creator === currentUser && getCurrentVideoUrl())) && (
                      <Button
                        className="absolute inset-0 m-auto w-16 h-16 rounded-full"
                        onClick={handleWatchVideo}
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="lg:flex-1 lg:min-w-0 space-y-6">
            {/* Status Badges */}
            <div className="flex gap-2 flex-wrap">
              {capsule.isMyListing && (
                <Badge className="bg-purple-600 hover:bg-purple-600">
                  あなたの出品
                </Badge>
              )}
              {capsule.isOwned && !capsule.isMyListing && (
                <Badge className="bg-green-600 hover:bg-green-600">
                  所有中
                </Badge>
              )}
              {capsule.isUnlocked && (
                <Badge className="bg-blue-600 hover:bg-blue-600">
                  視聴可能
                </Badge>
              )}
              {capsule.auctionEnded && (
                <Badge className="bg-gray-600 hover:bg-gray-600">
                  オークション終了
                </Badge>
              )}
              {capsule.workInProgress && (
                <Badge className="bg-orange-600 hover:bg-orange-600">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  作業中
                </Badge>
              )}
              {capsule.workCompleted && !capsule.isUnlocked && (
                <Badge className="bg-yellow-600 hover:bg-yellow-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  作業完了
                </Badge>
              )}
              {capsule.highestBidder && (
                <Badge variant="outline">
                  最高入札者: {capsule.highestBidder}
                </Badge>
              )}
            </div>

            {/* Work Slot Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{capsule.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span 
                    className="cursor-pointer hover:text-primary transition-colors underline-offset-4 hover:underline"
                    onClick={() => onCreatorClick?.(capsule.creator)}
                  >
                    {capsule.creator}
                  </span>
                </div>
                
                <p>{capsule.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">現在価格</p>
                      <p className="text-xl text-primary">¥{capsule.currentPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">残り時間</p>
                      <p className="text-xl">{formatTimeRemaining(capsule.endTime, capsule.auctionEnded)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Work Schedule Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">作業予定時間</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {formatWorkSchedule(capsule.workScheduledStartTime, capsule.workScheduledEndTime)}
                  </p>
                </div>
                
                {/* Winner Slots Info */}
                {capsule.maxWinners && capsule.maxWinners > 1 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">複数人落札システム</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      上位{capsule.maxWinners}名が落札し、入札額に応じて動画の視聴区間が分割されます
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Creator Controls */}
        {capsule.isMyListing && (
          <Card>
            <CardHeader>
              <CardTitle>クリエイター操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!capsule.auctionEnded && (
                <Button 
                  onClick={handleEndAuction}
                  variant="outline"
                  className="w-full"
                >
                  オークションを終了する
                </Button>
              )}
              
              {capsule.auctionEnded && !capsule.workInProgress && !capsule.workCompleted && capsule.winners && capsule.winners.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {capsule.winners.length}名が落札しました。作業を開始してください。
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      落札者: {capsule.winners.join(', ')}
                    </p>
                  </div>
                  <Button 
                    onClick={handleStartWork}
                    className="w-full"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    作業を開始する
                  </Button>
                </div>
              )}
              
              {capsule.workInProgress && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-orange-600" />
                    <p className="text-sm text-muted-foreground">
                      作業中です。タイムラプス録画中...
                    </p>
                  </div>
                  
                  {/* Video Upload Section */}
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      テスト機能: タイムラプス動画アップロード
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      実際のタイムラプス録画の代わりに、動画ファイルをアップロードできます
                    </p>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    
                    <div className="space-y-2">
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        動画ファイルを選択
                      </Button>
                      
                      {selectedVideoFile && (
                        <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
                          ✓ 動画がアップロードされました: {selectedVideoFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleCompleteWork}
                    className="w-full"
                    variant="outline"
                    disabled={!selectedVideoFile}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    作業を完了する
                  </Button>
                  
                  {!selectedVideoFile && (
                    <p className="text-xs text-muted-foreground text-center">
                      作業完了前に動画をアップロードしてください
                    </p>
                  )}
                </div>
              )}
              
              {capsule.workCompleted && !capsule.isUnlocked && (
                <div className="space-y-4">
                  <div className="text-center text-green-600">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      作業が完了しました！タイムラプス動画を解禁できます。
                    </p>
                  </div>
                  
                  {/* Creator Preview Section */}
                  {getCurrentVideoUrl() && (
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        作成者プレビュー
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        解禁前に録画された動画を確認できます
                      </p>
                      <Button 
                        onClick={handleWatchVideo}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        タイムラプス動画を確認
                      </Button>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleUnlockVideo}
                    className="w-full"
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    タイムラプス動画を解禁する
                  </Button>
                </div>
              )}
              
              {capsule.isUnlocked && (
                <div className="space-y-4">
                  <div className="text-center text-green-600">
                    ✓ タイムラプス動画を解禁済み
                  </div>
                  
                  {/* Creator can still watch their own video */}
                  {getCurrentVideoUrl() && (
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        あなたの作品
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        解禁済みのタイムラプス動画を確認できます
                      </p>
                      <Button 
                        onClick={handleWatchVideo}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        タイムラプス動画を確認
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Current Bids */}
        {capsule.currentBids && capsule.currentBids.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                入札履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {capsule.currentBids.slice(0, capsule.maxWinners || 1).map((bid, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Crown className="h-4 w-4 text-yellow-600" />}
                      <span className="font-medium">{index + 1}位</span>
                      <span className="text-muted-foreground">{bid.bidder}</span>
                      {bid.bidder === currentUser && (
                        <Badge className="bg-green-600 hover:bg-green-600 text-xs">あなた</Badge>
                      )}
                    </div>
                    <span className="font-medium text-primary">¥{bid.amount.toLocaleString()}</span>
                  </div>
                ))}
                
                {capsule.currentBids.length > (capsule.maxWinners || 1) && (
                  <div className="space-y-2">
                    <div className="border-t pt-2">
                      <p className="text-sm text-muted-foreground mb-2">その他の入札</p>
                      {capsule.currentBids.slice(capsule.maxWinners || 1).map((bid, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{(capsule.maxWinners || 1) + index + 1}位</span>
                            <span className="text-sm">{bid.bidder}</span>
                            {bid.bidder === currentUser && (
                              <Badge variant="outline" className="text-xs">あなた</Badge>
                            )}
                          </div>
                          <span className="text-sm">¥{bid.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bidding Section */}
        {!capsule.isOwned && !capsule.isMyListing && formatTimeRemaining(capsule.endTime, capsule.auctionEnded) !== '終了' && (
          <Card>
            <CardHeader>
              <CardTitle>入札</CardTitle>
              {capsule.maxWinners && capsule.maxWinners > 1 && (
                <p className="text-sm text-muted-foreground">
                  上位{capsule.maxWinners}名が落札できます
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={`${capsule.currentPrice + 100}以上`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleBid}
                  disabled={!bidAmount || parseInt(bidAmount) <= capsule.currentPrice}
                >
                  入札
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                最低入札額: ¥{(capsule.currentPrice + 100).toLocaleString()}
              </p>
              {capsule.maxWinners && capsule.maxWinners > 1 && (
                <p className="text-sm text-blue-600">
                  💡 複数人が落札可能です。上位{capsule.maxWinners}名に入れば視聴権を獲得できます。
                </p>
              )}
            </CardContent>
          </Card>
        )}



        {/* Video Access Message */}
        {capsule.isOwned && !capsule.isUnlocked && !capsule.isMyListing && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <h3>タイムラプス動画</h3>
                {!capsule.workInProgress && !capsule.workCompleted && (
                  <p className="text-muted-foreground">
                    クリエイターの作業開始をお待ちください
                  </p>
                )}
                {capsule.workInProgress && (
                  <div className="space-y-2">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-orange-600" />
                    <p className="text-muted-foreground">
                      クリエイターが作業中です。タイムラプス録画中...
                    </p>
                  </div>
                )}
                {capsule.workCompleted && (
                  <div className="space-y-2">
                    <CheckCircle2 className="h-6 w-6 mx-auto text-green-600" />
                    <p className="text-muted-foreground">
                      作業が完了しました。クリエイターが動画解禁するまでお待ちください
                    </p>
                  </div>
                )}

                {/* Show user's video segment info if multi-winner auction */}
                {capsule.maxWinners && capsule.maxWinners > 1 && getUserVideoSegment() && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">あなたの視聴予定区間</span>
                    </div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>視聴時間: {formatDuration(getUserVideoSegment()?.startTime || 0)} - {formatDuration(getUserVideoSegment()?.endTime || 0)}</div>
                      <div>視聴時間長: {formatDuration(getUserVideoSegment()?.duration || 0)}</div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      動画解禁後、この区間を専用視聴できます
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auction Results */}
        {capsule.auctionEnded && capsule.winners && capsule.winners.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                オークション結果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {capsule.maxWinners && capsule.maxWinners > 1 && capsule.videoSegments && capsule.currentBids ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">動画分割システム</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        入札額に応じて制作過程動画が分割され、各落札者が専用の視聴区間を所有します。
                      </p>
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <Clock className="h-3 w-3" />
                        <span>総動画時間: {formatDuration(capsule.totalVideoDuration || 3600)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-sm font-medium">各落札者の視聴区間</h5>
                      {capsule.currentBids.slice(0, capsule.maxWinners).map((bid, index) => {
                        const segment = capsule.videoSegments?.get(bid.bidder);
                        const isCurrentUser = bid.bidder === currentUser;
                        
                        return (
                          <div 
                            key={index} 
                            className={`relative p-4 rounded-lg border-2 transition-all ${
                              isCurrentUser 
                                ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-300' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {index === 0 && <Crown className="h-4 w-4 text-yellow-600" />}
                                <span className="font-medium">{index + 1}位: {bid.bidder}</span>
                                {isCurrentUser && (
                                  <Badge className="bg-green-600 hover:bg-green-600 text-xs">あなたの区間</Badge>
                                )}
                              </div>
                              <span className="text-sm font-medium text-primary">¥{bid.amount.toLocaleString()}</span>
                            </div>
                            
                            {segment && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">視聴時間:</span>
                                    <span className="font-mono bg-white px-2 py-1 rounded border">
                                      {formatDuration(segment.startTime)} - {formatDuration(segment.endTime)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">長さ:</span>
                                    <span className="font-mono bg-white px-2 py-1 rounded border">
                                      {formatDuration(segment.duration)}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Visual progress bar for segment */}
                                <div className="relative bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`absolute h-2 rounded-full ${
                                      isCurrentUser ? 'bg-green-500' : 'bg-blue-400'
                                    }`}
                                    style={{
                                      left: `${(segment.startTime / (capsule.totalVideoDuration || 3600)) * 100}%`,
                                      width: `${(segment.duration / (capsule.totalVideoDuration || 3600)) * 100}%`
                                    }}
                                  />
                                </div>
                                
                                <div className="text-xs text-muted-foreground">
                                  入札割合: {((bid.amount / capsule.currentBids.slice(0, capsule.maxWinners).reduce((sum, b) => sum + b.amount, 0)) * 100).toFixed(1)}%
                                  → 視聴時間 {((segment.duration / (capsule.totalVideoDuration || 3600)) * 100).toFixed(1)}%
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {capsule.isUnlocked && getUserVideoSegment() && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <PlayCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">あなたの視聴可能区間</span>
                        </div>
                        <div className="text-sm text-green-700">
                          {formatDuration(getUserVideoSegment()?.startTime || 0)} - {formatDuration(getUserVideoSegment()?.endTime || 0)} 
                          （{formatDuration(getUserVideoSegment()?.duration || 0)}間）
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          動画視聴時、この区間のみが再生されます
                        </p>
                      </div>
                    )}
                    
                    <div className="text-center pt-2 border-t">
                      <p className="text-primary font-medium">
                        最高落札価格: ¥{capsule.currentPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">
                      落札者: {capsule.highestBidder}
                    </p>
                    <p className="text-primary font-medium">
                      落札価格: ¥{capsule.currentPrice.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}