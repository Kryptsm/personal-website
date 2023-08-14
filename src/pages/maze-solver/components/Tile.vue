<script setup>
import { useGetRandomInt } from "../../../functions/math";
import { ref } from "vue";
const props = defineProps([
	"status",
	"x",
	"y",
	"hoverStatus",
	"trackerNum",
	"trackerTotal",
	"topLeft",
	"topRight",
]);
const emits = defineEmits(["select-choice"]);
</script>

<template>
	<div class="tile wall" v-if="status == 0">
		<span class="container top-left" v-if="topLeft"
			><div class="internal"></div
		></span>
		<span class="container top-right" v-if="topRight"
			><div class="internal"></div
		></span>
	</div>
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
			backgroundColor: `rgb(${200 - 200 * (trackerNum / trackerTotal)}, ${
				220 - 200 * (trackerNum / trackerTotal)
			}, ${255 - 120 * (trackerNum / trackerTotal)})`,
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
	position: relative;

	.container {
		display: block;
		position: absolute;

		width: 40%;
		height: 40%;
		&.top-right {
			transform: rotate(-45deg);
			top: 0;
			right: 0;
		}

		&.top-left {
			transform: rotate(45deg);

			top: 0;
			left: 0;
		}

		.internal {
			width: 100%;
			height: 100%;
			background-color: rgb(35, 35, 35);
			transform: scaleX(3);
		}
	}
}

.tile {
	border: 1px solid rgb(35, 35, 35);
	width: 100%;
	height: 100%;
}
</style>
