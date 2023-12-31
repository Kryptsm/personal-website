import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

// https://vitejs.dev/config/
export default defineConfig({
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
	ssr: {
		noExternal: ["chat.js/**"],
	},
	optimizeDeps: {
		exclude: ["js-big-decimal"],
	},
});
