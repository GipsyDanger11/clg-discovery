import Link from "next/link";
import type { College } from "@/lib/types";

export function CollegeCard({ college }: { college: College }) {
  return (
    <Link href={`/college/${college.id}`}>
      <div className="group rounded-xl border border-purple-500/20 bg-purple-950/40 p-5 backdrop-blur-sm transition-all hover:border-purple-400/40 hover:bg-purple-900/40 hover:shadow-lg hover:shadow-purple-500/10">
        <h3 className="text-lg font-semibold text-purple-100 group-hover:text-purple-200">
          {college.name}
        </h3>
        <p className="mt-1 text-sm text-purple-300">{college.location}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-purple-200">
            ₹{college.fees.toLocaleString()}/yr
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-sm text-purple-200">
            ★ {college.rating}
          </span>
        </div>
      </div>
    </Link>
  );
}
