<script setup>
import { useGetRandomInt } from "../../functions/math";
import { ref, onMounted, onUnmounted, getCurrentInstance } from "vue";
import Tile from "./components/Tile.vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

const initialNodes = ref([]);
const nodes = ref([]);
// Preset maze: 0 = wall, 1 = open space
const presetMazes = [
  // 45x25 maze: simple open maze with a border and a few internal walls
  Array.from({ length: 25 }, (v, y) =>
    Array.from({ length: 45 }, (v, x) => {
      // Border walls
      if (y === 0 || y === 24 || x === 0 || x === 44) return 0;
      // Internal vertical wall
      if (x === 10 && y > 2 && y < 22) return 0;
      // Internal horizontal wall
      if (y === 12 && x > 10 && x < 35) return 0;
      // Another vertical wall
      if (x === 35 && y > 12 && y < 22) return 0;
      // Open space
      return 1;
    })
  ),
  // 45x25 maze: complex maze with many walls and multiple paths
  [
    // Each row is a 45-element array (0=wall, 1=space)
    // This maze is hand-designed for complexity and multiple routes
    // S = suggested start, E = suggested end
    // Pathways snake around, with dead ends and loops
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1,
      1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0,
    ],
    [
      0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1,
      0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0,
    ],
    [
      0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0,
    ],
    [
      0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
      0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0,
    ],
    [
      0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1,
      1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0,
      0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
    ],
    [
      0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0,
    ],
    [
      0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
    ],
    [
      0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1,
      1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
      0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
    ],
    [
      0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    ],
    [
      0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
    ],
    [
      0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0,
      0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
    ],
    [
      0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1,
      1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0,
    ],
    [
      0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0,
      0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
    ],
    [
      0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1,
      0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0,
    ],
    [
      0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
    ],
    [
      0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1,
      1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0,
      0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
    ],
    [
      0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    ],
    [
      0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
    ],
    [
      0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
  ],
];
const presetDrawerOpen = ref(false);

const initialTracker = ref([]);
const tracker = ref([]);
const width = ref(45);
const height = ref(25);
const currentChoice = ref("start");
const selectMode = ref("create");

const currentStep = ref(0);
const currentBubbleLayer = ref([]);
const start = ref({ x: -1, y: -1 });
const end = ref({ x: -1, y: -1 });
const path = ref([]);

const bubbleInterval = ref(0);
const pathInterval = ref(0);

const displayOptions = ref([
  {
    id: 1,
    description:
      "Show search progress. Will display blue cells during and after the search which indicates cells that we look at to try and find the exit.",
    status: false,
    options: [
      {
        id: 1,
        description:
          "Show detailed search. Includes color indication of how deep the search progress is. The darker the cell, the farther away from the start it is.",
        status: true,
      },
    ],
  },
  {
    id: 2,
    description: "Shows the path from start to end being created over time.",
    status: true,
  },
]);

