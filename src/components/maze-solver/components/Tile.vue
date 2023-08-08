<script setup>
import { useGetRandomInt } from "../../../functions/math";
import { ref } from "vue";
const props = defineProps(["status", "x", "y", "hoverStatus"]);
const emits = defineEmits(["select-choice"]);
</script>

<template>
	<div class="tile wall" v-if="status == 0"></div>
	<div
		class="tile space"
		:class="[
			hoverStatus == 'start'
				? 'hover-start'
				: hoverStatus == 'end'
				? 'hover-end'
				: '',
		]"
		@click="$emit('select-choice', x, y)"
		v-if="status == 1"
	></div>
	<div class="tile start" v-if="status == 2"></div>
	<div class="tile end" v-if="status == 3"></div>
	<div class="tile path" v-if="status == 4"></div>
	<div class="tile bubble" v-if="status == 5"></div>
</template>

<style scoped lang="scss">
.space {
	background-color: white;
}

.hover-start:hover {
	background-color: lightgreen;
}

.hover-end:hover {
	background-color: pink;
}

.start {
	background-color: green;
}

.end {
	background-color: red;
}

.path {
	background-color: yellowgreen;
}

.bubble {
	background-color: lightblue;
}

.space,
.start,
.end,
.path,
.bubble {
	border: 1px solid transparent !important;
}

.wall {
	background-color: black;
}

.tile {
	border: 1px solid black;
	width: 100%;
	height: 100%;
}
</style>
