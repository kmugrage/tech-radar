"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { importBlipsFromCsv } from "@/actions/blip-actions";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ImportBlipsPage() {
  const params = useParams<{ radarId: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ type: "loading" });

    const formData = new FormData(e.currentTarget);
    const file = formData.get("csvFile") as File | null;

    if (!file || file.size === 0) {
      setStatus({ type: "error", message: "Please select a CSV file" });
      return;
    }

    const text = await file.text();
    const result = await importBlipsFromCsv(params.radarId, text);

    if (result.error && !result.imported) {
      setStatus({ type: "error", message: result.error });
    } else if (result.error && result.imported) {
      // Partial success
      setStatus({ type: "error", message: result.error });
    } else {
      setStatus({
        type: "success",
        message: `Imported ${result.imported} blip(s).`,
      });
      setTimeout(() => router.push(`/radar/${params.radarId}/blips`), 1500);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link href={`/radar/${params.radarId}/blips`}>
          <Button variant="ghost" size="sm">
            &larr; Back to blips
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import blips from CSV</CardTitle>
          <CardDescription>
            Upload a CSV file with columns: name, quadrant, ring.
            Optional columns: description, isNew.
            Quadrant and ring values must match your radar&apos;s names exactly
            (case-insensitive).
          </CardDescription>
        </CardHeader>

        <div className="mb-6">
          <a
            href={`/api/radar/${params.radarId}/sample-csv`}
            download
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download sample CSV
          </a>
        </div>

        {status.type === "error" && (
          <div className="mb-4 whitespace-pre-wrap rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {status.message}
          </div>
        )}

        {status.type === "success" && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="csvFile"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              CSV file
            </label>
            <input
              type="file"
              id="csvFile"
              name="csvFile"
              accept=".csv,text/csv"
              required
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-900/30 dark:file:text-blue-400"
            />
          </div>
          <Button type="submit" disabled={status.type === "loading"}>
            {status.type === "loading" ? "Importing..." : "Import"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
