const https = require("https");

/**
 * Clean and format video title
 */
function cleanTitle(rawTitle) {
    if (!rawTitle) return "";
    return rawTitle
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

/**
 * Parse ISO 8601 duration (e.g. PT1H8M34S, PT49M2S) from YouTube Data API
 */
function parseISO8601Duration(durationStr) {
    if (!durationStr) return "";
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = durationStr.match(regex);
    if (!matches) return "";
    const hours = parseInt(matches[1] || 0, 10);
    const minutes = parseInt(matches[2] || 0, 10);
    const seconds = parseInt(matches[3] || 0, 10);

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Fetch HTML content from URL with redirect support
 */
function fetchHtml(url, maxRedirects = 3) {
    return new Promise((resolve, reject) => {
        const req = https.get(
            url,
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept-Language": "en-US,en;q=0.9",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Cookie": "CONSENT=YES+cb.20210328-17-p0.en+FX+478;",
                },
            },
            (res) => {
                if (
                    res.statusCode >= 300 &&
                    res.statusCode < 400 &&
                    res.headers.location &&
                    maxRedirects > 0
                ) {
                    const nextUrl = res.headers.location.startsWith("http")
                        ? res.headers.location
                        : `https://www.youtube.com${res.headers.location}`;
                    return resolve(fetchHtml(nextUrl, maxRedirects - 1));
                }

                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => resolve(data));
            }
        );
        req.on("error", reject);
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error("Timeout fetching YouTube page"));
        });
    });
}

/**
 * Extract ytInitialData JSON from HTML
 */
function parseYtInitialData(html) {
    if (!html) return null;
    const patterns = [
        "var ytInitialData =",
        "window[\"ytInitialData\"] =",
        "ytInitialData =",
    ];

    let start = -1;
    for (const pat of patterns) {
        const idx = html.indexOf(pat);
        if (idx !== -1) {
            start = html.indexOf("{", idx + pat.length - 1);
            if (start !== -1) break;
        }
    }

    if (start === -1) return null;

    let depth = 0;
    let end = start;
    for (let i = start; i < html.length; i++) {
        if (html[i] === "{") depth++;
        else if (html[i] === "}") {
            depth--;
            if (depth === 0) {
                end = i;
                break;
            }
        }
    }
    try {
        return JSON.parse(html.substring(start, end + 1));
    } catch {
        return null;
    }
}

/**
 * Extract videos and continuation tokens from any Innertube node
 */
function extractFromInnertubeNode(node, playlistId, existingVideos = []) {
    const foundTokens = [];

    function scan(curr) {
        if (!curr || typeof curr !== "object") return;

        // Modern YouTube lockupViewModel
        if (curr.lockupViewModel) {
            const vm = curr.lockupViewModel;
            const videoId = vm.contentId || "";
            const isVideo =
                vm.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" ||
                (!vm.contentType &&
                    videoId.length === 11 &&
                    !videoId.startsWith("PL") &&
                    !videoId.startsWith("RD") &&
                    !videoId.startsWith("VL"));

            if (isVideo && videoId.length === 11 && !videoId.startsWith("PL")) {
                const rawTitle = vm.metadata?.lockupMetadataViewModel?.title?.content || "";
                const title = cleanTitle(rawTitle);

                const thumbSources = vm.contentImage?.thumbnailViewModel?.image?.sources || [];
                const thumbnailUrl =
                    thumbSources.slice(-1)?.[0]?.url ||
                    (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "");

                let duration = "";
                const overlays = vm.contentImage?.thumbnailViewModel?.overlays || [];
                for (const ov of overlays) {
                    const badge =
                        ov.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel;
                    if (badge && badge.text) {
                        duration = badge.text;
                        break;
                    }
                    const timeStatus =
                        ov.thumbnailOverlayTimeStatusRenderer?.text?.simpleText ||
                        ov.thumbnailOverlayTimeStatusRenderer?.text?.runs?.[0]?.text;
                    if (timeStatus) {
                        duration = timeStatus;
                        break;
                    }
                }

                if (
                    videoId &&
                    title &&
                    !existingVideos.some((v) => v.youtubeVideoId === videoId)
                ) {
                    existingVideos.push({
                        lectureNumber: existingVideos.length + 1,
                        title,
                        youtubeVideoId: videoId,
                        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
                        thumbnailUrl,
                        duration: duration || "Video Lecture",
                        playlistId,
                    });
                }
            }
        }

        // Classic YouTube playlistVideoRenderer
        if (curr.playlistVideoRenderer) {
            const p = curr.playlistVideoRenderer;
            const videoId = p.videoId;
            const rawTitle =
                p.title?.runs?.map((x) => x.text).join("") || p.title?.simpleText || "";
            const title = cleanTitle(rawTitle);
            const duration =
                p.lengthText?.simpleText ||
                p.lengthText?.runs?.map((x) => x.text).join("") ||
                "";
            const thumbSources = p.thumbnail?.thumbnails || [];
            const thumbnailUrl =
                thumbSources.slice(-1)?.[0]?.url ||
                (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "");

            if (
                videoId &&
                title &&
                !existingVideos.some((v) => v.youtubeVideoId === videoId)
            ) {
                existingVideos.push({
                    lectureNumber: existingVideos.length + 1,
                    title,
                    youtubeVideoId: videoId,
                    youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
                    thumbnailUrl,
                    duration: duration || "Video Lecture",
                    playlistId,
                });
            }
        }

        // Extract continuation token
        if (
            curr.token &&
            typeof curr.token === "string" &&
            curr.token.length > 20 &&
            !curr.token.includes("comment")
        ) {
            if (!foundTokens.includes(curr.token)) {
                foundTokens.push(curr.token);
            }
        }

        for (const key of Object.keys(curr)) {
            scan(curr[key]);
        }
    }

    scan(node);
    return { videos: existingVideos, tokens: foundTokens };
}

