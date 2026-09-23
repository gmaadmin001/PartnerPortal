/**
 * Shared email layer — Resend only.
 *
 * Resend has no hosted template editor, so the "one reusable template" lives here
 * as `renderEmail`. Call sites supply content, never markup for the wrapper.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "ReloCentra Partner Portal <noreply@globalmobilityadviser.com>";

export interface EmailContent {
  subject: string;
  greeting: string;
  headline: string;
  /** Trusted HTML fragment. Interpolate user/DB values through `escapeHtml`. */
  bodyHtml: string;
  buttonLabel: string;
  buttonUrl: string;
  footnote: string;
}

export interface EmailMessage extends EmailContent {
  to: string;
  toName?: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** RFC 5322 display name, with anything that could break the header stripped out. */
function formatRecipient(email: string, name?: string): string {
  const address = email.replace(/[\r\n]/g, "").trim();
  const safeName = (name ?? "").replace(/[\\"\r\n]/g, "").trim();
  if (!safeName || safeName === address) return address;
  return `"${safeName}" <${address}>`;
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The branded wrapper every email in the app renders through. */
export function renderEmail(content: EmailContent): string {
  const year = new Date().getUTCFullYear();
  const greeting = escapeHtml(content.greeting);
  const headline = escapeHtml(content.headline);
  const footnote = escapeHtml(content.footnote);
  const buttonLabel = escapeHtml(content.buttonLabel);
  const buttonUrl = escapeHtml(content.buttonUrl);

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(content.subject)}</title></head>
<body style="margin:0;padding:0;background:#f6f8fc;font-family:'Open Sans',Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f6f8fc;">
    <tr>
      <td align="center" style="padding:32px 16px 32px">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%">

          <tr>
            <td style="background-color:#1E2E61;background-image:linear-gradient(135deg,#0c1428,#1E2E61);border-radius:12px 12px 0 0;padding:28px 40px">
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.03em">
                Global Mobility Adviser
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#b9c2d6;letter-spacing:0.1em;text-transform:uppercase">
                ReloCentra &middot; Partner Portal
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;padding:36px 40px">
              <p style="margin:0 0 6px;font-size:15px;color:#374151">${greeting}</p>
              <h1 style="margin:0 0 20px;font-size:26px;font-weight:800;color:#0a1628;line-height:1.2">${headline}</h1>
              <div style="font-size:15px;color:#374151;line-height:1.75">
                ${content.bodyHtml}
              </div>

              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:32px 0">
                <tr>
                  <td style="border-radius:10px;background-color:#1E2E61;background-image:linear-gradient(135deg,#1E2E61,#1C66AD)">
                    <a href="${buttonUrl}" style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;border-radius:10px;letter-spacing:0.02em">
                      ${buttonLabel}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;line-height:1.6">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0;font-size:12px;color:#1C66AD;line-height:1.6;word-break:break-all">
                ${buttonUrl}
              </p>

              <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #f3f4f6;font-size:12px;color:#9ca3af;line-height:1.6">
                ${footnote}
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f6f8fc;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center">
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af">
                &copy; ${year} Global Mobility Adviser &nbsp;&middot;&nbsp; ReloCentra Partner Portal
              </p>
              <p style="margin:0;font-size:12px">
                <a href="https://globalmobilityadviser.com" style="color:#1C66AD;text-decoration:none">globalmobilityadviser.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderText(content: EmailContent): string {
  return [
    content.greeting,
    "",
    content.headline,
    "",
    htmlToText(content.bodyHtml),
    "",
    `${content.buttonLabel}: ${content.buttonUrl}`,
    "",
    content.footnote,
    "",
    "-- ",
    "Global Mobility Adviser · ReloCentra Partner Portal",
    "https://globalmobilityadviser.com",
  ].join("\n");
}

/**
 * Missing API key → warn and return, so a half-configured environment never
 * crashes a request flow. A real Resend error with the key present throws.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not configured — skipping send");
    return;
  }

  const { to, toName, ...content } = message;

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to: [formatRecipient(to, toName)],
      subject: content.subject,
      html: renderEmail(content),
      text: renderText(content),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`[email] Resend returned ${res.status}: ${detail}`);
  }
}
