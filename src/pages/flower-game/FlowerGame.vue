<script setup>
import Flower from "./components/Flower.vue";
import PlayButton from "../../assets/play.svg";
import PauseButton from "../../assets/pause.svg";
import { useGetRandomInt } from "../../functions/math";
import { ref, reactive, onMounted, onUnmounted } from "vue";

const nodes = ref([]);
const width = ref(45);
const height = ref(30);
const flowerTimeout = ref(undefined);
const playStatus = ref(true);
const rules = ref([
	{
		id: 1,
		name: "Any live flower with fewer than two live neighbours dies, as if by underpopulation.",
		status: true,
	},
	{
		id: 2,
		name: "Any live flower with two or three live neighbours lives on to the next generation.",
		status: true,
	},
	{
		id: 3,
		name: "Any live flower with more than three live neighbours dies, as if by overpopulation.",
		status: true,
	},
	{
		id: 4,
		name: "Any dead flower with exactly three live neighbours becomes a live flower, as if by reproduction.",
		status: true,
	},
	{
		id: 5,
		name: "Any dead flower with exactly two living neighbors has a chance to become a live flower, as if by generosity.",
		status: true,
	},
]);

function createNodes() {
	rules.value.forEach((e) => (e.status = true));
	nodes.value = [];
	for (let y = 0; y < height.value; y++) {
		let newArray = [];
		for (let x = 0; x < width.value; x++) {
			newArray.push(useGetRandomInt(2));
		}
		nodes.value.push(newArray);
	}
}

function updateNode(x, y) {
	if (nodes.value[y][x]) nodes.value[y][x] = 0;
	else nodes.value[y][x] = 1;
}

function advanceStage() {
	let newNodes = JSON.parse(JSON.stringify(nodes.value));
	for (let y = 0; y < height.value; y++) {
		for (let x = 0; x < width.value; x++) {
			let node = nodes.value[y][x];
			let left = x ? nodes.value[y][x - 1] : 0;
			let right = x < width.value - 1 ? nodes.value[y][x + 1] : 0;
			let top = y ? nodes.value[y - 1][x] : 0;
			let bottom = y < height.value - 1 ? nodes.value[y + 1][x] : 0;

			let topLeft = x && y ? nodes.value[y - 1][x - 1] : 0;
			let topRight = x < width.value - 1 && y ? nodes.value[y - 1][x + 1] : 0;
			let bottomLeft =
				x && y < height.value - 1 ? nodes.value[y + 1][x - 1] : 0;
			let bottomRight =
				x < width.value - 1 && y < height.value - 1
					? nodes.value[y + 1][x + 1]
					: 0;

			let totalLivingNeighbors =
				left +
				right +
				top +
				bottom +
				topLeft +
				topRight +
				bottomLeft +
				bottomRight;

			if (node) {
				//Any live flower with fewer than two live neighbours dies, as if by underpopulation.
				if (totalLivingNeighbors < 2 && rules.value[0].status)
					newNodes[y][x] = 0;

				//Any live flower with two or three live neighbours lives on to the next generation.
				if (
					(totalLivingNeighbors == 2 || totalLivingNeighbors == 3) &&
					rules.value[1].status
				)
					newNodes[y][x] = 1;

				//Any live flower with more than three live neighbours dies, as if by overpopulation.
				if (totalLivingNeighbors > 3 && rules.value[2].status)
					newNodes[y][x] = 0;
			}

			if (!node) {
				let chance = 40;
				//Any dead flower with exactly three live neighbours becomes a live flower, as if by reproduction.
				if (totalLivingNeighbors == 3 && rules.value[3].status)
					newNodes[y][x] = 1;

				//Any dead flower with exactly two living neighbors has a chance to become a live flower, as if by generosity.
				if (
					totalLivingNeighbors == 2 &&
					useGetRandomInt(chance) == 0 &&
					rules.value[4].status
				)
					newNodes[y][x] = 1;
			}
		}
	}
	nodes.value = newNodes;
}

