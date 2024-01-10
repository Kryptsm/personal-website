<template>
	<TransitionRoot as="template" :show="open ? true : false">
		<Dialog as="div" class="relative z-10" @close="closeModal()">
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
							class="relative transform overflow-hidden rounded-lg bg-white text-left transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6 modal-dialog"
						>
							<div class="sm:flex sm:items-start">
								<div class="content">
									<DialogTitle
										as="h3"
										class="text-base font-semibold leading-6 text-gray-900 title pt-3 pb-3"
										>Enter Meal Information
									</DialogTitle>
									<div
										class="border-b border-gray-900/10 pe-12 ps-12 pb-12 pt-6"
									>
										<div
											class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 form"
										>
											<div class="sm:col-span-3 meal-name">
												<label
													for="meal-name"
													class="block text-sm font-medium leading-6 text-gray-900"
													>Meal Name</label
												>
												<div class="mt-2">
													<input
														v-model="form.mealName"
														type="text"
														name="meal-name"
														id="meal-name"
														class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
													/>
												</div>
											</div>

											<div class="sm:col-span-3 date">
												<label
													for="date"
													class="block text-sm font-medium leading-6 text-gray-900"
													>Date</label
												>
												<div class="mt-2">
													<input
														v-model="form.date"
														type="date"
														id="start"
														name="trip-start"
														min="2022-01-01"
														max="2024-12-31"
													/>
												</div>
											</div>

											<div class="sm:col-span-3 core-name">
												<label
													for="core-name"
													class="block text-sm font-medium leading-6 text-gray-900"
													>Meal Core Name (ex. Pizza, Sandwich, Soup)</label
												>
												<div class="mt-2">
													<input
														v-model="form.coreName"
														type="text"
														name="core-name"
														id="core-name"
														class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
													/>
												</div>
											</div>

											<div class="sm:col-span-3 side">
												<label
													for="side-name"
													class="block text-sm font-medium leading-6 text-gray-900"
													>Side (ex. Fries)</label
												>
												<div class="mt-2">
													<input
														v-model="form.sideName"
														type="text"
														name="side-name"
														id="side-name"
														class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
													/>
												</div>
											</div>

											<div class="sm:col-span-3">
												<label
													for="restaurant"
													class="block text-sm font-medium leading-6 text-gray-900"
													>Restaurant
													<span v-if="addNewRestaurant">Name</span></label
												>
												<div class="mt-2">
													<select
														v-model="form.restaurantID"
														id="restaurant"
														name="restaurant"
														class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
														v-if="!addNewRestaurant"
													>
														<option
															v-for="restaurant in restaurants"
															:value="restaurant.id"
														>
															{{ restaurant.name }}
														</option>
													</select>

													<input
														v-model="form.newRestaurantName"
														type="text"
														name="restaurant"
														id="restaurant"
														class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
														v-if="addNewRestaurant"
													/>
												</div>
											</div>

											<div class="sm:col-span-3">
												<label
													for="restaurant"
													class="block text-sm font-medium leading-6 text-gray-900"
												>
												</label>
												<div class="mt-5 ms-3">
													<button
														type="button"
														class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
														@click="addNewRestaurant = !addNewRestaurant"
													>
														Add
														{{ addNewRestaurant ? "Existing" : "New" }}
														Restaurant
													</button>
												</div>
											</div>

											<div class="sm:col-span-3">
												<label
													for="restaurant"
													class="block text-sm font-medium leading-6 text-gray-900"
													>Is this meal leftovers?</label
												>
												<div class="mt-3 ms-3">
													<Switch
														v-model="enabled"
														:class="[
															enabled ? 'bg-indigo-600' : 'bg-gray-200',
															'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
														]"
													>
														<span class="sr-only">Use setting</span>
														<span
															:class="[
																enabled ? 'translate-x-5' : 'translate-x-0',
																'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
															]"
															class="slider"
														>
															<span
																:class="[
																	enabled
																		? 'opacity-0 duration-100 ease-out'
																		: 'opacity-100 duration-200 ease-in',
																	'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity',
																]"
																aria-hidden="true"
															>
																<svg
																	class="h-3 w-3 text-gray-400"
																	fill="none"
																	viewBox="0 0 12 12"
																>
																	<path
																		d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
																		stroke="currentColor"
																		stroke-width="2"
																		stroke-linecap="round"
																		stroke-linejoin="round"
																	/>
																</svg>
															</span>
															<span
																:class="[
																	enabled
																		? true
																		: false
																		? 'opacity-100 duration-200 ease-in'
																		: 'opacity-0 duration-100 ease-out',
																	'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity',
																]"
																aria-hidden="true"
															>
																<svg
																	class="h-3 w-3 text-indigo-600"
																	fill="currentColor"
																	viewBox="0 0 12 12"
																>
																	<path
																		d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
																	/>
																</svg>
															</span>
														</span>
													</Switch>
												</div>
											</div>

											<div class="sm:col-span-3 rating">
												<label
													for="stars"
													class="block text-sm font-medium leading-6 text-gray-900"
													>Rating</label
												>
												<div class="stars">
													<div class="star-1">
														<FilledStar
															v-if="form.rating >= 1"
															@click="setRating(1)"
															class="filled-star"
														/>
														<StarIcon v-else @click="setRating(1)" />
													</div>
													<div class="star-2">
														<FilledStar
															v-if="form.rating >= 2"
															@click="setRating(2)"
															class="filled-star"
														/>
														<StarIcon v-else @click="setRating(2)" />
													</div>
													<div class="star-3">
														<FilledStar
															v-if="form.rating >= 3"
															@click="setRating(3)"
															class="filled-star"
														/>
														<StarIcon v-else @click="setRating(3)" />
													</div>
													<div class="star-4">
														<FilledStar
															v-if="form.rating >= 4"
															@click="setRating(4)"
															class="filled-star"
														/>
														<StarIcon v-else @click="setRating(4)" />
													</div>
													<div class="star-5">
														<FilledStar
															v-if="form.rating >= 5"
															@click="setRating(5)"
															class="filled-star"
														/>
														<StarIcon v-else @click="setRating(5)" />
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse buttons">
								<button
									type="button"
									class="mt-3 me-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset hover:bg-indigo-500 sm:mt-0 sm:w-auto bg-indigo-600 text-white"
									@click="submit()"
								>
									Submit
								</button>
								<button
									type="button"
									class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
									@click="closeModal()"
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
import * as func from "../functions/functions";

