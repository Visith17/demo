"use client";

import { Bell, CalendarClock, Info, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MotionDiv } from "@/components/shared/MotionDiv";

type Notification = {
  id: string;
  title: string;
  description: string;
  type: "info" | "success" | "error";
  timestamp: string;
};

interface Prop {
  notificationDetails: any;
  index: number;
  className?: string;
}

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};


export default function NotificationPage({
  notificationDetails,
  index,
  className = "",
}: Prop) {
  return (

    <MotionDiv
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{
        delay: index * 0.2,
        ease: "easeInOut",
        duration: 0.2,
      }}
      viewport={{ amount: 0 }}
    >
      <div className="p-2 space-y-6 max-w-3xl mx-auto md:pb-4">
        

        {/* {notificationDetails.map((notification) => ( */}
          <Card key={notificationDetails.id} className="shadow-sm">
            <CardHeader className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getIcon(notificationDetails.type)}
                <CardTitle className="text-base">{notificationDetails.title}</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                <CalendarClock className="w-3 h-3 mr-1 inline" />
                {notificationDetails.timestamp}
              </Badge>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {notificationDetails.description}
            </CardContent>
          </Card>
        {/* ))} */}
      </div>
    </MotionDiv>
  );
}

function getIcon(type: Notification["type"]) {
  const iconProps = "w-4 h-4";

  switch (type) {
    case "success":
      return <CheckCircle className={`${iconProps} text-green-500`} />;
    case "info":
      return <Info className={`${iconProps} text-blue-500`} />;
    case "error":
      return <XCircle className={`${iconProps} text-red-500`} />;
    default:
      return <Bell className={iconProps} />;
  }
}
