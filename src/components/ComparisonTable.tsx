import type { College } from "@/lib/types";

interface ComparisonTableProps {
  colleges: College[];
}

export function ComparisonTable({ colleges }: ComparisonTableProps) {
  if (colleges.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-150 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-primary-50">
            <th className="p-4 text-left text-primary-600 font-semibold uppercase text-xs tracking-wide">Attribute</th>
            {colleges.map((c) => (
              <th key={c.id} className="p-4 text-left text-gray-800 font-bold">
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <Row label="Location" values={colleges.map((c) => c.location)} />
          <Row label="Rating" values={colleges.map((c) => String(c.rating))} />
          <Row label="Fees (per year)" values={colleges.map((c) => `₹${c.fees.toLocaleString()}`)} />
          <Row label="Established" values={colleges.map((c) => String(c.established || "N/A"))} />
          <Row label="Type" values={colleges.map((c) => c.type || "N/A")} />
          <Row label="Courses" values={colleges.map((c) => c.courses)} />
          <Row label="Placements" values={colleges.map((c) => c.placements)} />
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="p-4 text-primary-600 font-medium whitespace-nowrap">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="p-4 text-gray-700">
          {v}
        </td>
      ))}
    </tr>
  );
}
