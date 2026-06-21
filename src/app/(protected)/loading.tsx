export default function ProtectedLoading() {
  return (
    <main style={{ background: 'var(--surface)', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        
        {/* Header */}
        <div className="card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-gray-100">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-gray-200 shrink-0"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-16 mt-1"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5 h-24 bg-gray-50 rounded-xl flex gap-4 border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0"></div>
                  <div className="space-y-2 flex-1 pt-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 h-48 bg-gray-50 rounded-xl border border-gray-100"></div>
            <div className="card p-6 h-32 bg-gray-50 rounded-xl border border-gray-100"></div>
            <div className="card p-6 h-64 bg-gray-50 rounded-xl border border-gray-100"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
