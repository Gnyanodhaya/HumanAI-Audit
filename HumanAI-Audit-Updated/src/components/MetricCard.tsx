/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: string | number;
    isPositive?: boolean;
    neutral?: boolean;
    label?: string;
  };
  help?: string;
  sublabel?: string;
  badge?: string;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'primary';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  delta,
  help,
  sublabel,
  badge,
  variant = 'default'
}) => {
  const getBorderColor = () => {
    switch (variant) {
      case 'primary': return 'border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20';
      case 'success': return 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20';
      case 'warning': return 'border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20';
      case 'info': return 'border-cyan-200 dark:border-cyan-900/40 bg-cyan-50/30 dark:bg-cyan-950/20';
      default: return 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80';
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${getBorderColor()} shadow-xs transition-all hover:shadow-sm relative group`}>
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          {label}
          {help && (
            <span className="relative group/tooltip cursor-help inline-block text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block z-50 w-48 p-2 text-xs font-normal text-white bg-slate-900 dark:bg-slate-800 rounded shadow-lg border border-slate-700 leading-tight">
                {help}
              </span>
            </span>
          )}
        </span>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2.5">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
          {value}
        </div>

        {delta && (
          <span
            className={`inline-flex items-center text-xs font-medium gap-0.5 ${
              delta.neutral
                ? 'text-slate-500 dark:text-slate-400'
                : delta.isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {delta.neutral ? (
              <Minus className="w-3 h-3" />
            ) : delta.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {delta.value}
            {delta.label && <span className="text-[10px] text-slate-400 ml-0.5">({delta.label})</span>}
          </span>
        )}
      </div>

      {sublabel && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
          {sublabel}
        </p>
      )}
    </div>
  );
};
