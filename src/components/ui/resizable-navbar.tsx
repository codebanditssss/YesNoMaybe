"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

interface NavbarProps {
  children: React.ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past initial threshold
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setScrollDirection('up');
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Dynamic classes based on scroll state
  const navbarClasses = [
    'navbar',
    scrollDirection === 'down' ? 'navbar-expanded' : 'navbar-compact',
    scrollY > 50 ? 'navbar-scrolled' : ''
  ].filter(Boolean).join(' ');

  return (
    <nav className={navbarClasses}>
      {children}
    </nav>
  );
}

interface NavBodyProps {
  children: React.ReactNode;
}

export function NavBody({ children }: NavBodyProps) {
  return (
    <div className="nav-body flex items-center justify-between w-full">
      {children}
    </div>
  );
}

interface NavItemsProps {
  items: { name: string; link: string }[];
}

export function NavItems({ items }: NavItemsProps) {
  return (
    <ul className="nav-items">
      {items.map((item, idx) => (
        <li key={idx}>
          <a href={item.link} className="nav-link">{item.name}</a>
        </li>
      ))}
    </ul>
  );
}

interface MobileNavProps {
  children: React.ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  return (
    <div className="mobile-nav">
      {children}
    </div>
  );
}

export function NavbarLogo() {
  return (
    <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <svg 
        viewBox="0 0 24 24" 
        className="w-8 h-8 text-black"
        fill="currentColor"
      >
        <path d="M12 2L9.5 7L15 9L12 14L18.5 16L15 22L21 19.5L19.5 15L16 13L18.5 9L15.5 7.5L17 4L12 2Z" />
      </svg>
      <span className="text-xl font-bold">Augur</span>
    </a>
  );
}

interface NavbarButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
}

export function NavbarButton({ 
  children, 
  variant = "primary", 
  className = "",
  onClick 
}: NavbarButtonProps) {
  return (
    <button 
      className={`navbar-button ${variant} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
}

export function MobileNavHeader({ children }: MobileNavHeaderProps) {
  return (
    <div className="mobile-nav-header">
      {children}
    </div>
  );
}

interface MobileNavToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

export function MobileNavToggle({ isOpen, onClick }: MobileNavToggleProps) {
  return (
    <button className="mobile-nav-toggle" onClick={onClick}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="menu-icon"
      >
        {isOpen ? (
          <path
            d="M6 18L18 6M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M3 12h18M3 6h18M3 18h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavMenu({ children, isOpen, onClose }: MobileNavMenuProps) {
  return (
    <div className={`mobile-nav-menu ${isOpen ? 'open' : ''}`}>
      {children}
    </div>
  );
}

interface ResizableNavbarProps {
  onOpenAuth?: (tab: 'signin' | 'signup') => void;
}

export default function ResizableNavbar({ onOpenAuth }: ResizableNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const avatarRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { name: "Feature", link: "#features" },
    { name: "Markets", link: "#learn" },
    { name: "FAQ", link: "#faq" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Navbar>
      <NavBody>
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <NavbarLogo />
        </div>
        
        {/* Center: Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavItems items={navItems} />
        </div>
        
        {/* Right: Auth buttons or Profile */}
        <div className="flex-shrink-0">
          <div className="hidden md:flex">
            {user ? (
              <div className="relative" ref={avatarRef}>
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name || 'Profile'} 
                      className="h-8 w-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                      {profile?.full_name?.split(' ').map(n => n[0]).join('') || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
                
                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-info">
                      <div className="profile-name">
                        {profile?.full_name || user.email?.split('@')[0] || 'User'}
                      </div>
                      <div className="profile-email">
                        {user.email}
                      </div>
                    </div>
                    <div className="profile-divider"></div>
                    <button
                      onClick={handleSignOut}
                      className="sign-out-button"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons flex gap-3">
                <NavbarButton 
                  variant="secondary" 
                  onClick={() => onOpenAuth?.('signin')}
                >
                  Sign In
                </NavbarButton>
                <NavbarButton 
                  variant="primary" 
                  onClick={() => onOpenAuth?.('signup')}
                >
                  Sign Up
                </NavbarButton>
              </div>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <MobileNavToggle 
              isOpen={isMobileMenuOpen} 
              onClick={toggleMobileMenu} 
            />
          </div>
        </div>
      </NavBody>

      {/* Mobile Navigation Menu */}
      <MobileNavMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu}>
        <MobileNavHeader>
          <NavbarLogo />
        </MobileNavHeader>
        
        <div className="mobile-nav-items">
          {navItems.map((item, idx) => (
            <a 
              key={item.name} 
              href={item.link} 
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              {item.name}
            </a>
          ))}
        </div>
        
        {user ? (
          <div className="mobile-user-section">
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="mobile-user-name">
                  {user.email?.split('@')[0] || 'User'}
                </div>
                <div className="mobile-user-email">
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mobile-sign-out"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="mobile-auth-buttons flex flex-col gap-3">
            <NavbarButton 
              variant="secondary" 
              onClick={() => {
                onOpenAuth?.('signin');
                closeMobileMenu();
              }}
            >
              Sign In
            </NavbarButton>
            <NavbarButton 
              variant="primary" 
              onClick={() => {
                onOpenAuth?.('signup');
                closeMobileMenu();
              }}
            >
              Sign Up
            </NavbarButton>
          </div>
        )}
      </MobileNavMenu>
    </Navbar>
  );
} 