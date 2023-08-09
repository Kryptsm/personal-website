<script setup>
import { useGetRandomInt } from "../../functions/math";
import { ref, onMounted, onUnmounted } from "vue";
import Tile from "./components/Tile.vue";

const initialNodes = ref([]);
const nodes = ref([]);
const initialTracker = ref([]);
const tracker = ref([]);
const width = ref(45);
const height = ref(25);
const computedWidth = ref("");
const computedHeight = ref("");
const currentChoice = ref("start");

const currentStep = ref(0);
const currentBubbleLayer = ref([]);
const start = ref({ x: -1, y: -1 });
const end = ref({ x: -1, y: -1 });
const path = ref([]);

const bubbleInterval = ref(0);
const pathInterval = ref(0);

const displayChoices = ref([
	{
		id: 1,
		name: "Show search progress. Will display blue cells during and after the search which indicates cells that we look at to try and find the exit. The darker the cell, the farther away from the start it is.",
		status: false,
	},
	{
		id: 2,
		name: "Show path discovery animation. A light green path that appears once the end has been found successfully. Represents the fastest possible path from start to end. This will remove the animation but the path will still appear.",
		status: true,
	},
]);

//Creates the maze, as well as a same-size secondary array of arrays which we will use to track the path to the exit.
function createNodes(status) {
	start.value = { x: -1, y: -1 };
	end.value = { x: -1, y: -1 };
	currentChoice.value = "start";
	currentStep.value = 0;
	currentBubbleLayer.value = [];
	path.value = [];

	if (bubbleInterval.value) {
		clearInterval(bubbleInterval.value);
		bubbleInterval.value = 0;
	}

	if (pathInterval.value) {
		clearInterval(pathInterval.value);
		pathInterval.value = 0;
	}

	//only recreate the entire nodes array if we don't already have one
	if (status) {
		nodes.value = [];
		initialNodes.value = [];
		tracker.value = [];
		initialTracker.value = [];
		for (let y = 0; y < height.value; y++) {
			let newArray = [];
			let trackerNewArray = [];
			for (let x = 0; x < width.value; x++) {
				//Randomizes the maze making every cell a 1/3 chance to be a wall.
				newArray.push(useGetRandomInt(3) == 0 ? 0 : 1);
				trackerNewArray.push(0);
			}
			nodes.value.push(JSON.parse(JSON.stringify(newArray)));
			initialNodes.value.push(JSON.parse(JSON.stringify(newArray)));
			tracker.value.push(JSON.parse(JSON.stringify(trackerNewArray)));
			initialTracker.value.push(JSON.parse(JSON.stringify(trackerNewArray)));
		}
	} else {
		nodes.value = JSON.parse(JSON.stringify(initialNodes.value));
		tracker.value = JSON.parse(JSON.stringify(initialTracker.value));
	}
}

//Resizes the maze for different screen sizes
function resizeMaze() {
	let originalWidth = width.value;
	if (window.innerWidth >= 900 && width.value != 45) width.value = 45;
	if (window.innerWidth < 900) width.value = 35;
	if (window.innerWidth < 750) width.value = 25;
	if (window.innerWidth < 550) width.value = 15;
	if (originalWidth != width.value) createNodes(true);
	computedWidth.value = `${100 / width.value}%`;
	computedHeight.value = "25px";
}

//Handles choosing the start and end points for the maze
function selectChoice(x, y) {
	if (currentChoice.value == "start") {
		nodes.value[y][x] = 2;
		start.value = { x: x, y: y };
		currentChoice.value = "end";
		startTimeout(false);
	} else if (currentChoice.value == "end") {
		nodes.value[y][x] = 3;
		end.value = { x: x, y: y };
		currentChoice.value = "none";
		startTimeout(displayChoices.value[0].status);
	}
}

//Manages the creation of the MazeSolver, setting the width properly for screen size, creates the maze, and adds an event listener.
onMounted(() => {
	if (window.innerWidth < 900) width.value = 35;
	if (window.innerWidth < 750) width.value = 25;
	if (window.innerWidth < 550) width.value = 15;
	createNodes(true);
	computedWidth.value = `${100 / width.value}%`;
	computedHeight.value = "25px";

	window.addEventListener("resize", resizeMaze);
});

//Removes the event listener on unmounting
onUnmounted(() => {
	window.removeEventListener("resize", resizeMaze);
});

//Returns the styling for the individual tiles
function tileStyles() {
	return {
		width: computedWidth.value,
		height: computedHeight.value,
	};
}

