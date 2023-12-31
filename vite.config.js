import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

const http = require("http");
const fs = require("fs");
const httpPort = 80;

http
	.createServer((req, res) => {
		fs.readFile("index.html", "utf-8", (err, content) => {
			if (err) {
				console.log('We cannot open "index.html" file.');
			}

			res.writeHead(200, {
				"Content-Type": "text/html; charset=utf-8",
			});

			res.end(content);
		});
	})
	.listen(httpPort, () => {
		console.log("Server listening on: http://localhost:%s", httpPort);
	});

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
	ssr: {
		noExternal: ["chat.js/**"],
	},
	optimizeDeps: {
		exclude: ["js-big-decimal"],
	},
});
