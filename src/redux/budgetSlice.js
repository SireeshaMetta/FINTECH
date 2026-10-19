import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchBudget = createAsyncThunk(
  'budget/fetchBudget',
  async (month, thunkAPI) => {
    try {
      const response = await api.get('/budgets', { params: { month } });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch budget');
    }
  }
);

export const setBudget = createAsyncThunk(
  'budget/setBudget',
  async (budgetData, thunkAPI) => {
    try {
      const response = await api.post('/budgets', budgetData);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to set budget');
    }
  }
);

export const fetchBudgetStatus = createAsyncThunk(
  'budget/fetchBudgetStatus',
  async (month, thunkAPI) => {
    try {
      const response = await api.get('/budgets/status', { params: { month } });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to check budget status');
    }
  }
);

const budgetSlice = createSlice({
  name: 'budget',
  initialState: {
    budget: null,
    status: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudget.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budget = action.payload;
      })
      .addCase(fetchBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(setBudget.fulfilled, (state, action) => {
        state.budget = action.payload;
      })
      .addCase(fetchBudgetStatus.fulfilled, (state, action) => {
        state.status = action.payload;
      });
  },
});

export default budgetSlice.reducer;