//Increments the bubble search another layer outwards as it searches for the exit
function incrementBubble() {
	//If we haven't chosen a start or an end yet
	if (start.value.x == -1) return 0;

	let arr = [];
	//First iteration, which uses the start position
	if (currentStep.value == 0) {
		currentStep.value++;
		let location = start.value;
		let returnVal = false;

		//We get the next layer (in this case the 4 tiles surrounding the start position, if they are empty)
		arr = getNextBubbleLayer(location, arr);

		if (arr.length) {
			//Each tile surrounding the start position is set to the current step we are on (in the first case, 1) in the tracker program. At this point the actual maze is unchanged.
			arr.forEach((e) => {
				if (
					tracker.value[e.y][e.x] != currentStep.value &&
					nodes.value[e.y][e.x] != 3
				) {
					tracker.value[e.y][e.x] = currentStep.value;
				} else if (nodes.value[e.y][e.x] == 3 && !returnVal) {
					//If we found the start, we start the path finding process and end this one
					findPath({ x: e.x, y: e.y });
					returnVal = true;
					return;
				}
			});
		}

		if (returnVal) return 0;

		//tracks the bubble layer we just expanded to, so that next time we can use that one as each of our starting locations
		currentBubbleLayer.value = arr;
	} else if (currentBubbleLayer.value) {
		let layer = currentBubbleLayer.value;
		let trackingArray = [];
		let returnVal = false;
		currentStep.value++;

		//Same as initial implementation, but with iterating over the entire previous bubble layer. So, instead of just the starting tile, then we would iterate over the 4 tiles surrounding the starting tile, for example.
		layer.forEach((tile) => {
			//We get the next bubble layer for each cell from the previous layer
			arr = [...getNextBubbleLayer(tile, arr)];

			//For each of those bubble layers, we set all the information in the tracker, and if a cell was marked in the tracker, we make sure to track it the next bubble layet (with trackingArray)
			if (arr.length) {
				arr.forEach((e) => {
					if (
						tracker.value[e.y][e.x] == 0 &&
						nodes.value[e.y][e.x] != 3 &&
						!returnVal
					) {
						tracker.value[e.y][e.x] = currentStep.value;
						trackingArray = [...trackingArray, { x: e.x, y: e.y }];
					} else if (nodes.value[e.y][e.x] == 3 && !returnVal) {
						findPath({ x: e.x, y: e.y });
						returnVal = true;
					}
					if (returnVal) return;
				});
			}
			if (returnVal) return;
		});

		if (returnVal) return 0;

		currentBubbleLayer.value = trackingArray;
	}
	return currentBubbleLayer.value.length;
}

//Gets an array of locations on the maze which indicates the next locations the bubble bubbles out to in search for the exit
function getNextBubbleLayer(loc, stored) {
	let arr = [];
	let n = nodes.value;
	//Gets the northern cell
	if (
		loc.y &&
		(n[loc.y - 1][loc.x] === 1 || n[loc.y - 1][loc.x] === 3) &&
		!alreadyStoredStatus(stored, { x: loc.x, y: loc.y - 1 })
	)
		arr = [...arr, { x: loc.x, y: loc.y - 1 }];
	//Gets the southern cell
	if (
		loc.y != height.value - 1 &&
		(n[loc.y + 1][loc.x] === 1 || n[loc.y + 1][loc.x] === 3) &&
		!alreadyStoredStatus(stored, { x: loc.x, y: loc.y + 1 })
	)
		arr = [...arr, { x: loc.x, y: loc.y + 1 }];
	//Gets the western cell
	if (
		loc.x &&
		(n[loc.y][loc.x - 1] === 1 || n[loc.y][loc.x - 1] === 3) &&
		!alreadyStoredStatus(stored, { x: loc.x - 1, y: loc.y })
	)
		arr = [...arr, { x: loc.x - 1, y: loc.y }];
	//Gets the eastern cell
	if (
		loc.x != width.value - 1 &&
		(n[loc.y][loc.x + 1] === 1 || n[loc.y][loc.x + 1] === 3) &&
		!alreadyStoredStatus(stored, { x: loc.x + 1, y: loc.y })
	)
		arr = [...arr, { x: loc.x + 1, y: loc.y }];

	//Returns the array of all the cells found that are viable and haven't been visited already
	return arr;
}

//Gets whether or not a maze location is already in the provided array
function alreadyStoredStatus(arr, val) {
	let status = false;
	arr.forEach((e) => {
		if (e.y == val.y && e.x && val.x) return true;
	});

	return status;
}

//starts the bubble search process, not being instantaneous for design effect
function startTimeout(animation) {
	if (animation) {
		let result = 1;
		bubbleInterval.value = setInterval(function () {
			if (result) result = incrementBubble();
			if (!result) {
				console.log("Bubble interval cleared");
				clearInterval(bubbleInterval.value);
				bubbleInterval.value = 0;

				if (end.value.x == -1) setAllUnreachable();
			}
		}, 150);
	} else {
		let result = 1;
		let index = 0;
		while (result && index < 5000) {
			result = incrementBubble();
			index++;
		}
		if (end.value.x == -1) setAllUnreachable();
		console.log("Bubble while cleared in " + index + " iterations");
	}
}

