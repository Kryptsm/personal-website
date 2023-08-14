import * as queries from "../../graphql/queries";
import { API } from "aws-amplify";

export async function listRestaurants() {
	const result = await API.graphql({
		query: `query ListRestaurants {
					listRestaurants(filter: {_deleted: {ne: true}}) {
						items {
						Meals(filter: {_deleted: {ne: true}}) {
							items {
							date
							id
							name
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
	console.log("Restaurants: ", restaurants);
	return restaurants;
}

export async function listMeals() {
	const result = await API.graphql({
		query: `query ListMeals {
					listMeals(filter: {_deleted: {ne: true}}) {
						items {
						date
						id
						name
						restaurantID
						_version
						}
					}
				}`,
	});
	let meals = result.data.listMeals.items;
	console.log("Meals: ", meals);
	return meals;
}
