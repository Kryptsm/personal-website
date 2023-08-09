import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Personal from "./components/personal/Personal.vue";
import FlowerGame from "./components/flower-game/FlowerGame.vue";
import MazeSolver from "./components/maze-solver/MazeSolver.vue";
import { createRouter, createWebHistory } from "vue-router";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
	components,
	directives,
});

const routes = [
	{
		path: "/",
		name: "personal",
		component: Personal,
	},
	{
		path: "/flower-game",
		name: "flower-game",
		component: FlowerGame,
	},
	{
		path: "/maze-solver",
		name: "maze-solver",
		component: MazeSolver,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

const app = createApp(App);
app.use(router);
app.use(vuetify);

app.mount("#app");
