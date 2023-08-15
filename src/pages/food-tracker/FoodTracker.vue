<script setup>
import { useGetRandomInt } from "../../functions/math";
import { ref, onMounted } from "vue";
import * as func from "./functions";
import FutureSpongebob from "../../assets/FutureSpongebob.jpeg";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "vue-chartjs";

ChartJS.register(ArcElement, Tooltip, Legend);

const daysOfTheWeek = ref([
	{
		name: "Sunday",
		date: undefined,
		isToday: false,
		isFuture: false,
		meals: [],
	},
	{
		name: "Monday",
		date: undefined,
		isToday: false,
		isFuture: false,
		meals: [],
	},
	{
		name: "Tuesday",
		date: undefined,
		isToday: false,
		isFuture: false,
		meals: [],
	},
	{
		name: "Wednesday",
		date: undefined,
		isToday: false,
		isFuture: false,
		meals: [],
	},
	{
		name: "Thursday",
		date: undefined,
		isToday: false,
		isFuture: false,
		meals: [],
	},
	{
		name: "Friday",
		date: undefined,
		isToday: false,
		isFuture: false,
		meals: [],
	},
	{
		name: "Saturday",
		date: undefined,
		isToday: false,
		isFuture: false,
		meals: [],
	},
]);
const graphColors = ref([
	"#52D726",
	"#FFEC00",
	"#FF7300",
	"#FF0000",
	"#007ED6",
	"#7CDDDD",
	"#963868",
	"#727394",
	"#853277",
	"#A37730",
]);
const allMeals = ref([]);
const allRestaurants = ref([]);
const simplifiedNames = ref(false);

const pieOptions = ref({
	responsive: true,
	maintainAspectRatio: true,
});

onMounted(() => {
	// var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
	// let localDate = new Date(Date.now() - tzoffset);
	// console.log("Date: ", localDate);
	// var localISODate = localDate.toISOString().split("T")[0];

	// console.log("ISO Date: ", localISODate);

	let date = new Date(); // Or the date you'd like converted.
	let isoDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
		.toISOString()
		.split("T")[0];
	let currentDay = date.getDay();
	console.log("Date: ", date);
	console.log("ISO Date: ", isoDate);
	console.log("Day: ", currentDay);

	daysOfTheWeek.value[currentDay].isToday = true;

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
	//console.log(meals);
	meals.forEach((meal) => {
		let day = daysOfTheWeek.value.find((day) => day.date == meal.date);
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
	console.log("Meal Counts: ", itemCounts);
	return itemCounts;
}

function totalRestaurants(items) {
	let itemCounts = [];
	items.forEach((item) => {
		itemCounts.push({ name: item.name, count: item.Meals.items.length });
	});
	console.log("Restaurant Counts: ", itemCounts);
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

	console.log(newData);
	return newData;
}
</script>

<template>
	<div class="week-calendar">
		<div class="day-card" v-for="day in daysOfTheWeek">
			<div class="name" :class="{ today: day.isToday }">
				<div class="dayName">{{ day.name }}</div>
			</div>
			<div class="content">
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
	<h6 class="graph-heading">Totals:</h6>
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
	</div>
</template>

<style scoped lang="scss">
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
			background-color: #bee3f1;
		}

		.name {
			padding: 12px 0;
			border-radius: 0;
		}

		.content {
			border-top: 1px solid black;
			border-radius: 0;
			position: relative;
			padding: 25px 10px 10px 10px;
			height: 140px;

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
		}
	}

	:first-child {
		border-top-left-radius: 6px;
		border-bottom-left-radius: 6px;
	}

	:not(:first-child) {
		border-left: none;
	}

	:last-child {
		border-top-right-radius: 6px;
		border-bottom-right-radius: 6px;
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
</style>
