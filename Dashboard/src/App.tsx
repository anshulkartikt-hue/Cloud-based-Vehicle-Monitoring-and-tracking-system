import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangleIcon } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { navigation } from './data/navigation';
import { useVehicleTelemetry } from './hooks/useVehicleTelemetry';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DashboardPage } from './pages/DashboardPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { SettingsPage } from './pages/SettingsPage';
import { TrackingPage } from './pages/TrackingPage';
import type { PageId } from './types/vehicle';

export function App() {
  const [page, setPage] = useState<PageId>('dashboard');
  const [navOpen, setNavOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try {return localStorage.getItem('vm-theme') === 'dark';} catch {return false;}
  });
  const telemetry = useVehicleTelemetry();

  useEffect(() => {
    try {localStorage.setItem('vm-theme', isDark ? 'dark' : 'light');} catch {/* storage unavailable */}
  }, [isDark]);

  const navigate = (p: PageId) => {setPage(p);setNavOpen(false);};
  const toggleTheme = () => setIsDark((d) => !d);
  const pageLabel = navigation.find((n) => n.id === page)?.label ?? '';
  const activeAlerts = telemetry.alerts.filter((a) => a.status === 'active').length;

  const content = {
    dashboard: <DashboardPage telemetry={telemetry} isDark={isDark} onNavigate={navigate} />,
    monitoring: <MonitoringPage telemetry={telemetry} />,
    tracking: <TrackingPage telemetry={telemetry} isDark={isDark} />,
    analytics: <AnalyticsPage telemetry={telemetry} isDark={isDark} />,
    alerts: <AlertsPage telemetry={telemetry} />,
    settings: <SettingsPage isDark={isDark} onToggleTheme={toggleTheme} />
  }[page];

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="flex h-screen w-full bg-canvas font-sans text-ink">
        <Sidebar page={page} onNavigate={navigate} open={navOpen} onClose={() => setNavOpen(false)} activeAlerts={activeAlerts} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            pageLabel={pageLabel}
            running={telemetry.running}
            onStart={telemetry.start}
            onStop={telemetry.stop}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onMenu={() => setNavOpen(true)} />
          
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {telemetry.error &&
            <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">
                <AlertTriangleIcon className="h-4 w-4" /> {telemetry.error}
              </div>
            }
            {!telemetry.running &&
            <div className="mb-4 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-muted">
                Simulation paused — values are frozen at the last reading. Press <strong className="text-ink">Start Simulation</strong> to resume.
              </div>
            }
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className="mx-auto max-w-[1600px]">
                
                {content}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>);

}