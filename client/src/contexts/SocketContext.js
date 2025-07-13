import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user && !socket) {
      const token = localStorage.getItem('token');
      if (token) {
        const newSocket = io('http://localhost:5000', {
          auth: { token }
        });

        newSocket.on('connect', () => {
          console.log('Connected to server');
          setConnected(true);
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from server');
          setConnected(false);
        });

        newSocket.on('new_message', (message) => {
          // Handle new message
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'message',
            message: `New message from ${message.senderName}`,
            data: message
          }]);
        });

        newSocket.on('prayer_notification', (notification) => {
          // Handle prayer request notification
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'prayer',
            message: `${notification.userName} posted a prayer request: ${notification.prayerTitle}`,
            data: notification
          }]);
        });

        newSocket.on('user_status_changed', (statusUpdate) => {
          // Handle user status change
          if (statusUpdate.status === 'online') {
            setOnlineUsers(prev => new Set([...prev, statusUpdate.userId]));
          } else {
            setOnlineUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(statusUpdate.userId);
              return newSet;
            });
          }
        });

        newSocket.on('user_offline', (userId) => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        });

        setSocket(newSocket);
      }
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
        setOnlineUsers(new Set());
      }
    };
  }, [user, socket]);

  const sendMessage = (receiverId, content, chatId) => {
    if (socket && connected) {
      socket.emit('send_message', {
        receiverId,
        content,
        chatId
      });
    }
  };

  const joinChat = (chatId) => {
    if (socket && connected) {
      socket.emit('join_chat', chatId);
    }
  };

  const leaveChat = (chatId) => {
    if (socket && connected) {
      socket.emit('leave_chat', chatId);
    }
  };

  const notifyPrayerRequest = (prayerData) => {
    if (socket && connected) {
      socket.emit('new_prayer_request', prayerData);
    }
  };

  const updateUserStatus = (status) => {
    if (socket && connected) {
      socket.emit('user_status_update', status);
    }
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    connected,
    onlineUsers,
    notifications,
    sendMessage,
    joinChat,
    leaveChat,
    notifyPrayerRequest,
    updateUserStatus,
    removeNotification,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}