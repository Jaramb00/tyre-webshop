import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { NotificationDto } from '../../types';

interface NotificationState {
  notifications: NotificationDto[];
  unreadCount: number;
}

const initialState: NotificationState = { notifications: [], unreadCount: 0 };

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationDto>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) state.unreadCount++;
    },
    setNotifications: (state, action: PayloadAction<NotificationDto[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => { n.isRead = true; });
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, setNotifications, markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
