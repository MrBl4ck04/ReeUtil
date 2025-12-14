const nodemailer = require("nodemailer");

// Detectar si estamos en producción
const isProduction = process.env.NODE_ENV === "production";

let emailUser;
let useBrevoAPI = false;

if (isProduction) {
  // ====================================
  // PRODUCCIÓN: Usar API de Brevo (HTTP) en lugar de SMTP
  // Render bloquea SMTP, pero HTTP funciona
  // ====================================
  const brevoApiKey = process.env.BREVO_API_KEY;
  emailUser = process.env.EMAIL_USER;

  if (brevoApiKey && emailUser) {
    useBrevoAPI = true;
    console.log("✓ Usando Brevo API (HTTP) para envío de emails");
    console.log("✓ Usuario:", emailUser);
  } else {
    console.error("⚠️  ERROR: BREVO_API_KEY o EMAIL_USER no configurados");
    console.error(
      "⚠️  Consigue tu API key en: https://app.brevo.com/settings/keys/api"
    );
  }
} else {
  // ====================================
  // DESARROLLO: Usar Gmail con SMTP
  // ====================================
  const EMAIL_CONFIG = {
    service: "gmail",
    user: "carlocaba2004@gmail.com",
    password: "eihzqxjidgbbeojb",
  };

  emailUser = EMAIL_CONFIG.user;
}

// Solo crear transporter si NO usamos Brevo API
const transporter = !useBrevoAPI
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "carlocaba2004@gmail.com",
        pass: "eihzqxjidgbbeojb",
      },
    })
  : null;

// Función para enviar email con Brevo API (HTTP)
async function sendEmailWithBrevoAPI(to, subject, htmlContent) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const from = emailUser;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: from, name: "ReeUtil" },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    console.log("Email enviado via Brevo API:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error al enviar email con Brevo API:", error);
    throw error;
  }
}

// Función para enviar código de verificación
exports.sendVerificationCode = async (email, code) => {
  const subject = "Código de Verificación - ReeUtil";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #2563eb; text-align: center; margin-bottom: 20px;">ReeUtil</h1>
        <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Código de Verificación</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          Hola,
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          Has solicitado restablecer tu contraseña. Usa el siguiente código de verificación:
        </p>
        
        <div style="background-color: #f0f9ff; border: 2px dashed #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
            ${code}
          </h1>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
          Este código es válido por <strong>10 minutos</strong>.
        </p>
        
        <p style="color: #999; font-size: 12px; line-height: 1.5; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
          Si no solicitaste este cambio, ignora este mensaje. Tu cuenta permanece segura.
        </p>
        
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          © ${new Date().getFullYear()} ReeUtil. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;

  try {
    if (useBrevoAPI) {
      // Usar API de Brevo (producción)
      return await sendEmailWithBrevoAPI(email, subject, htmlContent);
    } else {
      // Usar SMTP con nodemailer (desarrollo)
      const mailOptions = {
        from: emailUser,
        to: email,
        subject: subject,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email enviado:", info.messageId);
      return { success: true, messageId: info.messageId };
    }
  } catch (error) {
    console.error("Error al enviar email:", error);
    throw new Error("No se pudo enviar el código de verificación por email.");
  }
};

// Función para verificar la configuración del servicio
exports.verifyEmailConfig = async () => {
  if (useBrevoAPI) {
    console.log("Usando Brevo API - no requiere verificación SMTP");
    return true;
  }

  try {
    await transporter.verify();
    console.log("Servicio de email configurado correctamente");
    return true;
  } catch (error) {
    console.error("Error en configuración de email:", error);
    return false;
  }
};
