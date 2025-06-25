"use client";

import React, { useEffect, useRef, useState } from "react";

interface PointerHighlightProps {
  children: React.ReactNode;
  className?: string;
}

export function PointerHighlight({ children, className = "" }: PointerHighlightProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <span 
      ref={ref}
      className={`pointer-highlight ${isVisible ? 'visible' : ''} ${className}`}
    >
      {children}
    </span>
  );
} 