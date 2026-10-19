import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './redux/authSlice';

// Layout & Route Guards
import DashboardLayout from './layouts/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Loader from './components/Loader';

// Lazy Loaded Page Views
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ExpenseTracker = lazy(() => import('./pages/ExpenseTracker'));
const ScamDetector = lazy(() => import('./pages/ScamDetector'));
const RiskAnalyzer = lazy(() => import('./pages/RiskAnalyzer'));
const ReceiptScanner = lazy(() => import('./pages/ReceiptScanner'));
const FinancialAssistant = lazy(() => import('./pages/FinancialAssistant'));
const Reports = lazy(() => import('./pages/Reports'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const BudgetPage = lazy(() => import('./pages/BudgetPage'));
const SavingsGoalsPage = lazy(() => import('./pages/SavingsGoalsPage'));

function App() {
  const dispatch = useDispatch();
  const { token, initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    } else {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
          <Loader size="lg" message="Loading FinGuard AI..." />
        </div>
      }
    >
      <Routes>
        {/* Public Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Dashboard Workspace */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <ExpenseTracker />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/budgets"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <BudgetPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/savings"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <SavingsGoalsPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/scam-detector"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <ScamDetector />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/risk-analyzer"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <RiskAnalyzer />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/receipt-scanner"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <ReceiptScanner />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <FinancialAssistant />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* Admin Panel Guards */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminRoute>
                <DashboardLayout>
                  <AdminPanel />
                </DashboardLayout>
              </AdminRoute>
            </PrivateRoute>
          }
        />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;

