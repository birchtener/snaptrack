import Logo from "@/assets/logo_dark.png";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { CalendarPlus, LayersPlus, Menu } from "lucide-react";
import { UserMenu } from "../user/components/UserMenu";
import WorkspaceSelector from "../workspaces/components/WorkspaceSelector";
import EventSelector from "../events/components/EventSelector";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useWorkspaces } from "../workspaces/hooks/useWorkspaceQueries";
import { useEvents } from "../events/hooks/useEventQueries";

const AppHeader: React.FC = () => {
  const { toggleSidebar } = useSidebar();
  const { workspaceId } = useParams<{
    workspaceId: string;
  }>();
  const { isFetched: isWorkspaceFetched } = useWorkspaces();
  const { isFetched: isEventFetched } = useEvents(workspaceId || "");

  const isMobile = useIsMobile();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4 justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/workspaces">
            <img src={Logo} alt="Logo" className="h-6 w-6" />
          </Link>

          {!isMobile && (
            <>
              <WorkspaceSelector />
              <EventSelector />
            </>
          )}

          {isWorkspaceFetched &&
            location.pathname === "/app/workspaces/create" && (
              <div className="flex items-center">
                <div className="h-4 w-px bg-border rotate-10"></div>
                <LayersPlus className="w-4 h-4 ml-4 text-muted-foreground" />
                <span className="ml-2">Create Workspace</span>
              </div>
            )}

          {isEventFetched && location.pathname.includes("/event/create") && (
            <div className="flex items-center">
              <div className="h-4 w-px bg-border rotate-10"></div>
              <CalendarPlus className="w-4 h-4 ml-4 text-muted-foreground" />
              <span className="ml-2">Create Event</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isMobile &&
            location.pathname !== "/app/workspaces" &&
            location.pathname !== "/app/workspaces/create" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="px-0"
              >
                <Menu />
              </Button>
            )}

          {!isMobile ||
          (isMobile && location.pathname === "/app/workspaces") ? (
            <UserMenu />
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
