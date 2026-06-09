"use client";



interface SearchFilterBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  location: string;
  onLocationChange: (loc: string) => void;
  minRating: string;
  onMinRatingChange: (r: string) => void;
  sortBy: string;
  onSortByChange: (s: string) => void;
}

export function SearchFilterBar({
  query,
  onQueryChange,
  location,
  onLocationChange,
  minRating,
  onMinRatingChange,
  sortBy,
  onSortByChange,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-2xl border border-gray-150 bg-white p-5 shadow-sm">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Search</label>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="College name, location, courses..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
        />
      </div>
      <div className="min-w-[140px]">
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="City, state..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
        />
      </div>
      <div className="min-w-[100px]">
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Min Rating</label>
        <select
          value={minRating}
          onChange={(e) => onMinRatingChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
        >
          <option value="">Any</option>
          <option value="4">4+</option>
          <option value="3">3+</option>
          <option value="2">2+</option>
        </select>
      </div>
      <div className="min-w-[120px]">
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
        >
          <option value="name">Name</option>
          <option value="rating">Rating</option>
          <option value="fees">Fees</option>
        </select>
      </div>
    </div>
  );
}
