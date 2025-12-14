const nodemailer = require("nodemailer");

// Detectar si estamos en producción
const isProduction = process.env.NODE_ENV === "production";

let transportConfig;
let emailUser; // Definir aquí para poder usarlo en las funciones

if (isProduction) {
  // ====================================
  // PRODUCCIÓN: Usar SIEMPRE variables de entorno
  // ====================================
  const emailService = process.env.EMAIL_SERVICE || "gmail";
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;
  emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  // Verificar configuración
  if (!emailUser || !emailPassword) {
    console.error(
      "⚠️  ERROR: EMAIL_USER o EMAIL_PASSWORD no están configurados en las variables de entorno"
    );
    console.error("⚠️  Configura estas variables en Render Dashboard");
  } else {
    console.log("✓ Servicio de email configurado para PRODUCCIÓN");
    console.log("✓ Servicio:", emailService);
    console.log("✓ Usuario:", emailUser);
  }

  // Configuración diferente según el servicio
  if (emailService === "brevo" || emailHost) {
    // Brevo u otro servicio SMTP personalizado
    const port = parseInt(emailPort || "587");
    transportConfig = {
      host: emailHost || "smtp-relay.brevo.com",
      port: port,
      secure: port === 465, // true para 465 (SSL), false para 587 (TLS)
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
      tls: {
        rejectUnauthorized: false, // Para evitar errores de certificados
      },
    };
    console.log(
      "✓ Usando configuración SMTP personalizada:",
      transportConfig.host,
      "- Puerto:",
      port
    );
  } else {
    // Gmail u otro servicio predefinido
    transportConfig = {
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    };
    console.log("✓ Usando servicio predefinido:", emailService);
  }
} else {
  // ====================================
  // DESARROLLO: Usar credenciales hardcoded
  // ====================================
  const EMAIL_CONFIG = {
    service: "gmail",
    user: "carlocaba2004@gmail.com",
    password: "eihzqxjidgbbeojb",
  };

  emailUser = EMAIL_CONFIG.user;

  transportConfig = {
    service: EMAIL_CONFIG.service,
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.password,
    },
  };

  console.log("✓ Servicio de email configurado para DESARROLLO");
  console.log("✓ Usuario:", EMAIL_CONFIG.user);
}

const transporter = nodemailer.createTransport(transportConfig);

// Función para enviar código de verificación
exports.sendVerificationCode = async (email, code) => {
  try {
    const mailOptions = {
      from: emailUser,
      to: email,
      subject: "Código de Verificación - ReeUtil",
      html: `
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
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error al enviar email:", error);
    throw new Error("No se pudo enviar el código de verificación por email.");
  }
};

// Función para verificar la configuración del servicio
exports.verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log("Servicio de email configurado correctamente");
    return true;
  } catch (error) {
    console.error("Error en configuración de email:", error);
    return false;
  }
};
