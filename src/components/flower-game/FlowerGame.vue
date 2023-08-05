<script>
import Flower from "./components/Flower.vue";
import PlayButton from "../../assets/play.svg";
import PauseButton from "../../assets/pause.svg";
export default {
	components: { Flower, PlayButton, PauseButton },
	data() {
		return {
			nodes: [],
			width: 45,
			height: 30,
			computedWidth: "",
			computedHeight: "",
			flowerTimeout: undefined,
			playStatus: true,
			rules: [
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
			],
		};
	},
	methods: {
		createNodes() {
			this.rules.forEach((e) => (e.status = true));
			this.nodes = [];
			for (let y = 0; y < this.height; y++) {
				let newArray = [];
				for (let x = 0; x < this.width; x++) {
					newArray.push(this.getRandomInt(2));
				}
				this.nodes.push(newArray);
			}
		},
		updateNode(x, y) {
			if (this.nodes[y][x]) this.nodes[y][x] = 0;
			else this.nodes[y][x] = 1;
		},
		advanceStage() {
			let newNodes = JSON.parse(JSON.stringify(this.nodes));
			for (let y = 0; y < this.height; y++) {
				for (let x = 0; x < this.width; x++) {
					let node = this.nodes[y][x];
					let left = x ? this.nodes[y][x - 1] : 0;
					let right = x < this.width - 1 ? this.nodes[y][x + 1] : 0;
					let top = y ? this.nodes[y - 1][x] : 0;
					let bottom = y < this.height - 1 ? this.nodes[y + 1][x] : 0;

					let topLeft = x && y ? this.nodes[y - 1][x - 1] : 0;
					let topRight = x < this.width - 1 && y ? this.nodes[y - 1][x + 1] : 0;
					let bottomLeft =
						x && y < this.height - 1 ? this.nodes[y + 1][x - 1] : 0;
					let bottomRight =
						x < this.width - 1 && y < this.height - 1
							? this.nodes[y + 1][x + 1]
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
						if (totalLivingNeighbors < 2 && this.rules[0].status)
							newNodes[y][x] = 0;

						//Any live flower with two or three live neighbours lives on to the next generation.
						if (
							(totalLivingNeighbors == 2 || totalLivingNeighbors == 3) &&
							this.rules[1].status
						)
							newNodes[y][x] = 1;

						//Any live flower with more than three live neighbours dies, as if by overpopulation.
						if (totalLivingNeighbors > 3 && this.rules[2].status)
							newNodes[y][x] = 0;
					}

					if (!node) {
						let chance = 20;
						//Any dead flower with exactly three live neighbours becomes a live flower, as if by reproduction.
						if (totalLivingNeighbors == 3 && this.rules[3].status)
							newNodes[y][x] = 1;

						//Any dead flower with exactly two living neighbors has a chance to become a live flower, as if by generosity.
						if (
							totalLivingNeighbors == 2 &&
							this.getRandomInt(chance) == 0 &&
							this.rules[4].status
						)
							newNodes[y][x] = 1;
					}
				}
			}
			this.nodes = newNodes;
		},
		startTimeout() {
			if (!this.flowerTimeout) {
				this.playStatus = true;
				this.flowerTimeout = setInterval(this.advanceStage, 75);
			}
		},
		endTimeout() {
			if (this.flowerTimeout) {
				this.playStatus = false;
				clearInterval(this.flowerTimeout);
				this.flowerTimeout = undefined;
			}
		},
		getRandomInt(max) {
			return Math.floor(Math.random() * max);
		},
	},
	created() {
		if (window.innerWidth < 900) this.width = 35;
		if (window.innerWidth < 750) this.width = 25;
		if (window.innerWidth < 550) this.width = 15;
		this.createNodes();
		this.startTimeout();
		this.computedWidth = `${100 / this.width}%`;
		this.computedHeight = "25px";
	},
	computed: {
		flowerStyles() {
			return {
				width: this.computedWidth,
				height: this.computedHeight,
			};
		},
	},
	mounted() {
		window.addEventListener("resize", () => {
			let originalWidth = this.width;
			if (window.innerWidth >= 900 && this.width != 45) this.width = 45;
			if (window.innerWidth < 900) this.width = 35;
			if (window.innerWidth < 750) this.width = 25;
			if (window.innerWidth < 550) this.width = 15;
			if (originalWidth != this.width) this.createNodes();
			this.computedWidth = `${100 / this.width}%`;
			this.computedHeight = "25px";
		});
	},
};
</script>

<template>
	<div class="flowers mx-auto max-w-7xl">
		<div
			v-for="(row, indexRow) in nodes"
			class="flowersRow mx-auto flex max-w-7xl"
		>
			<div
				v-for="(col, indexCol) in row"
				class="flowersCol"
				:style="flowerStyles"
			>
				<Flower
					:status="col"
					:x="indexCol"
					:y="indexRow"
					@update-node="updateNode"
				></Flower>
			</div>
		</div>
		<fieldset class="info mx-auto max-w-7xl">
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
		display: flex;
		width: 100%;
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
