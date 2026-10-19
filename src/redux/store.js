import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import expenseReducer from './expenseSlice';
import budgetReducer from './budgetSlice';
import savingsReducer from './savingsSlice';
import notificationReducer from './notificationSlice';
import fraudReducer from './fraudSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expenseReducer,
    budget: budgetReducer,
    savings: savingsReducer,
    notifications: notificationReducer,
    fraud: fraudReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
