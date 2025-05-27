// src/components/auth/auth-button.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, LogIn, UserPlus } from 'lucide-react';

export function AuthButton() {
  const { user, loading: authLoading, signOutUser } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);

  const handleSignOut = async () => {
    setActionLoading(true);
    await signOutUser();
    // Navigation is handled by signOutUser in AuthContext
    setActionLoading(false);
  };

  if (authLoading && !user) { // Show loader only if not already displaying user avatar
    return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  }

  if (user) {
    const initials = (user.displayName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase();
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
            {actionLoading && user ? ( // Show loader inside avatar button only during sign-out
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Avatar className="h-10 w-10">
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User avatar'} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.displayName || 'Authenticated User'}
              </p>
              {user.email && (
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} disabled={actionLoading}>
            {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If not logged in and not loading auth state
  return (
    <div className="flex items-center space-x-2">
        <Button asChild variant="ghost">
            <Link href="/auth/signin">
                <LogIn className="mr-2 h-4 w-4" />
                Login
            </Link>
        </Button>
    </div>
  );
}