//Finds the path from the found exit provided as LOC to the start using the bubble search
function findPath(loc) {
	//We push the end node into the path to start
	path.value.push(loc);

	//We get the next node after the end node and push it into the path, as well as set its value in the maze to track the path visually
	let nextNode = getNextPathNode(loc, currentStep.value);
	path.value.push(nextNode);
	nodes.value[nextNode.y][nextNode.x] = 4;

	if (displayChoices.value[1].status) {
		//Set an interval to repeat the above process as long as the start hasn't been found as part of the path.
		pathInterval.value = setInterval(function () {
			if (nextNode.x != start.value.x || nextNode.y != start.value.y) {
				nextNode = getNextPathNode(
					nextNode,
					tracker.value[nextNode.y][nextNode.x]
				);
				path.value.push(nextNode);
				if (nodes.value[nextNode.y][nextNode.x] != 2)
					nodes.value[nextNode.y][nextNode.x] = 4;
			}

			if (nextNode.x == start.value.x && nextNode.y == start.value.y) {
				console.log("Path interval cleared");
				clearInterval(pathInterval.value);
				pathInterval.value = 0;
			}
		}, 150);
	} else {
		let index = 0;
		while (
			nextNode.x != start.value.x ||
			(nextNode.y != start.value.x && index < 500)
		) {
			nextNode = getNextPathNode(
				nextNode,
				tracker.value[nextNode.y][nextNode.x]
			);
			if (nextNode) {
				path.value.push(nextNode);
				if (nodes.value[nextNode.y][nextNode.x] != 2)
					nodes.value[nextNode.y][nextNode.x] = 4;
			} else {
				break;
			}
			index++;
		}
		console.log("Path while cleared after " + index + " iteration(s)");
	}
}

//When provided a location and the current step we are on, finds the next lowest step (if we are on 30, finds 29) which is a neighbor of the cell provided, which indicates the proper way back to the start
function getNextPathNode(loc, step) {
	let t = tracker.value;
	let n = nodes.value;

	if (step != 1) {
		//Gets northern cell and returns it if it is next in the path (tracked via step)
		if (loc.y && t[loc.y - 1][loc.x] === step - 1)
			return { x: loc.x, y: loc.y - 1 };
		//Gets southern if the northern did not work
		if (loc.y != height.value - 1 && t[loc.y + 1][loc.x] === step - 1)
			return { x: loc.x, y: loc.y + 1 };
		//Gets western if the southern did not work
		if (loc.x && t[loc.y][loc.x - 1] === step - 1)
			return { x: loc.x - 1, y: loc.y };
		//Gets the eastern if the western did not work
		if (loc.x != width.value - 1 && t[loc.y][loc.x + 1] === step - 1)
			return { x: loc.x + 1, y: loc.y };
	} else {
		//Gets northern cell and returns it if it is next in the path (tracked via step)
		if (loc.y && n[loc.y - 1][loc.x] === 2) return { x: loc.x, y: loc.y - 1 };
		//Gets southern if the northern did not work
		if (loc.y != height.value - 1 && n[loc.y + 1][loc.x] === 2)
			return { x: loc.x, y: loc.y + 1 };
		//Gets western if the southern did not work
		if (loc.x && n[loc.y][loc.x - 1] === 2) return { x: loc.x - 1, y: loc.y };
		//Gets the eastern if the western did not work
		if (loc.x != width.value - 1 && n[loc.y][loc.x + 1] === 2)
			return { x: loc.x + 1, y: loc.y };
	}
}

function setAllUnreachable() {
	nodes.value.forEach((row, rowIndex) => {
		row.forEach((col, colIndex) => {
			if (
				tracker.value[rowIndex][colIndex] === 0 &&
				nodes.value[rowIndex][colIndex] != 2
			)
				nodes.value[rowIndex][colIndex] = 0;
		});
	});
	tracker.value = JSON.parse(JSON.stringify(initialTracker.value));
	currentStep.value = 0;
}
</script>

