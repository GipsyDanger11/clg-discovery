import Link from "next/link";
import type { College } from "@/lib/types";

export function CollegeCard({ college }: { college: College }) {
  return (
    <Link href={`/college/${college.id}`}>
      <div className="group rounded-xl border border-gray-150 bg-white shadow-sm transition-all hover:shadow-md hover:border-primary-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-primary-100 to-primary-50">
          {college.imageUrl ? (
            <img
              src={college.imageUrl}
              alt={college.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg className="h-12 w-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
            {college.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            {college.location}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-primary-600">
              ₹{college.fees.toLocaleString()}/yr
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
              ★ {college.rating}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
