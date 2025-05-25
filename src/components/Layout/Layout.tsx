
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#000000] text-[#DDDDDD] flex">
      <Sidebar />
      <main className="flex-1 md:ml-0 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8 pt-20 md:pt-6 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
