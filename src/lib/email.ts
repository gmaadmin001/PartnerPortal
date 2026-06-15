import "server-only";

export interface EmailParams {
  to_email: string;
  to_name: string;
  subject: string;
  greeting: string;
  headline: string;
  message_html: string;
  button_label: string;
  button_url: string;
  footnote: string;
}

export async function sendEmail(params: EmailParams): Promise<void> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.warn("[email] EmailJS env vars not configured — skipping send");
    return;
  }

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: params,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`[email] EmailJS returned ${res.status}: ${text}`);
    }
  } catch (err) {
    console.warn("[email] EmailJS send failed:", err);
  }
}
