import React from 'react';

interface PanelProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Panel({ title, description, action, className = '', children }: PanelProps) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-5 shadow-card ${className}`} aria-label={title}>
      {title &&
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
          </div>
          {action}
        </header>
      }
      {children}
    </section>);

}