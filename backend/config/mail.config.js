// This file sets up email sending for OTP and other messages.
const dns = require("dns");
const nodemailer = require("nodemailer");

// Ensure Node.js prioritizes IPv4 resolution across all network operations
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

/**
 * Custom DNS lookup enforcing IPv4 to prevent ENETUNREACH errors on cloud container hosts
 */
const ipv4Lookup = (hostname, options, callback) => {
    return dns.lookup(hostname, Object.assign({}, options, { family: 4, all: false }), callback);
};

/**
 * Primary SMTP transport: Gmail direct SSL on Port 465 (IPv4 enforced)
 */
const primaryTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    family: 4,
    lookup: ipv4Lookup,
    connectionTimeout: 10000, // 10s timeout
    greetingTimeout: 10000,   // 10s greeting timeout
    socketTimeout: 15000,     // 15s socket timeout
});

/**
 * Secondary SMTP transport: Gmail STARTTLS on Port 587 (IPv4 enforced fallback)
 */
const fallbackTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    family: 4,
    lookup: ipv4Lookup,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

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
 * Send email with automatic IPv4 enforcement and port 465 -> 587 failover
 *
 * @param {Object} mailOptions - Nodemailer mail options ({ from, to, subject, text, html })
 * @returns {Promise<Object>} - Nodemailer send result info
 */
async function sendMail(mailOptions) {
    const recipient = maskEmail(mailOptions.to);

    try {
        console.log(`[Email Service] Attempting delivery to ${recipient} via Port 465 (SSL / IPv4)...`);
        const info = await primaryTransporter.sendMail(mailOptions);
        console.log(`[Email Service] Delivered successfully to ${recipient} (Message ID: ${info.messageId})`);
        return info;
    } catch (primaryError) {
        console.warn(`[Email Service] Port 465 delivery failed (${primaryError.code || primaryError.message}). Retrying via Port 587 (STARTTLS / IPv4)...`);
        
        try {
            const fallbackInfo = await fallbackTransporter.sendMail(mailOptions);
            console.log(`[Email Service] Delivered successfully via fallback to ${recipient} (Message ID: ${fallbackInfo.messageId})`);
            return fallbackInfo;
        } catch (fallbackError) {
            console.error(`[Email Service] All SMTP attempts failed for ${recipient}. Primary error: ${primaryError.message} | Fallback error: ${fallbackError.message}`);
            throw fallbackError;
        }
    }
}

module.exports = {
    sendMail,
    primaryTransporter,
    fallbackTransporter,
};