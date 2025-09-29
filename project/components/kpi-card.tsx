"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export type KpiCardProps = {
  title: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
  valueClassName?: string;
};

export function KpiCard({
  title,
  value,
  hint,
  icon,
  trend = "neutral",
  className,
  valueClassName,
}: KpiCardProps) {
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor =
    trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground";

  return (
    <Card className={cn("bg-card text-card-foreground", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
          {icon ? (
            <div className="p-2 rounded-md bg-accent text-accent-foreground">{icon}</div>
          ) : (
            <TrendIcon className={cn("h-4 w-4", trendColor)} />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default KpiCard;
