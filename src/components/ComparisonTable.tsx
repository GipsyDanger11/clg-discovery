import type { College } from "@/lib/types";

interface ComparisonTableProps {
  colleges: College[];
}

export function ComparisonTable({ colleges }: ComparisonTableProps) {
  if (colleges.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-purple-500/20">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-purple-500/20 bg-purple-900/40">
            <th className="p-3 text-left text-purple-300 font-medium">Attribute</th>
            {colleges.map((c) => (
              <th key={c.id} className="p-3 text-left text-purple-100 font-semibold">
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-purple-500/10">
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
    <tr className="hover:bg-purple-900/20">
      <td className="p-3 text-purple-300 font-medium">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="p-3 text-purple-100">
          {v}
        </td>
      ))}
    </tr>
  );
}
