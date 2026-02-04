import Link from "next/link";
import { getUserRadars, deleteRadar } from "@/actions/radar-actions";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const radars = await getUserRadars();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Radars
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your technology radars
          </p>
        </div>
        <Link href="/radar/new">
          <Button>New Radar</Button>
        </Link>
      </div>

      {radars.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-gray-500">
            You haven&apos;t created any radars yet.
          </p>
          <Link href="/radar/new" className="mt-4 inline-block">
            <Button>Create your first radar</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {radars.map((radar) => (
            <Card key={radar.id} className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <CardTitle>
                    <Link
                      href={`/radar/${radar.id}`}
                      className="hover:text-[#bd4257] transition-colors"
                    >
                      {radar.name}
                    </Link>
                  </CardTitle>
                  {radar.description && (
                    <CardDescription>{radar.description}</CardDescription>
                  )}
                </CardHeader>
                <p className="text-xs text-gray-400">
                  Updated{" "}
                  {radar.updatedAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/radar/${radar.id}`}>
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </Link>
                <Link href={`/radar/${radar.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteRadar(radar.id);
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
