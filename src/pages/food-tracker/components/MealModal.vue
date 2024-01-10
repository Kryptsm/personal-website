<template>
	<TransitionRoot as="template" :show="meal.modalStatus ? true : false">
		<Dialog as="div" class="relative z-10" @close="meal.modalStatus = false">
			<TransitionChild
				as="template"
				enter="ease-out duration-300"
				enter-from="opacity-0"
				enter-to="opacity-100"
				leave="ease-in duration-200"
				leave-from="opacity-100"
				leave-to="opacity-0"
			>
				<div
					class="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity"
				/>
			</TransitionChild>

			<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
				<div
					class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
				>
					<TransitionChild
						as="template"
						enter="ease-out duration-300"
						enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						enter-to="opacity-100 translate-y-0 sm:scale-100"
						leave="ease-in duration-200"
						leave-from="opacity-100 translate-y-0 sm:scale-100"
						leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
					>
						<DialogPanel
							class="relative transform overflow-hidden rounded-lg bg-white text-left transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 modal-dialog"
						>
							<div class="sm:flex sm:items-start">
								<div class="content">
									<DialogTitle
										as="h3"
										class="text-base font-semibold leading-6 text-gray-900 title"
									>
										<div class="name">{{ meal.name }}</div>
										<div class="stars" v-if="meal.rating">
											<div class="star-1">
												<FilledStar
													v-if="meal.rating >= 1"
													class="filled-star"
												/>
												<StarIcon v-else />
											</div>
											<div class="star-2">
												<FilledStar
													v-if="meal.rating >= 2"
													class="filled-star"
												/>
												<StarIcon v-else />
											</div>
											<div class="star-3">
												<FilledStar
													v-if="meal.rating >= 3"
													class="filled-star"
												/>
												<StarIcon v-else />
											</div>
											<div class="star-4">
												<FilledStar
													v-if="meal.rating >= 4"
													class="filled-star"
												/>
												<StarIcon v-else />
											</div>
											<div class="star-5">
												<FilledStar
													v-if="meal.rating >= 5"
													class="filled-star"
												/>
												<StarIcon v-else />
											</div>
										</div>
									</DialogTitle>
									<div class="mt-2 body">
										<p>I've had this meal {{ count }} time(s).</p>
										<p><span>Restaurant:</span> {{ restaurant.name }}</p>
										<p><span>Core Meal:</span> {{ meal.coreName }}</p>
										<p><span>Side:</span> {{ meal.side ?? "None" }}</p>
										<span v-if="meal.isLeftovers">Leftovers</span>
										<span>{{ meal.date }}</span>
									</div>
								</div>
							</div>
							<div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse buttons">
								<button
									type="button"
									class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
									@click="meal.modalStatus = false"
								>
									Close
								</button>
							</div>
						</DialogPanel>
					</TransitionChild>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>
</template>

<script setup>
import { ref } from "vue";
import {
	Dialog,
	DialogPanel,
	DialogTitle,
	TransitionChild,
	TransitionRoot,
} from "@headlessui/vue";
import { StarIcon } from "@heroicons/vue/24/outline";
import { StarIcon as FilledStar } from "@heroicons/vue/24/solid";

const props = defineProps(["meal", "restaurant", "count"]);
</script>

<style scoped lang="scss">
.modal-dialog {
	border: 1px solid black;
	padding: 0;

	.content {
		padding: 0;
		width: 100%;
		.title {
			border-bottom: 1px solid black;
			display: flex;
			justify-content: space-between;
			gap: 10px;

			.name {
				padding: 12px 16px;
			}

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
		}

		.body {
			padding: 0 16px;

			span {
				font-weight: 700;
			}
		}
	}

	.buttons {
		padding: 0 16px 16px 16px;
	}
}
</style>
