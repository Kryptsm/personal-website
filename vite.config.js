import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

// https://vitejs.dev/config/
export default defineConfig({
	base: "/",
	...(process.env.NODE_ENV === "development"
		? {
				define: {
					global: {},
				},
		  }
		: {}),
	resolve: {
		alias: {
			...(process.env.NODE_ENV !== "development"
				? {
						"./runtimeConfig": "./runtimeConfig.browser", //fix production build
				  }
				: {}),
		},
	},
	plugins: [vue(), svgLoader()],
	server: {
		proxy: {
			"/api/cta-train": {
				target: "https://www.transitchicago.com/api/1.0",
				changeOrigin: true,
				secure: true,
				rewrite: (path) => path.replace(/^\/api\/cta-train/, ""),
			},
			"/api/cta-bus": {
				target: "https://www.ctabustracker.com/bustime/api/v2",
				changeOrigin: true,
				secure: true,
				rewrite: (path) => path.replace(/^\/api\/cta-bus/, ""),
			},
			"/api/cta-alerts": {
				target: "https://www.transitchicago.com/api/1.0",
				changeOrigin: true,
				secure: true,
				rewrite: (path) => path.replace(/^\/api\/cta-alerts/, ""),
			},
		},
	},
	ssr: {
		noExternal: ["chat.js/**"],
	},
	optimizeDeps: {
		exclude: ["js-big-decimal"],
	},
});