const tours = ref();
const tourSteps = ref([
  {
    target: ".maze-container", // We're using document.querySelector() under the hood
    header: {
      title: "The Maze",
    },
    content: `Welcome to Maze Solver! This is the maze. Black squares are the 'walls' and white spaces are 'spaces'.`,
    params: {
      placement: "top",
    },
  },
  {
    target: ".maze-container", // We're using document.querySelector() under the hood
    header: {
      title: "The Maze Pt. 2",
    },
    content: `The maze is randomly generated every time you refresh the page, with each tile having a roughly 1/3 chance to be a wall.`,
    params: {
      placement: "top",
    },
  },
  {
    target: ".newmaze-btn", // We're using document.querySelector() under the hood
    header: {
      title: "New Maze",
    },
    content: `This will regenerate the maze, randomly generating all the tiles again.`,
    params: {
      placement: "bottom",
    },
  },
  {
    target: ".resetmaze-btn", // We're using document.querySelector() under the hood
    header: {
      title: "Reset the Maze",
    },
    content: `This button resets the maze, removing any progress towards finding the exit. However, the walls and spaces stay where they are.`,
    params: {
      placement: "bottom",
    },
  },
  {
    target: ".maze-container", // We're using document.querySelector() under the hood
    header: {
      title: "Starting",
    },
    content: `To start solving the maze, click on a tile to turn it green, representing where you want the starting position to be. All empty spaces on the maze that are unreachable from that spot are turned into walls.`,
    params: {
      placement: "bottom",
    },
  },
  {
    target: ".maze-container", // We're using document.querySelector() under the hood
    header: {
      title: "Ending",
    },
    content: `Finally, click another spot to turn it red, indicating where you want the end of the maze to be. You'll notice the solving will begin automatically!`,
    params: {
      placement: "bottom",
    },
  },
  {
    target: ".display-options", // We're using document.querySelector() under the hood
    header: {
      title: "Display Options",
    },
    content: `You also have some display options here to change how the maze looks. Option 2 is selected by default.`,
    params: {
      placement: "top",
    },
  },
]);

const dragStart = ref({ x: null, y: null });
const dragEnd = ref({ x: null, y: null });
const currentlyDragging = ref(false);
const currentDragPos = ref({ x: null, y: null });
const dragValue = ref(1);

const howDoesItWork = ref(false);

//Manages the creation of the MazeSolver, setting the width properly for screen size, creates the maze, and adds an event listener.
onMounted(() => {
  if (window.innerWidth < 900) width.value = 35;
  if (window.innerWidth < 750) width.value = 25;
  if (window.innerWidth < 550) width.value = 15;
  createNodes(true);
  clearBoard();

  window.addEventListener("resize", resizeMaze);

  window.addEventListener("mousemove", function (e) {
    e.preventDefault();
    if (selectMode.value == "solve") return;
    if (currentlyDragging.value) {
      let x = e.target.getAttribute("x");
      let y = e.target.getAttribute("y");
      currentDragPos.value = { x, y };
      console.log("current drag pos", x, y, currentDragPos.value);
    }
  });

  window.addEventListener("mousedown", function (e) {
    e.preventDefault();
    if (selectMode.value == "solve") return;

    let x = e.target.getAttribute("x");
    let y = e.target.getAttribute("y");
    dragStart.value = { x, y };
    currentDragPos.value = { x, y };
    dragEnd.value = { x: null, y: null };
    currentlyDragging.value = true;

    if (e.target.classList.contains("wall")) dragValue.value = 0;
    else dragValue.value = 1;

    console.log("mousedown", x, y, dragStart.value);
  });

  window.addEventListener("mouseup", function (e) {
    e.preventDefault();
    if (selectMode.value == "solve") return;

    let x = e.target.getAttribute("x");
    let y = e.target.getAttribute("y");
    dragEnd.value = { x, y };
    console.log("mouseup", x, y, dragEnd.value);

    // Remove walls for all nodes within the rectangle defined by dragStart and dragEnd
    if (
      dragStart.value &&
      dragEnd.value &&
      dragStart.value.x !== null &&
      dragStart.value.y !== null &&
      dragEnd.value.x !== null &&
      dragEnd.value.y !== null
    ) {
      const minX = Math.min(dragStart.value.x, dragEnd.value.x);
      const maxX = Math.max(dragStart.value.x, dragEnd.value.x);
      const minY = Math.min(dragStart.value.y, dragEnd.value.y);
      const maxY = Math.max(dragStart.value.y, dragEnd.value.y);

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          nodes.value[y][x] = dragValue.value ? 0 : 1;
        }
      }
    }

    currentlyDragging.value = false;
  });

  const internalInstance = getCurrentInstance();
  const $tours = internalInstance.appContext.config.globalProperties.$tours;
  tours.value = $tours;
});

//Removes the event listener on unmounting
onUnmounted(() => {
  window.removeEventListener("resize", resizeMaze);
});

