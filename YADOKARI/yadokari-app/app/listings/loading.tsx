export default function ListingsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-7 bg-gray-100 rounded w-48 mb-3" />
          <div className="h-4 bg-gray-100 rounded w-72 mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full rounded-2xl bg-gray-100" style={{ height: "calc(100vh - 320px)", minHeight: "480px" }} />
      </div>
    </div>
  );
}
