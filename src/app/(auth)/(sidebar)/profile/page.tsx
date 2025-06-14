'use client';
import { useClerk, UserProfile, useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { Calendar, LogOut, Mail, Settings, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUpdateUserPreferences, useUserProfile } from '@/api/users/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const updatePreferences = useUpdateUserPreferences();

  const [theme, setTheme] = useState(userProfile?.preferences.theme || 'system');
  const [showUserProfile, setShowUserProfile] = useState(false);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      setTheme(newTheme);
      await updatePreferences.mutateAsync({
        ...userProfile?.preferences,
        theme: newTheme,
      });
      toast.success('Theme updated successfully');
    } catch {
      toast.error('Failed to update theme');
      // Revert on error
      setTheme(userProfile?.preferences.theme || 'system');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  };

  if (!isUserLoaded || isProfileLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{user?.primaryEmailAddress?.emailAddress || 'No email available'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Display Name
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{user?.fullName || user?.firstName || 'No name set'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Account Created
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    {user?.createdAt ? format(new Date(user.createdAt), 'PPP') : 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Last Sign In
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    {user?.lastSignInAt ? format(new Date(user.lastSignInAt), 'PPP') : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your experience with Discharger.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme.
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>
              Manage your account settings and security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setShowUserProfile(true)}
              >
                Manage Account Settings
              </Button>
              <p className="text-sm text-muted-foreground">
                Update your password, security settings, and more.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              <p className="text-sm text-muted-foreground">
                Sign out of your account and return to the login page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Profile Modal */}
      {showUserProfile && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setShowUserProfile(false)}
          onKeyDown={e => e.key === 'Escape' && setShowUserProfile(false)}
          role="button"
          aria-label="Close modal"
          tabIndex={0}
        >
          <div
            className="overflow-y-auto"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            role="button"
            tabIndex={0}
          >
            <UserProfile
              routing="hash"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-0 bg-transparent',
                  navbar: 'hidden',
                  pageScrollBox: 'padding: 0',
                  page: 'padding: 24px',
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
