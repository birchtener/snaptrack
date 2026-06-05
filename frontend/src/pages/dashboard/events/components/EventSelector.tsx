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
import { Calendars, ChevronsUpDown, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEvents } from "../hooks/useEventQueries";

export default function EventSelector() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { workspaceId, eventId } = useParams<{
    workspaceId: string;
    eventId: string;
  }>();
  const [searchInput, setSearchInput] = useState<string>("");
  const { data: eventData, isFetched: isEventFetched } = useEvents(
    workspaceId || "",
  );

  const filteredEvents = eventData?.data.filter((event) =>
    event.name.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const { pathname } = useLocation();

  if (
    !isEventFetched ||
    pathname === "/app/workspaces" ||
    pathname === "/app/workspaces/create" ||
    pathname.includes("event/create") ||
    !pathname.includes("/event/")
  ) {
    return null;
  }

  return (
    <div className="flex items-center">
      {!isMobile && <div className="h-4 w-px bg-border rotate-10 mr-4"></div>}
      <Calendars className="w-4 h-4 text-muted-foreground" />
      <span className="ml-2">
        {eventData?.data?.find((w) => w.id === eventId)?.name}
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
                placeholder="Search events..."
                autoFocus
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-transparent! border-0 shadow-none ring-0 outline-none focus:bg-transparent focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none pr-8"
              />
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {filteredEvents?.map((event) => (
              <DropdownMenuItem
                key={event.id}
                onClick={() => {
                  navigate(`/app/${workspaceId}/event/${event.id}`);
                }}
              >
                {event.name}
              </DropdownMenuItem>
            ))}
            {filteredEvents?.length === 0 && (
              <DropdownMenuItem disabled>No events found.</DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => navigate(`/app/${workspaceId}/events`)}
            >
              <Calendars className="w-3 h-3 text-muted-foreground" />
              View All Events
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="text-primary"
              onClick={() => navigate(`/app/${workspaceId}/event/create`)}
            >
              <Plus className="w-3 h-3" />
              Create New Event
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