function startTimeout() {
	if (!flowerTimeout.value) {
		playStatus.value = true;
		flowerTimeout.value = setInterval(advanceStage, 150);
	}
}

function endTimeout() {
	if (flowerTimeout.value) {
		playStatus.value = false;
		clearInterval(flowerTimeout.value);
		flowerTimeout.value = undefined;
	}
}

function resizeGarden() {
	let originalWidth = width.value;
	if (window.innerWidth >= 900 && width.value != 45) width.value = 45;
	if (window.innerWidth < 900) width.value = 35;
	if (window.innerWidth < 750) width.value = 25;
	if (window.innerWidth < 550) width.value = 15;
	if (originalWidth != width.value) createNodes();
}

onMounted(() => {
	if (window.innerWidth < 900) width.value = 35;
	if (window.innerWidth < 750) width.value = 25;
	if (window.innerWidth < 550) width.value = 15;
	createNodes();
	startTimeout();

	window.addEventListener("resize", resizeGarden);
});

onUnmounted(() => {
	window.removeEventListener("resize", resizeGarden);
});
</script>

<template>
	<div class="flowers">
		<v-row v-for="(row, indexRow) in nodes" class="flowersRow">
			<v-col v-for="(col, indexCol) in row" class="flowersCol">
				<Flower
					:status="col"
					:x="indexCol"
					:y="indexRow"
					@update-node="updateNode"
				></Flower>
			</v-col>
		</v-row>
		<fieldset class="info">
			<div class="header-bar mx-auto flex">
				<legend class="text-base font-semibold leading-6 text-gray-900 mr-auto">
					Rules
				</legend>
				<div class="pauseplay flex">
					<PlayButton
						v-if="!playStatus"
						@click="startTimeout()"
						class="mx-auto"
					/>
					<PauseButton
						v-if="playStatus"
						@click="endTimeout()"
						class="mx-auto"
					/>
				</div>

				<div class="replant flex">
					<button
						@click="createNodes()"
						class="text-base font-semibold leading-6 text-gray-900 ml-auto"
					>
						Replant The Garden
					</button>
				</div>
			</div>

			<div
				class="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200"
			>
				<div
					v-for="(rule, ruleId) in rules"
					:key="ruleId"
					class="relative flex items-start py-4"
				>
					<div class="min-w-0 flex-1 text-sm leading-6">
						<label
							:for="`person-${rule.id}`"
							class="select-none font-medium text-gray-900"
						>
							Rule {{ rule.id }}. {{ rule.name }}
						</label>
					</div>
					<div class="ml-3 flex h-6 items-center">
						<input
							:id="`person-${rule.id}`"
							:name="`person-${rule.id}`"
							v-model="rule.status"
							type="checkbox"
							class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
						/>
					</div>
				</div>
			</div>
			<div class="hints text-base font-semibold leading-6 text-gray-900">
				Hint: Try taking out rules 1 and 4 and see what happens! After that, add
				4 back in.
			</div>
		</fieldset>
	</div>
</template>

<style scoped lang="scss">
.flowers {
	.buttons {
		button {
			border: 1px solid lightgray;
			padding: 10px;
			margin: 10px 20px;
			border-radius: 8px;
			background-color: lightblue;
		}
	}

	.flowersRow {
		margin: 0 !important;
		.flowersCol {
			width: 100%;
			height: 25px;
			padding: 0 !important;
		}
	}

	.flowersRow + .flowersRow {
		margin-top: 0 !important;
	}

	.info {
		margin: 20px;

		.header-bar {
			.replant button {
				background-color: lightgreen;
				padding: 5px 20px;
				border-radius: 8px;
			}

			legend {
				padding-top: 5px;
			}

			.pauseplay svg {
				cursor: pointer;
				margin-top: 4px;
			}

			.replant,
			legend,
			.pauseplay {
				width: 33%;
			}
		}

		.hints {
			margin-top: 15px;
		}
	}
}
</style>
