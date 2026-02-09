import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RoleGatedButtonProps {
  allowed: boolean;
  tooltipText: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onClick?: () => void;
  disabled?: boolean;
  'data-testid'?: string;
}

export function RoleGatedButton({
  allowed,
  tooltipText,
  children,
  className = '',
  variant,
  size,
  onClick,
  disabled,
  'data-testid': testId,
}: RoleGatedButtonProps) {
  if (allowed) {
    return (
      <Button
        data-testid={testId}
        className={className}
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Button
              data-testid={testId}
              className={`opacity-40 cursor-not-allowed grayscale ${className}`}
              variant={variant || 'outline'}
              size={size}
              disabled
            >
              <Lock size={12} className="mr-1.5 shrink-0" />
              {children}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent
          className="bg-slate-800 border-slate-700 text-slate-200 text-xs max-w-[200px]"
          side="top"
        >
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface RoleGatedActionProps {
  allowed: boolean;
  tooltipText: string;
  children: React.ReactElement<{ className?: string; disabled?: boolean; onClick?: () => void }>;
}

export function RoleGatedAction({
  allowed,
  tooltipText,
  children,
}: RoleGatedActionProps) {
  if (allowed) {
    return children;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            {React.cloneElement(children, {
              disabled: true,
              className: `${children.props.className || ''} opacity-30 cursor-not-allowed grayscale`,
              onClick: undefined,
            })}
          </span>
        </TooltipTrigger>
        <TooltipContent
          className="bg-slate-800 border-slate-700 text-slate-200 text-xs max-w-[200px]"
          side="top"
        >
          <div className="flex items-center gap-1.5">
            <Lock size={10} className="shrink-0" />
            {tooltipText}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface PulseIndicatorProps {
  show: boolean;
  className?: string;
}

export function PulseIndicator({ show, className = '' }: PulseIndicatorProps) {
  if (!show) return null;
  return (
    <span className={`relative flex h-2.5 w-2.5 ${className}`} data-testid="pulse-indicator">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
    </span>
  );
}

interface ActionBadgeProps {
  count: number;
  label: string;
  className?: string;
}

export function ActionBadge({ count, label, className = '' }: ActionBadgeProps) {
  if (count === 0) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs bg-red-600/20 text-red-400 border border-red-600/30 px-2 py-0.5 rounded-full ${className}`}
      data-testid="action-badge"
    >
      <PulseIndicator show />
      {count} {label}
    </span>
  );
}
