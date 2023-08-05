<script>
export default {
	props: {
		status: Number,
		x: Number,
		y: Number,
	},
	emits: ["update-node"],
	methods: {
		getRandomInt(max) {
			return Math.floor(Math.random() * max);
		},
	},
};
</script>

<template>
	<div
		class="flower"
		:style="{
			backgroundColor: `rgb(${getRandomInt(200) + 55}, ${
				getRandomInt(200) + 55
			}, ${getRandomInt(200) + 55})`,
		}"
		v-if="status"
		@click="$emit('update-node', x, y)"
	></div>
	<div
		class="flower"
		:class="'dead-' + getRandomInt(4)"
		v-if="!status"
		@click="$emit('update-node', x, y)"
	></div>
</template>

<style scoped>
.dead-0 {
	background-color: rgb(88, 60, 8);
	cursor: pointer;
}

.dead-1 {
	background-color: rgb(87, 60, 10);
	cursor: pointer;
}

.dead-2 {
	background-color: rgb(94, 66, 15);
	cursor: pointer;
}

.dead-3 {
	background-color: rgb(77, 54, 13);
	cursor: pointer;
}

.flower {
	border: 1px solid black;
	width: 100%;
	height: 100%;
}
</style>
