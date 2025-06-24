"use client";

import React from "react";

interface NavbarProps {
  children: React.ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  return (
    <nav className="navbar">
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
          <a href={item.link}>{item.name}</a>
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
      YesNoMaybe
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