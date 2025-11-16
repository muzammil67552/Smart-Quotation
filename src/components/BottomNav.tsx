import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, History, Plus, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/create-quotation', icon: Plus, label: 'Create', isMain: true },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/edit-profile', icon: Settings, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-strong z-50">
      <div className="container max-w-2xl mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            if (item.isMain) {
              return (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-16 h-16 rounded-full bg-gradient-accent shadow-medium -mt-8"
                  size="icon"
                >
                  <Icon className="w-7 h-7" />
                </Button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive(item.path) && 'scale-110')} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
