import React, { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ArrowLeft, Bell, Shield, HelpCircle, LogOut, User, CreditCard } from 'lucide-react';
import { AppContext } from '../App';
import { AppBar } from './AppBar';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const context = useContext(AppContext);
  if (!context) return null;
  
  const { currentUser } = context;

  
  const [notifications, setNotifications] = useState({
    bidUpdates: true,
    newCapsules: false,
    workReminders: true
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    onClick 
  }: { 
    icon: any, 
    title: string, 
    description?: string, 
    onClick?: () => void 
  }) => (
    <div 
      className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer rounded-lg"
      onClick={onClick}
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1">
        <p>{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <AppBar title="設定" showBackButton onBack={onBack} />
      
      <div className="p-4 space-y-6">


        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle>アカウント</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SettingItem
              icon={User}
              title="プロフィール編集"
              description="ユーザー名やプロフィール画像を変更"
              onClick={() => alert('プロフィール編集画面に移動')}
            />
            <Separator />
            <SettingItem
              icon={CreditCard}
              title="支払い方法"
              description="クレジットカードや銀行口座の管理"
              onClick={() => alert('支払い方法設定画面に移動')}
            />
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle>通知設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>入札履歴の更新</Label>
                <p className="text-sm text-muted-foreground">
                  あなたの入札が上回られたときに通知
                </p>
              </div>
              <Switch
                checked={notifications.bidUpdates}
                onCheckedChange={(checked) => handleNotificationChange('bidUpdates', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>新着カプセル</Label>
                <p className="text-sm text-muted-foreground">
                  お気に入りクリエイターの新しいカプセル
                </p>
              </div>
              <Switch
                checked={notifications.newCapsules}
                onCheckedChange={(checked) => handleNotificationChange('newCapsules', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>作業開始リマインダー</Label>
                <p className="text-sm text-muted-foreground">
                  出品した作業の開始時刻前に通知
                </p>
              </div>
              <Switch
                checked={notifications.workReminders}
                onCheckedChange={(checked) => handleNotificationChange('workReminders', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle>プライバシー・セキュリティ</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SettingItem
              icon={Shield}
              title="プライバシー設定"
              description="アカウントの公開設定や個人情報の管理"
              onClick={() => alert('プライバシー設定画面に移動')}
            />
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle>サポート</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SettingItem
              icon={HelpCircle}
              title="ヘルプセンター"
              description="よくある質問と使い方ガイド"
              onClick={() => alert('ヘルプセンターを開く')}
            />
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Lapsell v1.0.0</p>
            <p className="text-xs text-muted-foreground">
              © 2025 Lapsell. All rights reserved.
            </p>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card>
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full justify-start p-4 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                if (confirm('ログアウトしますか？')) {
                  alert('ログアウトしました');
                  onBack();
                }
              }}
            >
              <LogOut className="h-5 w-5 mr-4" />
              ログアウト
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}