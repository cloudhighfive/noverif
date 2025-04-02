// src/hooks/useNotifications.ts

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/firebase';
import { Notification } from '@/types';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [user]);

  const fetchNotifications = async (): Promise<void> => {
    try {
      if (!user) return;
      setLoading(true);
      const unreadNotifications = await getUnreadNotifications(user.uid);
      setNotifications(unreadNotifications);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      if (!user) return;
      await markAllNotificationsAsRead(user.uid);
      setNotifications([]);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
    count: notifications.length
  };
}