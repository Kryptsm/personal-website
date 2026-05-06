/**
 * Lightweight serverless proxy for CTA APIs in production.
 * Deploy as an AWS Lambda / Amplify function, Vercel serverless function,
 * or Netlify function. This avoids CORS issues from browsers.
 *
 * Environment variables required:
 *   CTA_TRAIN_API_KEY
 *   CTA_BUS_API_KEY
 */

const CTA_ENDPOINTS = {
	"cta-train": "https://www.transitchicago.com/api/1.0",
	"cta-bus": "https://www.ctabustracker.com/bustime/api/v2",
	"cta-alerts": "https://www.transitchicago.com/api/1.0",
};

export async function handler(event) {
	const path = event.path || event.rawPath || "";
	const queryString = event.queryStringParameters || {};

	// Determine which CTA API to proxy
	let targetBase = null;
	let apiPath = "";

	for (const [prefix, base] of Object.entries(CTA_ENDPOINTS)) {
		const match = path.match(new RegExp(`/api/${prefix}(.*)`));
		if (match) {
			targetBase = base;
			apiPath = match[1] || "";
			break;
		}
	}

	if (!targetBase) {
		return {
			statusCode: 404,
			body: JSON.stringify({ error: "Unknown API route" }),
		};
	}

	// Inject the appropriate API key server-side
	if (path.includes("cta-train")) {
		queryString.key = process.env.CTA_TRAIN_API_KEY;
	} else if (path.includes("cta-bus")) {
		queryString.key = process.env.CTA_BUS_API_KEY;
	}

	const params = new URLSearchParams(queryString).toString();
	const targetUrl = `${targetBase}${apiPath}${params ? "?" + params : ""}`;

	try {
		const response = await fetch(targetUrl);
		const body = await response.text();

		return {
			statusCode: response.status,
			headers: {
				"Content-Type":
					response.headers.get("content-type") || "application/json",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, OPTIONS",
				"Cache-Control": "public, max-age=15",
			},
			body,
		};
	} catch (err) {
		return {
			statusCode: 502,
			body: JSON.stringify({ error: "Failed to reach CTA API" }),
		};
	}
}
