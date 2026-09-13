import { Badge } from "@/components/ui/badge";
import type { ParsedResume } from "@/lib/validations/resumeParse";

export function ParsedResumePreview({ parsed }: { parsed: ParsedResume }) {
  return (
    <div className="glass flex flex-col gap-4 rounded-xl p-4 text-sm">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        What the AI extracted
      </p>

      {parsed.headline || parsed.currentTitle || parsed.currentCompany ? (
        <div>
          {parsed.headline ? <p className="font-medium">{parsed.headline}</p> : null}
          {parsed.currentTitle || parsed.currentCompany ? (
            <p className="text-muted-foreground">
              {[parsed.currentTitle, parsed.currentCompany].filter(Boolean).join(" at ")}
            </p>
          ) : null}
        </div>
      ) : null}

      {parsed.experiences.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Experience ({parsed.experiences.length})
          </p>
          <ul className="flex flex-col gap-1.5">
            {parsed.experiences.map((exp, i) => (
              <li key={i} className="text-muted-foreground">
                <span className="text-foreground">
                  {exp.title ?? "Untitled role"}
                  {exp.company ? ` at ${exp.company}` : ""}
                </span>
                {!exp.company || !exp.title ? (
                  <span className="text-destructive"> (missing {[!exp.title && "title", !exp.company && "company"].filter(Boolean).join(" and ")} - will not import)</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {parsed.skills.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Skills ({parsed.skills.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {parsed.skills.map((s, i) =>
              s.skill ? (
                <Badge key={i} variant="secondary" className="text-xs">
                  {s.skill}
                </Badge>
              ) : null,
            )}
          </div>
        </div>
      ) : null}

      {parsed.education.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Education ({parsed.education.length})
          </p>
          <ul className="flex flex-col gap-1">
            {parsed.education.map((e, i) => (
              <li key={i} className="text-muted-foreground">
                <span className="text-foreground">{e.institution ?? "Unknown institution"}</span>
                {e.degree ? ` - ${e.degree}` : ""}
                {!e.institution ? (
                  <span className="text-destructive"> (missing institution - will not import)</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {parsed.certifications.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Certifications ({parsed.certifications.length})
          </p>
          <ul className="flex flex-col gap-1">
            {parsed.certifications.map((c, i) => (
              <li key={i} className="text-muted-foreground">
                <span className="text-foreground">{c.name ?? "Unknown certification"}</span>
                {c.issuer ? ` - ${c.issuer}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {parsed.experiences.length === 0 &&
      parsed.skills.length === 0 &&
      parsed.education.length === 0 &&
      parsed.certifications.length === 0 ? (
        <p className="text-muted-foreground">
          Nothing was extracted from this resume. It may be scanned/image-based text, or the formatting is too unusual for the parser to read.
        </p>
      ) : null}
    </div>
  );
}
