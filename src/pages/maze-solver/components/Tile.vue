<script setup>
import { useGetRandomInt } from "../../../functions/math";
import { ref } from "vue";
const props = defineProps([
  "status",
  "adjacentPathStatus",
  "adjacentWallStatus",
  "x",
  "y",
  "hoverStatus",
  "highlight",
  "mazeType",
  "trackerNum",
  "trackerTotal",
  "topLeft",
  "topRight",
  "showBubble",
  "showDetailedBubble",
]);
const emits = defineEmits(["select-choice"]);
</script>

<template>
  <div
    :x="x"
    :y="y"
    class="tile wall"
    v-if="status == 0"
    :class="[mazeType == 'create' ? 'hover-create' : '', highlight ? 'highlight' : '']"
    @click="mazeType == 'create' && $emit('select-choice', x, y)"
  >
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
      mazeType == 'solve'
        ? hoverStatus == 'start'
          ? 'hover-start'
          : hoverStatus == 'end'
          ? 'hover-end'
          : ''
        : mazeType == 'create'
        ? 'hover-create'
        : '', highlight ? 'highlight' : ''
    ]"
    @click="$emit('select-choice', x, y)"
    v-if="status == 1"
  >
    <div
      :x="x"
      :y="y"
      class="circle"
      :class="{
        'top-left-blocker':
          adjacentWallStatus &&
          (!adjacentWallStatus.north || !adjacentWallStatus.west),
        'top-right-blocker':
          adjacentWallStatus &&
          (!adjacentWallStatus.north || !adjacentWallStatus.east),
        'bottom-left-blocker':
          adjacentWallStatus &&
          (!adjacentWallStatus.south || !adjacentWallStatus.west),
        'bottom-right-blocker':
          adjacentWallStatus &&
          (!adjacentWallStatus.south || !adjacentWallStatus.east),
      }"
    ></div>
  </div>
  <div class="tile start" v-if="status == 2"></div>
  <div class="tile end" v-if="status == 3"></div>
  <div class="tile path" v-if="status == 4">
    <!-- <div
      class="center-tile"
      v-if="
        (!adjacentPathStatus.north || !adjacentPathStatus.south) &&
        (!adjacentPathStatus.west || !adjacentPathStatus.east)
      "
    ></div> -->
    <svg
      style="background: none"
      class="curve curve-bottom-right"
      v-if="adjacentPathStatus.east && adjacentPathStatus.south"
    >
      <!-- Move to right-center, curve through center (10,10), to bottom-center -->
      <path
        d="M 33 12.5 L 25 12.5 Q 12.5 12.5, 12.5 25 L 12.5 33"
        stroke="yellowgreen"
        stroke-width="6"
        fill="none"
      />
    </svg>
    <svg
      style="background: none"
      class="curve curve-bottom-left"
      v-if="adjacentPathStatus.south && adjacentPathStatus.west"
    >
      <path
        d="M 12.5 33 L 12.5 25 Q 12.5 12.5, 0 12.5 L -8 12.5"
        stroke="yellowgreen"
        stroke-width="6"
        fill="none"
      />
    </svg>
    <svg
      style="background: none"
      class="curve curve-top-left"
      v-if="adjacentPathStatus.north && adjacentPathStatus.west"
    >
      <path
        d="M -8 12.5 L 0 12.5 Q 12.5 12.5, 12.5 0 L 12.5 -8"
        stroke="yellowgreen"
        stroke-width="6"
        fill="none"
      />
    </svg>
    <svg
      style="background: none"
      class="curve curve-top-right"
      v-if="adjacentPathStatus.north && adjacentPathStatus.east"
    >
      <path
        d="M 12.5 -8 L 12.5 0 Q 12.5 12.5, 25 12.5 L 33 12.5"
        stroke="yellowgreen"
        stroke-width="6"
        fill="none"
      />
    </svg>
    <div class="block north-block" v-if="adjacentPathStatus.north"></div>
    <div class="block east-block" v-if="adjacentPathStatus.east"></div>
    <div class="block south-block" v-if="adjacentPathStatus.south"></div>
    <div class="block west-block" v-if="adjacentPathStatus.west"></div>
    <div
      class="north-path adjacent"
      v-if="
        adjacentPathStatus.north &&
        !adjacentPathStatus.east &&
        !adjacentPathStatus.west
      "
    ></div>
    <div
      class="south-path adjacent"
      v-if="
        adjacentPathStatus.south &&
        !adjacentPathStatus.east &&
        !adjacentPathStatus.west
      "
    ></div>
    <div
      class="west-path adjacent"
      v-if="
        adjacentPathStatus.west &&
        !adjacentPathStatus.north &&
        !adjacentPathStatus.south
      "
    ></div>
    <div
      class="east-path adjacent"
      v-if="
        adjacentPathStatus.east &&
        !adjacentPathStatus.south &&
        !adjacentPathStatus.north
      "
    ></div>
    <div
      class="circle"
      :class="{
        'top-left-blocker':
          adjacentWallStatus &&
          (!adjacentWallStatus.north || !adjacentWallStatus.west),
        'top-right-blocker':
          adjacentWallStatus &&
          (!adjacentWallStatus.north || !adjacentWallStatus.east),
        'bottom-left-blocker':
          adjacentWallStatus &&
          (!adjacentWallStatus.south || !adjacentWallStatus.west),
        'bottom-right-blocker':
          adjacentWallStatus &&
          (!adjacentWallStatus.south || !adjacentWallStatus.east),
      }"
      :style="
        showBubble && trackerNum == trackerTotal - 1
          ? { backgroundColor: '#08088c' }
          : showBubble && showDetailedBubble
          ? {
              backgroundColor: `rgb(${
                200 - 200 * (trackerNum / trackerTotal)
              }, ${220 - 200 * (trackerNum / trackerTotal)}, ${
                255 - 120 * (trackerNum / trackerTotal)
              })`,
            }
          : ''
      "
    ></div>
  </div>
  <div class="tile bubble" v-if="status == 5">
    <div
      class="circle"
      :class="{
        'top-left-blocker':
          adjacentWallStatus &&
          (!adjacentWallStatus.north || !adjacentWallStatus.west),
        'top-right-blocker':
          adjacentWallStatus &&
          (!adjacentWallStatus.north || !adjacentWallStatus.east),
        'bottom-left-blocker':
          adjacentWallStatus &&
          (!adjacentWallStatus.south || !adjacentWallStatus.west),
        'bottom-right-blocker':
          adjacentWallStatus &&
          (!adjacentWallStatus.south || !adjacentWallStatus.east),
      }"
      :style="
        showBubble && trackerNum == trackerTotal - 1
          ? { backgroundColor: '#08088c' }
          : showBubble && showDetailedBubble
          ? {
              backgroundColor: `rgb(${
                200 - 200 * (trackerNum / trackerTotal)
              }, ${220 - 200 * (trackerNum / trackerTotal)}, ${
                255 - 120 * (trackerNum / trackerTotal)
              })`,
            }
          : ''
      "
    ></div>
  </div>
