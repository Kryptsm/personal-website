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
								isLeftovers
								side
								restaurantID
								createdBy
								rating
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
	return restaurants;
}

export async function createRestaurant(name) {
	const result = await client.graphql({
		query: `
			mutation CreateRestaurant {
				createRestaurant(input: {name: "${name}"}) {
					Meals {
						items {
							coreName
							createdBy
							date
							id
							isLeftovers
							name
							restaurantID
							side
							rating
							_version
						}
					}
					id
					name
					_version
				}
			}
		`,
	});

	return result.data.createRestaurant;
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
							createdBy
							rating
							_version
						}
					}
				}`,
	});
	let meals = result.data.listMeals.items;
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
							rating
							_version
						}
					}
				}`,
	});

	let meals = result.data.listMeals.items;
	return meals;
}

export async function createMeal(
	name,
	date,
	restaurantID,
	coreName,
	isLeftovers,
	side,
	createdBy,
	rating
) {
	const result = await client.graphql({
		query: `
			mutation CreateMeal {
				createMeal(
					input: {name: "${name}", date: "${date}", restaurantID: "${restaurantID}", createdBy: "${createdBy}", isLeftovers: ${isLeftovers}, coreName: "${coreName}", 
						side: "${side ?? ""}", rating: ${rating}}
				) {
					coreName
					createdBy
					date
					id
					isLeftovers
					name
					restaurantID
					side
					rating
					_version
				}
			}
		`,
	});

	return result.data.createMeal;
}

export async function getRestaurantRecommendations(restaurants) {
	if (!restaurants || !restaurants.length) return;
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
