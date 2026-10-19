import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchFraudAlerts = createAsyncThunk(
  'fraud/fetchFraudAlerts',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/fraud/alerts');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch fraud alerts');
    }
  }
);

export const scanFraud = createAsyncThunk(
  'fraud/scanFraud',
  async (_, thunkAPI) => {
    try {
      const response = await api.post('/fraud/scan');
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to perform fraud scan');
    }
  }
);

export const resolveFraudAlert = createAsyncThunk(
  'fraud/resolveFraudAlert',
  async ({ id, status }, thunkAPI) => {
    try {
      const response = await api.put(`/fraud/alerts/${id}`, { status });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update fraud alert status');
    }
  }
);

const fraudSlice = createSlice({
  name: 'fraud',
  initialState: {
    alerts: [],
    riskScore: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFraudAlerts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFraudAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload.data;
        state.riskScore = action.payload.riskScore;
      })
      .addCase(fetchFraudAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(scanFraud.fulfilled, (state, action) => {
        // Refresh alert array with new ones if scanned
        action.payload.forEach((newAlert) => {
          if (!state.alerts.find((a) => a._id === newAlert._id)) {
            state.alerts.unshift(newAlert);
          }
        });
      })
      .addCase(resolveFraudAlert.fulfilled, (state, action) => {
        state.alerts = state.alerts.map((a) => (a._id === action.payload._id ? action.payload : a));
        // Recalculate quick mock risk score based on active alerts
        const active = state.alerts.filter(a => a.status === 'active');
        if (active.length > 0) {
          const maxScore = Math.max(...active.map(a => a.riskScore));
          state.riskScore = Math.min(maxScore + (active.length - 1) * 8, 100);
        } else {
          state.riskScore = 0;
        }
      });
  },
});

export default fraudSlice.reducer;
