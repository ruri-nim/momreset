"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

interface Point {
  label: string;
  value: number | null;
  target?: number;
}

interface ChartBlockProps {
  title: string;
  subtitle: string;
  data: Point[];
}

export default function ChartBlock({ title, subtitle, data }: ChartBlockProps) {
  const hasSparseCurrentSeries = data.filter((point) => point.value !== null).length <= 1;
  const hasTargetSeries = data.some((point) => point.target !== undefined);

  return (
      <Card className="px-4 py-5 md:px-5 md:py-6">
      <div className="mb-4">
        <h3 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-ink">{title}</h3>
        <p className="mt-1 text-[13px] leading-6 text-muted">{subtitle}</p>
      </div>
      <div
        className="h-[232px] rounded-[24px] p-3 md:h-[248px] md:p-4"
        style={{
          background: "linear-gradient(180deg, rgb(var(--color-peach) / 0.72) 0%, rgb(var(--color-rose) / 0.72) 100%)",
          border: "1px solid rgb(var(--color-line) / 0.82)",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgb(var(--color-line) / 0.52)" strokeDasharray="4 8" vertical />
            <XAxis
              dataKey="label"
              stroke="rgb(var(--color-muted))"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "rgb(var(--color-muted))" }}
              tickMargin={10}
              minTickGap={6}
            />
            <YAxis
              stroke="rgb(var(--color-muted))"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "rgb(var(--color-muted))" }}
              tickMargin={8}
              width={30}
            />
            <Tooltip
              formatter={(value: number | string, name: string) => {
                const label = name === "target" ? "목표선" : "현재 값";
                return [`${value}`, label];
              }}
              contentStyle={{
                borderRadius: 18,
                border: "1px solid rgb(var(--color-line) / 0.95)",
                background: "var(--card-background-strong)",
                color: "rgb(var(--color-ink))",
                boxShadow: "0 18px 34px rgba(15, 23, 42, 0.14)",
                fontSize: 12,
                letterSpacing: "-0.02em",
                padding: "10px 12px",
              }}
              labelStyle={{ color: "rgb(var(--color-muted))", marginBottom: 6 }}
              cursor={{ stroke: "rgb(var(--color-coral) / 0.3)", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="rgb(var(--color-coral))"
              strokeWidth={3}
              connectNulls={false}
              strokeLinecap="round"
              dot={
                hasSparseCurrentSeries
                  ? { r: 6, strokeWidth: 2, stroke: "rgb(var(--color-coral))", fill: "var(--card-background-strong)" }
                  : false
              }
              activeDot={{ r: 7, strokeWidth: 2, stroke: "rgb(var(--color-coral))", fill: "var(--card-background-strong)" }}
            />
            {hasTargetSeries ? (
              <Line
                type="monotone"
                dataKey="target"
                stroke="rgb(var(--color-muted))"
                strokeWidth={1.8}
                strokeDasharray="6 6"
                dot={false}
                strokeLinecap="round"
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
