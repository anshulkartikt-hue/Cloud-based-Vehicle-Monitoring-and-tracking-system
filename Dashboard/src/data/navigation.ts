import { LayoutDashboardIcon, GaugeIcon, MapPinnedIcon, BarChart3Icon, BellRingIcon, SettingsIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PageId } from '../types/vehicle';

export const navigation: {id: PageId;label: string;icon: LucideIcon;}[] = [
{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
{ id: 'monitoring', label: 'Vehicle Monitoring', icon: GaugeIcon },
{ id: 'tracking', label: 'Live Tracking', icon: MapPinnedIcon },
{ id: 'analytics', label: 'Analytics', icon: BarChart3Icon },
{ id: 'alerts', label: 'Alerts', icon: BellRingIcon },
{ id: 'settings', label: 'Settings', icon: SettingsIcon }];