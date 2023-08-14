<script setup>
import { useGetRandomInt } from "../../functions/math";
import { ref, onMounted } from "vue";
import * as func from "./functions";

// const days = ref([
// 	{ date: "2023-07-30", events: [] },
// 	{ date: "2023-07-31", events: [] },
// 	{ date: "2023-08-01", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-02", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-03", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-04", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-05", isCurrentMonth: true, events: [] },
// 	{
// 		date: "2023-08-06",
// 		isCurrentMonth: true,
// 		events: [
// 			{
// 				id: 1,
// 				name: "Design review",
// 				time: "10AM",
// 				datetime: "2023-08-03T10:00",
// 				href: "#",
// 			},
// 			{
// 				id: 2,
// 				name: "Sales meeting",
// 				time: "2PM",
// 				datetime: "2023-08-03T14:00",
// 				href: "#",
// 			},
// 		],
// 	},
// 	{ date: "2023-08-07", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-08", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-09", isCurrentMonth: true, events: [] },
// 	{
// 		date: "2023-08-10",
// 		isCurrentMonth: true,
// 		events: [
// 			{
// 				id: 3,
// 				name: "Date night",
// 				time: "6PM",
// 				datetime: "2023-08-08T18:00",
// 				href: "#",
// 			},
// 		],
// 	},
// 	{ date: "2023-08-11", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-12", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-13", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-14", isCurrentMonth: true, events: [] },
// 	{
// 		date: "2023-08-15",
// 		isCurrentMonth: true,
// 		events: [
// 			{
// 				id: 6,
// 				name: "Sam's birthday party",
// 				time: "2PM",
// 				datetime: "2023-08-25T14:00",
// 				href: "#",
// 			},
// 		],
// 	},
// 	{ date: "2023-08-16", isCurrentMonth: true, events: [], isToday: true },
// 	{ date: "2023-08-17", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-18", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-19", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-20", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-21", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-22", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-23", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-24", isCurrentMonth: true, events: [] },
// 	{
// 		date: "2023-08-25",
// 		isCurrentMonth: true,
// 		isSelected: true,
// 		events: [
// 			{
// 				id: 4,
// 				name: "Maple syrup museum",
// 				time: "3PM",
// 				datetime: "2023-08-22T15:00",
// 				href: "#",
// 			},
// 			{
// 				id: 5,
// 				name: "Hockey game",
// 				time: "7PM",
// 				datetime: "2023-08-22T19:00",
// 				href: "#",
// 			},
// 		],
// 	},
// 	{ date: "2023-08-26", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-27", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-28", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-29", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-30", isCurrentMonth: true, events: [] },
// 	{ date: "2023-08-31", isCurrentMonth: true, events: [] },
// 	{ date: "2023-09-01", events: [] },
// 	{ date: "2023-09-02", events: [] },
// 	{ date: "2023-09-03", events: [] },
// 	{ date: "2023-09-04", events: [] },
// 	{ date: "2023-09-05", events: [] },
// 	{ date: "2023-09-06", events: [] },
// 	{
// 		date: "2023-09-07",
// 		events: [
// 			{
// 				id: 7,
// 				name: "Cinema with friends",
// 				time: "9PM",
// 				datetime: "2023-09-04T21:00",
// 				href: "#",
// 			},
// 		],
// 	},
// 	{ date: "2023-09-08", events: [] },
// 	{ date: "2023-09-09", events: [] },
// ]);
// const selectedDay = ref(days.value.find((day) => day.isSelected));

const restaurants = ref([]);
const daysOfTheWeek = ref([
	{ name: "Sunday", date: undefined },
	{ name: "Monday", date: undefined },
	{ name: "Tuesday", date: undefined },
	{ name: "Wednesday", date: undefined },
	{ name: "Thursday", date: undefined },
	{ name: "Friday", date: undefined },
	{ name: "Saturday", date: undefined },
]);

onMounted(() => {
	const start = new Date();
	const format = start.toISOString().split("T")[0];
	console.log(start, format);

	const offset = start.getTimezoneOffset();
	console.log(offset);
	// daysOfTheWeek.value.forEach(e => {

	// })

	func.listRestaurants().then((result) => (restaurants.value = result));
	func.listMeals().then((result) => addNewMeals(result));
});

function addNewMeals(meals) {
	console.log(meals);
}
</script>

<template>
	<div class="week-calendar">
		<div class="day-card" v-for="day in daysOfTheWeek">
			<div class="name">{{ day.name }}</div>
			<div class="content">content</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.week-calendar {
	display: flex;
	justify-content: space-around;
	width: 95%;
	margin: auto;

	.day-card {
		border: 1px solid black;
		width: 100%;
		text-align: center;

		.name {
			padding: 12px 0;
		}

		.content {
			border-top: 1px solid black;
			border-radius: 0;
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
</style>
