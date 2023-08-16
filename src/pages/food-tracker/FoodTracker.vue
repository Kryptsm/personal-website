<script setup>
import { useGetRandomInt } from "../../functions/math";
import { ref, onMounted } from "vue";
import * as func from "./functions";
import FutureSpongebob from "../../assets/FutureSpongebob.jpeg";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "vue-chartjs";

ChartJS.register(ArcElement, Tooltip, Legend);

const showWeeks = ref(3);
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

	console.log("Previous Weeks: ", previousWeeks.value);

	let date = new Date();
	let isoDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
		.toISOString()
		.split("T")[0];
	let currentDay = date.getDay();

	daysOfTheWeek.value.filter((e) => e.currentWeek)[currentDay].isToday = true;

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

	func.listRestaurants().then((result) => {
		allRestaurants.value = result;
		getPieData(totalRestaurants(result));
	});
	func.listMeals().then((result) => {
		addNewMeals(result);
		allMeals.value = result;
		getPieData(totalMeals(result));
	});
});

function addNewMeals(meals) {
	meals.forEach((meal) => {
		let day = daysOfTheWeek.value.find((day) => day.date == meal.date);
		previousWeeks.value.forEach((week) => {
			if (!day) day = week.find((day) => day.date == meal.date);
		});
		if (day) day.meals = [...day.meals, meal];
	});
}

function getDayNum(isoDate) {
	return isoDate ? isoDate.slice(8, 10) : undefined;
}

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

function totalRestaurants(items) {
	let itemCounts = [];
	items.forEach((item) => {
		itemCounts.push({ name: item.name, count: item.Meals.items.length });
	});
	return itemCounts;
}

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
		<div class="week-calendar">
			<div class="day-card" v-for="(day, index) in daysOfTheWeek">
				<div class="name">
					<div class="dayName">{{ day.name }}</div>
				</div>
				<div class="previousWeeks" v-if="showWeeks > 1">
					<div class="week" v-for="prevWeek in previousWeeks">
						<div class="content">
							<div class="dayNum">{{ getDayNum(prevWeek[index].date) }}</div>
							<div>
								<div class="meal" v-for="meal in prevWeek[index].meals">
									<span v-if="!simplifiedNames">{{ meal.name }}</span>
									<span v-if="simplifiedNames">{{ meal.coreName }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="content" :class="{ today: day.isToday }">
					<div class="dayNum">{{ getDayNum(day.date) }}</div>
					<div v-if="!day.isFuture">
						<div class="meal" v-for="meal in day.meals">
							<span v-if="!simplifiedNames">{{ meal.name }}</span>
							<span v-if="simplifiedNames">{{ meal.coreName }}</span>
						</div>
					</div>
					<div v-if="!day.isToday && day.isFuture" class="future">
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
		display: flex;
		justify-content: space-around;
		width: 95%;
		margin: 15px auto;

		.day-card {
			border: 1px solid black;
			width: 100%;
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

			.content {
				border-top: 1px solid black;
				border-radius: 0;
				position: relative;
				padding: 25px 10px 10px 10px;
				height: 140px;
				background-color: rgb(250, 250, 250);

				.dayNum {
					position: absolute;
					top: 0;
					left: 5px;
				}

				@media only screen and (max-width: 900px) {
					.future {
						display: none;
					}
				}

				.meal + .meal {
					margin-top: 10px;
				}
			}
		}

		:first-child {
			border-top-left-radius: 6px;
			border-bottom-left-radius: 6px;

			.name {
				border-top-left-radius: 6px;
			}

			:last-child {
				border-bottom-left-radius: 6px;
			}
		}

		:not(:first-child) {
			border-left: none;
		}

		:last-child {
			border-top-right-radius: 6px;
			border-bottom-right-radius: 6px;

			.name {
				border-top-right-radius: 6px;
			}

			:last-child {
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
	}
}
</style>
