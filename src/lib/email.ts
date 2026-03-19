import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string, username: string) {
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "AnimeList <onboarding@resend.dev>",
    to: email,
    subject: "Verifique seu email - AnimeList",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #0D0B14; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7C3AED, #5B21B6); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">AnimeList</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #E8E4F4; font-size: 16px; margin: 0 0 8px;">Olá, <strong>${username}</strong>!</p>
          <p style="color: #A8A0B8; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Use o código abaixo para verificar seu email:
          </p>
          <div style="background: #161320; border: 1px solid #1E1A2B; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #7C3AED;">${code}</span>
          </div>
          <p style="color: #6B6580; font-size: 12px; margin: 0;">
            Este código expira em 15 minutos. Se você não solicitou isso, ignore este email.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Email send error:", error);
    throw new Error("Falha ao enviar email");
  }
}
