"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, type ComponentProps } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface RefreshButtonProps extends ComponentProps<typeof Button> {
  queryKey: string;
}

export function RefreshButton({
  variant = "outline",
  size = "sm",
  queryKey,
  children,
  ...props
}: RefreshButtonProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.refetchQueries({ queryKey: [queryKey] });
    setIsRefreshing(false);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={isRefreshing}
      {...props}
    >
      <RefreshCw
        className={`size-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
      />
      {children}
    </Button>
  );
}
