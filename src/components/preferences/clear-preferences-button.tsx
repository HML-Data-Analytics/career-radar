"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Trash2 } from "lucide-react";

export function ClearPreferencesButton({
  onConfirm,
}: {
  onConfirm: () => Promise<{ error?: string } | void> | { error?: string } | void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="glass shrink-0 gap-1.5 border-white/20 text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-3.5" />
        Clear preferences
      </Button>
      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        title="Clear all preferences?"
        description="This permanently deletes everything on this page - target roles, locations, salary, companies, and all other settings. Job matching and filtering will fall back to showing everything until you set preferences again. This cannot be undone."
        confirmLabel="Clear preferences"
        onConfirm={onConfirm}
      />
    </>
  );
}
