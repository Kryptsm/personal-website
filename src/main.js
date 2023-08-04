import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Personal from "./components/personal/Personal.vue";
import FlowerGame from "./components/flower-game/FlowerGame.vue";
import { createRouter, createWebHistory } from "vue-router";

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
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

const app = createApp(App);
app.use(router);

app.mount("#app");
