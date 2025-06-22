import { useEffect, useRef, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';

import api from '../../api/baseApi';
import {
  connectToNotifications,
  disconnectFromNotifications,
} from '../../api/sockets/sockets';

export interface Notification<T> {
  id: string;
  userId: string;
  type: string;
  payload: T;
  isRead: boolean;
  isDelivered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportResolvedPayload {
  message: string;
  reportId: number;
  resolvedAt: string;
}

interface UseNotificationsReturn {
  notifications: Notification<ReportResolvedPayload>[];
  isLoading: boolean;
  error: string | null;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(userId: string): UseNotificationsReturn {
  const socketRef = useRef<Socket | null>(null);
  const [notifications, setNotifications] = useState<
    Notification<ReportResolvedPayload>[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitializedRef = useRef(false);
  const notificationIdsRef = useRef<Set<string>>(new Set());

  const handleSocketNotification = useCallback(
    (notification: Notification<ReportResolvedPayload>) => {
      console.log('[Socket] New notification received:', notification);

      if (notificationIdsRef.current.has(notification.id)) {
        console.log(
          '[Socket] Duplicate notification ignored:',
          notification.id,
        );
        return;
      }

      if (notification.type !== 'report_created') return;
      notificationIdsRef.current.add(notification.id);
      setNotifications((prev) => [notification, ...prev]);
    },
    [],
  );

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/notifications');

      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch notifications: ${response.statusText}`,
        );
      }

      const fetchedNotifications: Notification<ReportResolvedPayload>[] =
        response.data;
      console.log(
        '[useNotifications] Fetched notifications:',
        fetchedNotifications,
      );

      // Update both state and Set
      const filteredNotifications = fetchedNotifications.filter(
        (notification) => notification.type === 'report_created',
      );
      setNotifications(filteredNotifications);
      notificationIdsRef.current = new Set(
        filteredNotifications.map((n) => n.id),
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch notifications';
      console.error('[useNotifications] Fetch error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const connectSocket = useCallback(() => {
    if (!userId || socketRef.current) return;

    try {
      socketRef.current = connectToNotifications(userId);
      socketRef.current.on('new-notification', handleSocketNotification);

      socketRef.current.on('connect', () => {
        console.log('[Socket] Connected successfully');
      });

      socketRef.current.on('disconnect', (reason) => {
        alert(`disconnected ${reason}`);
        console.log('[Socket] Disconnected:', reason);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error);
        setError('Real-time connection failed');
      });
    } catch (err) {
      console.error('[useNotifications] Socket connection error:', err);
      setError('Failed to establish real-time connection');
    }
  }, [userId, handleSocketNotification]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('new-notification', handleSocketNotification);
      socketRef.current.disconnect();
      disconnectFromNotifications();
      socketRef.current = null;
    }
  }, [handleSocketNotification]);

  useEffect(() => {
    if (!userId || isInitializedRef.current) return;

    isInitializedRef.current = true;

    fetchNotifications();

    connectSocket();

    return () => {
      disconnectSocket();
      isInitializedRef.current = false;
    };
  }, [userId, fetchNotifications, connectSocket, disconnectSocket]);

  // Handle user ID changes
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setError(null);
      notificationIdsRef.current.clear();
      disconnectSocket();
      isInitializedRef.current = false;
    }
  }, [userId, disconnectSocket]);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await api.post(`/notifications/read-all`);
      console.log(res);

      if (res.status !== 201) throw new Error('Failed to mark all as read');
      setNotifications([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to mark notification as read';
      console.error('[useNotifications] markAsRead error:', err);
      setError(errorMessage);
      throw err; // Re-throw so caller can handle
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);

      const response = await api.post('/notifications/read', {
        id: notificationId,
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId),
      );
      notificationIdsRef.current.delete(notificationId);

      console.log(
        '[useNotifications] Notification marked as read:',
        notificationId,
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to mark notification as read';
      console.error('[useNotifications] markAsRead error:', err);
      setError(errorMessage);
      throw err; // Re-throw so caller can handle
    }
  }, []);

  return {
    notifications,
    isLoading,
    error,
    markAllAsRead,
    markAsRead,
    refetch: fetchNotifications,
  };
}
