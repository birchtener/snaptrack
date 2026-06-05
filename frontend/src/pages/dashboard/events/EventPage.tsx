import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvents } from "./hooks/useEventQueries";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarPlus, Search } from "lucide-react";

export default function EventPage() {
  const navigate = useNavigate();

  const { workspaceId } = useParams<{ workspaceId: string }>();

  const [searchInput, setSearchInput] = useState("");

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useEvents(workspaceId || "");

  const events = response?.data || [];
  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchInput.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="w-full h-full bg-background text-foreground">
        <h1 className="text-2xl font-medium tracking-normal">Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map((skeletonId) => (
            <Card
              key={skeletonId}
              className="border-border bg-card shadow flex flex-col justify-between"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-sm bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3 rounded-md bg-muted animate-pulse" />
                    <Skeleton className="h-4 w-1/3 rounded-md bg-muted animate-pulse" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full p-6 flex flex-col items-center justify-center border border-destructive bg-destructive/10 text-destructive-foreground rounded-lg">
        <p className="text-sm font-semibold text-destructive">
          Failed to pull active events
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
        <h1 className="text-2xl font-bold tracking-normal">Events</h1>

        <div className="w-full flex justify-between items-center mt-8">
          <div className="relative max-w-sm w-full mr-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button onClick={() => navigate(`/app/${workspaceId}/event/create`)}>
            <CalendarPlus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {filteredEvents?.length === 0 && events.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-border rounded-lg mt-6 bg-card shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            No active events linked to this workspace.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Get started by launching a new card scanning session above.
          </p>
        </div>
      ) : filteredEvents?.length === 0 && events.length > 0 ? (
        <div className="text-center p-12 border border-dashed border-border rounded-lg mt-6 bg-card shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            No events found matching your filter parameters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredEvents?.map((event) => (
            <Card
              key={event.id}
              onClick={() => navigate(`/app/${workspaceId}/event/${event.id}`)}
              className="group cursor-pointer hover:bg-accent/10 border-border bg-card shadow transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/50">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-semibold text-card-foreground tracking-tight group-hover:text-primary transition-colors">
                        {event.name}
                      </CardTitle>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide rounded-full border shrink-0 ${
                          event.isActive
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {event.isActive ? "Active" : "Archived"}
                      </span>
                    </div>

                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {event.description ||
                        "No description provided for this session."}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
