<script setup>
import { useGetRandomInt } from "../../../functions/math";
import { ref } from "vue";
const props = defineProps(["status", "x", "y", "hoverStatus", "trackerNum"]);
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
	<div
		class="tile bubble"
		:style="{
			backgroundColor: `rgb(${130 - trackerNum * 1.55}, ${
				200 - trackerNum * 2.2
			}, ${230 - trackerNum * 2})`,
		}"
		v-if="status == 5"
	></div>
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

.space,
.start,
.end,
.path,
.bubble {
	border: 1px solid transparent !important;
}

.wall {
	background-color: rgb(35, 35, 35);
}

.tile {
	border: 1px solid rgb(35, 35, 35);
	width: 100%;
	height: 100%;
}
</style>
