import { StakeholderRoleProvider } from "@/hooks/useStakeholderRole";
import type { ReactNode } from "react";
import { useState } from "react";
import { Sidebar, SidebarDrawer } from "./Sidebar";
import { TopBar } from "./TopBar";

/**
 * Persistent dashboard shell: a fixed sidebar on desktop that collapses into a
 * drawer on mobile, a sticky top bar with page title, breadcrumb, search,
 * notifications, help, role selector and profile menu, and the page content.
 */
export function DashboardLayout({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <StakeholderRoleProvider>
      <div className="flex min-h-dvh bg-background">
        <Sidebar />
        <SidebarDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenDrawer={() => setDrawerOpen(true)} />
          <main data-ocid="dashboard.main" className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </StakeholderRoleProvider>
  );
}
