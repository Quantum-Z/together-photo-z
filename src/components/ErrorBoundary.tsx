"use client";
import React from "react";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen grid place-items-center p-6 text-center">
          <div className="glass rounded-3xl p-8 max-w-sm">
            <div className="text-4xl mb-3">🥺</div>
            <h2 className="font-cute font-bold text-lg mb-1">Something went wrong</h2>
            <p className="text-sm opacity-70 font-cute mb-4">{this.state.error.message}</p>
            <button
              onClick={() => location.reload()}
              className="brand-grad text-white font-cute font-semibold px-5 py-2.5 rounded-2xl"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
