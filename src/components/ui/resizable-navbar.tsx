"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileDropdown } from "@/components/profile/ProfileDropdown";

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
    <div className="nav-body">
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
    <div className="navbar-logo">
      <span className="logo-text">YesNoMaybe</span>
      <div className="logo-indicator"></div>
    </div>
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
  const { user, loading } = useAuth();
  const avatarRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { name: "Markets", link: "/markets" },
    { name: "Portfolio", link: "/portfolio" },
    { name: "Analytics", link: "/analytics" },
    { name: "About", link: "/about" }
  ];

  return (
    <Navbar>
      <NavBody>
        <NavbarLogo />
        
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <NavItems items={navItems} />
        </div>
        
        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-3">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : user ? (
            <div className="relative">
              <div
                ref={avatarRef}
                className="profile-avatar cursor-pointer"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <ProfileDropdown
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                avatarRef={avatarRef}
              />
            </div>
          ) : (
            <>
              <NavbarButton variant="secondary" onClick={() => onOpenAuth?.('signin')}>Sign In</NavbarButton>
              <NavbarButton variant="primary" onClick={() => onOpenAuth?.('signup')}>Get Started</NavbarButton>
            </>
          )}
        </div>
        
        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <MobileNavToggle 
              isOpen={isMobileMenuOpen} 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            />
          </MobileNavHeader>
          
          <MobileNavMenu 
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a key={idx} href={item.link}>{item.name}</a>
            ))}
            {user ? (
              <>
                <div className="mobile-user-info">
                  <div className="mobile-profile-avatar">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.email}</span>
                </div>
                <a href="/profile">Profile</a>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  setIsProfileOpen(true);
                }}>Settings</a>
              </>
            ) : (
              <>
                <a href="/signin" onClick={() => onOpenAuth?.('signin')}>Sign In</a>
                <a href="/signup" onClick={() => onOpenAuth?.('signup')}>Get Started</a>
              </>
            )}
          </MobileNavMenu>
        </MobileNav>
      </NavBody>
    </Navbar>
  );
} 