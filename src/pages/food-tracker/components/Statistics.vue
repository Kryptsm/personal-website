<script setup>
import { ref, onMounted, onUnmounted, onUpdated } from "vue";
import * as func from "../functions/functions.js";
import * as graphfunctions from "../functions/graph-functions.js";
import * as sharedfunc from "../../shared/shared-functions";

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
	sharedfunc.fetchUser().then((user) => {
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

	props.restaurants?.forEach((restaurant) => {
		if (restaurant.name == query) restaurant.highlighted = true;
		else restaurant.highlighted = false;
	});

	props.meals?.forEach((meal) => {
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
	props.restaurants?.forEach((restaurant) => {
		restaurant.highlighted = false;
	});

	props.meals?.forEach((meal) => {
		meal.highlighted = false;
	});
}

const chartRef1 = ref(null);
const chartRef2 = ref(null);
const chartRef3 = ref(null);
</script>

<template>
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
				@click="nested ? onClick($event, restaurantPieData, 1) : () => {}"
			/>
		</div>
		<div class="pie-container">
			<p>Meals Eaten</p>
			<Pie
				ref="chartRef2"
				:data="
					graphfunctions.getPieData(totalMeals(nested ? props.meals : allMeals))
				"
				:options="pieOptions"
				@click="nested ? onClick($event, mealsPieData, 2) : () => {}"
			/>
		</div>
		<div class="pie-container">
			<p>Sides Eaten</p>
			<Pie
				ref="chartRef3"
				:data="
					graphfunctions.getPieData(totalSides(nested ? props.meals : allMeals))
				"
				:options="pieOptions"
				@click="nested ? onClick($event, sidesPieData, 3) : () => {}"
			/>
		</div>
	</div>
</template>

<style scoped lang="scss">
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
</style>
