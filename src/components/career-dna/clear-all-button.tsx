"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Trash2 } from "lucide-react";

export function ClearAllButton({
  itemLabel,
  count,
  onConfirm,
}: {
  itemLabel: string;
  count: number;
  onConfirm: () => Promise<{ error?: string } | void> | { error?: string } | void;
}) {
  const [open, setOpen] = useState(false);

  if (count === 0) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="glass gap-1.5 border-white/20 text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-3.5" />
        Clear all
      </Button>
      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        title={`Clear all ${itemLabel}?`}
        description={`This permanently deletes all ${count} ${itemLabel} from your Career DNA. This cannot be undone.`}
        confirmLabel="Clear all"
        onConfirm={onConfirm}
      />
    </>
  );
}
