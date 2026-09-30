const Groq = require("groq-sdk");

/**
 * Default fallback model for educational AI tasks
 */
const DEFAULT_MODEL = "qwen/qwen3.8-27b";

/**
 * System prompt setting educational tone for NGSkillForge Learning Platform
 */
const DEFAULT_SYSTEM_PROMPT =
    "You are the NGSkillForge AI Tutor, a friendly, accurate, and concise coding educator. " +
    "Explain technical concepts clearly with structured examples, code snippets where helpful, and best practices.";

let groqInstance = null;

/**
 * Verify whether Groq is configured with a valid non-placeholder API key
 */
function isConfigured() {
    const apiKey = process.env.GROQ_API_KEY;
    return Boolean(
        apiKey &&
        apiKey.trim() !== "" &&
        apiKey !== "your_groq_api_key_here" &&
        apiKey !== "your_key_here"
    );
}

/**
 * Lazily initialize and return the Groq SDK client
 */
function getGroqClient() {
    if (!isConfigured()) {
        const err = new Error(
            "GROQ_API_KEY is not configured in backend environment variables. Please add a valid key to .env"
        );
        err.statusCode = 503;
        err.code = "GROQ_KEY_MISSING";
        throw err;
    }

    if (!groqInstance) {
        groqInstance = new Groq({
            apiKey: process.env.GROQ_API_KEY.trim(),
        });
    }

    return groqInstance;
}

/**
 * Get active Groq chat model from environment or fallback
 */
function getActiveModel(overrideModel) {
    if (overrideModel && typeof overrideModel === "string" && overrideModel.trim()) {
        return overrideModel.trim();
    }
    return (process.env.GROQ_MODEL || DEFAULT_MODEL).trim();
}

/**
 * Helper delay function
 */
function waitDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Core chat completion method using Groq API with built-in retry
 *
 * @param {Object} params
 * @param {Array<{role: string, content: string}>} [params.messages] - Array of chat messages
 * @param {string} [params.prompt] - Single user prompt (used if messages not provided)
 * @param {string} [params.systemPrompt] - System instruction prompt
 * @param {string} [params.model] - Model name override
 * @param {number} [params.temperature=0.7] - Sampling temperature (0.0 - 2.0)
 * @param {number} [params.maxTokens=850] - Max tokens to generate (capped at 900 for Groq tier)
 * @returns {Promise<{ text: string, model: string, usage: Object }>}
 */
async function generateChatCompletion({
    messages = [],
    prompt,
    systemPrompt = DEFAULT_SYSTEM_PROMPT,
    model,
    temperature = 0.7,
    maxTokens = 850,
    responseFormat,
} = {}) {
    const client = getGroqClient();
    const selectedModel = getActiveModel(model);

    // Build standard messages array
    const chatMessages = [];

    if (systemPrompt && typeof systemPrompt === "string" && systemPrompt.trim()) {
        chatMessages.push({
            role: "system",
            content: systemPrompt.trim(),
        });
    }

    if (Array.isArray(messages) && messages.length > 0) {
        for (const msg of messages) {
            if (msg && msg.role && msg.content) {
                chatMessages.push({
                    role: msg.role,
                    content: String(msg.content),
                });
            }
        }
    } else if (prompt && typeof prompt === "string" && prompt.trim()) {
        chatMessages.push({
            role: "user",
            content: prompt.trim(),
        });
    } else {
        const err = new Error("No user message or prompt provided for AI completion");
        err.statusCode = 400;
        throw err;
    }

    // Safety limit max_tokens to 850 to respect Groq OTPM rate limits
    const safeMaxTokens = Math.max(1, Math.min(850, Number(maxTokens) || 850));

    const requestPayload = {
        model: selectedModel,
        messages: chatMessages,
        temperature: Math.max(0, Math.min(2, Number(temperature) || 0.7)),
        max_tokens: safeMaxTokens,
    };

    if (responseFormat) {
        requestPayload.response_format = responseFormat;
    }

    // Attempt completion with up to 3 retries for 429 rate limit
    let maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
        attempt++;
        try {
            const completion = await client.chat.completions.create(requestPayload);
            const choice = completion.choices?.[0];
            const textResponse = choice?.message?.content || "";

            return {
                text: textResponse.trim(),
                model: selectedModel,
                finishReason: choice?.finish_reason || "stop",
                usage: completion.usage || {},
            };
        } catch (apiError) {
            const status = apiError.status || apiError.statusCode || 500;

            if (status === 429 && attempt < maxAttempts) {
                const waitSec = attempt * 8; // wait 8s, then 16s
                console.log(`⏳ Groq rate limit hit. Pausing for ${waitSec}s before retry (attempt ${attempt}/${maxAttempts})...`);
                await waitDelay(waitSec * 1000);
                continue;
            }

            // Handle specific Groq API errors gracefully
            let userSafeMessage = "An error occurred while communicating with the AI service.";

            if (status === 401) {
                userSafeMessage = "Invalid or unauthorized Groq API key. Please check your backend configuration.";
            } else if (status === 429) {
                userSafeMessage = "AI rate limit reached. Please wait a moment before trying again.";
            } else if (status === 400) {
                userSafeMessage = apiError.message || "Invalid request sent to AI service.";
            } else if (apiError.code === "ECONNRESET" || apiError.code === "ETIMEDOUT") {
                userSafeMessage = "Connection to AI service timed out. Please try again.";
            }

            const formattedError = new Error(userSafeMessage);
            formattedError.statusCode = status === 401 || status === 429 ? status : 502;
            formattedError.originalError = process.env.NODE_ENV === "development" ? apiError.message : undefined;
            throw formattedError;
        }
    }
}

/**
 * High-level helper to ask a single question and get the text response
 *
 * @param {string} prompt - User question or prompt
 * @param {Object} [options] - Additional options (systemPrompt, model, temperature, maxTokens)
 * @returns {Promise<string>}
 */
async function askAI(prompt, options = {}) {
    const result = await generateChatCompletion({
        prompt,
        ...options,
    });
    return result.text;
}

module.exports = {
    askAI,
    generateChatCompletion,
    isConfigured,
    getActiveModel,
    DEFAULT_MODEL,
    DEFAULT_SYSTEM_PROMPT,
};
