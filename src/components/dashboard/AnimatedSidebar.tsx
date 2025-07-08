"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ClientRedirectManager } from '@/lib/redirect-manager';
import { 
  IconHome,
  IconChartBar,
  IconUsers,
  IconSettings,
  IconLogout,
  IconTarget,
  IconActivity,
  IconClock,
  IconShield,
  IconDatabase,
  IconDeviceDesktop,
  IconFlag,
  IconFileText
} from '@tabler/icons-react';

export function AnimatedSidebar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Check if user has admin role
  const isAdmin = user?.user_metadata?.role === 'admin';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: IconHome },
    { name: 'Markets', href: '/Markets', icon: IconChartBar },
    { name: 'Portfolio', href: '/Portfolio', icon: IconTarget },
    { name: 'Market Depth', href: '/MarketDepth', icon: IconActivity },
    { name: 'Trade History', href: '/TradeHistory', icon: IconClock },
    { name: 'Leaderboard', href: '/Leaderboard', icon: IconUsers },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: IconShield },
    { name: 'User Management', href: '/admin/users', icon: IconUsers },
    { name: 'Market Management', href: '/admin/markets', icon: IconChartBar },
    { name: 'System Monitor', href: '/admin/system', icon: IconDeviceDesktop },
    { name: 'Analytics', href: '/admin/analytics', icon: IconDatabase },
    { name: 'Moderation', href: '/admin/moderation', icon: IconFlag },
    { name: 'Reports', href: '/admin/reports', icon: IconFileText },
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
        <item.icon className="h-5 w-5 shrink-0 text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white transition-colors" />
      ),
    }));
  };

  const regularLinks = convertToSidebarLinks(navigation);
  const adminLinks = convertToSidebarLinks(adminNavigation);

  // Add Settings and Logout links
  const settingsLink = {
    label: 'Settings',
    href: '/Settings',
    icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white transition-colors" />,
  };

  const logoutLink = {
    label: 'Sign Out',
    href: '#',
    icon: <IconLogout className="h-5 w-5 shrink-0 text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300 transition-colors" />,
    onClick: handleSignOut,
  };

  // Get display name for profile
  const getDisplayName = () => {
    const fullName = user?.user_metadata?.full_name;
    const email = user?.email;
    
    if (fullName) return fullName;
    if (email) {
      // Get username part of email (before @)
      const username = email.split('@')[0];
      // Capitalize first letter and replace dots/underscores with spaces
      return username
        .split(/[._]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return 'User';
  };

  // Get avatar text
  const getAvatarText = () => {
    const fullName = user?.user_metadata?.full_name;
    if (fullName) {
      // Get initials from full name
      return fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    // Get first letter of email username
    return user?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo */}
          <SidebarLink
            link={{
              label: open ? 'YesNoMaybe' : '',
              href: '#',
              icon: (
                <div className="h-6 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
              ),
            }}
            variant="brand"
            className="mb-2"
          />
          
          <div className="mt-6 flex flex-col gap-1">
            {/* Show admin navigation for admin users */}
            {isAdmin ? (
              <>
                {open && (
                  <SidebarLink
                    link={{
                      label: 'ADMIN PANEL',
                      href: '#',
                      icon: <div className="w-5" />,
                    }}
                    variant="muted"
                    className="mb-1"
                  />
                )}
                {adminLinks.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </>
            ) : (
              <>
                {open && (
                  <SidebarLink
                    link={{
                      label: 'NAVIGATION',
                      href: '#',
                      icon: <div className="w-5" />,
                    }}
                    variant="muted"
                    className="mb-1"
                  />
                )}
                {regularLinks.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </>
            )}

            {/* Settings */}
            {open && (
              <div className="my-4">
                <div className="border-t border-neutral-200 dark:border-neutral-800"></div>
              </div>
            )}
            <SidebarLink link={settingsLink} />
          </div>
        </div>

        {/* Footer with user info and logout */}
        <div className="flex flex-col gap-1">
          {user && (
            <SidebarLink
              link={{
                label: getDisplayName(),
                href: '/Settings',
                icon: (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {getAvatarText()}
                    </span>
                  </div>
                ),
              }}
              variant="brand"
              className="hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
            />
          )}
          <SidebarLink link={logoutLink} variant="danger" />
        </div>
      </SidebarBody>
    </Sidebar>
  );
} 