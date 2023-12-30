import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Personal from "./pages/personal/Personal.vue";
import FlowerGame from "./pages/flower-game/FlowerGame.vue";
import MazeSolver from "./pages/maze-solver/MazeSolver.vue";
import FoodTracker from "./pages/food-tracker/FoodTracker.vue";
import { createRouter, createWebHistory } from "vue-router";

// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

import {
	SecretsManagerClient,
	GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import { Amplify, API, graphqlOperation } from "aws-amplify";
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
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

const secret_name = "openai-api-key";

const client = new SecretsManagerClient({
	region: "us-east-2",
});

let response;

try {
	response = await client.send(
		new GetSecretValueCommand({
			SecretId: secret_name,
			VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
		})
	);
} catch (error) {
	// For a list of exceptions thrown, see
	// https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
	throw error;
}

const secret = response.SecretString;
console.log(secret);

// Your code goes here

const app = createApp(App);
app.use(router);
app.use(vuetify);

app.mount("#app");
