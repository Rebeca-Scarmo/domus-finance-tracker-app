
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
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden text-[#DDDDDD] h-12 w-12"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 md:w-64 bg-[#000000] border-r border-[#7C7C7C] transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 md:h-16 border-b border-[#7C7C7C] px-4">
            <h1 className="text-2xl md:text-xl font-bold text-[#EEB3E7]">DOMUS</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-4 md:py-3 text-base md:text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#EEB3E7] text-[#000000]'
                      : 'text-[#DDDDDD] hover:bg-[#7C7C7C] hover:text-[#DDDDDD]'
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="mr-3 h-6 w-6 md:h-5 md:w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Sign out button */}
          <div className="p-4 border-t border-[#7C7C7C]">
            <Button
              variant="ghost"
              className="w-full justify-start text-[#DDDDDD] hover:bg-[#7C7C7C] hover:text-[#DDDDDD] h-12 md:h-auto py-4 md:py-2 text-base md:text-sm"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-6 w-6 md:h-5 md:w-5" />
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
