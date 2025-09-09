'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { useAuth } from '../../context/auth-context';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold">
            Polling App
          </Link>
          <nav className="ml-10 hidden space-x-4 md:flex">
            <Link href="/polls" className="text-sm font-medium transition-colors hover:text-primary">
              Polls
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/polls/create">
                <Button variant="outline">Create Poll</Button>
              </Link>
              <Button onClick={logout} variant="ghost">Sign Out</Button>
              <div className="text-sm font-medium">Hi, {user.name}</div>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}