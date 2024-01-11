<script setup>
import { ref, onMounted, onUnmounted, onUpdated } from "vue";
import * as func from "../functions/functions.js";
import * as graphfunctions from "../functions/graph-functions.js";
import * as userFunctions from "../../../functions/user-functions.js";
import Stars from "../../shared/Stars.vue";

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	BarElement,
	CategoryScale,
	LinearScale,
	ArcElement,
} from "chart.js";

import {
	Pie,
	getDatasetAtEvent,
	getElementAtEvent,
	getElementsAtEvent,
} from "vue-chartjs";

ChartJS.register(
	ArcElement,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

const windowSize = ref(0);

const props = defineProps(["meals", "restaurants"]);
const allMeals = ref([]);
const allRestaurants = ref([]);
const nested = ref(false);

const userInfo = ref();

const restaurantPieData = ref(null);
const mealsPieData = ref(null);
const sidesPieData = ref(null);

const pieOptions = ref({
	responsive: true,
	maintainAspectRatio: true,
});

const currentTimeout = ref(null);

onMounted(() => {
	if (!props.meals && !props.restaurants) fetchValues();
	else nested.value = true;

	windowSize.value = window.innerWidth;
	window.addEventListener("resize", () => {
		windowSize.value = window.innerWidth;
	});
});

onUnmounted(() => {
	window.removeEventListener("resize", () => {
		windowSize.value = window.innerWidth;
	});
});

function fetchValues() {
	//Gets the user we are currently signed in as from the database, then gets that users meals and stores them.
	userFunctions.fetchUser().then((user) => {
		userInfo.value = user;

		//Gets the list of all restaurants visited and stores them
		func.listRestaurants().then((restaurants) => {
			let addedResult = [];
			restaurants.forEach((restaurant) => {
				addedResult = [...addedResult, { ...restaurant, highlighted: false }];
			});
			allRestaurants.value = addedResult;
		});

		func.listUserMeals(user.id).then((meals) => {
			let addedResult = [];
			meals.forEach((meal) => {
				addedResult = [
					...addedResult,
					{ ...meal, modalStatus: false, highlighted: false },
				];
			});

			allMeals.value = addedResult;
		});
	});
}

function getRestaurant(id) {
	let list = nested.value ? props.restaurants : allRestaurants.value;
	if (!list || !list.length) return {};
	return list.find((restaurant) => restaurant.id === id);
}

//Totals each meal that I've eaten based on their core name (Counts the amount of times I've had Pizza)
//Format: [{ name: "Pizza", count: 2 }, { name: "Chicken Wings", count: 6 }]
function totalMeals(items) {
	let itemCounts = [];
	items?.forEach((item) => {
		if (item.coreName) {
			let existingTracker = itemCounts.find(
				(count) => count.name === item.coreName
			);

			if (!existingTracker) {
				itemCounts.push({ name: item.coreName, count: 1 });
			} else if (existingTracker) {
				existingTracker.count++;
			}
		}
	});
	mealsPieData.value = itemCounts;
	return itemCounts;
}

//Totals the amount of times I've been to a specific restaurant, indicated by how many meals are stored within that restaurant
//Format: [{ name: "Goff's", count: 2 }, { name: "Burger House", count: 6 }]
function totalRestaurants(items) {
	let itemCounts = [];
	items?.forEach((item) => {
		itemCounts.push({
			name: item.name,
			count: item.Meals.items.filter((e) => e.isLeftovers !== true).length,
		});
	});
	restaurantPieData.value = itemCounts;
	return itemCounts;
}

//Totals the sides I've eaten throughout the meals passed in.
//Format: [{ name: "Fries", count: 2 }, { name: "None", count: 6 }]
function totalSides(items) {
	let itemCounts = [];
	items?.forEach((item) => {
		if (item.side) {
			let existingTracker = itemCounts.find(
				(count) => count.name === item.side
			);

			if (!existingTracker) {
				itemCounts.push({ name: item.side, count: 1 });
			} else if (existingTracker) {
				existingTracker.count++;
			}
		} else {
			let existingTracker = itemCounts.find((count) => count.name === "None");

			if (!existingTracker) {
				itemCounts.push({ name: "None", count: 1 });
			} else if (existingTracker) {
				existingTracker.count++;
			}
		}
	});
	sidesPieData.value = itemCounts;
	return itemCounts;
}

const onClick = (event, data, ref) => {
	const {
		value: { chart },
	} = ref == 1 ? chartRef1 : ref == 2 ? chartRef2 : chartRef3;

	if (!chart) {
		return;
	}

	elementAtEvent(
		getElementAtEvent(chart, event),
		JSON.parse(JSON.stringify(data))
	);
};

const elementAtEvent = (element, data) => {
	if (!element.length) return;

	const { index } = element[0];

	highlightItem(data[index].name);
};

function highlightItem(query) {
	if (currentTimeout.value) clearTimeout(currentTimeout.value);

	let restaurantList = nested.value ? props.restaurants : allRestaurants.value;
	let mealList = nested.value ? props.meals : allMeals.value;

	restaurantList?.forEach((restaurant) => {
		if (restaurant.name == query) restaurant.highlighted = true;
		else restaurant.highlighted = false;
	});

	mealList?.forEach((meal) => {
		if (
			meal.name == query ||
			meal.side == query ||
			meal.coreName == query ||
			(query == "None" && !meal.side)
		)
			meal.highlighted = true;
		else meal.highlighted = false;
	});

	currentTimeout.value = setTimeout(() => {
		resetHighlights();
	}, 3500);
}

function resetHighlights() {
	let restaurantList = nested.value ? props.restaurants : allRestaurants.value;
	let mealList = nested.value ? props.meals : allMeals.value;

	restaurantList?.forEach((restaurant) => {
		restaurant.highlighted = false;
	});

	mealList?.forEach((meal) => {
		meal.highlighted = false;
	});
}

const chartRef1 = ref(null);
const chartRef2 = ref(null);
const chartRef3 = ref(null);
</script>

<template>
	<section class="statistics">
		<div class="graph">
			<div class="pie-container">
				<p>Restaurants Visited</p>
				<Pie
					ref="chartRef1"
					:data="
						graphfunctions.getPieData(
							totalRestaurants(nested ? props.restaurants : allRestaurants)
						)
					"
					:options="pieOptions"
					@click="onClick($event, restaurantPieData, 1)"
				/>
			</div>
			<div class="pie-container">
				<p>Meals Eaten</p>
				<Pie
					ref="chartRef2"
					:data="
						graphfunctions.getPieData(
							totalMeals(nested ? props.meals : allMeals)
						)
					"
					:options="pieOptions"
					@click="onClick($event, mealsPieData, 2)"
				/>
			</div>
			<div class="pie-container">
				<p>Sides Eaten</p>
				<Pie
					ref="chartRef3"
					:data="
						graphfunctions.getPieData(
							totalSides(nested ? props.meals : allMeals)
						)
					"
					:options="pieOptions"
					@click="onClick($event, sidesPieData, 3)"
				/>
			</div>
		</div>
		<div class="table" v-if="!nested && allMeals?.length">
			<div class="mt-8 flow-root">
				<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div
						class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"
					>
						<div
							class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg"
						>
							<table class="min-w-full divide-y divide-gray-300">
								<thead class="bg-gray-50">
									<tr>
										<th
											scope="col"
											class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
										>
											Name
										</th>
										<th
											scope="col"
											class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
										>
											Restaurant
										</th>
										<th
											scope="col"
											class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
										>
											Date
										</th>
										<th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
											<span class="sr-only">Rating</span>
										</th>
										<!-- <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
											<span class="sr-only">Edit</span>
										</th> -->
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200 bg-white">
									<tr
										v-for="meal in nested ? props.meals : allMeals"
										:key="meal ? meal.id : 0"
										:class="{
											highlighted:
												meal.highlighted ||
												getRestaurant(meal.restaurantID).highlighted,
										}"
									>
										<td
											class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
										>
											{{ meal.name }}
										</td>
										<td
											class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
										>
											{{ getRestaurant(meal.restaurantID).name }}
										</td>
										<td
											class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
										>
											{{ meal.date }}
										</td>
										<td
											class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
										>
											<Stars :rating="meal.rating"></Stars>
										</td>
										<!-- <td
											class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
										>
											<a href="#" class="text-indigo-600 hover:text-indigo-900"
												>Edit<span class="sr-only"
													>, {{ meal.coreName }}</span
												></a
											>
										</td> -->
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style scoped lang="scss">
.statistics {
	margin: 0 10px 80px 10px;
	display: grid;
	.graph-heading {
		width: 95%;
		margin: auto;
	}

	.graph {
		display: flex;
		justify-content: space-around;
		width: 100%;
		margin-top: 20px;

		.pie-container {
			width: 40%;

			p {
				text-align: center;
			}
		}

		@media only screen and (max-width: 900px) {
			display: unset;

			.pie-container {
				width: 95%;
				margin: auto;
				padding-bottom: 15px;
			}
		}
	}

	.table {
		margin-top: 20px;
		justify-self: center;

		.highlighted {
			border: 1px solid lightcoral;
			background-color: rgb(247, 235, 235);
		}
	}
}
</style>
../../../functions/shared-functions.js ../../../functions/user-functions.js
