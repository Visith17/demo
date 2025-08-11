'use client';

import { Notification } from "@/types";
import { NotificationResponse } from "@/app/api/notification";

interface NotificationListProps {
  notificationFetch: NotificationResponse;
  isHandling: boolean;
  className?: string;
}

export default function NotificationList({ 
  notificationFetch, 
  isHandling, 
  className = "" 
}: NotificationListProps) {
  const notifications = notificationFetch?.items || [];

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {notifications.map((notification: Notification) => (
        <div
          key={notification.id}
          className="p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-medium text-gray-900">{notification.title}</h3>
          <p className="text-gray-600 mt-1">{notification.description}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {new Date(notification.timestamp).toLocaleDateString()}
            </span>
            <span className={`text-sm px-2 py-1 rounded-full ${getTypeStyles(notification.type)}`}>
              {notification.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function getTypeStyles(type: Notification['type']): string {
  switch (type) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'info':
    default:
      return 'bg-blue-100 text-blue-800';
  }
}
