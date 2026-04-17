"use server";

import { Resend } from "resend";

export type ContactState = {
  status: "success" | "error" | "validation";
  errors?: Record<string, string>;
  message?: string;
} | null;

function validate(data: { name: string; email: string; message: string }) {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) errors.name = "required";
  if (!data.email.trim()) errors.email = "required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "invalid";
  if (!data.message.trim()) errors.message = "required";
  else if (data.message.trim().length < 10) errors.message = "too_short";
  return errors;
}

export async function sendContactEmail(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const data = {
    name: formData.get("name")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim() ?? "",
    message: formData.get("message")?.toString().trim() ?? "",
  };

  const errors = validate(data);
  if (Object.keys(errors).length > 0) {
    return { status: "validation", errors };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const to = process.env.CONTACT_EMAIL ?? "lemaireq.84@gmail.com";

  const { error } = await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to,
    replyTo: data.email,
    subject: `New message from ${data.name}`,
    text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.1em">
          Portfolio Contact Form
        </p>
        <h2 style="margin:8px 0 4px">${data.name}</h2>
        <p style="color:#888;font-size:13px;margin:0 0 24px">
          <a href="mailto:${data.email}" style="color:#c8a97e">${data.email}</a>
        </p>
        <p style="line-height:1.7;white-space:pre-wrap">${data.message}</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return { status: "error", message: "Failed to send. Please try again." };
  }

  return { status: "success" };
}
