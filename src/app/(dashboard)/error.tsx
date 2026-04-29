"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-full min-h-[400px] p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="h-12 w-12 rounded-full bg-red-950/30 border border-red-800/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Something went wrong</h2>
          <p className="text-subtle text-sm mt-1">
            {error.message || "An unexpected error occurred while loading this page."}
          </p>
          {error.digest && (
            <p className="text-xs text-subtle/50 mt-2 font-mono">Ref: {error.digest}</p>
          )}
        </div>
        <Button onClick={reset} variant="outline" size="sm">
          Try again
        </Button>
      </div>
    </div>
  );
}
