"use client";
import { NotificationWithUser } from "@/lib/types";
import { UserButton } from "@clerk/nextjs";
import { Prisma, Role } from "@prisma/client";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Bell } from "lucide-react";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ModeToggle } from "./mode-toggle";
import { Switch } from "../ui/switch";

type Props = {
  notifications: NotificationWithUser;
  role?: string;
  className?: string;
  subAccountId?: string;
};

const Infobar = ({ notifications, subAccountId, className, role }: Props) => {
  const [allnotifications, setAllNotifications] = useState(notifications);
  const [showAll, setShowAll] = useState(true);

  const handleClick = () => {
    if (!showAll) {
      setAllNotifications(notifications);
    } else {
      if (notifications?.length !== 0) {
        setAllNotifications(
          notifications?.filter((item) => item.subAccountId === subAccountId) ??
            []
        );
      }
    }

    setShowAll((prev) => !prev);
  };
  return (
    <>
      <div
        className={twMerge(
          "fixed z-[20] md:left-[300px] left-0 right-0 top-0 p-4 bg-background/80 backdrop-blur-md flex gap-4 items-center border-b-[1px]",
          className
        )}
      >
        <div className="flex items-center gap-2 ml-auto">
          <UserButton afterSignOutUrl="/" />
          <Sheet>
            <SheetTrigger>
              <div className="rounded-full w-8 h-8 bg-primary flex items-center justify-center text-white">
                <Bell size={17} onClick={handleClick} />
              </div>
            </SheetTrigger>
            <SheetContent className="mt-4 mr-4 pr-4 flex flex-col">
              <SheetHeader className="text-left">
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  {role === "AGENCY_ADMIN" ||
                    (role === "AGENCY_OWNER" && (
                      <Card className="flex items-center justify-between p-4">
                        Current Subaccount
                        <Switch onChangeCapture={handleClick} />
                      </Card>
                    ))}
                </SheetDescription>
              </SheetHeader>
              {allnotifications?.map((notification) => (
                <div
                  key={notification.id}
                  className="flex flex-col gap-y-2 mb-2 overflow-x-scroll text-ellipsis"
                >
                  <div className="flex gap-2">
                    <Avatar>
                      <AvatarImage
                        src={notification.User.avatarUrl}
                        alt="Profile Picture"
                      >
                        <AvatarFallback className="bg-primary">
                          {notification.User.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </AvatarImage>
                    </Avatar>
                    <div className="flex flex-col">
                      <p>
                        <span className="font-bold">
                          {notification.notification.split("|")[0]}
                        </span>
                        <span className="text-muted-foreground">
                          {notification.notification.split("|")[1]}
                        </span>
                        <span className="font-bold">
                          {notification.notification.split("|")[2]}
                        </span>
                      </p>
                      <small className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
              {allnotifications?.length === 0 && (
                <div className="flex items-center justify-center mb-4 text-muted-foreground">
                  You have no notifications
                </div>
              )}
            </SheetContent>
          </Sheet>
          <ModeToggle />
        </div>
      </div>
    </>
  );
};

export default Infobar;
