import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PremiumIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'accent' | 'outlined';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const iconSizes = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
  xl: 'h-10 w-10',
};

export function PremiumIcon({ 
  icon: Icon, 
  size = 'md', 
  variant = 'default',
  className 
}: PremiumIconProps) {
  return (
    <div
      className={cn(
        'rounded-xl flex items-center justify-center transition-all duration-300',
        sizeClasses[size],
        variant === 'default' && 'bg-primary/10 group-hover:bg-primary/15',
        variant === 'accent' && 'accent-gradient shadow-lg',
        variant === 'outlined' && 'border-2 border-primary/20 bg-background',
        className
      )}
    >
      <Icon 
        className={cn(
          iconSizes[size],
          'transition-colors duration-300',
          variant === 'default' && 'text-primary',
          variant === 'accent' && 'text-white',
          variant === 'outlined' && 'text-primary'
        )} 
        strokeWidth={1.75}
      />
    </div>
  );
}

// Badge style pour formats de fichiers
interface FileFormatBadgeProps {
  format: string;
  recommended?: boolean;
}

export function FileFormatBadge({ format, recommended }: FileFormatBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide',
        recommended 
          ? 'bg-accent/10 text-accent border border-accent/20' 
          : 'bg-primary/5 text-primary/70 border border-primary/10'
      )}
    >
      {format}
      {recommended && (
        <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
      )}
    </span>
  );
}

// Trust badge avec icône
interface TrustBadgeProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function TrustBadge({ icon: Icon, title, description, className }: TrustBadgeProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
      </div>
      <div>
        <span className="font-semibold text-foreground text-sm">{title}</span>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