<template>
	<div class="info">
		<div class="body">
			The maze below is randomly generated, wherein each cell has a 1/3 chance
			of being a wall. The black cells are walls, the white are empty spaces.
			Hover over the cells to see a green cell, click to place the location you
			want to start from. Then a red cell will appear, and click another cell to
			set the exit.
		</div>
		<div class="body">
			When you select a starting position, all positions in the maze that are
			unreachable from there will automatically become walls. You may also click
			the "reset the maze" button to reset your starting and stop positions.
		</div>
		<div class="body">
			You may also select some display options below. The first option shows how
			the program locates the end of the maze over time with an animation. The
			blue cells indicate the ones we've visited to try and find the exit.
			Darker cells are farther away from the start. The second option makes the
			path instantly appear, by default it appears over time.
		</div>
	</div>
	<div class="maze">
		<div v-for="(row, indexRow) in nodes" class="mazeRow">
			<div v-for="(col, indexCol) in row" class="mazeCol" :style="tileStyles()">
				<Tile
					:status="
						displayChoices[0].status
							? tracker[indexRow][indexCol] != 0 &&
							  currentStep &&
							  nodes[indexRow][indexCol] != 4
								? 5
								: col
							: col
					"
					:x="indexCol"
					:y="indexRow"
					:hoverStatus="currentChoice"
					:trackerNum="tracker[indexRow][indexCol]"
					@select-choice="selectChoice"
				></Tile>
			</div>
		</div>
	</div>
	<fieldset class="info">
		<div class="header-bar mx-auto flex">
			<legend class="text-base font-semibold leading-6 text-gray-900 mr-auto">
				Display Options
			</legend>

			<div class="newmaze flex">
				<button
					@click="createNodes(true)"
					class="text-base font-semibold leading-6 text-gray-900 ml-auto"
				>
					New Maze
				</button>
			</div>

			<div class="newmaze flex">
				<button
					@click="createNodes(false)"
					class="text-base font-semibold leading-6 text-gray-900 ml-auto"
				>
					Reset the Maze
				</button>
			</div>
		</div>

		<div
			class="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200 body"
		>
			<div
				v-for="(rule, ruleId) in displayChoices"
				:key="ruleId"
				class="relative flex items-start py-4"
			>
				<div class="min-w-0 flex-1 text-sm leading-6">
					<label
						:for="`person-${rule.id}`"
						class="select-none font-medium text-gray-900"
					>
						Option {{ rule.id }}. {{ rule.name }}
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
		<div class="body">
			From a more computer science point of view, here is a longer explanation
			of how it works:
		</div>
		<div class="body">
			Essentially, this program uses a breadth first search in order to locate
			the ending of a maze without actually knowing where the ending is.
			Additionally, it works without the assumption that the ending is against a
			wall, and that walls are always connected to other walls. Due to the
			random generation, walls can be floating, so a simple "follow the left
			handed wall until the exit" strategy is non-viable.
		</div>
		<div class="body">
			So, my program essentially just tracks each cell and how long it takes to
			get from every cell back to the start. It expands outwards, so that it
			marks all the cells that would take 1 turn to move back to the start
			first. These would be the four cells in each cardinal direction around the
			starting cell. Ignoring all the walls of course.
		</div>
		<div class="body">
			Then it marks all the cells that take 2 turns to get back to the start,
			which are all the cells adjacent to the 1 turn cells that we haven't
			visited yet. It keeps expanding outwards in this pattern, keeping track of
			each cell it visits and how many turns it takes to reach the starting cell
			from that cell. This results in it "bubbling out" as you can see if you
			select Option 1 in the Display Options. The darker a cell gets, the
			farther away from the start it is.
		</div>
		<div class="body">
			Once the exit is found, we work our way backwards counting down to one. If
			it took us 20 turns to find the exit, we then locate a cell adjacent to
			the exit which takes 19 turns to reach the start. Then from that cell we
			locate an adjacent on that takes 18 turns. All the way back to zero. As a
			result, this method will return the most optimal path possible to get from
			beginning to end.
		</div>
		<div class="body">
			I originally completed a program similar to this (in C++ Programming
			Language) as part of a class I took at Southern Methodist University.
			Basically I was bored one day at work and decided to test my knowledge and
			re-program this. With styling and more functionality, I completed a
			program that was an entire grade, and we had at least 2 weeks to do, in
			the span of a day. I also did not look up and assistance or my own old
			code to accomplish it.
		</div>
	</fieldset>
</template>

<style scoped lang="scss">
.maze {
	border: 1px solid black;
	.mazeRow {
		display: flex;
		width: 100%;
	}
}

.info {
	margin: 20px;

	.body {
		font-size: 14px;
		font-weight: 700;
	}

	.body + .body {
		margin-top: 15px;
	}

	.header-bar {
		.newmaze button {
			background-color: lightgreen;
			padding: 5px 20px;
			border-radius: 8px;
		}

		.newmaze + .newmaze {
			margin-left: 40px;
		}

		legend {
			padding-top: 5px;
		}

		.pauseplay svg {
			cursor: pointer;
			margin-top: 4px;
		}
	}

	.hints {
		margin-top: 15px;
	}
}
</style>
