import { generateClient } from "aws-amplify/api";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
const client = generateClient();

import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: import.meta.env.VITE_OPENAI_API_KEY, // This is the default and can be omitted
	dangerouslyAllowBrowser: true,
});

export async function listRestaurants() {
	const result = await client.graphql({
		query: `query ListRestaurants {
					listRestaurants(filter: {_deleted: {ne: true}}) {
						items {
						Meals(filter: {_deleted: {ne: true}}) {
							items {
							date
							id
							name
							coreName
							side
							isLeftovers
							restaurantID
							_version
							}
						}
						id
						name
						_version
						}
					}
				}`,
	});
	let restaurants = result.data.listRestaurants.items;
	console.log("listRestaurants: ", restaurants);
	return restaurants;
}

export async function listMeals() {
	const result = await client.graphql({
		query: `query ListMeals {
					listMeals(filter: {_deleted: {ne: true}}) {
						items {
							date
							id
							name
							coreName
							isLeftovers
							side
							restaurantID
							_version
							createdBy
						}
					}
				}`,
	});
	let meals = result.data.listMeals.items;
	console.log("listMeals: ", meals);
	return meals;
}

export async function listUserMeals(username) {
	const result = await client.graphql({
		query: `query ListUserMeals {
					listMeals(filter: {_deleted: {ne: true}, createdBy: {eq: "${username}"}}) {
						items {
						coreName
						createdBy
						date
						id
						isLeftovers
						name
						restaurantID
						side
						}
					}
				}`,
	});

	let meals = result.data.listMeals.items;
	console.log("listUserMeals: ", meals);
	return meals;
}

export async function createMeal(
	name,
	date,
	restaurantID,
	coreName,
	isLeftovers,
	side
) {
	const result = await client.graphql({
		query: `
			mutation MyMutation {
  				createMeal(
    				input: {name: ${name}, date: ${date}, restaurantID: ${restaurantID}, coreName: ${coreName}, isLeftovers: ${isLeftovers}, side: ${side}}
  			) {
    			coreName
				date
				isLeftovers
				name
				restaurantID
				side
			}
			}
		`,
	});
}

export async function getRestaurantRecommendations(restaurants) {
	if (!restaurants || !restaurants.length) return;
	console.log(restaurants);
	let compiledList = "";

	restaurants.forEach((restaurant) => {
		compiledList += restaurant.name + " + ";
	});

	compiledList = compiledList.slice(0, -3);

	const chatCompletion = await openai.chat.completions.create({
		messages: [
			{
				role: "user",
				content: `I've gone to restaurants ${compiledList} in Dallas. Recommend other options I might like. Keep answer short (name and link) and numbered 1-5, no fast food unless its most relevant.`,
			},
		],
		model: "gpt-3.5-turbo",
	});

	let result = chatCompletion?.choices[0].message.content;

	const itemList = result.trim().split("\n");

	const objectList = itemList.map((item) => {
		// Extracting the position, name, and link from each item
		const [position, rest] = item.split(". ");
		const [name, link] = rest.split(" - ");

		// Creating an object with name and link properties
		return { name, link };
	});

	return objectList;
}
