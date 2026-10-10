// This file sets up email sending for OTP and other messages.
const dns = require("dns");
const nodemailer = require("nodemailer");

// Use Google DNS servers to resolve hostnames reliably
dns.setServers(["8.8.8.8", "8.8.4.4"]);

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

/**
 * Robust IPv4 DNS resolver function for Nodemailer and net.connect.
 * Uses dns.resolve4 (A records only) to completely prevent IPv6 (ENETUNREACH) on Render containers.
 * Handles both (hostname, callback) and (hostname, options, callback) argument signatures.
 */
const ipv4Lookup = (hostname, options, callback) => {
    const cb = typeof options === "function" ? options : callback;

    dns.resolve4(hostname, (err, addresses) => {
        if (!err && addresses && addresses.length > 0) {
            return cb(null, addresses[0], 4);
        }
        // Fallback: system lookup forcing IPv4 family
        dns.lookup(hostname, { family: 4, all: false }, cb);
    });
};

/**
 * Primary SMTP transport: Gmail direct SSL on Port 465 (IPv4 enforced via dns.resolve4)
 */
const primaryTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    lookup: ipv4Lookup,
    tls: {
        servername: "smtp.gmail.com",
        rejectUnauthorized: true,
    },
    connectionTimeout: 10000, // 10s connection timeout
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
    lookup: ipv4Lookup,
    tls: {
        servername: "smtp.gmail.com",
        rejectUnauthorized: true,
    },
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
            console.error(`[Email Service] All SMTP attempts failed for ${recipient}. Primary: ${primaryError.message} | Fallback: ${fallbackError.message}`);
            throw fallbackError;
        }
    }
}

module.exports = {
    sendMail,
    primaryTransporter,
    fallbackTransporter,
};