import { Switch } from "@headlessui/vue";

const enabled = ref(false);
const addNewRestaurant = ref(false);

const form = ref({
	mealName: null,
	sideName: null,
	coreName: null,
	date: null,
	restaurantID: null,
	newRestaurantName: null,
	rating: null,
});

const props = defineProps(["open", "restaurants", "userInfo"]);
const emit = defineEmits(["closeModal"]);

function closeModal() {
	emit("closeModal");
}

function setRating(number) {
	form.value.rating = number;
}

function searchForRestaurant(name) {
	let match = props.restaurants?.find(
		(restaurant) => restaurant.name.toLowerCase() == name.toLowerCase()
	);

	return match;
}

function submit() {
	if (
		!form.value.mealName ||
		!form.value.date ||
		(!addNewRestaurant.value && !form.value.restaurantID) ||
		(addNewRestaurant.value && !form.value.newRestaurantName) ||
		!form.value.coreName
	) {
		console.log("Missing information");
		return;
	}

	if (addNewRestaurant.value) {
		let match = searchForRestaurant(form.value.newRestaurantName);

		if (match) {
			let parsedMatch = JSON.parse(JSON.stringify(match));
			console.log(parsedMatch.id);

			func
				.createMeal(
					form.value.mealName,
					form.value.date,
					parsedMatch.id,
					form.value.coreName,
					enabled.value === true ? true : false,
					form.value.sideName,
					props.userInfo.id,
					form.value.rating
				)
				.then((newMeal) => {
					emit("closeModal", newMeal);
				});
		} else {
			func
				.createRestaurant(form.value.newRestaurantName)
				.then((newRestaurant) => {
					func
						.createMeal(
							form.value.mealName,
							form.value.date,
							newRestaurant.id,
							form.value.coreName,
							enabled.value === true ? true : false,
							form.value.sideName,
							props.userInfo.id,
							form.value.rating
						)
						.then((newMeal) => {
							emit("closeModal", newMeal, newRestaurant);
						});
				});
		}
	} else {
		func
			.createMeal(
				form.value.mealName,
				form.value.date,
				form.value.restaurantID,
				form.value.coreName,
				enabled.value === true ? true : false,
				form.value.sideName,
				props.userInfo.id,
				form.value.rating
			)
			.then((newMeal) => {
				emit("closeModal", newMeal);
			});
	}
}
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
			padding: 0 16px;
			display: flex;
			justify-content: space-between;
			gap: 10px;

			span {
				white-space: nowrap;
			}
		}

		.body {
			padding: 0 16px;

			span {
				font-weight: 700;
			}
		}

		.form {
			.date {
				input {
					border: 1px solid lightgray;
					width: 100%;
					padding: 5px 15px;
					border-radius: 6px;
				}
			}

			.side {
				display: flex;
				flex-direction: column;
				justify-content: flex-end;
			}

			.slider {
				margin-left: 2px;
				margin-top: 2px;
			}

			.rating {
				.stars {
					margin-top: 5px;
					display: flex;
					svg {
						width: 30px;
						height: 30px;
						cursor: pointer;
					}

					.filled-star {
						color: gold;
					}
				}
			}
		}
	}

	.buttons {
		padding: 0 16px 16px 16px;
		display: flex;
		justify-content: flex-end;
		gap: 16px;
	}
}
</style>
./functions/functions
