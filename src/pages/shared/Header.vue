<script setup>
import { ref } from "vue";
import {
	Dialog,
	DialogPanel,
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
} from "@headlessui/vue";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";
import { ChevronDownIcon } from "@heroicons/vue/20/solid";

const mobileMenuOpen = ref(false);
</script>

<template>
	<header class="bg-white">
		<div
			class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
			aria-label="Global"
		>
			<a class="-m-1.5 p-1.5">
				<span class="sr-only">Your Company</span>
				<img
					class="h-8 w-auto"
					src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
					alt=""
				/>
			</a>
			<div class="flex lg:hidden">
				<button
					type="button"
					class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
					@click="mobileMenuOpen = true"
				>
					<span class="sr-only">Open main menu</span>
					<Bars3Icon class="h-6 w-6" aria-hidden="true" />
				</button>
			</div>
			<div class="hidden lg:flex lg:gap-x-12 link-parent">
				<router-link
					:to="{ name: 'personal' }"
					class="text-sm font-semibold leading-6 text-gray-900"
				>
					Personal
				</router-link>
				<router-link
					:to="{ name: 'flower-game' }"
					class="text-sm font-semibold leading-6 text-gray-900"
				>
					Flower Game
				</router-link>
				<router-link
					:to="{ name: 'maze-solver' }"
					class="text-sm font-semibold leading-6 text-gray-900"
				>
					Maze Solver
				</router-link>
				<Menu as="div" class="relative inline-block text-left">
					<div>
						<MenuButton
							class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
						>
							Food Tracker
							<ChevronDownIcon
								class="-mr-1 h-5 w-5 text-gray-400"
								aria-hidden="true"
							/>
						</MenuButton>
					</div>

					<transition
						enter-active-class="transition ease-out duration-100"
						enter-from-class="transform opacity-0 scale-95"
						enter-to-class="transform opacity-100 scale-100"
						leave-active-class="transition ease-in duration-75"
						leave-from-class="transform opacity-100 scale-100"
						leave-to-class="transform opacity-0 scale-95"
					>
						<MenuItems
							class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
						>
							<div class="py-1">
								<MenuItem v-slot="{ active }">
									<router-link
										href="#"
										:to="{ name: 'food-tracker' }"
										:class="[
											active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
											'block px-4 py-2 text-sm',
										]"
									>
										Calendar
									</router-link>
								</MenuItem>
								<MenuItem v-slot="{ active }">
									<router-link
										href="#"
										:to="{ name: 'food-tracker/statistics' }"
										:class="[
											active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
											'block px-4 py-2 text-sm',
										]"
									>
										Statistics
									</router-link>
								</MenuItem>
							</div>
						</MenuItems>
					</transition>
				</Menu>
			</div>
		</div>
		<Dialog
			as="div"
			class="lg:hidden"
			@close="mobileMenuOpen = false"
			:open="mobileMenuOpen"
		>
			<div class="fixed inset-0 z-10" />
			<DialogPanel
				class="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10"
			>
				<div class="flex items-center justify-between">
					<a class="-m-1.5 p-1.5">
						<span class="sr-only">Your Company</span>
						<img
							class="h-8 w-auto"
							src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
							alt=""
						/>
					</a>
					<button
						type="button"
						class="-m-2.5 rounded-md p-2.5 text-gray-700"
						@click="mobileMenuOpen = false"
					>
						<span class="sr-only">Close menu</span>
						<XMarkIcon class="h-6 w-6" aria-hidden="true" />
					</button>
				</div>
				<div class="mt-6 flow-root">
					<div class="-my-6 divide-y divide-gray-500/10">
						<div class="space-y-2 py-6">
							<router-link
								:to="{ name: 'personal' }"
								@click="mobileMenuOpen = false"
								class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
							>
								Personal
							</router-link>
							<router-link
								:to="{ name: 'flower-game' }"
								@click="mobileMenuOpen = false"
								class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
							>
								Flower Game
							</router-link>
							<router-link
								:to="{ name: 'maze-solver' }"
								@click="mobileMenuOpen = false"
								class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
							>
								Maze Solver
							</router-link>
							<router-link
								:to="{ name: 'food-tracker' }"
								@click="mobileMenuOpen = false"
								class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
							>
								Food Tracker: Calendar
							</router-link>
							<router-link
								:to="{ name: 'food-tracker/statistics' }"
								@click="mobileMenuOpen = false"
								class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
							>
								Food Tracker: Statistics
							</router-link>
						</div>
					</div>
				</div>
			</DialogPanel>
		</Dialog>
	</header>
</template>

<style scoped>
.link-parent {
	display: flex;
	align-items: center;

	@media only screen and (max-width: 1023px) {
		display: none;
	}
}
</style>
