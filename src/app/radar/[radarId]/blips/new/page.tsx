import { notFound } from "next/navigation";
import Link from "next/link";
import { getRadar } from "@/actions/radar-actions";
import { createBlip } from "@/actions/blip-actions";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BlipForm } from "@/components/forms/blip-form";
import { Button } from "@/components/ui/button";

export default async function NewBlipPage({
  params,
}: {
  params: Promise<{ radarId: string }>;
}) {
  const { radarId } = await params;
  const radar = await getRadar(radarId);
  if (!radar) notFound();

  const action = createBlip.bind(null, radarId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link href={`/radar/${radarId}/blips`}>
          <Button variant="ghost" size="sm">
            &larr; Back to blips
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add a blip</CardTitle>
          <CardDescription>
            Add a technology to &ldquo;{radar.name}&rdquo;
          </CardDescription>
        </CardHeader>
        <BlipForm
          action={action}
          quadrants={radar.quadrants}
          rings={radar.rings}
          submitLabel="Add Blip"
        />
      </Card>
    </div>
  );
}
