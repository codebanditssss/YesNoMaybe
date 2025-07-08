"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
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
  IconFileText,
  IconX,
  IconWallet
} from '@tabler/icons-react';

interface AnimatedSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AnimatedSidebar({ isOpen, onClose }: AnimatedSidebarProps) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Sync internal open state with parent's isOpen prop
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  // Handle closing sidebar
  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  // Handle navigation
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    router.push(href);
    if (window.innerWidth < 1024) {
      handleClose();
    }
  };

  // Check if user has admin role
  const isAdmin = user?.user_metadata?.role === 'admin';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: IconHome },
    { name: 'Markets', href: '/Markets', icon: IconChartBar },
    { name: 'Portfolio', href: '/Portfolio', icon: IconTarget },
    { name: 'Wallet', href: '/Wallet', icon: IconWallet },
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

  // Convert navigation items to sidebar links format
  const convertToSidebarLinks = (navItems: any[]) => {
    return navItems.map((item) => ({
      label: item.name,
      href: item.href,
      icon: (
        <item.icon className="h-5 w-5 shrink-0 text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white transition-colors" />
      ),
      onClick: (e?: React.MouseEvent<HTMLAnchorElement>) => {
        if (e) handleNavigation(e, item.href);
      }
    }));
  };

  const regularLinks = convertToSidebarLinks(navigation);
  const adminLinks = convertToSidebarLinks(adminNavigation);

  // Add Settings and Logout links
  const settingsLink = {
    label: 'Settings',
    href: '/Settings',
    icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white transition-colors" />,
    onClick: (e?: React.MouseEvent<HTMLAnchorElement>) => {
      if (e) handleNavigation(e, '/Settings');
    }
  };

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody>
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo */}
          <SidebarLink
            link={{
              label: open ? 'YesNoMaybe' : '',
              href: '/dashboard',
              icon: (
                <div className="h-6 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
              ),
              onClick: (e?: React.MouseEvent<HTMLAnchorElement>) => {
                if (e) handleNavigation(e, '/dashboard');
              }
            }}
            variant="brand"
            className="mb-2"
            active={pathname === '/dashboard'}
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
                  <SidebarLink 
                    key={idx} 
                    link={link}
                    active={pathname === link.href}
                  />
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
                  <SidebarLink 
                    key={idx} 
                    link={link}
                    active={pathname === link.href}
                  />
                ))}
              </>
            )}

            {/* Settings */}
            {open && (
              <div className="my-4">
                <div className="border-t border-neutral-200 dark:border-neutral-800"></div>
              </div>
            )}
            <SidebarLink 
              link={settingsLink}
              active={pathname === settingsLink.href}
            />
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
} 