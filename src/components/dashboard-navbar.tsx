'use client'

import Link from 'next/link'
import { createClient } from '../../supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { UserCircle, Home, FileText, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ThemeSwitcher } from './theme-switcher'
import Image from 'next/image'

export default function DashboardNavbar() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    const supabase = createClient()
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.email?.split('@')[0] || 'User')
      }
    }
    loadUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <nav className="w-full border-b bg-background py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" prefetch className="flex items-center gap-2">
            <Image src="/logo.png" alt="Log Tracker" width={40} height={40} />
            <span className="text-xl font-bold">Log Tracker</span>
          </Link>
          <div className="hidden md:flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/reports">
              <Button variant="ghost" className="gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <ThemeSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <UserCircle className="h-5 w-5" />
                <span className="hidden sm:inline">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm font-medium">
                {userName}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="md:hidden">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="md:hidden">
                <Link href="/dashboard/reports" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Reports
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}