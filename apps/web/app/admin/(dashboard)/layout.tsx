import type { ReactNode } from 'react';

import { AdminShell } from '@/components/admin/admin-shell';

export const dynamic = 'force-dynamic';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
