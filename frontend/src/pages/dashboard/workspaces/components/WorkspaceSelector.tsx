import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layers, ChevronsUpDown, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaces } from "../hooks/useWorkspaceQueries";

export default function WorkspaceSelector() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [searchInput, setSearchInput] = useState<string>("");
  const { data: workspaceData, isFetched: isWorkspaceFetched } =
    useWorkspaces();

  const filteredWorkspaces = workspaceData?.data.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const { pathname } = useLocation();

  if (
    !isWorkspaceFetched ||
    pathname === "/app/workspaces" ||
    pathname === "/app/workspaces/create"
  ) {
    return null;
  }

  return (
    <div className="flex items-center">
      {!isMobile && <div className="h-4 w-px bg-border rotate-10 mr-4"></div>}
      <Layers className="w-4 h-4 ml-4 text-muted-foreground" />
      <span className="ml-2">
        {workspaceData?.data?.find((w) => w.id === workspaceId)?.name}
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
              <DropdownMenuItem disabled>No workspaces found.</DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate("/app/workspaces")}>
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
              <Plus className="w-3 h-3" />
              Create New Workspace
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
