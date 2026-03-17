import React from 'react';
import { cn } from "@/src/lib/utils";

interface CardParticipaProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function CardParticipa({ children, className, onClick }: CardParticipaProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg",
        "dark:bg-zinc-900/40 dark:border-white/5",
        "transition-all duration-300",
        onClick && "cursor-pointer hover:scale-[1.01] hover:bg-white/10 active:scale-[0.99]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 pb-2", className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 pt-2", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 pt-2 border-t border-white/5", className)}>{children}</div>;
}
