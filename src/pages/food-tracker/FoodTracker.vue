<script setup>
import { useGetRandomInt } from "../../functions/math";
import { ref, onMounted, onUnmounted } from "vue";
import * as func from "./functions";
import * as sharedfunc from "../shared/shared-functions";
import FutureSpongebob from "../../assets/FutureSpongebob.jpeg";
import MealModal from "./MealModal.vue";
import NewMealModal from "./NewMealModal.vue";
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { ArrowTopRightOnSquareIcon } from "@heroicons/vue/20/solid";

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

const date = ref(new Date("2024/01/01"));
const newMealModalStatus = ref(false);

const showWeeks = ref(4);
const windowSize = ref(0);
const daysOfTheWeek = ref([]);
const previousWeeks = ref([]);
const graphColors = ref([
	"#52D726",
	"#FF7300",
	"#007ED6",
	"#7CDDDD",
	"#FFEC00",
	"#963868",
	"#727394",
	"#853277",
	"#A37730",
	"#FF0000",
]);
const allMeals = ref([]);
const allRestaurants = ref([]);
const restaurantRecs = ref([]);
const simplifiedNames = ref(false);
const userInfo = ref();

const pieOptions = ref({
	responsive: true,
	maintainAspectRatio: true,
});

const restaurantPieData = ref(null);
const mealsPieData = ref(null);
const sidesPieData = ref(null);

const currentTimeout = ref(null);
const months = ref([
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
]);

onMounted(() => {
	initializeValues();
	fetchValues();

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

function initializeValues() {
	daysOfTheWeek.value = [
		{
			name: "Sunday",
			date: undefined,
			isToday: false,
			isFuture: false,
			currentWeek: true,
			meals: [],
		},
		{
			name: "Monday",
			date: undefined,
			isToday: false,
			isFuture: false,
			currentWeek: true,
			meals: [],
		},
		{
			name: "Tuesday",
			date: undefined,
			isToday: false,
			isFuture: false,
			currentWeek: true,
			meals: [],
		},
		{
			name: "Wednesday",
			date: undefined,
			isToday: false,
			isFuture: false,
			currentWeek: true,
			meals: [],
		},
		{
			name: "Thursday",
			date: undefined,
			isToday: false,
			isFuture: false,
			currentWeek: true,
			meals: [],
		},
		{
			name: "Friday",
			date: undefined,
			isToday: false,
			isFuture: false,
			currentWeek: true,
			meals: [],
		},
		{
			name: "Saturday",
			date: undefined,
			isToday: false,
			isFuture: false,
			currentWeek: true,
			meals: [],
		},
	];

	//Creates objects that represent each previous week that is indicated we want shown.
	previousWeeks.value = [];
	for (let x = 0; x < showWeeks.value - 1; x++) {
		previousWeeks.value = [
			...previousWeeks.value,
			[
				{
					name: "Sunday",
					date: undefined,
					isToday: false,
					isFuture: false,
					currentWeek: false,
					meals: [],
				},
				{
					name: "Monday",
					date: undefined,
					isToday: false,
					isFuture: false,
					currentWeek: false,
					meals: [],
				},
				{
					name: "Tuesday",
					date: undefined,
					isToday: false,
					isFuture: false,
					currentWeek: false,
					meals: [],
				},
				{
					name: "Wednesday",
					date: undefined,
					isToday: false,
					isFuture: false,
					currentWeek: false,
					meals: [],
				},
				{
					name: "Thursday",
					date: undefined,
					isToday: false,
					isFuture: false,
					currentWeek: false,
					meals: [],
				},
				{
					name: "Friday",
					date: undefined,
					isToday: false,
					isFuture: false,
					currentWeek: false,
					meals: [],
				},
				{
					name: "Saturday",
					date: undefined,
					isToday: false,
					isFuture: false,
					currentWeek: false,
					meals: [],
				},
			],
		];
	}

	//Gets the current date in YYYY-MM-DD form, as well as the current day of the week
	let isoDate = new Date(
		date.value.getTime() - date.value.getTimezoneOffset() * 60000
	)
		.toISOString()
		.split("T")[0];
	let currentDay = date.value.getDay();

	//Sets the current day object to isToday
	daysOfTheWeek.value.filter((e) => e.currentWeek)[currentDay].isToday = true;

	//For each day of the week, we set up its date value in relation to today, and whether or not its in the future or not.
	daysOfTheWeek.value.forEach((e, index) => {
		if (index > currentDay) {
			let newDate = new Date(date.value);
			newDate.setDate(newDate.getDate() + (index - currentDay));
			let isoNewDate = new Date(
				newDate.getTime() - newDate.getTimezoneOffset() * 60000
			)
				.toISOString()
				.split("T")[0];

			e.date = isoNewDate;
			e.isFuture = true;
		} else if (index == currentDay) {
			e.date = isoDate;
		} else if (index < currentDay) {
			let newDate = new Date(date.value);
			newDate.setDate(newDate.getDate() - (currentDay - index));
			let isoNewDate = new Date(
				newDate.getTime() - newDate.getTimezoneOffset() * 60000
			)
				.toISOString()
				.split("T")[0];

			e.date = isoNewDate;
		}
	});

	//For all the previous weeks, sets their date in relation to today
	previousWeeks.value.forEach((week, weekIndex) => {
		week.forEach((day, dayIndex) => {
			let distanceFromCurrentDay =
				7 - dayIndex + 7 * (showWeeks.value - 2 - weekIndex) + currentDay;

			let newDate = new Date(date.value);
			newDate.setDate(newDate.getDate() - distanceFromCurrentDay);
			let isoNewDate = new Date(
				newDate.getTime() - newDate.getTimezoneOffset() * 60000
			)
				.toISOString()
				.split("T")[0];

			day.date = isoNewDate;
		});
	});

	addNewMeals(allMeals.value);
}

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

			restaurantRecs.value = [
				{
					name: "Pecan Lodge",
					link: "https://www.pecanlodge.com/",
				},
				{
					name: "The Rustic",
					link: "https://therustic.com/",
				},
				{
					name: "Uchi",
					link: "https://uchidallas.com/",
				},
				{
					name: "Pappas Bros",
				},
				{
					name: "Velvet Taco",
					link: "https://www.velvettaco.com/",
				},
			];

			sharedfunc.updateUser(user, user.name, new Date().toISOString());
			// func.getRestaurantRecommendations(addedResult).then((result) => {
			// 	console.log("result: ", result);
			// });
		});

		func.listUserMeals(user.id).then((meals) => {
			let addedResult = [];
			meals.forEach((meal) => {
				addedResult = [
					...addedResult,
					{ ...meal, modalStatus: false, highlighted: false },
				];
			});

			addNewMeals(addedResult);
			allMeals.value = addedResult;
		});
	});
}

