"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type RadarFormProps = {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  defaultValues?: {
    name: string;
    description: string | null;
  };
  submitLabel: string;
};

export function RadarForm({
  action,
  defaultValues,
  submitLabel,
}: RadarFormProps) {
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
        label="Radar name"
        placeholder="e.g., Q1 2025 Technology Radar"
        defaultValue={defaultValues?.name}
        required
      />
      <Textarea
        id="description"
        name="description"
        label="Description (optional)"
        placeholder="What is this radar about?"
        defaultValue={defaultValues?.description ?? ""}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
