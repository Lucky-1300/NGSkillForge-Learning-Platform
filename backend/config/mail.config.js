// This file sets up email sending for OTP and other messages.
const dns = require("dns");
const https = require("https");
const nodemailer = require("nodemailer");

// Use Google DNS servers to resolve hostnames reliably
dns.setServers(["8.8.8.8", "8.8.4.4"]);

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

/**
 * Dynamically resolves smtp.gmail.com to an IPv4 (A record) address.
 */
async function resolveGmailIPv4() {
    return new Promise((resolve) => {
        let finished = false;
        const timer = setTimeout(() => {
            if (!finished) {
                finished = true;
                console.warn("[Email Service] DNS resolve4 timed out, using fallback address");
                resolve("142.251.2.108");
            }
        }, 3500);

        dns.resolve4("smtp.gmail.com", (err, addresses) => {
            if (!finished) {
                finished = true;
                clearTimeout(timer);
                if (!err && addresses && addresses.length > 0) {
                    return resolve(addresses[Math.floor(Math.random() * addresses.length)]);
                }
                resolve("142.251.2.108");
            }
        });
    });
}

/**
 * Send email via Resend HTTPS REST API (Port 443 - 100% cloud firewall compatible).
 */
function sendViaResend({ to, subject, html, text }) {
    return new Promise((resolve, reject) => {
        const fromAddress = process.env.RESEND_FROM || "NGSkillForge <onboarding@resend.dev>";
        const payload = JSON.stringify({
            from: fromAddress,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            text,
        });

        const req = https.request(
            "https://api.resend.com/emails",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(payload),
                },
            },
            (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    try {
                        const json = JSON.parse(data);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve({ messageId: json.id });
                        } else {
                            reject(new Error(json.message || `Resend API error (${res.statusCode})`));
                        }
                    } catch (e) {
                        reject(new Error(`Failed to parse Resend response: ${data}`));
                    }
                });
            }
        );

        req.on("error", reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error("Resend API request timed out"));
        });
        req.write(payload);
        req.end();
    });
}

/**
 * Send email via Brevo HTTPS REST API (Port 443).
 */
function sendViaBrevo({ to, subject, html, text }) {
    return new Promise((resolve, reject) => {
        const senderEmail = process.env.EMAIL_USER || "luckykumari42774@gmail.com";
        const payload = JSON.stringify({
            sender: { name: "NGSkillForge", email: senderEmail },
            to: [{ email: to }],
            subject,
            htmlContent: html,
            textContent: text,
        });

        const req = https.request(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",
                headers: {
                    "api-key": process.env.BREVO_API_KEY.trim(),
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(payload),
                },
            },
            (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    try {
                        const json = JSON.parse(data);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve({ messageId: json.messageId });
                        } else {
                            reject(new Error(json.message || `Brevo API error (${res.statusCode})`));
                        }
                    } catch (e) {
                        reject(new Error(`Failed to parse Brevo response: ${data}`));
                    }
                });
            }
        );

        req.on("error", reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error("Brevo API request timed out"));
        });
        req.write(payload);
        req.end();
    });
}

/**
 * Create a Nodemailer transporter instance for a specific IPv4 host and port.
 */
function createTransporter(targetHost, port, secure) {
    return nodemailer.createTransport({
        host: targetHost,
        port,
        secure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            servername: "smtp.gmail.com",
            rejectUnauthorized: true,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });
}

/**
 * Safe email masker for diagnostic logs (e.g. 'luckykumari42774@gmail.com' -> 'lu***@gmail.com')
 */
function maskEmail(email) {
    if (!email || typeof email !== "string") return "unknown";
    const parts = email.split("@");
    if (parts.length !== 2) return "***";
    const name = parts[0];
    const domain = parts[1];
    const maskedName = name.length > 2 ? `${name.slice(0, 2)}***` : `${name}***`;
    return `${maskedName}@${domain}`;
}

/**
 * Unified sendMail function supporting Resend (HTTPS 443), Brevo (HTTPS 443), and Nodemailer SMTP fallback.
 *
 * @param {Object} mailOptions - { from, to, subject, text, html }
 * @returns {Promise<Object>} - Delivery result info with messageId
 */
async function sendMail(mailOptions) {
    const recipient = maskEmail(mailOptions.to);

    // 1. Resend HTTPS REST API (Port 443 - Recommended for Render)
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== "") {
        console.log(`[Email Service] Attempting delivery to ${recipient} via Resend HTTPS API (Port 443)...`);
        try {
            const info = await sendViaResend(mailOptions);
            console.log(`[Email Service] Delivered successfully via Resend to ${recipient} (Message ID: ${info.messageId})`);
            return info;
        } catch (resendError) {
            console.error(`[Email Service] Resend API failed: ${resendError.message}`);
            throw resendError;
        }
    }

    // 2. Brevo HTTPS REST API (Port 443)
    if (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.trim() !== "") {
        console.log(`[Email Service] Attempting delivery to ${recipient} via Brevo HTTPS API (Port 443)...`);
        try {
            const info = await sendViaBrevo(mailOptions);
            console.log(`[Email Service] Delivered successfully via Brevo to ${recipient} (Message ID: ${info.messageId})`);
            return info;
        } catch (brevoError) {
            console.error(`[Email Service] Brevo API failed: ${brevoError.message}`);
            throw brevoError;
        }
    }

    // 3. SMTP Transport (Direct IPv4 on Port 465 SSL -> Port 587 STARTTLS)
    const targetIPv4 = await resolveGmailIPv4();
    console.log(`[Email Service] Resolved Gmail SMTP to IPv4: ${targetIPv4}`);

    try {
        console.log(`[Email Service] Attempting delivery to ${recipient} via SMTP Port 465 (SSL / IPv4)...`);
        const primaryTransporter = createTransporter(targetIPv4, 465, true);
        const info = await primaryTransporter.sendMail(mailOptions);
        console.log(`[Email Service] Delivered successfully to ${recipient} (Message ID: ${info.messageId})`);
        return info;
    } catch (primaryError) {
        console.warn(`[Email Service] Port 465 delivery failed (${primaryError.code || primaryError.message}). Retrying via Port 587 (STARTTLS / IPv4)...`);

        try {
            const fallbackTransporter = createTransporter(targetIPv4, 587, false);
            const fallbackInfo = await fallbackTransporter.sendMail(mailOptions);
            console.log(`[Email Service] Delivered successfully via fallback to ${recipient} (Message ID: ${fallbackInfo.messageId})`);
            return fallbackInfo;
        } catch (fallbackError) {
            console.error(`[Email Service] All SMTP attempts failed for ${recipient}. Primary: ${primaryError.message} | Fallback: ${fallbackError.message}`);
            throw fallbackError;
        }
    }
}

module.exports = {
    sendMail,
    resolveGmailIPv4,
    createTransporter,
    sendViaResend,
    sendViaBrevo,
};