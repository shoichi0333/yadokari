export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* 検索フォームスケルトン */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 h-11 bg-gray-100 rounded-xl" />
          <div className="w-28 h-11 bg-gray-100 rounded-xl" />
          <div className="w-20 h-11 bg-gray-100 rounded-xl" />
          <div className="w-16 h-11 bg-gray-200 rounded-xl" />
        </div>
        <div className="flex gap-2 mt-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-24 h-7 bg-gray-100 rounded-full" />
          ))}
        </div>
      </div>

      {/* 件数バー */}
      <div className="flex justify-between mb-4">
        <div className="w-32 h-5 bg-gray-100 rounded" />
        <div className="w-24 h-8 bg-gray-100 rounded-lg" />
      </div>

      {/* カードグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="h-48 bg-gray-100" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
              <div className="flex justify-between items-center pt-1">
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-100 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