</template>

<style scoped lang="scss">
.space {
  background-color: rgb(35, 35, 35);
  position: relative;
}

.hover-start:hover {
  .circle,
  .blocker {
    background-color: lightgreen;
  }
}

.hover-end:hover {
  .circle,
  .blocker {
    background-color: pink;
  }
}

.hover-create:hover {
  .circle,
  .blocker {
    cursor: pointer;
    border: 1px solid red;
  }

  &.wall {
    cursor: pointer;
    border: 1px solid red;
  }
}

.highlight {
  .circle,
  .blocker {
    cursor: pointer;
    border: 1px solid red;
  }

  &.wall {
    cursor: pointer;
    border: 1px solid red;
  }
}

.start {
  background-color: green;
  z-index: 5;
}

.end {
  background-color: red;
  z-index: 5;
}

.path {
  background-color: white;
  position: relative;

  .block {
    width: 5px;
    height: 5px;
    background-color: yellowgreen;
    position: absolute;
    z-index: 2;

    &.east-block {
      top: calc(50% - 2.5px);
      right: -2.5px;
    }

    &.north-block {
      top: -2.5px;
      left: calc(50% - 1px);
    }

    &.west-block {
      top: calc(50% - 2.5px);
      left: -2.5px;
    }

    &.south-block {
      bottom: -2.5px;
      left: calc(50% - 1px);
    }
  }

  .adjacent {
    width: 6px;
    height: calc(50% + 2px);
    background-color: yellowgreen;
    z-index: 2;
    position: absolute;
  }

  .curve {
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    margin-top: -1px;
    margin-left: 0.5px;
    z-index: 3;
    position: absolute;

    &.curve-top-left {
      margin-left: 0px;
    }
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

.bubble,
.path {
  background: rgb(35, 35, 35);
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
      right: -12.5px;
      display: none;
    }

    &.top-left {
      transform: rotate(45deg);

      top: -13.75px;
      left: -12.5px;
      display: none;
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
      // opacity: 0.5;
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
  position: relative;
}

.circle {
  top: -1px;
  left: -1px;
  position: absolute;
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  background: white;
  border-radius: 50%;
}

.top-left-blocker {
  border-top-left-radius: 0;
}

.top-right-blocker {
  border-top-right-radius: 0;
}

.bottom-left-blocker {
  border-bottom-left-radius: 0;
}

.bottom-right-blocker {
  border-bottom-right-radius: 0;
}
</style>
