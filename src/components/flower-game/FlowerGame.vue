<script>
import Flower from "./components/Flower.vue";
export default {
	components: { Flower },
	data() {
		return {
			nodes: [],
			width: 15,
			height: 15,
		};
	},
	methods: {
		createNodes() {
			for (let y = 0; y < this.height; y++) {
				let newArray = [];
				for (let x = 0; x < this.width; x++) {
					newArray.push(Math.round(Math.random()));
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

					//Any live cell with fewer than two live neighbours dies, as if by underpopulation.
					if (node && totalLivingNeighbors < 2) newNodes[y][x] = 0;

					//Any live cell with two or three live neighbours lives on to the next generation.
					if ((node && totalLivingNeighbors == 2) || totalLivingNeighbors == 3)
						newNodes[y][x] = 1;

					//Any live cell with more than three live neighbours dies, as if by overpopulation.
					if (node && totalLivingNeighbors > 3) newNodes[y][x] = 0;

					//Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
					if (!node && totalLivingNeighbors == 3) newNodes[y][x] = 1;
				}
			}
			this.nodes = newNodes;
		},
	},
	created() {
		this.createNodes();
	},
};
</script>

<template>
	<div v-for="(row, indexRow) in nodes" class="flex">
		<div v-for="(col, indexCol) in row">
			<Flower
				:status="col"
				:x="indexCol"
				:y="indexRow"
				@update-node="updateNode"
			></Flower>
		</div>
	</div>
	<button @click="advanceStage()">Advance Stage</button>
</template>

<style scoped></style>