//Adds all the meals passed in to their respective day object
function addNewMeals(meals) {
	meals.forEach((meal) => {
		let day = daysOfTheWeek.value.find((day) => day.date == meal.date);
		previousWeeks.value.forEach((week) => {
			if (!day) day = week.find((day) => day.date == meal.date);
		});
		if (day) day.meals = [...day.meals, meal];
	});
}

//Parses the ISO date (YYYY-MM-DD) passed in to just return the day (DD)
function getDayNum(isoDate) {
	return isoDate ? isoDate.slice(8, 10) : undefined;
}

//Totals each meal that I've eaten based on their core name (Counts the amount of times I've had Pizza)
//Format: [{ name: "Pizza", count: 2 }, { name: "Chicken Wings", count: 6 }]
function totalMeals(items) {
	let itemCounts = [];
	items.forEach((item) => {
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

function totalSpecificMeal(name) {
	let count = 0;
	allMeals.value.forEach((meal) => {
		if (meal.name === name) count++;
	});
	return count;
}

//Totals the sides I've eaten throughout the meals passed in.
//Format: [{ name: "Fries", count: 2 }, { name: "None", count: 6 }]
function totalSides(items) {
	let itemCounts = [];
	items.forEach((item) => {
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

//Totals the amount of times I've been to a specific restaurant, indicated by how many meals are stored within that restaurant
//Format: [{ name: "Goff's", count: 2 }, { name: "Burger House", count: 6 }]
function totalRestaurants(items) {
	let itemCounts = [];
	items.forEach((item) => {
		itemCounts.push({
			name: item.name,
			count: item.Meals.items.filter((e) => e.isLeftovers !== true).length,
		});
	});
	restaurantPieData.value = itemCounts;
	return itemCounts;
}

//Gets the pie data format from the "Totals" data format.
//Totals format: [{ name: "Goff's", count: 2 }, { name: "Burger House", count: 6 }]
//Pie format: { labels: ["Goff's", "Burger House"], datasets: [{ backgroundColor: ["#FFF", "#PPP"], data: [2, 6]}] }
function getPieData(itemCounts) {
	let newData = { labels: [], datasets: [{ backgroundColor: [], data: [] }] };
	itemCounts = itemCounts.sort((a, b) => {
		if (a.count < b.count) return 1;
		if (a.count > b.count) return -1;
		return 0;
	});
	itemCounts = itemCounts.slice(0, 7);
	itemCounts.forEach((item) => {
		newData.labels = [...newData.labels, item.name];
		newData.datasets[0].backgroundColor = [
			...newData.datasets[0].backgroundColor,
			graphColors.value[newData.datasets[0].backgroundColor.length],
		];
		newData.datasets[0].data = [...newData.datasets[0].data, item.count];
	});

	return newData;
}

function getRestaurant(id) {
	if (!allRestaurants.value || !allRestaurants.value.length) return {};
	return allRestaurants.value.find((restaurant) => restaurant.id === id);
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

	allRestaurants.value.forEach((restaurant) => {
		if (restaurant.name == query) restaurant.highlighted = true;
		else restaurant.highlighted = false;
	});

	allMeals.value.forEach((meal) => {
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
	allRestaurants.value.forEach((restaurant) => {
		restaurant.highlighted = false;
	});

	allMeals.value.forEach((meal) => {
		meal.highlighted = false;
	});
}

const chartRef1 = ref(null);
const chartRef2 = ref(null);
const chartRef3 = ref(null);

function handleDateChange(newDate) {
	date.value = new Date(newDate.replace(/-/g, "/"));
	initializeValues();
}

function newMealModalClose(newMeal, newRestaurant) {
	if (newRestaurant)
		allRestaurants.value = [...allRestaurants.value, newRestaurant];

	if (newMeal) {
		allMeals.value = [...allMeals.value, newMeal];
		addNewMeals([newMeal]);
	}

	newMealModalStatus.value = !newMealModalStatus.value;
}
</script>

<template>
	<Authenticator>
		<template v-slot="{ user, signOut }">
			<div class="food-tracker">
				<div v-if="restaurantRecs" class="recs">
					<h6 class="title">
						Restaurant Recommendations Based on your History:
					</h6>
					<div class="rec-container">
						<a
							v-for="(rec, index) in restaurantRecs"
							class="rec"
							:href="rec.link"
							target="_blank"
						>
							{{ rec.name }}
							<ArrowTopRightOnSquareIcon
								class="h-5 w-5 text-gray-600"
								aria-hidden="true"
								v-if="rec.link"
							/>
						</a>
					</div>
				</div>
				<div class="top-bar">
					<div class="add-new w-33">
						<button
							type="button"
							class="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto new-meal-btn"
							@click="newMealModalStatus = true"
						>
							Add New Meal
						</button>
					</div>
					<p class="month w-33" v-if="months && date">
						{{ months[date.getMonth()] }}
					</p>
					<span class="input-wrapper w-33">
						<input
							type="date"
							id="start"
							name="trip-start"
							:value="date.toISOString().split('T')[0]"
							min="2022-01-01"
							max="2024-12-31"
							@input="handleDateChange($event.target.value)"
						/>
					</span>
				</div>

				<div class="week-calendar" v-if="windowSize > 675">
					<div class="day-titles">
						<div class="day-card" v-for="(day, index) in daysOfTheWeek">
							<div class="name">
								<div class="day-name">{{ day.name }}</div>
							</div>
						</div>
					</div>

					<div class="week" v-for="prevWeek in previousWeeks">
						<div class="content" v-for="prevDay in prevWeek">
							<div class="day-num">{{ getDayNum(prevDay.date) }}</div>
							<div class="meals">
								<div
									class="meal"
									v-for="meal in prevDay.meals"
									v-on:click="meal.modalStatus = true"
									:class="{
										highlighted:
											meal.highlighted ||
											getRestaurant(meal.restaurantID).highlighted,
									}"
								>
									<span v-if="!simplifiedNames && windowSize > 900">{{
										meal.name
									}}</span>
									<span v-if="simplifiedNames || windowSize <= 900">{{
										meal.coreName
									}}</span>
									<MealModal
										:meal="meal"
										:restaurant="getRestaurant(meal.restaurantID)"
										:count="totalSpecificMeal(meal.name)"
									></MealModal>
								</div>
							</div>
						</div>
					</div>

					<div class="week current-week">
						<div
							class="content"
							v-for="day in daysOfTheWeek"
							:class="{ today: day.isToday }"
						>
							<div class="day-num">{{ getDayNum(day.date) }}</div>
							<div class="meals">
								<div
									class="meal"
									v-for="meal in day.meals"
									v-on:click="meal.modalStatus = true"
									:class="{
										highlighted:
											meal.highlighted ||
											getRestaurant(meal.restaurantID).highlighted,
									}"
								>
									<span v-if="!simplifiedNames && windowSize > 900">{{
										meal.name
									}}</span>
									<span v-if="simplifiedNames || windowSize <= 900">{{
										meal.coreName
									}}</span>
									<MealModal
										:meal="meal"
										:restaurant="getRestaurant(meal.restaurantID)"
										:count="totalSpecificMeal(meal.name)"
									></MealModal>
								</div>
							</div>
							<div v-if="!day.isToday && day.isFuture" class="future-img"></div>
						</div>
					</div>
				</div>
				<div class="week-calendar-mobile" v-if="windowSize <= 675">
					<div class="day-mobile" v-for="(day, index) in daysOfTheWeek">
						<div class="day-name">{{ day.name }}</div>
						<div
							class="content"
							:class="{ today: day.isToday, future: day.isFuture }"
						>
							<div class="day-num">{{ getDayNum(day.date) }}</div>
							<div class="meals">
								<div class="meal" v-for="meal in day.meals">
									<span v-if="!simplifiedNames">{{ meal.name }}</span>
									<span v-if="simplifiedNames">{{ meal.coreName }}</span>
								</div>
							</div>
							<div v-if="!day.isToday && day.isFuture" class="future-img"></div>
						</div>
					</div>
				</div>

				<h6 class="graph-heading">Statistics:</h6>
				<div class="graph">
					<div class="pie-container">
						<p>Restaurants Visited</p>
						<Pie
							ref="chartRef1"
							:data="getPieData(totalRestaurants(allRestaurants))"
							:options="pieOptions"
							@click="onClick($event, restaurantPieData, 1)"
						/>
					</div>
					<div class="pie-container">
						<p>Meals Eaten</p>
						<Pie
							ref="chartRef2"
							:data="getPieData(totalMeals(allMeals))"
							:options="pieOptions"
							@click="onClick($event, mealsPieData, 2)"
						/>
					</div>
					<div class="pie-container">
						<p>Sides Eaten</p>
						<Pie
							ref="chartRef3"
							:data="getPieData(totalSides(allMeals))"
							:options="pieOptions"
							@click="onClick($event, sidesPieData, 3)"
						/>
					</div>
				</div>
				<NewMealModal
					:open="newMealModalStatus"
					:restaurants="allRestaurants"
					:userInfo="userInfo"
					@close-modal="newMealModalClose"
				></NewMealModal>
			</div>
		</template>
	</Authenticator>
</template>

<style scoped lang="scss">
.food-tracker {
	margin: 0 0 35px 0;

	.title {
		font-size: 18px;
		margin-bottom: 10px;
	}

	.recs {
		width: 95%;
		margin: auto;
		margin-top: 15px;

		.rec-container {
			display: flex;
			width: 100%;

			.rec {
				padding: 10px 10px 10px 20px;
				border: 1px solid black;
				border-radius: 8px;
				width: 15%;
				text-align: center;
				justify-content: space-between;
				background-color: white;
				margin-right: 15px;
				display: flex;

				svg {
					margin-top: 1px;
				}
			}
		}
	}

	.top-bar {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		width: 95%;
		margin: auto;
		margin-top: 15px;
		w-33 {
			width: 33%;
		}

		.add-new {
			display: flex;
			align-items: center;
		}

		.month {
			text-align: center;
			font-size: 30px;
		}

		.input-wrapper {
			display: flex;
			input {
				display: flex;
				margin-left: auto;
				align-self: center;
				width: 50%;
				border: 1px solid black;
			}
		}
	}

	.week-calendar {
		width: 95%;
		margin: 15px auto;

		.day-titles {
			display: flex;

			.day-card {
				border: 1px solid black;
				border-bottom: none;
				width: calc(100% / 7);
				text-align: center;

				.today {
					background-color: #bee3f1 !important;
				}

				.name {
					padding: 12px 0;
					border-radius: 0;
					background-color: rgb(238, 104, 104);
					font-weight: 700;
				}
			}

			:not(:last-child) {
				border-right: none;
			}

			.day-card:first-child {
				border-top-left-radius: 6px;

				.name {
					border-top-left-radius: 6px;
				}
			}

			.day-card:last-child {
				border-top-right-radius: 6px;

				.name {
					border-top-right-radius: 6px;
				}
			}
		}

		.week {
			width: 100%;
			display: flex;
			.content {
				border-top: 1px solid black;
				border-left: 1px solid black;
				border-radius: 0;
				position: relative;
				padding: 25px 10px 10px 10px;
				width: calc(100% / 7);
				min-height: 140px;
				background-color: rgb(250, 250, 250);

				.day-num {
					position: absolute;
					top: 0;
					left: 5px;
				}

				.meals {
					display: flex;
					flex-direction: column;
					.meal {
						padding: 0 5px;
						border: 1px solid green;
						background-color: rgb(245, 255, 245);
						border-radius: 8px;
						width: fit-content;

						&.highlighted {
							border: 1px solid red;
							background-color: rgb(255, 207, 207);
						}

						&:hover {
							background-color: rgb(205, 248, 205);
							cursor: pointer;
						}
					}

					.meal + .meal {
						margin-top: 15px;
					}
				}

				@media only screen and (max-width: 900px) {
					.future {
						display: none;
					}

					.meals {
						font-size: 14px;
					}
				}
			}

			.content:last-child {
				border-right: 1px solid black;
			}
		}

		.current-week {
			border-bottom: 1px solid black;
			border-bottom-left-radius: 6px;
			border-bottom-right-radius: 6px;

			.content:first-child {
				border-bottom-left-radius: 6px;
			}

			.content:last-child {
				border-bottom-right-radius: 6px;
			}

			.today {
				background-color: rgb(217, 238, 246);
			}
		}
	}

	.week-calendar-mobile {
		margin: 15px auto;
		width: 90%;
		.day-mobile {
			.day-name {
				text-align: center;
				padding: 12px 0;
				background-color: rgb(238, 104, 104);
				font-weight: 700;
				border: 1px solid black;
			}

			.content {
				border-radius: 0;
				border-left: 1px solid black;
				border-right: 1px solid black;
				position: relative;
				padding: 25px 10px 10px 10px;
				min-height: 140px;
				background-color: rgb(250, 250, 250);

				.day-num {
					position: absolute;
					top: 0;
					left: 5px;
				}

				.meals {
					.meal + .meal {
						padding-top: 10px;
					}
				}

				&.today {
					background-color: rgb(217, 238, 246);
				}

				&.future {
					padding: 0;
					.future-img {
						img {
							max-height: 140px;
							margin: auto;
						}
					}
				}
			}
		}

		.day-mobile:first-child {
			.day-name {
				border-top-left-radius: 6px;
				border-top-right-radius: 6px;
			}
		}

		.day-mobile:last-child {
			.content {
				border-bottom: 1px solid black;
				border-bottom-left-radius: 6px;
				border-bottom-right-radius: 6px;
			}
		}
	}

	.graph-heading {
		width: 95%;
		margin: auto;
	}

	.graph {
		display: flex;
		justify-content: space-around;
		width: 100%;

		.pie-container {
			width: 40%;

			p {
				text-align: center;
			}
		}

		@media only screen and (max-width: 850px) {
			display: unset;

			.pie-container {
				width: 95%;
				margin: auto;
				padding-bottom: 15px;
			}
		}
	}
}
</style>
