import React, { useState, useEffect } from 'react';
import { CapsuleGrid } from './components/CapsuleGrid';
import { CapsuleDetail } from './components/CapsuleDetail';
import { Profile } from './components/Profile';
import { NewCapsule } from './components/NewCapsule';
import { Settings } from './components/Settings';
import { CreatorDetail } from './components/CreatorDetail';
import { FloatingActionButton } from './components/FloatingActionButton';
import { UserSwitcher } from './components/UserSwitcher';

type Screen = 'home' | 'detail' | 'profile' | 'new-capsule' | 'settings' | 'creator-detail';

export interface VideoSegment {
  startTime: number; // in seconds
  endTime: number;   // in seconds
  duration: number;  // in seconds
}

export interface WorkSlot {
  id: string;
  title: string;
  creator: string;
  currentPrice: number;
  endTime: string;
  thumbnail: string;
  description: string;
  isOwned: boolean;
  isUnlocked: boolean;
  videoUrl?: string;
  sampleVideoUrl?: string;
  highestBidder?: string;
  auctionEnded?: boolean;
  isMyListing?: boolean;
  workInProgress?: boolean;
  workCompleted?: boolean;
  workStartedAt?: string;
  workCompletedAt?: string;
  maxWinners?: number;
  currentBids?: { bidder: string; amount: number }[];
  winners?: string[];
  uploadedVideoFile?: File;
  videoSegments?: Map<string, VideoSegment>; // bidder name -> video segment
  totalVideoDuration?: number; // total video duration in seconds
  workScheduledStartTime?: string; // 作業予定開始時刻
  workScheduledEndTime?: string; // 作業予定終了時刻
}

interface User {
  id: string;
  name: string;
  role: string;
  description: string;
}

interface AppContextType {
  workSlots: WorkSlot[];
  updateWorkSlot: (id: string, updates: Partial<WorkSlot>) => void;
  addWorkSlot: (workSlot: WorkSlot) => void;
  placeBid: (id: string, amount: number, bidder: string) => void;
  endAuction: (id: string) => void;
  startWork: (id: string) => void;
  completeWork: (id: string, videoFile?: File) => void;
  unlockVideo: (id: string) => void;
  getVideoUrl: (id: string) => string | null;
  getVideoSegment: (id: string, bidder: string) => VideoSegment | null;
  allocateVideoSegments: (id: string) => void;
  currentUser: string;
  users: User[];
  switchUser: (userId: string) => void;
  selectedCreator: string | null;
  setSelectedCreator: (creator: string | null) => void;
}

export const AppContext = React.createContext<AppContextType | null>(null);

const demoUsers: User[] = [
  {
    id: 'creator1',
    name: 'クリエイターA',
    role: 'クリエイター',
    description: '作業枠を出品する側'
  },
  {
    id: 'bidder1',
    name: 'ユーザーX',
    role: 'コレクター',
    description: '作業枠に入札する側'
  },
  {
    id: 'artist1',
    name: 'アーティストB',
    role: 'クリエイター',
    description: 'デジタルアートを制作'
  },
  {
    id: 'newuser',
    name: '新規ユーザー',
    role: '初心者',
    description: 'まだ何も持っていない'
  }
];

