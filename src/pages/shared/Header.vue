<script setup>
import { onUpdated, ref, onMounted, watch } from "vue";
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
import SWLogo from "../../assets/SWLogo.png";
import { useRoute, useRouter } from "vue-router";

const mobileMenuOpen = ref(false);
const personalPage = ref(false);
const route = useRoute();

function scrollElementIntoView(str) {
	const targetElement = document.querySelector(str);

	targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
}

onUpdated(() => {
	const route = useRoute();
	const currentRouteName = route.name;
});

watch(
	() => route.name,
	async (a, b) => {
		if (a == "personal") personalPage.value = true;
		else personalPage.value = false;
	}
);
</script>

<template>
	<header class="bg-white">
		<div
			class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
			aria-label="Global"
		>
			<a class="-m-1.5 p-1.5">
				<span class="sr-only">Your Company</span>
				<img class="h-8 w-auto" :src="SWLogo" alt="" />
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
				<a
					class="text-sm font-semibold leading-6 text-gray-900"
					@click="scrollElementIntoView('.examples-of-work')"
					v-if="personalPage"
				>
					Examples of Work
				</a>
				<a
					class="text-sm font-semibold leading-6 text-gray-900"
					@click="scrollElementIntoView('.ways-to-reach-me')"
					v-if="personalPage"
				>
					Ways to Reach Me
				</a>
				<router-link
					:to="{ name: 'personal' }"
					class="text-sm font-semibold leading-6 text-gray-900"
					v-if="!personalPage"
				>
					Return to Homepage
				</router-link>
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
						<img class="h-8 w-auto" :src="SWLogo" alt="" />
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
							<a
								@click="
									mobileMenuOpen = false;
									scrollElementIntoView('.examples-of-work');
								"
								class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
								v-if="personalPage"
							>
								Examples of Work
							</a>
							<a
								@click="
									mobileMenuOpen = false;
									scrollElementIntoView('.ways-to-reach-me');
								"
								class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
								v-if="personalPage"
							>
								Ways to Reach Me
							</a>
							<router-link
								:to="{ name: 'personal' }"
								class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
								v-if="!personalPage"
							>
								Return to Homepage
							</router-link>
						</div>
					</div>
				</div>
			</DialogPanel>
		</Dialog>
	</header>
</template>

<style scoped lang="scss">
.link-parent {
	display: flex;
	align-items: center;

	a {
		cursor: pointer;
	}

	@media only screen and (max-width: 1023px) {
		display: none;
	}
}
</style>
