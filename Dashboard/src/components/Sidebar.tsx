
import React from 'react';
import { CloudIcon, XIcon, CpuIcon } from 'lucide-react';
import { navigation } from '../data/navigation';
import type { PageId } from '../types/vehicle';

interface SidebarProps {
  page: PageId;
  onNavigate: (p: PageId) => void;
  open: boolean;
  onClose: () => void;
  activeAlerts: number;
}

export function Sidebar({ page, onNavigate, open, onClose, activeAlerts }: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-navy-900/60 transition-opacity duration-200 lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true" />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy text-slate-300 transition-transform duration-[250ms] ease-[cubic-bezier(0.23,1,0.32,1)] dark:bg-navy-900 dark:border-r dark:border-white/5 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Main navigation">

        <div className="flex items-center gap-3 px-5 pb-6 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white">
            <CloudIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">CloudFleet</p>
            <p className="truncate text-xs text-slate-400">Vehicle Telemetry</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close navigation">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navigation.map(({ id, label, icon: Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`group flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  active ? 'bg-navy-700 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}>

                <Icon className={`h-[18px] w-[18px] shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${active ? 'text-blue-400' : ''}`} aria-hidden="true" />
                <span className="flex-1 text-left">{label}</span>
                {id === 'alerts' && activeAlerts > 0 &&
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white" aria-label={`${activeAlerts} active alerts`}>
                    {activeAlerts}
                  </span>
                }
              </button>
            );
          })}
        </nav>

        <div className="m-3 rounded-xl bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-white">
            <CpuIcon className="h-4 w-4 text-amber-400" aria-hidden="true" />
            Data source
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
            Vehicle telemetry is generated automatically in AWS Lambda and stored in Amazon DynamoDB.
          </p>
        </div>
      </aside>
    </>
  );
}
