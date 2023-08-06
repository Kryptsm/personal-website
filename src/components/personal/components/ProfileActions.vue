<script setup>
import {
	AcademicCapIcon,
	BanknotesIcon,
	CheckBadgeIcon,
	ClockIcon,
	ReceiptRefundIcon,
	UsersIcon,
} from "@heroicons/vue/24/outline";

const actions = [
	{
		title: "LinkedIn",
		href: "https://linkedin.com/in/kryptsm",
		icon: ClockIcon,
		iconForeground: "text-teal-700",
		iconBackground: "bg-teal-50",
		desc: "Where you can find any professional-based information on me, such as my educational history or employment.",
	},
	{
		title: "GitHub",
		href: "https://github.com/Kryptsm",
		icon: CheckBadgeIcon,
		iconForeground: "text-purple-700",
		iconBackground: "bg-purple-50",
		desc: "Where you can find various code I've written. Only personal projects and some school work, so it is fairly sparsed. At work we tend to use Azure DevOps, and it is also not public.",
	},
	{
		title: "Instagram",
		href: "https://instagram.com/kryptsm",
		icon: UsersIcon,
		iconForeground: "text-sky-700",
		iconBackground: "bg-sky-50",
		desc: "On a more personal note, follow me on instagram to see all the latest food I cook on my story.",
	},
	{
		title: "Discord",
		href: "",
		icon: BanknotesIcon,
		iconForeground: "text-yellow-700",
		iconBackground: "bg-yellow-50",
		desc: "If you want to casually reach out to me, my username on Discord is Kryptsm. This is where I generally keep contact with friends.",
	},
	{
		title: "Steam",
		href: "https://steamcommunity.com/id/kryptsm/",
		icon: ReceiptRefundIcon,
		iconForeground: "text-rose-700",
		iconBackground: "bg-rose-50",
		desc: "If you enjoy gaming, feel free to add me on Steam. I have a few other platforms as well, which generally are linked on my Discord.",
	},
];
</script>

<template>
	<div
		class="profileActions divide-y divide-gray-200 overflow-hidden rounded-lg shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0 px-4 sm:px-6 lg:px-8 mx-auto flex max-w-7xl"
	>
		<div
			v-for="(action, actionIdx) in actions"
			:key="action.title"
			:class="[
				actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
				actionIdx === 1 ? 'sm:rounded-tr-lg' : '',
				actionIdx === actions.length - 2 ? 'sm:rounded-bl-lg' : '',
				actionIdx === actions.length - 1
					? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none'
					: '',
				'group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500',
			]"
		>
			<div>
				<span
					:class="[
						action.iconBackground,
						action.iconForeground,
						'inline-flex rounded-lg p-3 ring-4 ring-white',
					]"
				>
					<component :is="action.icon" class="h-6 w-6" aria-hidden="true" />
				</span>
			</div>
			<div class="mt-8">
				<h3
					class="text-base font-semibold leading-6 text-gray-900"
					v-if="action.href"
				>
					<a :href="action.href" class="focus:outline-none">
						<!-- Extend touch target to entire panel -->
						<span class="absolute inset-0" aria-hidden="true" />
						{{ action.title }}
					</a>
				</h3>
				<h3
					class="text-base font-semibold leading-6 text-gray-900"
					v-if="!action.href"
				>
					<a class="focus:outline-none">
						<!-- Extend touch target to entire panel -->
						<span class="absolute inset-0" aria-hidden="true" />
						{{ action.title }}
					</a>
				</h3>
				<p class="mt-2 text-sm text-gray-500">
					{{ action.desc }}
				</p>
			</div>
			<span
				class="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
				aria-hidden="true"
				v-if="action.href"
			>
				<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z"
					/>
				</svg>
			</span>
		</div>
	</div>
</template>

<style scoped>
.profileActions {
	padding-top: 30px;
	box-shadow: none;
}
</style>
