import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationsRead = createAsyncThunk(
  'notifications/markNotificationsRead',
  async (id, thunkAPI) => {
    try {
      const response = await api.put('/notifications', { id });
      return { id, data: response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to mark notifications read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/notifications/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationsRead.fulfilled, (state, action) => {
        if (action.payload.id) {
          state.notifications = state.notifications.map((n) =>
            n._id === action.payload.id ? { ...n, read: true } : n
          );
          state.unreadCount = Math.max(state.unreadCount - 1, 0);
        } else {
          state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
          state.unreadCount = 0;
        }
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const wasUnread = state.notifications.find((n) => n._id === action.payload)?.read === false;
        state.notifications = state.notifications.filter((n) => n._id !== action.payload);
        if (wasUnread) {
          state.unreadCount = Math.max(state.unreadCount - 1, 0);
        }
      });
  },
});

export default notificationSlice.reducer;
