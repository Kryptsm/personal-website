<script setup>
import { useGetRandomInt } from "../../../functions/math";
import { ref } from "vue";
const props = defineProps([
	"status",
	"adjacentPathStatus",
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
		<span class="container top-left" v-if="topLeft">
			<div class="div">
				<div class="div-inner"></div>
			</div>
		</span>
		<span class="container top-right" v-if="topRight">
			<div class="div">
				<div class="div-inner"></div>
			</div>
		</span>
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
	<div
		class="tile path"
		v-if="status == 4"
		:style="{
			backgroundColor: `rgb(${200 - 200 * (trackerNum / trackerTotal)}, ${
				220 - 200 * (trackerNum / trackerTotal)
			}, ${255 - 120 * (trackerNum / trackerTotal)})`,
		}"
	>
		<div
			class="center-tile"
			v-if="
				(!adjacentPathStatus.north || !adjacentPathStatus.south) &&
				(!adjacentPathStatus.west || !adjacentPathStatus.east)
			"
		></div>
		<div class="north-path adjacent" v-if="adjacentPathStatus.north"></div>
		<div class="south-path adjacent" v-if="adjacentPathStatus.south"></div>
		<div class="west-path adjacent" v-if="adjacentPathStatus.west"></div>
		<div class="east-path adjacent" v-if="adjacentPathStatus.east"></div>
	</div>
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
	background-color: white;
	position: relative;

	.adjacent {
		width: 6px;
		height: calc(50% + 2px);
		background-color: yellowgreen;
		z-index: 2;
		position: absolute;
	}

	.center-tile {
		width: 6px;
		height: 6px;
		position: absolute;
		left: calc(50% - 2px);
		top: calc(50% - 3px);
		background-color: yellowgreen;
		z-index: 2;
	}

	.north-path {
		top: -1px;
		left: calc(50% - 2px);
	}

	.west-path,
	.east-path {
		height: calc(50% + 4px);
		top: calc(25% - 2px);
		transform: rotate(90deg);
	}

	.west-path {
		left: 3px;
	}

	.south-path {
		left: calc(50% - 2px);
		top: calc(50% - 1px);
	}

	.east-path {
		left: calc(75% - 3px);
	}
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
		z-index: 2;

		// width: 40%;
		// height: 40%;
		&.top-right {
			transform: rotate(-45deg);
			top: -13.75px;
			right: -13.75px;
		}

		&.top-left {
			transform: rotate(45deg);

			top: -13.75px;
			left: -13.75px;
		}

		.div {
			position: relative;
			overflow: hidden;
			padding: 6.25px 0;
			transform: scaleX(1.5);
		}

		.div-inner {
			position: relative;
			background: rgb(35, 35, 35);
			height: 12.5px;
		}

		.div-inner:before,
		.div-inner:after {
			box-shadow: 0 0 0 12.5px rgb(35, 35, 35);
			border-radius: 100%;
			position: absolute;
			height: 85px; /* You can change height to increase or decrease concave radius */
			content: "";
			right: -20%;
			left: -20%;
			top: 100%;
		}

		.div-inner:after {
			bottom: 100%;
			top: auto;
		}
	}
}

.tile {
	border: 1px solid rgb(35, 35, 35);
	width: 100%;
	height: 100%;
}
</style>
