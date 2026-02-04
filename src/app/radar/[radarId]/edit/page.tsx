import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadarForm } from "@/components/forms/radar-form";
import { getRadar, updateRadar, updateQuadrant, updateRing } from "@/actions/radar-actions";
import { Button } from "@/components/ui/button";
import { QuadrantEditor } from "@/components/forms/quadrant-editor";
import { RingEditor } from "@/components/forms/ring-editor";

export default async function EditRadarPage({
  params,
}: {
  params: Promise<{ radarId: string }>;
}) {
  const { radarId } = await params;
  const radar = await getRadar(radarId);
  if (!radar) notFound();

  const updateAction = updateRadar.bind(null, radarId);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Radar
        </h1>
        <Link href={`/radar/${radarId}`}>
          <Button variant="ghost">Back to Radar</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Radar Details</CardTitle>
        </CardHeader>
        <RadarForm
          action={updateAction}
          defaultValues={{
            name: radar.name,
            description: radar.description,
          }}
          submitLabel="Save Changes"
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quadrants</CardTitle>
          <CardDescription>
            Customize quadrant names and colors
          </CardDescription>
        </CardHeader>
        <div className="space-y-3">
          {radar.quadrants.map((q) => (
            <QuadrantEditor key={q.id} quadrant={q} />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rings</CardTitle>
          <CardDescription>
            Customize ring names (innermost to outermost)
          </CardDescription>
        </CardHeader>
        <div className="space-y-3">
          {radar.rings.map((r) => (
            <RingEditor key={r.id} ring={r} />
          ))}
        </div>
      </Card>
    </div>
  );
}
