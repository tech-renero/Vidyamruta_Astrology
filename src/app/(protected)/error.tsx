"use client";

import { useEffect } from "react";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Protected Route Error:", error);
  }, [error]);

  return (
    <main style={{ background: 'var(--surface)', minHeight: '80vh' }} className="flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full text-center space-y-6 animate-fadeIn border border-gray-100">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: '#ffebee', color: 'var(--danger)' }}>
          <span className="text-3xl">⚠️</span>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Something went wrong!</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            We encountered an unexpected error while loading your dashboard.
          </p>
          {error.digest && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Error ID: {error.digest}</p>
          )}
        </div>
        
        <button
          onClick={() => reset()}
          className="btn-primary w-full py-3 transition-transform hover:scale-[1.02]"
        >
          🔄 Try Again
        </button>
      </div>
    </main>
  );
}
