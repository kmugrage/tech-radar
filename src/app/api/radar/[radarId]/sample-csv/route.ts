import { NextResponse } from "next/server";
import { getRadar } from "@/actions/radar-actions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ radarId: string }> }
) {
  const { radarId } = await params;
  const radar = await getRadar(radarId);

  if (!radar) {
    return NextResponse.json({ error: "Radar not found" }, { status: 404 });
  }

  const quadrantNames = radar.quadrants.map((q) => q.name);
  const ringNames = radar.rings.map((r) => r.name);

  // Build sample rows using the radar's actual quadrant/ring names
  const sampleRows = [
    [
      "React",
      quadrantNames[3] ?? "Languages & Frameworks",
      ringNames[0] ?? "Adopt",
      "Our primary frontend framework",
      "false",
    ],
    [
      "Kubernetes",
      quadrantNames[1] ?? "Platforms",
      ringNames[0] ?? "Adopt",
      "Container orchestration platform",
      "false",
    ],
    [
      "Deno",
      quadrantNames[1] ?? "Platforms",
      ringNames[2] ?? "Assess",
      "Alternative JavaScript runtime",
      "true",
    ],
    [
      "Pair Programming",
      quadrantNames[0] ?? "Techniques",
      ringNames[1] ?? "Trial",
      "Collaborative coding practice",
      "false",
    ],
    [
      "Vite",
      quadrantNames[2] ?? "Tools",
      ringNames[0] ?? "Adopt",
      "Fast build tool for web projects",
      "true",
    ],
  ];

  const csv = [
    "name,quadrant,ring,description,isNew",
    ...sampleRows.map(
      (row) =>
        row
          .map((field) =>
            field.includes(",") || field.includes('"')
              ? `"${field.replace(/"/g, '""')}"`
              : field
          )
          .join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="radar-blips-sample.csv"`,
    },
  });
}