/**
 * Fetch continuation items via YouTube Innertube Browse POST
 */
function fetchInnertubeContinuation(token) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            context: {
                client: {
                    clientName: "WEB",
                    clientVersion: "2.20260925.08.00",
                },
            },
            continuation: token,
        });

        const req = https.request(
            "https://www.youtube.com/youtubei/v1/browse?prettyPrint=false",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(postData),
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                },
            },
            (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            }
        );

        req.on("error", reject);
        req.setTimeout(12000, () => {
            req.destroy();
            reject(new Error("Timeout in continuation fetch"));
        });
        req.write(postData);
        req.end();
    });
}

/**
 * Fetch complete playlist via web scraper with full queue-based pagination
 */
async function fetchPlaylistViaWeb(playlistId) {
    const html = await fetchHtml(
        `https://www.youtube.com/playlist?list=${playlistId}`
    );
    const ytData = parseYtInitialData(html);
    if (!ytData) {
        throw new Error("Unable to parse YouTube page initial data");
    }

    let allVideos = [];
    const initial = extractFromInnertubeNode(ytData, playlistId, allVideos);
    allVideos = initial.videos;

    const visitedTokens = new Set();
    const queue = [...initial.tokens];

    // Follow all continuation tokens until all pages are retrieved
    while (queue.length > 0) {
        const nextTok = queue.shift();
        if (visitedTokens.has(nextTok)) continue;
        visitedTokens.add(nextTok);

        try {
            const contData = await fetchInnertubeContinuation(nextTok);
            const res = extractFromInnertubeNode(contData, playlistId, allVideos);
            allVideos = res.videos;
            for (const t of res.tokens) {
                if (!visitedTokens.has(t)) queue.push(t);
            }
        } catch (contError) {
            console.warn("Continuation fetch error:", contError.message);
        }
    }

    // Re-index lecture numbers sequentially 1..N
    return allVideos.map((v, i) => ({
        ...v,
        lectureNumber: i + 1,
    }));
}

/**
 * Fetch playlist using YouTube Data API v3 with full pagination (nextPageToken)
 */
async function fetchPlaylistViaApi(playlistId, apiKey) {
    const fetchPage = (pageToken = "") => {
        return new Promise((resolve, reject) => {
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}${
                pageToken ? `&pageToken=${pageToken}` : ""
            }&key=${apiKey}`;

            https.get(url, (res) => {
                let body = "";
                res.on("data", (chunk) => (body += chunk));
                res.on("end", () => {
                    try {
                        const parsed = JSON.parse(body);
                        if (parsed.error) {
                            return reject(
                                new Error(parsed.error.message || "YouTube API error")
                            );
                        }
                        resolve(parsed);
                    } catch (err) {
                        reject(err);
                    }
                });
            }).on("error", reject);
        });
    };

    let allItems = [];
    let pageToken = "";
    do {
        const res = await fetchPage(pageToken);
        if (res.items && res.items.length) {
            allItems = allItems.concat(res.items);
        }
        pageToken = res.nextPageToken || "";
    } while (pageToken);

    // Fetch video durations in batches of 50
    const videoIds = allItems
        .map((item) => item.contentDetails?.videoId || item.snippet?.resourceId?.videoId)
        .filter(Boolean);

    const durationMap = {};
    for (let i = 0; i < videoIds.length; i += 50) {
        const batchIds = videoIds.slice(i, i + 50).join(",");
        await new Promise((resolve) => {
            https.get(
                `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batchIds}&key=${apiKey}`,
                (res) => {
                    let body = "";
                    res.on("data", (chunk) => (body += chunk));
                    res.on("end", () => {
                        try {
                            const parsed = JSON.parse(body);
                            (parsed.items || []).forEach((v) => {
                                durationMap[v.id] = parseISO8601Duration(
                                    v.contentDetails?.duration
                                );
                            });
                        } catch {
                            // ignore
                        }
                        resolve();
                    });
                }
            ).on("error", () => resolve());
        });
    }

    return allItems.map((item, index) => {
        const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
        const title = cleanTitle(item.snippet?.title);
        const thumbnailUrl =
            item.snippet?.thumbnails?.maxres?.url ||
            item.snippet?.thumbnails?.standard?.url ||
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        return {
            lectureNumber: index + 1,
            title,
            youtubeVideoId: videoId,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnailUrl,
            duration: durationMap[videoId] || "Video Lecture",
            playlistId,
        };
    });
}

/**
 * Primary function to fetch YouTube playlist video metadata
 */
async function fetchPlaylistVideos(playlistId) {
    if (!playlistId) {
        throw new Error("Playlist ID is required");
    }

    // 1. If YouTube Data API key is provided, use official API with pagination
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
        try {
            return await fetchPlaylistViaApi(playlistId, apiKey);
        } catch (apiError) {
            console.warn(
                `YouTube Data API failed (${apiError.message}), falling back to web scraper...`
            );
        }
    }

    // 2. Full web playlist extractor with continuation pagination
    return await fetchPlaylistViaWeb(playlistId);
}

module.exports = {
    fetchPlaylistVideos,
};
