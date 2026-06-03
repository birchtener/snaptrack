import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "../hooks/useUserQueries";
import { useAuth } from "@clerk/react";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Settings, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
export function UserMenu() {
  const { data, isLoading, isError } = useCurrentUser();
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  if (isError) {
    return null;
  }

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          {isMobile && location.pathname !== "/app/workspaces" ? (
            <div className="w-full p-2 flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={data?.user?.imageUrl || undefined}
                  alt={data?.user?.firstName}
                />
                <AvatarFallback>
                  {data?.user?.firstName[0]}
                  {data?.user?.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-center items-start">
                <div className="text-sm font-medium leading-none">
                  {data?.user?.firstName} {data?.user?.lastName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {data?.user?.email}
                </div>
              </div>
              <div></div>
            </div>
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={data?.user?.imageUrl || undefined}
                alt={data?.user?.firstName}
              />
              <AvatarFallback>
                {" "}
                {data?.user?.firstName[0]}
                {data?.user?.lastName[0]}
              </AvatarFallback>
            </Avatar>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-auto"
        align={isMobile ? "start" : "end"}
      >
        <DropdownMenuLabel>
          <div className="text-sm font-medium leading-none">
            {data?.user?.firstName} {data?.user?.lastName}
          </div>
          <div className="text-xs text-muted-foreground">
            {data?.user?.email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="h-4 w-4" />
            Profiles
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => signOut()}
            variant="destructive"
          >
            <LogOut className="h-4 w-4 text-destructive" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
