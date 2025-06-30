"use client";
import { useAuth } from '@/contexts/AuthContext';
import GlobalLoader from './GlobalLoader';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  return (
    <>
      {loading && <GlobalLoader />}
      {children}
    </>
  );
} 