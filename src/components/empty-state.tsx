import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="glass flex flex-col items-center gap-2 rounded-xl px-4 py-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      {href && cta ? (
        <Button size="sm" className="mt-2" render={<Link href={href}>{cta}</Link>} />
      ) : null}
    </div>
  );
}
