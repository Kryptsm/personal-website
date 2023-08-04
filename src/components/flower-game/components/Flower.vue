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
	<div class="alive" v-if="status" @click="$emit('update-node', x, y)"></div>
	<div class="dead" v-if="!status" @click="$emit('update-node', x, y)"></div>
</template>

<style scoped>
.alive {
	background-color: green;
}

.dead {
	background-color: gray;
	cursor: pointer;
}

.alive,
.dead {
	width: 49px;
	height: 49px;
	border: 1px solid black;
}
</style>
