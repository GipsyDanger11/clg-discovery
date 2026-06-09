import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids");

  if (!ids) {
    return Response.json({ error: "Missing ids parameter" }, { status: 400 });
  }

  const collegeIds = ids.split(",").filter(Boolean);

  if (collegeIds.length < 2 || collegeIds.length > 3) {
    return Response.json(
      { error: "Provide 2-3 college IDs for comparison" },
      { status: 400 }
    );
  }

  const colleges = await prisma.college.findMany({
    where: { id: { in: collegeIds } },
  });

  if (colleges.length !== collegeIds.length) {
    return Response.json(
      { error: "One or more colleges not found" },
      { status: 404 }
    );
  }

  return Response.json({ colleges });
}
