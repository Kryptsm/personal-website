<script setup>
import { StarIcon } from "@heroicons/vue/24/outline";
import { StarIcon as FilledStar } from "@heroicons/vue/24/solid";

const props = defineProps(["rating"]);
</script>

<template>
	<div class="stars" v-if="props.rating">
		<div class="star-1">
			<FilledStar v-if="props.rating >= 1" class="filled-star" />
			<StarIcon v-else />
		</div>
		<div class="star-2">
			<FilledStar v-if="props.rating >= 2" class="filled-star" />
			<StarIcon v-else />
		</div>
		<div class="star-3">
			<FilledStar v-if="props.rating >= 3" class="filled-star" />
			<StarIcon v-else />
		</div>
		<div class="star-4">
			<FilledStar v-if="props.rating >= 4" class="filled-star" />
			<StarIcon v-else />
		</div>
		<div class="star-5">
			<FilledStar v-if="props.rating >= 5" class="filled-star" />
			<StarIcon v-else />
		</div>
	</div>
</template>

<style scoped lang="scss">
.stars {
	padding-right: 16px;
	display: flex;
	white-space: nowrap;
	align-items: center;
	svg {
		width: 25px;
		height: 25px;
	}

	.filled-star {
		color: gold;
	}
}
</style>
