"use client";

import { useActionState } from "react";
import { updateQuadrant } from "@/actions/radar-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Quadrant } from "@/lib/types";

export function QuadrantEditor({ quadrant }: { quadrant: Quadrant }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await updateQuadrant(quadrant.id, formData);
    },
    null
  );

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div className="flex-1">
        <Input
          id={`q-name-${quadrant.id}`}
          name="name"
          defaultValue={quadrant.name}
          label={`Quadrant ${quadrant.position + 1}`}
        />
      </div>
      <div className="w-20">
        <label
          htmlFor={`q-color-${quadrant.id}`}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Color
        </label>
        <input
          type="color"
          id={`q-color-${quadrant.id}`}
          name="color"
          defaultValue={quadrant.color}
          className="h-[38px] w-full cursor-pointer rounded border border-gray-300 p-1"
        />
      </div>
      <Button size="sm" type="submit" disabled={isPending}>
        {isPending ? "..." : "Save"}
      </Button>
      {state?.error && (
        <span className="text-sm text-red-600">{state.error}</span>
      )}
    </form>
  );
}
