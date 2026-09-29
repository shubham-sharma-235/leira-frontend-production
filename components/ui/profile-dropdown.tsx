"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Settings, FileText, LogOut, User, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Profile {
  name: string;
  email: string;
  avatar?: string;
}

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

export interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Profile;
  onLogout?: () => void;
}

export function ProfileDropdown({
  data,
  onLogout,
  className,
  ...props
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const initial = data.name?.trim().charAt(0).toUpperCase() || data.email?.trim().charAt(0).toUpperCase() || "?";

  const menuItems: MenuItem[] = [
    { label: "Profile", href: "/profile", icon: <User className="w-4 h-4" /> },
    { label: "Wishlist", href: "/profile?tab=wishlist", icon: <Heart className="w-4 h-4" /> },
    {
      label: "Terms & Policies",
      href: "/terms-and-conditions",
      icon: <FileText className="w-4 h-4" />,
      external: false,
    },
  ];

  return (
    <div className={cn("relative", className)} {...props}>
      <DropdownMenu onOpenChange={setIsOpen}>
        <div className="group relative">
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center p-1 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 p-[1.5px] shadow-sm">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    {data.avatar ? (
                      <Image
                        src={data.avatar}
                        alt={data.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-pink-600 font-bold text-[11px]">
                        {initial}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>

          <div
            className={cn(
              "absolute -right-3 top-1/2 -translate-y-1/2 transition-all duration-200 hidden sm:block",
              isOpen ? "opacity-100" : "opacity-60 group-hover:opacity-100"
            )}
          >
            <svg
              width="12"
              height="24"
              viewBox="0 0 12 24"
              fill="none"
              className={cn(
                "transition-all duration-200",
                isOpen
                  ? "text-pink-500 scale-110"
                  : "text-gray-400 group-hover:text-gray-600"
              )}
              aria-hidden="true"
            >
              <path
                d="M2 4C6 8 6 16 2 20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-64 p-2 bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-2xl shadow-xl shadow-gray-900/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-top-right"
          >
            <div className="space-y-1">
              {menuItems.map((item) => (
                <DropdownMenuItem key={item.label} asChild>
                  <Link
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="flex items-center p-3 hover:bg-gray-100/80 rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-sm border border-transparent hover:border-gray-200/50"
                  >
                    <div className="flex items-center gap-2 flex-1 text-pink-600">
                      {item.icon}
                      <span className="text-sm font-medium text-gray-900 tracking-tight leading-tight whitespace-nowrap group-hover:text-pink-600 transition-colors">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator className="my-3 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            <DropdownMenuItem asChild>
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-3 duration-200 bg-red-500/10 rounded-xl hover:bg-red-500/20 cursor-pointer border border-transparent hover:border-red-500/30 hover:shadow-sm transition-all group"
              >
                <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                <span className="text-sm font-medium text-red-500 group-hover:text-red-600">
                  Sign Out
                </span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </div>
  );
}
