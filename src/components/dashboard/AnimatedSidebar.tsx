"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { ClientRedirectManager } from '@/lib/redirect-manager';
import { 
  Home,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Target,
  Activity,
  Clock,
  Shield,
  Database,
  Monitor,
  Flag,
  FileText
} from 'lucide-react';

export function AnimatedSidebar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Check if user has admin role
  const isAdmin = user?.user_metadata?.role === 'admin';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Markets', href: '/Markets', icon: BarChart3 },
    { name: 'Portfolio', href: '/Portfolio', icon: Target },
    { name: 'Market Depth', href: '/MarketDepth', icon: Activity },
    { name: 'Trade History', href: '/TradeHistory', icon: Clock },
    { name: 'Leaderboard', href: '/Leaderboard', icon: Users },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Shield },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Market Management', href: '/admin/markets', icon: BarChart3 },
    { name: 'System Monitor', href: '/admin/system', icon: Monitor },
    { name: 'Analytics', href: '/admin/analytics', icon: Database },
    { name: 'Moderation', href: '/admin/moderation', icon: Flag },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      ClientRedirectManager.redirect(
        router, 
        '/', 
        'User signed out successfully'
      );
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Convert navigation items to sidebar links format
  const convertToSidebarLinks = (navItems: any[]) => {
    return navItems.map((item) => ({
      label: item.name,
      href: item.href,
      icon: (
        <item.icon className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    }));
  };

  const regularLinks = convertToSidebarLinks(navigation);
  const adminLinks = convertToSidebarLinks(adminNavigation);

  // Add Settings and Logout links
  const settingsLink = {
    label: 'Settings',
    href: '/Settings',
    icon: <Settings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
  };

  const logoutLink = {
    label: 'Sign Out',
    href: '#',
    icon: <LogOut className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    onClick: handleSignOut,
  };

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <Logo /> : <LogoIcon />}
          
          <div className="mt-8 flex flex-col gap-2">
            {/* Show admin navigation for admin users */}
            {isAdmin ? (
              <>
                {open && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                      Admin Panel
                    </p>
                  </div>
                )}
                {adminLinks.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </>
            ) : (
              <>
                {open && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Main Menu
                    </p>
                  </div>
                )}
                {regularLinks.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </>
            )}

            {/* Settings */}
            {open && (
              <div className="my-4">
                <div className="border-t border-neutral-200 dark:border-neutral-700"></div>
              </div>
            )}
            <SidebarLink link={settingsLink} />
          </div>
        </div>

        {/* Footer with user info and logout */}
        <div>
          {user && (
            <SidebarLink
              link={{
                label: user.user_metadata?.full_name || user.email || 'User',
                href: '#',
                icon: (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center">
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
                      {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
                    </span>
                  </div>
                ),
              }}
            />
          )}
          <SidebarLink link={logoutLink} />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

// Logo components
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        YesNoMaybe
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
}; 