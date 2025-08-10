import { LogOut, Moon, Settings, User } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar(){
  return (
    <nav className="p-4 flex items-center justify-between">
      {/* Left */}
      collapseButton
      {/* Right */}
      <div className="flex items-center gap-4">
        <Link href="/">Dashboard</Link>
        <Moon/>
         
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://avatars.githubusercontent.com/u/29621916" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-[1.2rem] w-[1.2rem] mr-2"/>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings/>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut/>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}