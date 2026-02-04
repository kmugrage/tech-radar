import { notFound } from "next/navigation";
import Link from "next/link";
import { getRadar } from "@/actions/radar-actions";
import { deleteBlip } from "@/actions/blip-actions";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function BlipsPage({
  params,
}: {
  params: Promise<{ radarId: string }>;
}) {
  const { radarId } = await params;
  const radar = await getRadar(radarId);
  if (!radar) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blips &mdash; {radar.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {radar.blips.length} blip{radar.blips.length !== 1 && "s"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/radar/${radarId}`}>
            <Button variant="ghost">View Radar</Button>
          </Link>
          <Link href={`/radar/${radarId}/blips/import`}>
            <Button variant="secondary">Import CSV</Button>
          </Link>
          <Link href={`/radar/${radarId}/blips/new`}>
            <Button>Add Blip</Button>
          </Link>
        </div>
      </div>

      {radar.blips.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No blips yet. Add technologies to your radar.
          </p>
          <Link href={`/radar/${radarId}/blips/new`} className="mt-4 inline-block">
            <Button>Add your first blip</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {radar.blips.map((blip) => (
            <Card key={blip.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: blip.quadrant?.color ?? "#888",
                  }}
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {blip.name}
                    {blip.isNew && (
                      <span className="ml-2 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        NEW
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {blip.quadrant?.name} &middot; {blip.ring?.name}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/radar/${radarId}/blips/${blip.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteBlip(radarId, blip.id);
                  }}
                >
                  <Button variant="danger" size="sm" type="submit">
                    Delete
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
