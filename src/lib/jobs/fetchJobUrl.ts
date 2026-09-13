/**
 * Fetches a job posting URL and extracts visible text for parsing.
 * Deliberately conservative: no headless browser, no auth bypass, no
 * CAPTCHA/anti-bot circumvention. If a site blocks plain HTTP fetches,
 * the user is asked to paste the description instead.
 */
export async function fetchJobUrlText(url: string): Promise<string> {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http(s) URLs are supported");
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; CareerRadarBot/1.0; +https://career-radar.app)",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(
      `Could not fetch this URL (status ${response.status}). Try pasting the job description instead.`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error("This URL did not return an HTML page. Try pasting the job description instead.");
  }

  const html = await response.text();
  return stripHtml(html);
}

function stripHtml(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  const text = withoutScripts
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length < 100) {
    throw new Error(
      "This page did not contain enough readable text. Try pasting the job description instead.",
    );
  }

  return text.slice(0, 20000);
}
