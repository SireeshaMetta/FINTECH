import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async Thunks
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (params = {}, thunkAPI) => {
    try {
      const response = await api.get('/expenses', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch expenses';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchExpenseById = createAsyncThunk(
  'expenses/fetchExpenseById',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/expenses/${id}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch expense details';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData, thunkAPI) => {
    try {
      const response = await api.post('/expenses', expenseData);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'Failed to create expense';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, expenseData }, thunkAPI) => {
    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'Failed to update expense';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/expenses/${id}`);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete expense';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchExpenseAnalytics = createAsyncThunk(
  'expenses/fetchExpenseAnalytics',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/expenses/analytics');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch expense analytics';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  expenses: [],
  expense: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  },
  analytics: {
    summary: { totalAmount: 0, count: 0, avgAmount: 0 },
    categoryData: [],
    monthlyData: [],
    weeklyData: [],
  },
  loading: false,
  error: null,
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearExpenseError: (state) => {
      state.error = null;
    },
    clearSingleExpense: (state) => {
      state.expense = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Expense By ID
      .addCase(fetchExpenseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseById.fulfilled, (state, action) => {
        state.loading = false;
        state.expense = action.payload;
      })
      .addCase(fetchExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Expense
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Expense
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.map((exp) =>
          exp._id === action.payload._id ? action.payload : exp
        );
        if (state.expense?._id === action.payload._id) {
          state.expense = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Expense
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.filter((exp) => exp._id !== action.payload);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Analytics
      .addCase(fetchExpenseAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchExpenseAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearExpenseError, clearSingleExpense } = expenseSlice.actions;
export default expenseSlice.reducer;