function startTour() {
  tours.value.mazeTour.start();
}

function getInnerWidth() {
  return window.innerWidth;
}

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

function clearBoard() {
  nodes.value.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      nodes.value[rowIndex][colIndex] = 1;
    });
  });
}

//Resizes the maze for different screen sizes
function resizeMaze() {
  let originalWidth = width.value;
  if (window.innerWidth >= 1100 && width.value != 45) width.value = 45;
  if (window.innerWidth < 1100) width.value = 35;
  if (window.innerWidth < 750) width.value = 25;
  if (window.innerWidth < 550) width.value = 15;
  if (originalWidth != width.value) createNodes(true);
}

//Handles choosing the start and end points for the maze
function selectChoice(x, y) {
  if (selectMode.value == "create") {
    if (nodes.value[y][x] == 0) nodes.value[y][x] = 1;
    else if (nodes.value[y][x] == 1) nodes.value[y][x] = 0;
    initialNodes.value = JSON.parse(JSON.stringify(nodes.value));
  } else if (selectMode.value == "solve") {
    if (currentChoice.value == "start") {
      nodes.value[y][x] = 2;
      start.value = { x: x, y: y };
      currentChoice.value = "end";
      startTimeout(false);
    } else if (currentChoice.value == "end") {
      nodes.value[y][x] = 3;
      end.value = { x: x, y: y };
      currentChoice.value = "none";
      startTimeout(displayOptions.value[0].status);
    }
  }
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
    }, 75);
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

  if (displayOptions.value[1].status) {
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
    }, 100);
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

//Sets all the nodes that we are unable to reach (using a search for an exit without an exit) to be a wall
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

//Returns the status of the node and what it should be (wall, space, bubble, etc)
function getNodeStatus(indexRow, indexCol, colInfo) {
  let result = colInfo;
  //If we are displaying the bubble
  if (displayOptions.value[0].status) {
    //If the node in question has been tracked as part of the bubble, and its not part of the path, return 5 which indicates this node is a bubble node
    if (
      tracker.value[indexRow][indexCol] != 0 &&
      currentStep.value &&
      nodes.value[indexRow][indexCol] != 4
    )
      return 5;
  }

  //Checks to see if an empty tile is completely surrounded by walls. If it is, then we set it to also be a wall.
  if (colInfo == 1) {
    let surroundedStatus = true;
    if (indexRow != 0 && nodes.value[indexRow - 1][indexCol] != 0)
      surroundedStatus = false;
    if (
      indexRow != height.value - 1 &&
      nodes.value[indexRow + 1][indexCol] != 0
    )
      surroundedStatus = false;
    if (indexCol != 0 && nodes.value[indexRow][indexCol - 1] != 0)
      surroundedStatus = false;
    if (indexCol != width.value - 1 && nodes.value[indexRow][indexCol + 1] != 0)
      surroundedStatus = false;

    if (surroundedStatus) {
      nodes.value[indexRow][indexCol] = 0;
      return 0;
    }
  }

  //If the node is not part of the bubble, return it as it already exists.
  return colInfo;
}

function getAdjacentNodePathStatus(indexRow, indexCol, colInfo) {
  if (colInfo != 4) return;

  let sidesHolder = {
    north: false,
    west: false,
    east: false,
    south: false,
  };

  if (
    indexRow != 0 &&
    (nodes.value[indexRow - 1][indexCol] == 4 ||
      nodes.value[indexRow - 1][indexCol] == 3 ||
      nodes.value[indexRow - 1][indexCol] == 2)
  )
    sidesHolder.north = true;
  if (
    indexRow != height.value - 1 &&
    (nodes.value[indexRow + 1][indexCol] == 4 ||
      nodes.value[indexRow + 1][indexCol] == 3 ||
      nodes.value[indexRow + 1][indexCol] == 2)
  )
    sidesHolder.south = true;
  if (
    indexCol != 0 &&
    (nodes.value[indexRow][indexCol - 1] == 4 ||
      nodes.value[indexRow][indexCol - 1] == 3 ||
      nodes.value[indexRow][indexCol - 1] == 2)
  )
    sidesHolder.west = true;
  if (
    indexCol != width.value - 1 &&
    (nodes.value[indexRow][indexCol + 1] == 4 ||
      nodes.value[indexRow][indexCol + 1] == 3 ||
      nodes.value[indexRow][indexCol + 1] == 2)
  )
    sidesHolder.east = true;

  return sidesHolder;
}

