// This file handles email delivery using Resend HTTP API (primary for Render) and Nodemailer (local fallback).
const { Resend } = require("resend");
const nodemailer = require("nodemailer");

/**
 * Mask an email for secure diagnostic logging (e.g. 'lucky@example.com' -> 'lu***@example.com')
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
 * Lazily initialize and return Resend client instance
 */
function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : "";
    if (!apiKey) return null;
    return new Resend(apiKey);
}

/**
 * Get verified sender email address from environment
 */
function getSenderAddress() {
    return (
        process.env.RESEND_FROM ||
        process.env.EMAIL_FROM ||
        (process.env.EMAIL_USER ? `"NGSkillForge" <${process.env.EMAIL_USER}>` : "NGSkillForge <onboarding@resend.dev>")
    );
}

/**
 * Send email using the official Resend HTTP API SDK (Port 443)
 */
async function sendViaResendSdk({ to, subject, html, text }) {
    const resend = getResendClient();
    if (!resend) {
        throw new Error("RESEND_API_KEY is not configured in environment variables.");
    }

    const from = getSenderAddress();
    const recipient = Array.isArray(to) ? to : [to];

    const { data, error } = await resend.emails.send({
        from,
        to: recipient,
        subject,
        html,
        text,
    });

    if (error) {
        const errorMsg = error.message || (typeof error === "object" ? JSON.stringify(error) : String(error));
        const err = new Error(`Resend API Error: ${errorMsg}`);
        err.code = "RESEND_ERROR";
        err.statusCode = error.statusCode || 400;
        throw err;
    }

    return {
        messageId: data?.id || "resend-" + Date.now(),
        provider: "resend",
    };
}

/**
 * Send email using Nodemailer SMTP (Local development fallback)
 */
async function sendViaSmtp({ to, subject, html, text }) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("SMTP credentials (EMAIL_USER / EMAIL_PASS) are not configured.");
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });

    const from = process.env.EMAIL_USER;
    const info = await transporter.sendMail({
        from: `"NGSkillForge" <${from}>`,
        to,
        subject,
        html,
        text,
    });

    return {
        messageId: info.messageId,
        provider: "smtp",
    };
}

/**
 * Unified email sending function
 *
 * @param {Object} mailOptions - { to, subject, html, text }
 * @returns {Promise<Object>} - { messageId, provider }
 */
async function sendMail(mailOptions) {
    const masked = maskEmail(mailOptions.to);

    // 1. Primary: Resend HTTP API (Port 443 — Bypasses Render blocked SMTP ports)
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== "") {
        console.log(`[Email Service] Sending email to ${masked} via Resend HTTP API (Port 443)...`);
        try {
            const result = await sendViaResendSdk(mailOptions);
            console.log(`[Email Service] Delivered successfully via Resend to ${masked} (ID: ${result.messageId})`);
            return result;
        } catch (resendErr) {
            console.error(`[Email Service] Resend delivery failed for ${masked}:`, resendErr.message);
            throw resendErr;
        }
    }

    // 2. Fallback: SMTP (Local Development)
    console.log(`[Email Service] RESEND_API_KEY not found. Attempting Nodemailer SMTP for ${masked}...`);
    try {
        const result = await sendViaSmtp(mailOptions);
        console.log(`[Email Service] Delivered successfully via SMTP to ${masked} (Message ID: ${result.messageId})`);
        return result;
    } catch (smtpErr) {
        console.error(`[Email Service] SMTP delivery failed for ${masked}:`, smtpErr.code || smtpErr.message);
        throw smtpErr;
    }
}

module.exports = {
    sendMail,
    sendViaResendSdk,
    sendViaSmtp,
    getSenderAddress,
    maskEmail,
};