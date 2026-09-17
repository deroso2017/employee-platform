"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardKpiCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
}

export function DashboardKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: DashboardKpiCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>

            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>

            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </div>

          <div className="rounded-lg border bg-muted/40 p-3">
            <Icon className="size-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
