// This file sets up email sending for OTP and other messages.
const dns = require("dns");
const nodemailer = require("nodemailer");

// Use Google DNS servers to resolve hostnames reliably
dns.setServers(["8.8.8.8", "8.8.4.4"]);

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

/**
 * Dynamically resolves smtp.gmail.com to an IPv4 (A record) address.
 * Passing a raw IPv4 string to Nodemailer completely bypasses Nodemailer's
 * internal resolve6() and random-address selector, preventing Render ENETUNREACH.
 */
async function resolveGmailIPv4() {
    return new Promise((resolve) => {
        dns.resolve4("smtp.gmail.com", (err, addresses) => {
            if (!err && addresses && addresses.length > 0) {
                // Return a random IPv4 address from the resolved A records list
                return resolve(addresses[Math.floor(Math.random() * addresses.length)]);
            }
            // Fallback: return default hostname if resolve4 encounters an issue
            resolve("smtp.gmail.com");
        });
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
        connectionTimeout: 10000, // 10s connection timeout
        greetingTimeout: 10000,   // 10s greeting timeout
        socketTimeout: 15000,     // 15s socket timeout
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
 * Send email with guaranteed IPv4 host resolution and port 465 (SSL) -> 587 (STARTTLS) failover.
 *
 * @param {Object} mailOptions - Nodemailer mail options ({ from, to, subject, text, html })
 * @returns {Promise<Object>} - Nodemailer send result info
 */
async function sendMail(mailOptions) {
    const recipient = maskEmail(mailOptions.to);
    const targetIPv4 = await resolveGmailIPv4();

    console.log(`[Email Service] Resolved Gmail SMTP to IPv4: ${targetIPv4}`);

    // 1. Attempt delivery via Port 465 (Direct SSL)
    try {
        console.log(`[Email Service] Attempting delivery to ${recipient} via Port 465 (SSL / IPv4)...`);
        const primaryTransporter = createTransporter(targetIPv4, 465, true);
        const info = await primaryTransporter.sendMail(mailOptions);
        console.log(`[Email Service] Delivered successfully to ${recipient} (Message ID: ${info.messageId})`);
        return info;
    } catch (primaryError) {
        console.warn(`[Email Service] Port 465 delivery failed (${primaryError.code || primaryError.message}). Retrying via Port 587 (STARTTLS / IPv4)...`);

        // 2. Fallback attempt via Port 587 (STARTTLS)
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
};