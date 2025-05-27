
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  CreditCard, 
  Target, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Transações', href: '/transactions', icon: CreditCard },
  { name: 'Metas & Orçamentos', href: '/goals', icon: Target },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden bg-[#000000] border-b border-[#7C7C7C] h-16 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold text-[#EEB3E7]">DOMUS</h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#DDDDDD] h-10 w-10"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Desktop/Mobile Sidebar */}
      <div className={`
        ${isOpen ? 'block' : 'hidden'} md:block
        fixed md:static top-16 md:top-0 left-0 right-0 md:right-auto
        w-full md:w-64 bg-[#000000] border-b md:border-r border-[#7C7C7C]
        z-40 md:z-auto
      `}>
        <div className="flex flex-col h-auto md:h-screen">
          {/* Logo - only visible on desktop */}
          <div className="hidden md:flex items-center justify-center h-16 border-b border-[#7C7C7C] px-4">
            <h1 className="text-xl font-bold text-[#EEB3E7]">DOMUS</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 md:py-6 space-y-1 md:space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#EEB3E7] text-[#000000]'
                      : 'text-[#DDDDDD] hover:bg-[#7C7C7C] hover:text-[#DDDDDD]'
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Sign out button */}
          <div className="p-4 border-t border-[#7C7C7C]">
            <Button
              variant="ghost"
              className="w-full justify-start text-[#DDDDDD] hover:bg-[#7C7C7C] hover:text-[#DDDDDD] text-sm py-2"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
