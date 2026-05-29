export const CHART_COLORS = {
  emerald: '#10b981',
  emeraldLight: '#6ee7b7',
  rose: '#f43f5e',
  roseLight: '#fda4af',
  category: [
    '#10b981',
    '#06b6d4',
    '#8b5cf6',
    '#f59e0b',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#6366f1',
  ],
  grid: 'rgba(255,255,255,0.05)',
  axisTick: '#71717a',
  tooltipBg: '#18181b',
  tooltipBorder: '#27272a',
} as const;

export const TOOLTIP_STYLE = {
  background: CHART_COLORS.tooltipBg,
  border: `1px solid ${CHART_COLORS.tooltipBorder}`,
  borderRadius: 8,
  fontSize: 12,
  color: '#e4e4e7',
};

export const AXIS_PROPS = {
  tick: { fill: CHART_COLORS.axisTick, fontSize: 11 },
  axisLine: false,
  tickLine: false,
};
