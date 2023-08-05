<script>
export default {
	props: {
		status: Number,
		x: Number,
		y: Number,
	},
	emits: ["update-node"],
};
</script>

<template>
	<div
		class="alive flower"
		v-if="status"
		@click="$emit('update-node', x, y)"
	></div>
	<div
		class="dead flower"
		v-if="!status"
		@click="$emit('update-node', x, y)"
	></div>
</template>

<style scoped>
.alive {
	background-color: green;
}

.dead {
	background-color: rgb(85, 60, 13);
	cursor: pointer;
}

.alive,
.dead {
	border: 1px solid black;
	width: 100%;
	height: 100%;
}
</style>
