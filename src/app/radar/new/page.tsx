import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadarForm } from "@/components/forms/radar-form";
import { createRadar } from "@/actions/radar-actions";

export default function NewRadarPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Create a new radar</CardTitle>
          <CardDescription>
            Start with default quadrants and rings, customize them later.
          </CardDescription>
        </CardHeader>
        <RadarForm action={createRadar} submitLabel="Create Radar" />
      </Card>
    </div>
  );
}
