import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { User } from '@/types/onboarding';
import { ThemeToggle } from './ThemeToggle';
import { logout } from '@/services/authService';

interface HeaderProps {
  user: User | null;
}

export const Header = ({ user }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-bright to-cyan-glow flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-bold text-lg">IA</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">IA ATENDE MAIS</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user.nome}</p>
            <p className="text-xs text-muted-foreground">
              {user.tipo === 'admin' ? 'Administrador' : 'Cliente'}
            </p>
          </div>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
