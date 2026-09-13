import React from "react";
import { LucideIcon } from "lucide-react";

/**
 * The centered "this didn't work" page state.
 */
type ErrorStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

const ErrorState: React.FC<ErrorStateProps> = ({
  icon: Icon,
  title,
  description,
  children,
}) => (
  <div className="flex flex-col items-center gap-4 py-16 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <Icon className="h-6 w-6" />
    </div>
    <div className="space-y-1">
      <h1 className="text-xl font-semibold">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
    {children}
  </div>
);

export default ErrorState;
