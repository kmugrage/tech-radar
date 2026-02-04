"use client";

import { useActionState } from "react";
import { updateRing } from "@/actions/radar-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Ring } from "@/lib/types";

export function RingEditor({ ring }: { ring: Ring }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await updateRing(ring.id, formData);
    },
    null
  );

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div className="flex-1">
        <Input
          id={`r-name-${ring.id}`}
          name="name"
          defaultValue={ring.name}
          label={`Ring ${ring.position + 1}`}
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
