// src/components/notifications/NotificationBell.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDate } from '@/utils/formatters';
import { Notification } from '@/types';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { notifications, count, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'transaction':
        return '💲';
      case 'ach':
        return '🏦';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        className="text-gray-400 hover:text-white transition-colors p-2 rounded-full relative"
        onClick={toggleNotifications}
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-dark-700 flex justify-between items-center">
            <h3 className="font-medium text-white">Notifications</h3>
            {count > 0 && (
              <button
                className="text-xs text-primary-500 hover:text-primary-400"
                onClick={() => markAllAsRead()}
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No new notifications
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className="p-3 border-b border-dark-700 hover:bg-dark-700"
                >
                  <div className="flex">
                    <span className="mr-2">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <p className="text-sm text-white">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.createdAt ? formatDate(notification.createdAt) : ''}
                      </p>
                    </div>
                    <button
                      className="ml-2 text-gray-400 hover:text-white"
                      onClick={() => markAsRead(notification.id)}
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;