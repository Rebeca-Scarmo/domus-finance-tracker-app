
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#000000] text-[#DDDDDD] flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Sidebar />
      </div>
      <main className="flex-1 pt-16 md:pt-0 md:ml-0 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8 pt-4 md:pt-6 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
