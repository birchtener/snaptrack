import { useWorkspaces } from "./hooks/useWorkspaceQueries";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Layers, LayersPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function WorkspacePage() {
  const navigate = useNavigate();
  const { data: response, isLoading, isError, error } = useWorkspaces();
  const [searchInput, setSearchInput] = useState("");

  const workspaces = response?.data || [];
  const filteredWorkspaces = workspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchInput.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="w-full h-full bg-background text-foreground">
        <h1 className="text-2xl font-medium tracking-normal">
          Your Workspaces
        </h1>
        <div className="w-full flex justify-between items-center mt-8">
          <div className="relative max-w-sm w-full mr-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search workspaces..."
              disabled
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button className="gap-2" disabled>
            <LayersPlus />
            Create Workspace
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map(() => (
            <div className="cursor-pointer border-border bg-card shadow transition-all rounded-md p-4 border ">
              <div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-sm bg-muted animate-pulse" />
                  <div className="flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Skeleton className="h-5 w-16 rounded-full bg-muted animate-pulse" />
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      <Skeleton className="h-4 w-1/3 rounded-md bg-muted animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full p-6 flex flex-col items-center justify-center border border-destructive bg-destructive/10 text-destructive-foreground rounded-lg">
        <p className="text-sm font-semibold text-destructive">
          Failed to pull active workspaces
        </p>
        <p className="text-xs mt-1 opacity-90">
          {(error as any)?.message || "Internal network failure."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background text-foreground">
      <div className="flex flex-col items-start">
        <h1 className="text-2xl font-bold tracking-normal">Your Workspaces</h1>
        <div className="w-full flex justify-between items-center mt-8">
          <div className="relative max-w-sm w-full mr-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search workspaces..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button
            className="gap-2"
            onClick={() => navigate("/app/workspaces/create")}
          >
            <LayersPlus />
            Create Workspace
          </Button>
        </div>
      </div>
      {filteredWorkspaces?.length === 0 && workspaces.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-border rounded-lg mt-6 bg-card shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            No active workspaces linked to this account.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Get started by building your first isolated tracking environment.
          </p>
        </div>
      ) : filteredWorkspaces?.length === 0 && workspaces.length > 0 ? (
        <div className="text-center p-12 border border-dashed border-border rounded-lg mt-6 bg-card shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            No workspaces found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredWorkspaces?.map((workspace) => (
            <div
              key={workspace.id}
              onClick={() => navigate(`/app/${workspace.id}/events`)}
              className="cursor-pointer hover:bg-accent/10 border-border bg-card shadow transition-all hover:-translate-y-0.5 active:translate-y-0 rounded-md p-4 hover:text-primary border hover:border-primary/50"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/50">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                        {workspace.name}
                      </h3>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {workspace.members
                        ? `${workspace.members.length} member${
                            workspace.members.length > 1 ? "s" : ""
                          }`
                        : "No members"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* {Array.from({ length: 20 }).map((_, index) => (
            <div className="cursor-pointer hover:bg-accent/10 border-border bg-card shadow transition-all hover:-translate-y-0.5 active:translate-y-0 rounded-md p-4 hover:text-primary border hover:border-primary/50">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/50">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                        Test Workspace {index + 1}
                      </h3>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      1 member
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))} */}
        </div>
      )}
    </div>
  );
}