function getAdjacentNodeWallStatus(indexRow, indexCol, colInfo) {
  if (colInfo != 1 && colInfo != 4) return;

  let sidesHolder = {
    north: false,
    west: false,
    east: false,
    south: false,
  };

  if (indexRow != 0 && nodes.value[indexRow - 1][indexCol] == 0)
    sidesHolder.north = true;
  if (indexRow != height.value - 1 && nodes.value[indexRow + 1][indexCol] == 0)
    sidesHolder.south = true;
  if (indexCol != 0 && nodes.value[indexRow][indexCol - 1] == 0)
    sidesHolder.west = true;
  if (indexCol != width.value - 1 && nodes.value[indexRow][indexCol + 1] == 0)
    sidesHolder.east = true;

  return sidesHolder;
}

function changeMode() {
  if (selectMode.value == "create") {
    selectMode.value = "solve";
  } else {
    selectMode.value = "create";
    createNodes(false);
  }
}

function calculateHighlightStatus(x, y) {
  if (
    !currentlyDragging.value ||
    !dragStart.value ||
    !currentDragPos.value ||
    !dragStart.value.x ||
    !dragStart.value.y ||
    !currentDragPos.value.x ||
    !currentDragPos.value.y
  )
    return false;

  const minX = Math.min(currentDragPos.value.x, dragStart.value.x);
  const maxX = Math.max(currentDragPos.value.x, dragStart.value.x);
  const minY = Math.min(currentDragPos.value.y, dragStart.value.y);
  const maxY = Math.max(currentDragPos.value.y, dragStart.value.y);

  if (
    (x == minX && y >= minY && y <= maxY) ||
    (x == maxX && y <= maxY && y >= minY) ||
    (y == minY && x >= minX && x <= maxX) ||
    (y == maxY && x >= minX && x <= maxX)
  ) {
    return true;
  } else return false;
}

function setPreset(presetIndex) {
  createNodes(false);

  nodes.value = JSON.parse(JSON.stringify(presetMazes[presetIndex]));
  initialNodes.value = JSON.parse(JSON.stringify(presetMazes[presetIndex]));

  if (selectMode.value == "create") {
    selectMode.value = "solve";
  }
}
</script>

