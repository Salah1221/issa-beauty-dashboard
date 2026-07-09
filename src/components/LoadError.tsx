import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shown when a fetch fails, so a dropped connection reads as an error the user
// can retry — not an empty "no data" state.
const LoadError: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = "Something went wrong while loading.",
  onRetry,
}) => (
  <div className="mt-8 flex flex-col items-center gap-3 text-center">
    <AlertTriangle className="h-10 w-10 text-destructive" />
    <p className="text-muted-foreground">{message}</p>
    {onRetry && (
      <Button variant="outline" className="h-11" onClick={onRetry}>
        Retry
      </Button>
    )}
  </div>
);

export default LoadError;
