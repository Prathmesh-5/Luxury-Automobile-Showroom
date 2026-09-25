import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// Create a directory for email logs if it doesn't exist (used only in development fallback)
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, "email-debug.log");

/**
 * Send password reset email using Nodemailer with SMTP
 * @param {string} toEmail - The recipient's email address
 * @param {string} resetUrl - The password reset URL
 * @returns {Promise<boolean>}
 */
export const sendResetEmail = async (toEmail, resetUrl) => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const emailSubject = "Apex Luxury Showroom - Password Reset Request";
    const senderEmail = process.env.SMTP_FROM || smtpUser;

    // Premium HTML Email Template - Black, Dark Gray, and Gold (#D4AF37)
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body {
                background-color: #08080a;
                color: #ffffff;
                font-family: 'Outfit', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }
            .wrapper {
                width: 100%;
                background-color: #08080a;
                padding: 40px 0;
            }
            .container {
                max-width: 580px;
                margin: 0 auto;
                background-color: #121216;
                border: 1px solid rgba(212, 175, 55, 0.25);
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
            }
            .header {
                background-color: #0c0c0e;
                padding: 45px 30px;
                text-align: center;
                border-bottom: 1px solid rgba(212, 175, 55, 0.15);
            }
            .logo-text {
                color: #d4af37;
                font-size: 24px;
                font-weight: 800;
                letter-spacing: 5px;
                margin: 0;
                text-transform: uppercase;
                text-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
            }
            .logo-subtitle {
                color: #8a8a93;
                font-size: 11px;
                letter-spacing: 3px;
                text-transform: uppercase;
                margin-top: 5px;
                display: block;
            }
            .content {
                padding: 45px 35px;
            }
            .content h2 {
                color: #ffffff;
                font-size: 22px;
                font-weight: 600;
                margin-top: 0;
                margin-bottom: 20px;
                letter-spacing: 1px;
            }
            .content p {
                color: #a1a1aa;
                font-size: 15px;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .btn-container {
                text-align: center;
                margin: 35px 0;
            }
            .btn {
                background: linear-gradient(135deg, #d4af37, #b59410);
                color: #000000 !important;
                text-decoration: none;
                padding: 16px 40px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 14px;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                display: inline-block;
                box-shadow: 0 4px 15px rgba(212, 175, 55, 0.25);
                transition: all 0.3s ease;
            }
            .url-label {
                color: #71717a;
                font-size: 12px;
                margin-top: 30px;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .url-text {
                word-break: break-all;
                color: #d4af37;
                font-size: 13px;
                background-color: rgba(212, 175, 55, 0.04);
                border: 1px solid rgba(212, 175, 55, 0.1);
                border-radius: 6px;
                padding: 12px;
                margin: 0;
            }
            .warning {
                font-size: 12px;
                color: #71717a;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                padding-top: 25px;
                margin-top: 35px;
                line-height: 1.5;
            }
            .footer {
                background-color: #0c0c0e;
                padding: 25px 20px;
                text-align: center;
                font-size: 11px;
                color: #52525b;
                border-top: 1px solid rgba(212, 175, 55, 0.1);
                letter-spacing: 1px;
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo-text">APEX SHOWROOM</div>
                    <div class="logo-subtitle">Exotic & Premium Automobiles</div>
                </div>
                <div class="content">
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset the password for your Apex Showroom administrator account. Click the secure link below to proceed with setting up a new password:</p>
                    <div class="btn-container">
                        <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
                    </div>
                    
                    <div class="url-label">Plain Reset Link:</div>
                    <p class="url-text">${resetUrl}</p>
                    
                    <p class="warning">
                        This reset link is valid for <strong>15 minutes</strong> for security reasons and is single-use. If you did not request this change, you can safely ignore this email; your current credentials remain secure.
                    </p>
                </div>
                <div class="footer">
                    &copy; 2026 APEX LUXURY SHOWROOM &bull; SECURE CONTROL SYSTEM
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    const emailText = `APEX LUXURY SHOWROOM - PASSWORD RESET REQUEST\n\n` +
        `We received a request to reset the password for your Apex Showroom administrator account.\n\n` +
        `Please click the link below to reset your password (valid for 15 minutes):\n` +
        `${resetUrl}\n\n` +
        `If you didn't request this, ignore this email.`;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        console.log("SMTP configuration is missing in .env");

        // Fallback/Local Logging (Only when SMTP config is missing)
        const logHeader = `=======================================================================\n` +
            `[${new Date().toISOString()}] EMAIL SENT TO: ${toEmail}\n` +
            `SUBJECT: ${emailSubject}\n` +
            `=======================================================================\n`;
        const logContent = `${logHeader}${emailText}\n\n[HTML version of email is available]\n=======================================================================\n\n`;

        try {
            fs.appendFileSync(logFilePath, logContent, "utf-8");
            console.log(`\n📧 [DEV MODE] Reset link logged to local debug file.`);
            console.log(`🔗 Link: ${resetUrl}`);
            console.log(`📁 Log saved at: ${logFilePath}\n`);
        } catch (err) {
            console.error("❌ Failed to write local email debug log:", err);
        }
        return true;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort) || 587,
            secure: parseInt(smtpPort) === 465, // True for 465 (SSL), false for other ports (TLS)
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
            tls: {
                rejectUnauthorized: false // Helps prevent SSL handshake issues
            }
        });

        // Verify transporter connection configuration
        await transporter.verify();
        console.log("SMTP Connected Successfully");

        await transporter.sendMail({
            from: process.env.SMTP_FROM || `"${process.env.FROM_NAME || 'Apex Showroom Security'}" <${senderEmail}>`,
            to: toEmail,
            subject: emailSubject,
            text: emailText,
            html: emailHtml,
        });

        console.log("Email sent successfully");
        console.log(`Recipient: ${toEmail}`);
        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Helper to check if SMTP provider credentials are configured in environment variables
 * @returns {boolean}
 */
export const isEmailConfigured = () => {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    return Boolean(host && user && pass);
};

/**
 * Send a Newsletter Campaign email via Nodemailer
 * @param {string} toEmail - Recipient email
 * @param {string} subject - Email subject
 * @param {string} contentHtml - HTML or raw text content of campaign
 * @param {string} [unsubscribeToken] - Unsubscribe token for secure link
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendNewsletterEmail = async (toEmail, subject, contentHtml, unsubscribeToken = "", trackingToken = "") => {
    if (!isEmailConfigured()) {
        return {
            success: false,
            error: "Email provider credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not configured in environment variables."
        };
    }

    const clientUrl = process.env.VITE_CLIENT_URL || process.env.CLIENT_URL || "http://localhost:5173";
    const unsubscribeUrl = unsubscribeToken ? `${clientUrl}/unsubscribe?token=${unsubscribeToken}` : `${clientUrl}/unsubscribe`;

    const apiBaseUrl = (
        process.env.VITE_API_URL || 
        process.env.API_URL || 
        process.env.BACKEND_URL || 
        "http://localhost:5000/api"
    ).replace(/\/+$/, "");

    let processedContent = contentHtml;

    if (trackingToken) {
        // Rewrite clickable links for tracking (excluding unsubscribe and special protocol links)
        processedContent = processedContent.replace(
            /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
            (match, prefix, origUrl, suffix) => {
                if (
                    origUrl.includes("/unsubscribe") ||
                    origUrl.startsWith("mailto:") ||
                    origUrl.startsWith("tel:") ||
                    origUrl.includes("/newsletter/track/")
                ) {
                    return match;
                }
                const clickUrl = `${apiBaseUrl}/newsletter/track/click/${trackingToken}?url=${encodeURIComponent(origUrl)}`;
                return `<a ${prefix}href="${clickUrl}"${suffix}>`;
            }
        );

        // Inject 1x1 transparent open tracking pixel
        const openPixel = `<img src="${apiBaseUrl}/newsletter/track/open/${trackingToken}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;" />`;
        processedContent += openPixel;
    }

    const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <style>
            body { background-color: #08080a; color: #ffffff; font-family: 'Outfit', 'Helvetica', Arial, sans-serif; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #121216; border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 16px; overflow: hidden; padding: 40px 30px; }
            .header { text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.15); padding-bottom: 25px; margin-bottom: 30px; }
            .logo { color: #d4af37; font-size: 22px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; margin: 0; }
            .content { font-size: 15px; line-height: 1.7; color: #e5e5e7; margin-bottom: 40px; }
            .footer { border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; text-align: center; font-size: 12px; color: #71717a; }
            .unsub-link { color: #d4af37; text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="logo">APEX LUXURY AUTOMOBILES</h1>
            </div>
            <div class="content">
                ${processedContent}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Apex Luxury Showroom. All Rights Reserved.</p>
                ${unsubscribeToken ? `<p>If you no longer wish to receive newsletter emails, you can <a href="${unsubscribeUrl}" class="unsub-link" target="_blank">Unsubscribe here</a>.</p>` : ""}
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        // Controlled development/test-only failure simulation for invalid test recipient addresses
        if (
            toEmail &&
            typeof toEmail === "string" &&
            (toEmail.toUpperCase().includes("FAILURE-TEST") || toEmail.toUpperCase().includes("INVALID.EXAMPLE"))
        ) {
            console.warn(`⚠️ [DEV TEST FAILURE] Controlled simulated SMTP delivery failure for recipient: ${toEmail}`);
            throw new Error(`Simulated SMTP delivery failure for recipient ${toEmail} (550 5.1.1 User unknown)`);
        }

        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT || 587;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const fromEmail = process.env.SMTP_FROM || process.env.EMAIL_FROM || `"${process.env.EMAIL_FROM_NAME || 'Apex Luxury Showroom'}" <${smtpUser}>`;

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort),
            secure: parseInt(smtpPort) === 465,
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: false }
        });

        await transporter.sendMail({
            from: fromEmail,
            to: toEmail,
            subject: subject,
            html: fullHtml
        });

        return { success: true };
    } catch (err) {
        console.error(`Failed to send newsletter email to ${toEmail}:`, err);
        return { success: false, error: err.message };
    }
};
