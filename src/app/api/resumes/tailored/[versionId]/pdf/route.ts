import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { ResumePdfDocument } from "@/lib/resumes/ResumePdfDocument";
import type { TailoredResumeContent } from "@/lib/validations/resumeTailor";

export const runtime = "nodejs";

type StoredContent = { tailored: TailoredResumeContent } | null;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> },
) {
  const { versionId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = await createClient();
  const [{ data: version }, { data: profile }, { data: careerProfile }] = await Promise.all([
    supabase
      .from("resume_versions")
      .select("title, content")
      .eq("id", versionId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("career_profiles")
      .select("current_location")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!version) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const content = version.content as StoredContent;
  if (!content?.tailored) {
    return NextResponse.json({ error: "This version has no tailored content" }, { status: 404 });
  }

  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Resume";

  const buffer = await renderToBuffer(
    ResumePdfDocument({
      name,
      email: user.email ?? null,
      location: careerProfile?.current_location ?? null,
      tailored: content.tailored,
    }),
  );

  const fileName = `${version.title || "resume"}.pdf`.replace(/[^a-zA-Z0-9 ._-]/g, "");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
