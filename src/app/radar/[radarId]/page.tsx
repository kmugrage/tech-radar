import { notFound } from "next/navigation";
import Link from "next/link";
import { getRadar } from "@/actions/radar-actions";
import { RadarChart } from "@/components/radar/radar-chart";
import { Button } from "@/components/ui/button";

export default async function RadarViewPage({
  params,
}: {
  params: Promise<{ radarId: string }>;
}) {
  const { radarId } = await params;
  const radar = await getRadar(radarId);
  if (!radar) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {radar.name}
          </h1>
          {radar.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {radar.description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
          <Link href={`/radar/${radarId}/blips`}>
            <Button variant="secondary" size="sm">
              Manage Blips ({radar.blips.length})
            </Button>
          </Link>
          <Link href={`/radar/${radarId}/edit`}>
            <Button variant="secondary" size="sm">
              Settings
            </Button>
          </Link>
        </div>
      </div>

      <RadarChart
        quadrants={radar.quadrants}
        rings={radar.rings}
        blips={radar.blips}
      />
    </div>
  );
}
