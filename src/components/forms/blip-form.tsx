"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Quadrant, Ring } from "@/lib/types";

type BlipFormProps = {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  quadrants: Quadrant[];
  rings: Ring[];
  defaultValues?: {
    name: string;
    description: string | null;
    quadrantId: string;
    ringId: string;
    isNew: boolean;
  };
  submitLabel: string;
};

export function BlipForm({
  action,
  quadrants,
  rings,
  defaultValues,
  submitLabel,
}: BlipFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await action(formData);
      return result ?? null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </div>
      )}
      <Input
        id="name"
        name="name"
        label="Blip name"
        placeholder="e.g., React, Kubernetes, Pair Programming"
        defaultValue={defaultValues?.name}
        required
      />
      <Textarea
        id="description"
        name="description"
        label="Description (optional)"
        placeholder="Why is this technology on the radar?"
        defaultValue={defaultValues?.description ?? ""}
      />
      <Select
        id="quadrantId"
        name="quadrantId"
        label="Quadrant"
        options={quadrants.map((q) => ({ value: q.id, label: q.name }))}
        defaultValue={defaultValues?.quadrantId}
        required
      />
      <Select
        id="ringId"
        name="ringId"
        label="Ring"
        options={rings.map((r) => ({ value: r.id, label: r.name }))}
        defaultValue={defaultValues?.ringId}
        required
      />
      <div className="flex items-center gap-2">
        <input
          type="hidden"
          name="isNew"
          value="false"
        />
        <input
          type="checkbox"
          id="isNew"
          name="isNew"
          value="true"
          defaultChecked={defaultValues?.isNew ?? true}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="isNew"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          New (shows as triangle on radar)
        </label>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
