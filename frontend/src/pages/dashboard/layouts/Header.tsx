import { useState } from "react";
import Logo from "@/assets/logo_dark.png";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronsUpDown, LayersPlus, Menu, Search } from "lucide-react";
import { UserMenu } from "../user/components/UserMenu";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layers } from "lucide-react";
import { useWorkspaces } from "../workspaces/hooks/useWorkspaceQueries";
import { Input } from "@/components/ui/input";
export const AppHeader: React.FC = () => {
  const { toggleSidebar } = useSidebar();
  const { data, isFetched } = useWorkspaces();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const filteredWorkspaces = data?.data.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4 justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/workspaces">
            <img src={Logo} alt="Logo" className="h-6 w-6" />
          </Link>
          {isFetched &&
            data?.data &&
            location.pathname !== "/app/workspaces" &&
            location.pathname !== "/app/workspaces/create" && (
              <div className="flex items-center">
                <div className="h-4 w-px bg-border rotate-10"></div>
                <Layers className="w-4 h-4 ml-4 text-muted-foreground" />
                <span className="ml-2">
                  {data?.data?.find((w) => w.id === workspaceId)?.name}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-2 px-1">
                      <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-auto" align="start">
                    <DropdownMenuGroup>
                      <div className="relative">
                        <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                        <Input
                          placeholder="Search workspaces..."
                          autoFocus
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="bg-transparent! border-0 shadow-none ring-0 outline-none focus:bg-transparent focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none pr-8"
                        />
                      </div>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {filteredWorkspaces?.map((workspace) => (
                        <DropdownMenuItem
                          key={workspace.id}
                          onClick={() => {
                            navigate(`/app/${workspace.id}/events`);
                          }}
                        >
                          {workspace.name}
                        </DropdownMenuItem>
                      ))}
                      {filteredWorkspaces?.length === 0 && (
                        <DropdownMenuItem disabled>
                          No workspaces found.
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => navigate("/app/workspaces")}
                      >
                        <Layers className="w-3 h-3 text-muted-foreground" />
                        View All Workspaces
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        className="text-primary"
                        onClick={() => navigate("/app/workspaces/create")}
                      >
                        <LayersPlus className="w-3 h-3" />
                        Create New Workspace
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          {isFetched && location.pathname === "/app/workspaces/create" && (
            <div className="flex items-center">
              <div className="h-4 w-px bg-border rotate-10"></div>
              <LayersPlus className="w-4 h-4 ml-4 text-muted-foreground" />
              <span className="ml-2">Create Workspace</span>
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
