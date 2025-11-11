import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SimpleNavLinkProps {
  to: string;
  label: string;
}

export const NavLink = ({ to, label }: SimpleNavLinkProps) => {
  return (
    <Link 
      to={to} 
      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm group"
    >
      {label}
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
};
