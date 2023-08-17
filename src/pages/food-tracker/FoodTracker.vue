<script setup>
import { useGetRandomInt } from "../../functions/math";
import { ref, onMounted, onUnmounted } from "vue";
import * as func from "./functions";
import FutureSpongebob from "../../assets/FutureSpongebob.jpeg";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "vue-chartjs";

ChartJS.register(ArcElement, Tooltip, Legend);

const showWeeks = ref(3);
const windowSize = ref(0);
const daysOfTheWeek = ref([
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
]);
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
const simplifiedNames = ref(false);

const pieOptions = ref({
	responsive: true,
	maintainAspectRatio: true,
});

onMounted(() => {
	//Creates objects that represent each previous week that is indicated we want shown.
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
	let date = new Date();
	let isoDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
		.toISOString()
		.split("T")[0];
	let currentDay = date.getDay();

	//Sets the current day object to isToday
	daysOfTheWeek.value.filter((e) => e.currentWeek)[currentDay].isToday = true;

	//For each day of the week, we set up its date value in relation to today, and whether or not its in the future or not.
	daysOfTheWeek.value.forEach((e, index) => {
		if (index > currentDay) {
			let newDate = new Date(date);
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
			let newDate = new Date(date);
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

			let newDate = new Date(date);
			newDate.setDate(newDate.getDate() - distanceFromCurrentDay);
			let isoNewDate = new Date(
				newDate.getTime() - newDate.getTimezoneOffset() * 60000
			)
				.toISOString()
				.split("T")[0];

			day.date = isoNewDate;
		});
	});

	//Gets the list of all restaurants visited and stores them
	func.listRestaurants().then((result) => {
		allRestaurants.value = result;
	});
	//Gets the list of all meals eaten and stores them, and adds them to the day that they were eaten for display
	func.listMeals().then((result) => {
		addNewMeals(result);
		allMeals.value = result;
	});

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
	return itemCounts;
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
	return itemCounts;
}

//Totals the amount of times I've been to a specific restaurant, indicated by how many meals are stored within that restaurant
//Format: [{ name: "Goff's", count: 2 }, { name: "Burger House", count: 6 }]
function totalRestaurants(items) {
	let itemCounts = [];
	items.forEach((item) => {
		itemCounts.push({ name: item.name, count: item.Meals.items.length });
	});
	return itemCounts;
}

//Gets the pie data format from the "Totals" data format.
//Totals format: [{ name: "Goff's", count: 2 }, { name: "Burger House", count: 6 }]
//Pie format: { labels: ["Goff's", "Burger House"], datasets: [{ backgroundColor: ["#FFF", "#PPP"], data: [2, 6]}] }
function getPieData(itemCounts) {
	let newData = { labels: [], datasets: [{ backgroundColor: [], data: [] }] };
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
</script>

<template>
	<div class="food-tracker">
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
						<div class="meal" v-for="meal in prevDay.meals">
							<span v-if="!simplifiedNames && windowSize > 900">{{
								meal.name
							}}</span>
							<span v-if="simplifiedNames || windowSize <= 900">{{
								meal.coreName
							}}</span>
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
						<div class="meal" v-for="meal in day.meals">
							<span v-if="!simplifiedNames && windowSize > 900">{{
								meal.name
							}}</span>
							<span v-if="simplifiedNames || windowSize <= 900">{{
								meal.coreName
							}}</span>
						</div>
					</div>
					<div v-if="!day.isToday && day.isFuture" class="future-img">
						<img :src="FutureSpongebob" />
					</div>
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
					<div v-if="!day.isToday && day.isFuture" class="future-img">
						<img :src="FutureSpongebob" />
					</div>
				</div>
			</div>
		</div>

		<h6 class="graph-heading">Statistics:</h6>
		<div class="graph">
			<div class="pie-container">
				<p>Restaurants Visited</p>
				<Pie
					:data="getPieData(totalRestaurants(allRestaurants))"
					:options="pieOptions"
				/>
			</div>
			<div class="pie-container">
				<p>Meals Eaten</p>
				<Pie :data="getPieData(totalMeals(allMeals))" :options="pieOptions" />
			</div>
			<div class="pie-container">
				<p>Sides Eaten</p>
				<Pie :data="getPieData(totalSides(allMeals))" :options="pieOptions" />
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.food-tracker {
	margin: 0 0 35px 0;
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

				@media only screen and (max-width: 900px) {
					.future {
						display: none;
					}

					.meals {
						font-size: 14px;
					}
				}

				.meal + .meal {
					margin-top: 10px;
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
