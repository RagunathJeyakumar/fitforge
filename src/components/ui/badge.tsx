import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-lime-electric/15 text-lime-electric border border-lime-electric/30",
        secondary:
          "border-transparent bg-charcoal-800 text-muted-foreground border border-white/5",
        destructive:
          "border-transparent bg-destructive/15 text-destructive border border-destructive/30",
        outline: "text-foreground border border-white/15",
        gold:
          "border-amber-500/30 bg-amber-500/15 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]",
        cyan:
          "border-cyan-500/30 bg-cyan-500/15 text-cyan-400 font-medium",
        purple:
          "border-purple-500/30 bg-purple-500/15 text-purple-400 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