// Helper function to calculate video segments based on bid amounts with sequential allocation in random order
const allocateVideoSegmentsByBids = (bids: { bidder: string; amount: number }[], totalDuration: number = 3600): Map<string, VideoSegment> => {
  if (bids.length === 0) return new Map();
  
  // Calculate total bid amount
  const totalBidAmount = bids.reduce((sum, bid) => sum + bid.amount, 0);
  
  // Calculate segment durations proportionally to bid amounts
  const segmentDurations = bids.map(bid => ({
    bidder: bid.bidder,
    duration: Math.max(1, Math.floor(totalDuration * (bid.amount / totalBidAmount))) // Ensure minimum 1 second
  }));
  
  // Ensure total allocated duration doesn't exceed video duration
  const totalAllocated = segmentDurations.reduce((sum, seg) => sum + seg.duration, 0);
  if (totalAllocated > totalDuration) {
    // Scale down proportionally if total exceeds duration
    const scale = totalDuration / totalAllocated;
    segmentDurations.forEach(seg => {
      seg.duration = Math.max(1, Math.floor(seg.duration * scale));
    });
  }
  
  // Randomly shuffle the order of segments (Fisher-Yates shuffle)
  const shuffledSegments = [...segmentDurations];
  for (let i = shuffledSegments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledSegments[i], shuffledSegments[j]] = [shuffledSegments[j], shuffledSegments[i]];
  }
  
  // Allocate segments sequentially from the start of the video
  const segments = new Map<string, VideoSegment>();
  let currentTime = 0;
  
  for (const segment of shuffledSegments) {
    const startTime = currentTime;
    const endTime = Math.min(startTime + segment.duration, totalDuration);
    const actualDuration = endTime - startTime;
    
    segments.set(segment.bidder, {
      startTime,
      endTime,
      duration: actualDuration
    });
    
    currentTime = endTime;
    
    // Stop if we've reached the end of the video
    if (currentTime >= totalDuration) break;
  }
  
  return segments;
};

// Get current time for relative timing
const appStartTime = new Date();

