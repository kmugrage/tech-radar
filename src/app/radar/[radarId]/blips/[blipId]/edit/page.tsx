import { notFound } from "next/navigation";
import Link from "next/link";
import { getRadar } from "@/actions/radar-actions";
import { getBlip, updateBlip } from "@/actions/blip-actions";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BlipForm } from "@/components/forms/blip-form";
import { Button } from "@/components/ui/button";

export default async function EditBlipPage({
  params,
}: {
  params: Promise<{ radarId: string; blipId: string }>;
}) {
  const { radarId, blipId } = await params;
  const [radar, blip] = await Promise.all([
    getRadar(radarId),
    getBlip(radarId, blipId),
  ]);
  if (!radar || !blip) notFound();

  const action = updateBlip.bind(null, radarId, blipId);

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
          <CardTitle>Edit blip</CardTitle>
          <CardDescription>
            Update &ldquo;{blip.name}&rdquo;
          </CardDescription>
        </CardHeader>
        <BlipForm
          action={action}
          quadrants={radar.quadrants}
          rings={radar.rings}
          defaultValues={{
            name: blip.name,
            description: blip.description,
            quadrantId: blip.quadrantId,
            ringId: blip.ringId,
            isNew: blip.isNew,
          }}
          submitLabel="Save Changes"
        />
      </Card>
    </div>
  );
}
