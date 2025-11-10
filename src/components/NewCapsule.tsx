import React, { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Users } from 'lucide-react';
import { AppContext } from '../App';
import { AppBar } from './AppBar';

interface NewCapsuleProps {
  onBack: () => void;
}

export function NewCapsule({ onBack }: NewCapsuleProps) {
  const context = useContext(AppContext);
  if (!context) return null;
  
  const { addWorkSlot, currentUser } = context;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    startingPrice: '',
    maxWinners: '1',
    workStartTime: '', // 作業開始時刻
    workEndTime: '' // 作業終了時刻
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.startTime || !formData.endTime || !formData.startingPrice || !formData.maxWinners || !formData.workStartTime || !formData.workEndTime) {
      alert('すべての必須項目を入力してください');
      return;
    }
    
    const newWorkSlot = {
      id: Date.now().toString(),
      title: formData.title,
      creator: currentUser,
      currentPrice: parseInt(formData.startingPrice),
      endTime: formData.endTime,
      thumbnail: 'https://images.unsplash.com/photo-1662117940162-b666fea153cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMGFydHxlbnwxfHx8fDE3NTY3OTQ3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      description: formData.description,
      isOwned: false,
      isUnlocked: false,
      auctionEnded: false,
      isMyListing: true,
      maxWinners: parseInt(formData.maxWinners),
      videoUrl: '/mock-video.mp4',
      sampleVideoUrl: '/mock-sample.mp4',
      currentBids: [],
      winners: [],
      workScheduledStartTime: formData.workStartTime,
      workScheduledEndTime: formData.workEndTime
    };
    
    addWorkSlot(newWorkSlot);
    alert('作業枠が出品されました！');
    onBack();
  };

  return (
    <div className="min-h-screen bg-background">
      <AppBar title="新規作業枠出品" showBackButton onBack={onBack} />
      
      <div className="p-4 space-y-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>作業枠情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">作業タイトル *</Label>
              <Input
                id="title"
                placeholder="例: イラスト制作"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">作業内容 *</Label>
              <Textarea
                id="description"
                placeholder="どのような作業を行うか詳しく説明してください"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">オークション開始時刻 *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">オークション終了時刻 *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workStartTime">作業開始時刻 *</Label>
                <Input
                  id="workStartTime"
                  type="datetime-local"
                  value={formData.workStartTime}
                  onChange={(e) => handleInputChange('workStartTime', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workEndTime">作業終了時刻 *</Label>
                <Input
                  id="workEndTime"
                  type="datetime-local"
                  value={formData.workEndTime}
                  onChange={(e) => handleInputChange('workEndTime', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startingPrice">開始価格 (円) *</Label>
                <Input
                  id="startingPrice"
                  type="number"
                  placeholder="1000"
                  value={formData.startingPrice}
                  onChange={(e) => handleInputChange('startingPrice', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxWinners">落札者人数 *</Label>
                <Select 
                  value={formData.maxWinners}
                  onValueChange={(value) => handleInputChange('maxWinners', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="人数を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1名（通常）</SelectItem>
                    <SelectItem value="2">2名（複数人落札）</SelectItem>
                    <SelectItem value="3">3名（複数人落札）</SelectItem>
                    <SelectItem value="4">4名（複数人落札）</SelectItem>
                    <SelectItem value="5">5名（複数人落札）</SelectItem>
                    <SelectItem value="6">6名（複数人落札）</SelectItem>
                  </SelectContent>
                </Select>
                {parseInt(formData.maxWinners) > 1 && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    上位{formData.maxWinners}名が落札します
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• オークションは指定した終了時刻に自動終了します</p>
                <p>• 作業時刻になったらアプリでタイムラプス録画を行います</p>
                <p>• 作業完了後にタイムラプス動画が落札者のみに公開されます</p>
                {parseInt(formData.maxWinners) > 1 && (
                  <p className="text-blue-600">• 複数人落札の場合、上位{formData.maxWinners}名全員が動画を視聴できます</p>
                )}
                <p>• 出品後のキャンセルはできません</p>
              </div>
              
              <Button 
                onClick={handleSubmit}
                className="w-full"
                size="lg"
              >
                作業枠を出品する
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}