const initialWorkSlots: WorkSlot[] = [
  {
    id: '1',
    title: '漫画制作（ラフ→ペン入れ）',
    creator: 'アーティストB',
    currentPrice: 2500,
    endTime: new Date(appStartTime.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    thumbnail: 'https://images.unsplash.com/photo-1643425959020-b48e240d01b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5nYSUyMHNrZXRjaCUyMGRyYXdpbmd8ZW58MXx8fHwxNzU2OTQxODEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: '4ページの漫画のラフスケッチからペン入れまでの工程を公開。キャラクターの表情の描き方、構図の決め方、コマ割りのテクニックを実践的に学べます。',
    isOwned: false,
    isUnlocked: false,
    auctionEnded: false,
    isMyListing: false,
    maxWinners: 3,
    currentBids: [{ bidder: '新規ユーザー', amount: 2500 }],
    sampleVideoUrl: '/mock-sample.mp4',
    workScheduledStartTime: new Date(appStartTime.getTime() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    workScheduledEndTime: new Date(appStartTime.getTime() + 7 * 60 * 60 * 1000).toISOString() // 7 hours from now
  },
  {
    id: '2',
    title: 'オリジナル楽曲制作（作詞作曲）',
    creator: 'クリエイターA',
    currentPrice: 3000,
    endTime: new Date(appStartTime.getTime() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
    thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHByb2R1Y3Rpb24lMjBzdHVkaW98ZW58MXx8fHwxNzU2NzkyMTQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'ポップス楽曲の制作過程を完全公開。メロディーの発想から歌詞の構成、DTMソフトでの編曲、ミックス・マスタリングまでの全工程を3時間で実演します。',
    isOwned: false,
    isUnlocked: false,
    auctionEnded: true,
    highestBidder: 'ユーザーX',
    isMyListing: true,
    workInProgress: false,
    workCompleted: false,
    maxWinners: 2,
    currentBids: [
      { bidder: 'ユーザーX', amount: 3000 },
      { bidder: '新規ユーザー', amount: 2800 }
    ],
    winners: ['ユーザーX', '新規ユーザー'],
    videoUrl: '/mock-video.mp4',
    sampleVideoUrl: '/mock-sample.mp4',
    totalVideoDuration: 3600, // 1 hour total
    videoSegments: allocateVideoSegmentsByBids([
      { bidder: 'ユーザーX', amount: 3000 },
      { bidder: '新規ユーザー', amount: 2800 }
    ], 3600),
    workScheduledStartTime: new Date(appStartTime.getTime() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    workScheduledEndTime: new Date(appStartTime.getTime() + 9 * 60 * 60 * 1000).toISOString() // 9 hours from now
  },
  {
    id: '3',
    title: 'アイドル振り付け練習風景',
    creator: 'アーティストB',
    currentPrice: 2200,
    endTime: new Date(appStartTime.getTime() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
    thumbnail: 'https://images.unsplash.com/photo-1724631585467-1fc350177537?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpZG9sJTIwZGFuY2UlMjBwcmFjdGljZSUyMHN0dWRpb3xlbnwxfHx8fDE3NTY5NDE4MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: '新曲の振り付けを一から覚える過程を公開。基本ステップの練習から感情表現の込め方まで、プロのパフォーマーの練習方法を間近で見ることができます。',
    isOwned: false,
    isUnlocked: true,
    auctionEnded: true,
    isMyListing: false,
    highestBidder: 'ユーザーX',
    workInProgress: false,
    workCompleted: true,
    workCompletedAt: '2025-09-03T16:00:00Z',
    maxWinners: 5,
    currentBids: [
      { bidder: 'ユーザーX', amount: 2200 },
      { bidder: 'クリエイターA', amount: 2000 },
      { bidder: '新規ユーザー', amount: 1900 },
      { bidder: 'アーティストB', amount: 1800 },
      { bidder: 'ユーザーA', amount: 1700 },
      { bidder: 'ユーザーB', amount: 1600 }
    ],
    winners: ['ユーザーX', 'クリエイターA', '新規ユーザー', 'アーティストB', 'ユーザーA'],
    videoUrl: '/mock-video.mp4',
    sampleVideoUrl: '/mock-sample.mp4',
    totalVideoDuration: 4500, // 1.25 hours total
    videoSegments: allocateVideoSegmentsByBids([
      { bidder: 'ユーザーX', amount: 2200 },
      { bidder: 'クリエイターA', amount: 2000 },
      { bidder: '新規ユーザー', amount: 1900 },
      { bidder: 'アーティストB', amount: 1800 },
      { bidder: 'ユーザーA', amount: 1700 }
    ], 4500),
    workScheduledStartTime: new Date(appStartTime.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (already completed)
    workScheduledEndTime: new Date(appStartTime.getTime() - 0.25 * 60 * 60 * 1000).toISOString() // 15 minutes ago
  },
  {
    id: '4',
    title: 'アニメ制作（原画→動画）',
    creator: 'クリエイターA',
    currentPrice: 4000,
    endTime: new Date(appStartTime.getTime() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    thumbnail: 'https://images.unsplash.com/photo-1730641884360-0f6bb86e70e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGFuaW1hdGlvbiUyMHByb2R1Y3Rpb258ZW58MXx8fHwxNzU2OTQxODE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'キャラクターアニメーションの制作工程を完全公開。原画の描き方から中割りの技術、タイミング調整まで、プロアニメーターの技術を学べます。約5時間の作業過程。',
    isOwned: false,
    isUnlocked: false,
    auctionEnded: false,
    isMyListing: true,
    maxWinners: 2,
    sampleVideoUrl: '/mock-sample.mp4',
    workScheduledStartTime: new Date(appStartTime.getTime() + 7 * 60 * 60 * 1000).toISOString(), // 7 hours from now
    workScheduledEndTime: new Date(appStartTime.getTime() + 12 * 60 * 60 * 1000).toISOString() // 12 hours from now
  },
  {
    id: '5',
    title: '陶芸制作（ろくろ→焼き上げ）',
    creator: 'アーティストB',
    currentPrice: 2200,
    endTime: new Date(appStartTime.getTime() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
    thumbnail: 'https://images.unsplash.com/photo-1662845114342-256fdc45981d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwY3JlYXRpb24lMjBzdHVkaW98ZW58MXx8fHwxNzU2OTQxODIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: '茶碗の制作���程を丁寧に公開。土の準備からろくろ成形、釉薬かけ、窯入れまでの一連の工程。伝統工芸の奥深さを体感できます。',
    isOwned: false,
    isUnlocked: false,
    auctionEnded: false,
    isMyListing: false,
    maxWinners: 4,
    sampleVideoUrl: '/mock-sample.mp4',
    workScheduledStartTime: new Date(appStartTime.getTime() + 9 * 60 * 60 * 1000).toISOString(), // 9 hours from now
    workScheduledEndTime: new Date(appStartTime.getTime() + 15 * 60 * 60 * 1000).toISOString() // 15 hours from now
  },
  {
    id: '6',
    title: '油絵制作（下地→完成）',
    creator: 'クリエイターA',
    currentPrice: 3500,
    endTime: new Date(appStartTime.getTime() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
    thumbnail: 'https://images.unsplash.com/photo-1702471387271-e7936e77189b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvaWwlMjBwYWludGluZyUyMGFydGlzdCUyMGNhbnZhc3xlbnwxfHx8fDE3NTY5NDE4MjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: '風景画の制作過程を6時間で完全収録。キャンバスの下地作りから色の調合、筆使いのテクニック、光と影の表現方法まで、古典技法を現代的に解釈します。',
    isOwned: false,
    isUnlocked: false,
    auctionEnded: false,
    isMyListing: true,
    maxWinners: 3,
    sampleVideoUrl: '/mock-sample.mp4',
    workScheduledStartTime: new Date(appStartTime.getTime() + 13 * 60 * 60 * 1000).toISOString(), // 13 hours from now
    workScheduledEndTime: new Date(appStartTime.getTime() + 19 * 60 * 60 * 1000).toISOString() // 19 hours from now
  },
  {
    id: '7',
    title: 'アクセサリー制作（デザイン→完成）',
    creator: 'アーティストB',
    currentPrice: 1900,
    endTime: new Date(appStartTime.getTime() + 15 * 60 * 60 * 1000).toISOString(), // 15 hours from now
    thumbnail: 'https://images.unsplash.com/photo-1659032882703-f1e4983fe1b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXdlbHJ5JTIwY3JhZnRpbmclMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NTY5NDE4Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'シルバーリングの制作工程を公開。デザインスケッチから地金の加工、石留め、研磨仕上げまで。ジュエリーメイキングの繊細な技術を間近で学べます。',
    isOwned: false,
    isUnlocked: false,
    auctionEnded: false,
    isMyListing: false,
    maxWinners: 6,
    sampleVideoUrl: '/mock-sample.mp4',
    workScheduledStartTime: new Date(appStartTime.getTime() + 16 * 60 * 60 * 1000).toISOString(), // 16 hours from now
    workScheduledEndTime: new Date(appStartTime.getTime() + 20 * 60 * 60 * 1000).toISOString() // 20 hours from now
  },
  {
    id: '8',
    title: '��ティシエの本格ケーキ制作',
    creator: 'クリエイターA',
    currentPrice: 2800,
    endTime: new Date(appStartTime.getTime() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours from now
    thumbnail: 'https://images.unsplash.com/photo-1529687456478-8f4b77dda55c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtpbmclMjBjb29raW5nJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NTY5NDE4Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'プロのパティシエによる本格フランス菓子の制作過程。生地の仕込みからデコレーション、盛り付けまで、プロの技術と美的センスを学べる4時間の集中講座。',
    isOwned: false,
    isUnlocked: false,
    auctionEnded: false,
    isMyListing: true,
    maxWinners: 4,
    sampleVideoUrl: '/mock-sample.mp4',
    workScheduledStartTime: new Date(appStartTime.getTime() + 19 * 60 * 60 * 1000).toISOString(), // 19 hours from now
    workScheduledEndTime: new Date(appStartTime.getTime() + 23 * 60 * 60 * 1000).toISOString() // 23 hours from now
  },
  {
    id: '9',
    title: '木工家具制作（設計→組み立て）',
    creator: 'アーティストB',
    currentPrice: 3200,
    endTime: new Date(appStartTime.getTime() + 22 * 60 * 60 * 1000).toISOString(), // 22 hours from now
    thumbnail: 'https://images.unsplash.com/photo-1745426863308-308b92bff031?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kd29ya2luZyUyMGNyYWZ0aW5nJTIwdG9vbHN8ZW58MXx8fHwxNzU2OTQxODMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'オリジナル椅子の制作過程を完全収録。設計図の作成から木材の選定、カット、組み立て、仕上げまで。職人の手仕事の魅力を7時間で体験できます。',
    isOwned: false,
    isUnlocked: false,
    auctionEnded: false,
    isMyListing: false,
    maxWinners: 2,
    sampleVideoUrl: '/mock-sample.mp4',
    workScheduledStartTime: new Date(appStartTime.getTime() + 23 * 60 * 60 * 1000).toISOString(), // 23 hours from now
    workScheduledEndTime: new Date(appStartTime.getTime() + 30 * 60 * 60 * 1000).toISOString() // 30 hours from now
  },
  {
    id: '10',
    title: 'ファッションデザイン（スケッチ→縫製）',
    creator: 'クリエイターA',
    currentPrice: 2700,
    endTime: new Date(appStartTime.getTime() + 25 * 60 * 60 * 1000).toISOString(), // 25 hours from now
    thumbnail: 'https://images.unsplash.com/photo-1753162658542-dd053c2b5196?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwZGVzaWduJTIwc2tldGNoJTIwc3R1ZGlvfGVufDF8fHx8MTc1Njk0MTgzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'オリジナルドレスの制作工程を公開。デザインスケッチからパターン作成、生地選び、縫製、フィッティングまで。ファッションデザイナーの創作過程を学べます。',
    isOwned: false,
    isUnlocked: false,
    auctionEnded: false,
    isMyListing: true,
    maxWinners: 3,
    sampleVideoUrl: '/mock-sample.mp4',
    workScheduledStartTime: new Date(appStartTime.getTime() + 26 * 60 * 60 * 1000).toISOString(), // 26 hours from now
    workScheduledEndTime: new Date(appStartTime.getTime() + 32 * 60 * 60 * 1000).toISOString() // 32 hours from now
  },
  {
    id: '11',
    title: '彫刻制作（粘土原型→完成）',
    creator: 'アーティストB',
    currentPrice: 2400,
    endTime: new Date(appStartTime.getTime() + 29 * 60 * 60 * 1000).toISOString(), // 29 hours from now
    thumbnail: 'https://images.unsplash.com/photo-1656844447295-b4082a05813c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY3VscHR1cmUlMjBjbGF5JTIwYXJ0fGVufDF8fHx8MTc1Njk0MTgzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: '人物彫刻の制作過程を詳細記録。粘土での原型制作から型取り、石膏による複製まで。立体造形の基礎から応用技術まで学べる5時間の制作体験。',
    isOwned: false,
    isUnlocked: false,
    auctionEnded: false,
    isMyListing: false,
    maxWinners: 4,
    sampleVideoUrl: '/mock-sample.mp4',
    workScheduledStartTime: new Date(appStartTime.getTime() + 30 * 60 * 60 * 1000).toISOString(), // 30 hours from now
    workScheduledEndTime: new Date(appStartTime.getTime() + 35 * 60 * 60 * 1000).toISOString() // 35 hours from now
  },
  {
    id: '12',
    title: 'プログラミング（企画→実装）',
    creator: 'アーティストB',
    currentPrice: 2800,
    endTime: new Date(appStartTime.getTime() + 32 * 60 * 60 * 1000).toISOString(), // 32 hours from now
    thumbnail: 'https://images.unsplash.com/photo-1565229284535-2cbbe3049123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBwcm9ncmFtbWluZ3xlbnwxfHx8fDE3NTY3OTIxNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'モバイルアプリの開発過程を4時間で完全公開。企画立案からUI設計、コーディング、テスト、デプロイまで。現役エンジニアの開発手法を学べます。',
    isOwned: false,
    isUnlocked: true,
    auctionEnded: true,
    isMyListing: false,
    highestBidder: 'ユーザーX',
    workInProgress: false,
    workCompleted: true,
    workCompletedAt: '2025-09-08T16:00:00Z',
    maxWinners: 3,
    currentBids: [
      { bidder: 'ユーザーX', amount: 2800 },
      { bidder: 'クリエイターA', amount: 2600 },
      { bidder: '新規ユーザー', amount: 2400 },
      { bidder: 'アーティストA', amount: 2200 }
    ],
    winners: ['ユーザーX', 'クリエイターA', '新規ユーザー'],
    videoUrl: '/mock-video.mp4',
    sampleVideoUrl: '/mock-sample.mp4',
    totalVideoDuration: 2700, // 45 minutes total
    videoSegments: allocateVideoSegmentsByBids([
      { bidder: 'ユーザーX', amount: 2800 },
      { bidder: 'クリエイターA', amount: 2600 },
      { bidder: '新規ユーザー', amount: 2400 }
    ], 2700),
    workScheduledStartTime: new Date(appStartTime.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago (already completed)
    workScheduledEndTime: new Date(appStartTime.getTime() - 0.25 * 60 * 60 * 1000).toISOString() // 15 minutes ago
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');
  const [screenStack, setScreenStack] = useState<Screen[]>(['home']);
  const [selectedWorkSlot, setSelectedWorkSlot] = useState<WorkSlot | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [workSlots, setWorkSlots] = useState<WorkSlot[]>(initialWorkSlots);
  const [currentUserId, setCurrentUserId] = useState<string>('creator1');
  const [videoUrlCache, setVideoUrlCache] = useState<Map<string, string>>(new Map());
  
  const currentUser = demoUsers.find(user => user.id === currentUserId)?.name || 'クリエイターA';

  const updateWorkSlot = (id: string, updates: Partial<WorkSlot>) => {
    setWorkSlots(prev => prev.map(workSlot => 
      workSlot.id === id ? { ...workSlot, ...updates } : workSlot
    ));
    
    // Update selected work slot if it's the same one
    if (selectedWorkSlot?.id === id) {
      setSelectedWorkSlot(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const addWorkSlot = (workSlot: WorkSlot) => {
    setWorkSlots(prev => [workSlot, ...prev]);
  };

  const getVideoUrl = (id: string) => {
    const workSlot = workSlots.find(w => w.id === id);
    if (!workSlot) return null;
    
    // If there's an uploaded file, create/reuse object URL
    if (workSlot.uploadedVideoFile) {
      const existing = videoUrlCache.get(id);
      if (existing) return existing;
      
      const newUrl = URL.createObjectURL(workSlot.uploadedVideoFile);
      setVideoUrlCache(prev => new Map(prev).set(id, newUrl));
      return newUrl;
    }
    
    // Otherwise return the regular video URL
    return workSlot.videoUrl || null;
  };

  const getVideoSegment = (id: string, bidder: string): VideoSegment | null => {
    const workSlot = workSlots.find(w => w.id === id);
    if (!workSlot || !workSlot.videoSegments) return null;
    
    return workSlot.videoSegments.get(bidder) || null;
  };

  const allocateVideoSegments = (id: string) => {
    const workSlot = workSlots.find(w => w.id === id);
    if (!workSlot || !workSlot.currentBids) return;

    const winningBids = workSlot.currentBids.slice(0, workSlot.maxWinners || 1);
    const totalDuration = workSlot.totalVideoDuration || 3600; // Default 1 hour
    const segments = allocateVideoSegmentsByBids(winningBids, totalDuration);

    updateWorkSlot(id, { videoSegments: segments });
  };

  const placeBid = (id: string, amount: number, bidder: string) => {
    const workSlot = workSlots.find(w => w.id === id);
    if (workSlot) {
      const newBids = [...(workSlot.currentBids || [])];
      const existingBidIndex = newBids.findIndex(bid => bid.bidder === bidder);
      
      if (existingBidIndex >= 0) {
        newBids[existingBidIndex].amount = amount;
      } else {
        newBids.push({ bidder, amount });
      }
      
      // Sort bids by amount (highest first) and determine winners
      newBids.sort((a, b) => b.amount - a.amount);
      const maxWinners = workSlot.maxWinners || 1;
      const winners = newBids.slice(0, maxWinners).map(bid => bid.bidder);
      const highestAmount = newBids[0]?.amount || workSlot.currentPrice;
      
      // Allocate video segments for multiple winners
      let videoSegments = workSlot.videoSegments;
      if (maxWinners > 1) {
        const winningBids = newBids.slice(0, maxWinners);
        const totalDuration = workSlot.totalVideoDuration || 3600;
        videoSegments = allocateVideoSegmentsByBids(winningBids, totalDuration);
      }
      
      updateWorkSlot(id, { 
        currentPrice: highestAmount,
        highestBidder: newBids[0]?.bidder,
        currentBids: newBids,
        winners,
        isOwned: winners.includes(currentUser),
        videoSegments
      });
    }
  };

  const endAuction = (id: string) => {
    const workSlot = workSlots.find(w => w.id === id);
    if (workSlot) {
      const winners = workSlot.winners || [];
      updateWorkSlot(id, { 
        auctionEnded: true,
        isOwned: winners.includes(currentUser)
      });
    }
  };

  const startWork = (id: string) => {
    updateWorkSlot(id, { 
      workInProgress: true,
      workStartedAt: new Date().toISOString()
    });
  };

  const completeWork = (id: string, videoFile?: File) => {
    const updates: Partial<WorkSlot> = {
      workInProgress: false,
      workCompleted: true,
      workCompletedAt: new Date().toISOString()
    };
    
    if (videoFile) {
      updates.uploadedVideoFile = videoFile;
      // Clear any existing URL for this slot from cache
      setVideoUrlCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(id);
        return newCache;
      });
    }
    
    updateWorkSlot(id, updates);
  };

  const unlockVideo = (id: string) => {
    updateWorkSlot(id, { isUnlocked: true });
  };

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    
    // Update ownership and listing status for all work slots based on new user
    const newUserName = demoUsers.find(user => user.id === userId)?.name || '';
    setWorkSlots(prev => prev.map(workSlot => ({
      ...workSlot,
      isOwned: (workSlot.winners || []).includes(newUserName) || 
                (workSlot.auctionEnded && (workSlot.winners || []).includes(newUserName)),
      isMyListing: workSlot.creator === newUserName
    })));
    
    // Return to home screen when switching users
    setScreenStack(['home']);
    setPreviousScreen('home');
    setCurrentScreen('home');
    setSelectedWorkSlot(null);
    setSelectedCreator(null);
  };

  const handleWorkSlotClick = (workSlot: WorkSlot) => {
    // Find the most up-to-date version of the work slot
    const currentWorkSlot = workSlots.find(w => w.id === workSlot.id) || workSlot;
    setSelectedWorkSlot(currentWorkSlot);
    setPreviousScreen(currentScreen);
    setCurrentScreen('detail');
  };

  const handleBackToPrevious = () => {
    if (screenStack.length > 1) {
      const newStack = [...screenStack];
      newStack.pop();
      setScreenStack(newStack);
      setCurrentScreen(newStack[newStack.length - 1]);
    } else {
      setCurrentScreen('home');
      setScreenStack(['home']);
    }
    setSelectedWorkSlot(null);
    setSelectedCreator(null);
  };

  const handleNavigateTo = (screen: Screen) => {
    const newStack = [...screenStack, screen];
    setScreenStack(newStack);
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const handleCreatorClick = (creatorName: string) => {
    setSelectedCreator(creatorName);
    handleNavigateTo('creator-detail');
  };

  const contextValue: AppContextType = {
    workSlots,
    updateWorkSlot,
    addWorkSlot,
    placeBid,
    endAuction,
    startWork,
    completeWork,
    unlockVideo,
    getVideoUrl,
    getVideoSegment,
    allocateVideoSegments,
    currentUser,
    users: demoUsers,
    switchUser,
    selectedCreator,
    setSelectedCreator
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <CapsuleGrid onCapsuleClick={handleWorkSlotClick} onCreatorClick={handleCreatorClick} />;
      case 'detail':
        return selectedWorkSlot ? (
          <CapsuleDetail 
            capsule={selectedWorkSlot} 
            onBack={handleBackToPrevious}
            onCreatorClick={handleCreatorClick}
          />
        ) : null;
      case 'profile':
        return <Profile onBack={handleBackToPrevious} onCapsuleClick={handleWorkSlotClick} />;
      case 'new-capsule':
        return <NewCapsule onBack={handleBackToPrevious} />;
      case 'settings':
        return <Settings onBack={handleBackToPrevious} />;
      case 'creator-detail':
        return selectedCreator ? (
          <CreatorDetail 
            creatorName={selectedCreator}
            onBack={handleBackToPrevious}
            onCapsuleClick={handleWorkSlotClick}
          />
        ) : null;
      default:
        return <CapsuleGrid onCapsuleClick={handleWorkSlotClick} onCreatorClick={handleCreatorClick} />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background relative">
        {renderScreen()}
        <FloatingActionButton
          onProfileClick={() => handleNavigateTo('profile')}
          onNewCapsuleClick={() => handleNavigateTo('new-capsule')}
          onSettingsClick={() => handleNavigateTo('settings')}
        />
      </div>
    </AppContext.Provider>
  );
}