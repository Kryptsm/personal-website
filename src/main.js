import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Personal from "./pages/personal/Personal.vue";
import FlowerGame from "./pages/flower-game/FlowerGame.vue";
import MazeSolver from "./pages/maze-solver/MazeSolver.vue";
import FoodTracker from "./pages/food-tracker/FoodTracker.vue";
import Statistics from "./pages/food-tracker/components/Statistics.vue";
import { createRouter, createWebHistory } from "vue-router";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);

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
	{
		path: "/food-tracker",
		name: "food-tracker",
		component: FoodTracker,
	},
	{
		path: "/food-tracker/statistics",
		name: "food-tracker/statistics",
		component: Statistics,
	},
	{
		path: "/:pathMatch(.*)*",
		redirect: "/",
	},
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

const app = createApp(App);
app.use(router);
app.use(vuetify);

app.mount("#app");
