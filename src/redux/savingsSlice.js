import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchGoals = createAsyncThunk(
  'savings/fetchGoals',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/savings');
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch goals');
    }
  }
);

export const createGoal = createAsyncThunk(
  'savings/createGoal',
  async (goalData, thunkAPI) => {
    try {
      const response = await api.post('/savings', goalData);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create goal');
    }
  }
);

export const updateGoal = createAsyncThunk(
  'savings/updateGoal',
  async ({ id, goalData }, thunkAPI) => {
    try {
      const response = await api.put(`/savings/${id}`, goalData);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update goal');
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'savings/deleteGoal',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/savings/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete goal');
    }
  }
);

const savingsSlice = createSlice({
  name: 'savings',
  initialState: {
    goals: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload);
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.goals = state.goals.map((g) => (g._id === action.payload._id ? action.payload : g));
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter((g) => g._id !== action.payload);
      });
  },
});

export default savingsSlice.reducer;
