import React from 'react';
import { FiAlertOctagon, FiRotateCcw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled runtime error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 text-slate-100 font-sans">
          <div className="max-w-md w-full glass border border-slate-800 p-8 rounded-2xl space-y-6 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-rose-500/10 blur-[80px] pointer-events-none"></div>
            
            <div className="inline-flex w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 items-center justify-center text-rose-500 mb-2">
              <FiAlertOctagon size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                FinGuard AI encountered an unexpected browser execution crash. This may be caused by network instability or invalid state rendering.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-left font-mono text-[10px] text-rose-400 overflow-x-auto whitespace-pre-wrap max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
            >
              <FiRotateCcw size={16} />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
