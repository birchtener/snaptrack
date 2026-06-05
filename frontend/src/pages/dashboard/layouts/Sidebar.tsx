import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Calendars,
  BookUser,
  Users,
  Receipt,
  ScrollText,
  Settings,
  LayoutDashboard,
  ScanQrCode,
  Calendar,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserMenu } from "../user/components/UserMenu";
import { useLocation, NavLink, useParams } from "react-router";
type SidebarNavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

const workspaceMenuItems = (workspaceId: string): SidebarNavItem[] => [
  {
    title: "Events",
    url: `/app/${workspaceId}/events`,
    icon: Calendars,
  },
  {
    title: "Master List",
    url: `/app/${workspaceId}/master-list`,
    icon: BookUser,
  },
  {
    title: "Team",
    url: `/app/${workspaceId}/team`,
    icon: Users,
  },
  {
    title: "Billing",
    url: `/app/${workspaceId}/billing`,
    icon: Receipt,
  },
  {
    title: "Logs",
    url: `/app/${workspaceId}/logs`,
    icon: ScrollText,
  },
  {
    title: "Settings",
    url: `/app/${workspaceId}/settings`,
    icon: Settings,
  },
];

const eventMenuItems = (
  workspaceId: string,
  eventId: string,
): SidebarNavItem[] => [
  {
    title: "Overview",
    url: `/app/${workspaceId}/event/${eventId}`,
    icon: LayoutDashboard,
  },
  {
    title: "Scanner",
    url: `/app/${workspaceId}/event/${eventId}/scanner`,
    icon: ScanQrCode,
  },
  {
    title: "Rosters",
    url: `/app/${workspaceId}/event/${eventId}/rosters`,
    icon: Users,
  },
  {
    title: "Sessions",
    url: `/app/${workspaceId}/event/${eventId}/sessions`,
    icon: Calendar,
  },
  {
    title: "Event Logs",
    url: `/app/${workspaceId}/event/${eventId}/event-logs`,
    icon: ScrollText,
  },
  {
    title: "Event Settings",
    url: `/app/${workspaceId}/event/${eventId}/settings`,
    icon: Settings,
  },
];

export default function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>,
) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { workspaceId, eventId } = useParams<{
    workspaceId: string;
    eventId: string;
  }>();
  const isEventRoute =
    location.pathname.includes("/event/") &&
    !location.pathname.endsWith("event/create");
  const isWorkspaceRoute =
    location.pathname !== "/app/workspaces" && !isEventRoute;

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      collapsible="icon"
      {...props}
    >
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarMenu>
            {isWorkspaceRoute &&
              workspaceId &&
              workspaceMenuItems(workspaceId).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={
                      item.url === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.url)
                    }
                  >
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            {isEventRoute &&
              workspaceId &&
              eventId &&
              eventMenuItems(workspaceId, eventId).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={
                      item.url === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.url)
                    }
                  >
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {isMobile ? <UserMenu /> : <SidebarTrigger />}
      </SidebarFooter>
    </Sidebar>
  );
}
