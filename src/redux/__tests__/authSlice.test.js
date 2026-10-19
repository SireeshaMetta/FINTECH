import { describe, it, expect } from 'vitest';
import authReducer, { clearError, logoutUser } from '../authSlice';

describe('Auth Redux Slice Reducers', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    initialized: false,
  };

  it('should return the initial state on first load', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should clear errors when clearError is dispatched', () => {
    const errorState = { ...initialState, error: 'Authentication failed' };
    const result = authReducer(errorState, clearError());
    expect(result.error).toBeNull();
  });

  it('should clear token and user details when logoutUser is dispatched', () => {
    const activeState = {
      user: { name: 'Admin User', role: 'admin' },
      token: 'mock-valid-jwt-token',
      isAuthenticated: true,
      loading: false,
      error: null,
      initialized: true,
    };
    const result = authReducer(activeState, logoutUser());
    expect(result.token).toBeNull();
    expect(result.user).toBeNull();
    expect(result.isAuthenticated).toBe(false);
  });
});
