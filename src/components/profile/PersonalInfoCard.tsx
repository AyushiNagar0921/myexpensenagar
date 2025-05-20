// src/components/profile/PersonalInfoTab.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function PersonalInfoTab({ user }: { user: any }) {
  const { updateUserProfile } = useAuth();
  const [username, setUsername] = useState(user?.user_metadata?.username || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.id || !event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    setUploading(true);
    try {
      const { error } = await supabase.storage.from('avatars').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (data) setAvatarUrl(data.publicUrl);
      toast.success('Avatar uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateUserProfile({ username, avatar_url: avatarUrl });
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center sm:flex-row gap-4">
          <Avatar className="h-24 w-24">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={username || 'User'} /> : <AvatarFallback>{username[0]?.toUpperCase() || 'U'}</AvatarFallback>}
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="avatar">Profile Picture</Label>
            <Input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email || ''} disabled />
        </div>
        <div className="space-y-2">
          <Label>Username</Label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <Button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full">
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </Button>
      </CardContent>
    </Card>
  );
}
