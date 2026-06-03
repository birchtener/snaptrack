import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./Sidebar";
import { AppHeader } from "./Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <AppHeader />
        {location.pathname !== "/app/workspaces" &&
        location.pathname !== "/app/workspaces/create" ? (
          <div className="flex flex-1">
            {!isMobile && <AppSidebar />}
            <SidebarInset>
              <div className="px-4 py-12 max-w-6xl w-full mx-auto">
                <Outlet />
              </div>
            </SidebarInset>
            {isMobile && <AppSidebar side="right" />}
          </div>
        ) : (
          <div className="px-4 py-12 max-w-6xl w-full mx-auto">
            <Outlet />
          </div>
        )}
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
