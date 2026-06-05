import { Button } from "@/components/ui/button";
import { Home, Calendars, QrCode, Users, BookUser, Menu } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
export default function Dock() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { pathname } = useLocation();

  const dockNavigate = (url: string) => {
    if (pathname !== url) {
      navigate(url);
    }
  };

  return (
    <div className="fixed bottom-0 gap-16 left-0 right-0 h-12 bg-background border-t flex">
      <div className="absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 size-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
        <QrCode className="text-primary-foreground size-8" />
      </div>
      <div className="flex w-full items-center">
        <div className="flex-1">
          <Button
            variant="ghost"
            className="size-full flex items-center justify-center "
            onClick={() => dockNavigate(`/app/${workspaceId}/events`)}
          >
            <Calendars
              className={`size-6 ${pathname === `/app/${workspaceId}/events` ? "text-primary" : "text-muted-foreground"}`}
            />
          </Button>
        </div>
        <div className="flex-1">
          <Button
            variant="ghost"
            className="size-full flex items-center justify-center"
            onClick={() => dockNavigate(`/app/${workspaceId}/master-list`)}
          >
            <BookUser
              className={`size-6 ${pathname === `/app/${workspaceId}/master-list` ? "text-primary" : "text-muted-foreground"}`}
            />
          </Button>
        </div>
      </div>
      <div className="flex w-full items-center">
        <div className="flex-1">
          <Button
            variant="ghost"
            className="size-full flex items-center justify-center"
            onClick={() => dockNavigate(`/app/${workspaceId}/team`)}
          >
            <Users
              className={`size-6 ${pathname === `/app/${workspaceId}/team` ? "text-primary" : "text-muted-foreground"}`}
            />
          </Button>
        </div>
        <div className="flex-1">
          <Button
            variant="ghost"
            className="size-full flex items-center justify-center"
            onClick={() => dockNavigate(`/app/${workspaceId}/settings`)}
          >
            <Menu
              className={`size-6 ${pathname === `/app/${workspaceId}/settings` ? "text-primary" : "text-muted-foreground"}`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
