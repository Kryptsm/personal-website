const CTA_TRAIN_API_KEY = import.meta.env.VITE_CTA_TRAIN_API_KEY;
const CTA_BUS_API_KEY = import.meta.env.VITE_CTA_BUS_API_KEY;

// In development, requests go through Vite proxy. In production, through serverless proxy.
const TRAIN_BASE = import.meta.env.DEV ? "/api/cta-train" : "/api/cta-train";
const BUS_BASE = import.meta.env.DEV ? "/api/cta-bus" : "/api/cta-bus";
const ALERTS_BASE = import.meta.env.DEV ? "/api/cta-alerts" : "/api/cta-alerts";

/**
 * Fetch train arrival predictions for a station (by mapid) or platform (by stpid).
 * @param {Object} params - { mapid, stpid, rt, max }
 * @returns {Promise<Array>} Array of arrival prediction objects
 */
export async function getTrainArrivals({ mapid, stpid, rt, max = 5 }) {
	const params = new URLSearchParams({
		key: CTA_TRAIN_API_KEY,
		outputType: "JSON",
		max: String(max),
	});
	if (mapid) params.set("mapid", mapid);
	if (stpid) params.set("stpid", stpid);
	if (rt) params.set("rt", rt);

	const res = await fetch(`${TRAIN_BASE}/ttarrivals.aspx?${params}`);
	const data = await res.json();
	return data?.ctatt?.eta || [];
}

/**
 * Fetch bus arrival predictions for a stop.
 * @param {Object} params - { stpid, rt, top }
 * @returns {Promise<Array>} Array of bus prediction objects
 */
export async function getBusPredictions({ stpid, rt, top = 5 }) {
	const params = new URLSearchParams({
		key: CTA_BUS_API_KEY,
		format: "json",
		top: String(top),
	});
	if (stpid) params.set("stpid", stpid);
	if (rt) params.set("rt", rt);

	const res = await fetch(`${BUS_BASE}/getpredictions?${params}`);
	const data = await res.json();
	return data?.["bustime-response"]?.prd || [];
}

/**
 * Fetch CTA service alerts.
 * @param {Object} params - { routeid, stationid }
 * @returns {Promise<Array>} Array of alert objects
 */
export async function getAlerts({ routeid, stationid } = {}) {
	const params = new URLSearchParams({
		outputType: "JSON",
		accessibility: "false",
	});
	if (routeid) params.set("routeid", routeid);
	if (stationid) params.set("stationid", stationid);

	const res = await fetch(`${ALERTS_BASE}/alerts.aspx?${params}`);
	const data = await res.json();
	return data?.CTAAlerts?.Alert || [];
}

/**
 * CTA L line colors/identifiers
 */
export const CTA_LINES = {
	Red: { code: "Red", color: "#c60c30" },
	Blue: { code: "Blue", color: "#00a1de" },
	Brn: { code: "Brn", color: "#62361b" },
	Green: { code: "G", color: "#009b3a" },
	Orange: { code: "Org", color: "#f9461c" },
	Purple: { code: "P", color: "#522398" },
	Pink: { code: "Pink", color: "#e27ea6" },
	Yellow: { code: "Y", color: "#f9e300" },
};

/**
 * Format an arrival time string from CTA API to minutes from now.
 * CTA provides times in ISO-like format: "2026-05-03T14:32:00"
 */
export function minutesUntilArrival(arrivalTime) {
	if (!arrivalTime) return null;
	const arrival = new Date(arrivalTime);
	const now = new Date();
	const diffMs = arrival - now;
	return Math.max(0, Math.round(diffMs / 60000));
}