<template>
  <!-- <Authenticator>
		<template v-slot="{ user, signOut }"> -->

  <section class="header">
    <p class="text-md font-semibold py-3">
      Create your own maze by clicking to add or remove walls below, or
      <span class="randomize-link" @click="createNodes(true)"
        >randomize a maze.</span
      >
      Alternatively, you can choose
      <span class="randomize-link" @click="presetDrawerOpen = true"
        >a preset</span
      >
      as well. Once your maze is created, click the button below in order to
      choose start and end point.
    </p>

    <div>
      <TransitionRoot as="template" :show="presetDrawerOpen">
        <Dialog class="relative z-10" @close="presetDrawerOpen = false">
          <div class="fixed inset-0" />

          <div class="fixed inset-0 overflow-hidden">
            <div class="absolute inset-0 overflow-hidden">
              <div
                class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16"
              >
                <TransitionChild
                  as="template"
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enter-from="translate-x-full"
                  enter-to="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leave-from="translate-x-0"
                  leave-to="translate-x-full"
                >
                  <DialogPanel class="pointer-events-auto w-screen max-w-md">
                    <div
                      class="relative flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10"
                    >
                      <div class="px-4 sm:px-6">
                        <div class="flex items-start justify-between">
                          <DialogTitle
                            class="text-base font-semibold text-gray-900 dark:text-white"
                            >Choose a Preset Maze</DialogTitle
                          >
                          <div class="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              class="relative rounded-md text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                              @click="presetDrawerOpen = false"
                            >
                              <span class="absolute -inset-2.5" />
                              <span class="sr-only">Close panel</span>
                              <XMarkIcon class="size-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="relative mt-6 flex-1 px-4 sm:px-6">
                        <button
                          class="mr-4 rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
                          @click="setPreset(0)"
                        >
                          Simple Wall
                        </button>

                        <button
                          class="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
                          @click="setPreset(1)"
                        >
                          PacMan
                        </button>
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </div>

    <div class="header-controls">
      <button
        @click="changeMode()"
        class="text-base font-semibold leading-6 text-gray-900"
      >
        {{ selectMode == "create" ? "Start Solving!" : "Edit Maze" }}
      </button>
    </div>
  </section>
  <section class="maze-container">
    <div class="maze">
      <v-row v-for="(row, indexRow) in nodes" class="mazeRow">
        <v-col v-for="(col, indexCol) in row" class="mazeCol">
          <Tile
            :status="getNodeStatus(indexRow, indexCol, col)"
            :adjacent-path-status="
              getAdjacentNodePathStatus(indexRow, indexCol, col)
            "
            :adjacent-wall-status="
              getAdjacentNodeWallStatus(indexRow, indexCol, col)
            "
            :x="indexCol"
            :y="indexRow"
            :hoverStatus="currentChoice"
            :highlight="calculateHighlightStatus(indexCol, indexRow)"
            :maze-type="selectMode"
            :trackerNum="tracker[indexRow][indexCol]"
            :trackerTotal="currentStep"
            :top-left="
              indexRow != 0 &&
              indexCol != 0 &&
              nodes[indexRow - 1][indexCol - 1] == 0
            "
            :top-right="
              indexRow != 0 &&
              indexCol != width - 1 &&
              nodes[indexRow - 1][indexCol + 1] == 0
            "
            :show-bubble="displayOptions[0].status"
            :show-detailed-bubble="displayOptions[0].options[0].status"
            @select-choice="selectChoice"
          ></Tile>
        </v-col>
      </v-row>
    </div>
  </section>

  <fieldset class="info">
    <div class="header-bar mx-auto flex">
      <legend class="text-base font-semibold leading-6 text-gray-900 mr-auto">
        Display Options
      </legend>

      <!-- <div class="newmaze flex newmaze-btn" v-if="getInnerWidth() > 700">
        <button
          @click="startTour()"
          class="text-base font-semibold leading-6 text-gray-900 ml-auto"
        >
          Take the Tour
        </button>
      </div> -->

      <div class="newmaze flex resetmaze-btn">
        <button
          @click="createNodes(false)"
          class="text-base font-semibold leading-6 text-gray-900 ml-auto"
        >
          Reset the Maze
        </button>
      </div>
    </div>

    <div
      class="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200 body display-options"
    >
      <div v-for="(rule, ruleId) in displayOptions" :key="ruleId" class="">
        <div class="relative flex items-start py-4">
          <div class="min-w-0 flex-1 text-sm leading-6">
            <label
              :for="`display-option-${rule.id}`"
              class="select-none font-medium text-gray-900"
            >
              Option {{ rule.id }}. {{ rule.description }}
            </label>
          </div>
          <div class="ml-3 flex h-6 items-center">
            <input
              :id="`display-option-${rule.id}`"
              :name="`display-option-${rule.id}`"
              v-model="rule.status"
              type="checkbox"
              class="h-4 w-4 rounded border border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
          </div>
        </div>
        <div
          v-if="rule.options"
          v-for="(option, optionId) in rule.options"
          :key="optionId"
          class="ps-5"
        >
          <div class="relative flex items-start py-4">
            <div class="min-w-0 flex-1 text-sm leading-6">
              <label
                :for="`option-${option.id}`"
                class="select-none font-medium text-gray-900"
              >
                Modifier {{ option.id }}. {{ option.description }}
              </label>
            </div>
            <div class="ml-3 flex h-6 items-center">
              <input
                :id="`option-${option.id}`"
                :name="`option-${option.id}`"
                v-model="option.status"
                type="checkbox"
                class="h-4 w-4 rounded border border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <button
      @click="howDoesItWork = !howDoesItWork"
      class="text-base font-semibold leading-6 text-gray-900 p-2 bg-green-300 rounded my-3"
    >
      How Does It Work?
    </button>
    <div class="container" v-if="howDoesItWork">
      <div class="body" id="v-step-0">
        From a more computer science point of view, here is a longer explanation
        of how it works:
      </div>
      <div class="body" id="v-step-1">
        Essentially, this program uses a breadth first search in order to locate
        the ending of a maze without actually knowing where the ending is.
        Additionally, it works without the assumption that the ending is against
        a wall, and that walls are always connected to other walls. Due to the
        random generation, walls can be floating, so a simple "follow the left
        handed wall until the exit" strategy is non-viable.
      </div>
      <div class="body" id="v-step-2">
        So, my program just tracks each cell and how long it takes to get from
        every cell back to the start. It expands outwards, so that it marks all
        the cells that would take 1 turn to move back to the start first. These
        would be the four cells in each cardinal direction around the starting
        cell. Ignoring all the walls of course.
      </div>
      <div class="body">
        Then it marks all the cells that take 2 turns to get back to the start,
        which are all the cells adjacent to the 1 turn cells that we haven't
        visited yet. It keeps expanding outwards in this pattern, keeping track
        of each cell it visits and how many turns it takes to reach the starting
        cell from that cell. This results in it "bubbling out" as you can see if
        you select Option 1 in the Display Options. The darker a cell gets, the
        farther away from the start it is.
      </div>
      <div class="body">
        Once the exit is found, we work our way backwards counting down to one.
        If it took us 20 turns to find the exit, we then locate a cell adjacent
        to the exit which takes 19 turns to reach the start. Then from that cell
        we locate an adjacent on that takes 18 turns. All the way back to zero.
        As a result, this method will return the most optimal path possible to
        get from beginning to end.
      </div>
      <div class="body">
        I originally completed a program similar to this (in C++ Programming
        Language) as part of a class I took at Southern Methodist University.
        Basically I was bored one day at work and decided to test my knowledge
        and re-program this. With styling and more functionality, I completed a
        program that was an entire grade, and we had at least 2 weeks to do, in
        the span of a day. I also did not look up and assistance or my own old
        code to accomplish it.
      </div>
    </div>
  </fieldset>
  <v-tour name="mazeTour" :steps="tourSteps"></v-tour>
  <!-- </template>
	</Authenticator> -->
</template>

<style scoped lang="scss">
.header {
  .randomize-link {
    color: rgb(95, 95, 255);
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: rgb(159, 159, 255);
    }
  }

  button {
    background-color: rgb(150, 182, 255);
    padding: 5px 10px;
    border-radius: 8px;

    &:hover {
      background-color: rgb(118, 159, 255);
    }
  }

  .header-controls {
    display: flex;
    justify-content: center;
  }
}

.maze-container {
  padding-top: 20px;
  .maze {
    border: 1px solid black;
    .mazeRow {
      margin: 0 !important;
      .mazeCol {
        width: 100%;
        height: 25px;
        padding: 0 !important;
      }
    }

    .mazeRow + .mazeRow {
      margin-top: 0 !important;
    }
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
  }

  .hints {
    margin-top: 15px;
  }
}
</style>
