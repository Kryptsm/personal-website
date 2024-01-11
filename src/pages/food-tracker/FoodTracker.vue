<script setup>
import { useGetRandomInt } from "../../functions/math";
import { ref, onMounted, onUnmounted } from "vue";
import * as func from "./functions/functions.js";
import * as userFunctions from "../../functions/user-functions";
import FutureSpongebob from "../../assets/FutureSpongebob.jpeg";
import MealModal from "./components/MealModal.vue";
import NewMealModal from "./components/NewMealModal.vue";
import Statistics from "./components/Statistics.vue";
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { ArrowTopRightOnSquareIcon } from "@heroicons/vue/20/solid";

const date = ref(new Date("2024/01/10"));
const newMealModalStatus = ref(false);

const showWeeks = ref(4);
const windowSize = ref(0);
const daysOfTheWeek = ref([]);
const previousWeeks = ref([]);

const allMeals = ref([]);
const allRestaurants = ref([]);
const restaurantRecs = ref([]);
const simplifiedNames = ref(false);
const userInfo = ref();

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
	let initialDay = {
		date: undefined,
		isToday: false,
		isFuture: false,
		currentWeek: true,
		meals: [],
	};

	daysOfTheWeek.value = [
		{
			name: "Sunday",
			...initialDay,
		},
		{
			name: "Monday",
			...initialDay,
		},
		{
			name: "Tuesday",
			...initialDay,
		},
		{
			name: "Wednesday",
			...initialDay,
		},
		{
			name: "Thursday",
			...initialDay,
		},
		{
			name: "Friday",
			...initialDay,
		},
		{
			name: "Saturday",
			...initialDay,
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
					...initialDay,
					currentWeek: false,
				},
				{
					name: "Monday",
					...initialDay,
					currentWeek: false,
				},
				{
					name: "Tuesday",
					...initialDay,
					currentWeek: false,
				},
				{
					name: "Wednesday",
					...initialDay,
					currentWeek: false,
				},
				{
					name: "Thursday",
					...initialDay,
					currentWeek: false,
				},
				{
					name: "Friday",
					...initialDay,
					currentWeek: false,
				},
				{
					name: "Saturday",
					...initialDay,
					currentWeek: false,
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
	userFunctions.fetchUser().then((user) => {
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

			userFunctions.updateUser(
				user,
				user.name,
				new Date().toISOString(),
				user.mazeFTUE ?? false
			);
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

function totalSpecificMeal(name) {
	let count = 0;
	allMeals.value.forEach((meal) => {
		if (meal.name === name) count++;
	});
	return count;
}

function getRestaurant(id) {
	if (!allRestaurants.value || !allRestaurants.value.length) return {};
	return allRestaurants.value.find((restaurant) => restaurant.id === id);
}

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
	<div class="food-tracker">
		<div v-if="restaurantRecs" class="recs">
			<h6 class="title">Restaurant Recommendations Based on your History:</h6>
			<div class="rec-container">
				<a
					v-for="(rec, index) in windowSize >= 675
						? restaurantRecs
						: restaurantRecs.slice(0, 3)"
					class="rec"
					:href="rec.link"
					target="_blank"
					>{{ rec.name }}
					<ArrowTopRightOnSquareIcon
						class="h-5 w-5 text-gray-600"
						aria-hidden="true"
						v-if="rec.link && windowSize >= 800"
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
		<Statistics
			v-if="allMeals && allRestaurants"
			:meals="allMeals"
			:restaurants="allRestaurants"
		></Statistics>
		<NewMealModal
			:open="newMealModalStatus"
			:restaurants="allRestaurants"
			:userInfo="userInfo"
			@close-modal="newMealModalClose"
		></NewMealModal>
	</div>
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

		@media only screen and (max-width: 675px) {
			width: 90%;
		}

		.rec-container {
			display: flex;
			width: 100%;

			.hidden {
				display: none !important;
			}

			.rec {
				padding: 10px 20px 10px 20px;
				border: 1px solid black;
				border-radius: 8px;
				text-align: center;
				justify-content: space-between;
				background-color: white;
				margin-right: 15px;
				display: flex;

				svg {
					margin-top: 1px;
					margin-left: 5px;
					align-self: center;
				}
			}
		}
	}

	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		width: 95%;
		margin: auto;
		margin-top: 15px;

		@media only screen and (max-width: 675px) {
			width: 90%;
		}

		.add-new {
			display: flex;
			align-items: center;
		}

		.month {
			text-align: center;
			font-size: 30px;

			@media only screen and (max-width: 900px) {
				font-size: 25px;
			}

			@media only screen and (max-width: 675px) {
				font-size: 20px;
			}
		}

		.input-wrapper {
			display: flex;
			input {
				display: flex;
				margin-left: auto;
				align-self: center;
				border: 1px solid #c9c9c9;
				border-radius: 8px;
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
../../functions/shared-functions ../../functions/user-functions
