<script setup>
import { computed } from "vue";

const props = defineProps({
	stop: Object,
	arrivals: Array,
	getLineColor: Function,
	minutesUntilArrival: Function,
	type: { type: String, default: "train" },
});

const emit = defineEmits(["remove"]);

const formattedArrivals = computed(() => {
	if (!props.arrivals?.length) return [];

	if (props.type === "bus") {
		return props.arrivals.map((pred) => ({
			destination: pred.des,
			route: pred.rt,
			minutes: props.minutesUntilArrival(pred.prdtm),
			isApproaching: pred.prdctdn === "DUE",
			isDelayed: pred.dly,
			color: "#1565c0",
		}));
	}

	// Train arrivals
	return props.arrivals.map((eta) => ({
		destination: eta.destNm,
		route: eta.rt,
		minutes: props.minutesUntilArrival(eta.arrT),
		isApproaching: eta.isApp === "1",
		isDelayed: eta.isDly === "1",
		isScheduled: eta.isSch === "1",
		color: props.getLineColor(eta.rt),
	}));
});
</script>

<template>
	<div
		class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
	>
		<!-- Header -->
		<div
			class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b"
		>
			<div class="font-semibold text-gray-800">{{ stop.label }}</div>
			<button
				@click="emit('remove')"
				class="text-gray-400 hover:text-red-500 transition-colors"
				title="Remove stop"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		</div>

		<!-- Arrivals list -->
		<div class="divide-y divide-gray-100">
			<div
				v-for="(arrival, idx) in formattedArrivals"
				:key="idx"
				class="flex items-center justify-between px-4 py-2.5"
			>
				<div class="flex items-center gap-3">
					<span
						class="inline-block w-3 h-3 rounded-full flex-shrink-0"
						:style="{ backgroundColor: arrival.color }"
					></span>
					<div>
						<span class="text-sm font-medium text-gray-700">{{
							arrival.destination
						}}</span>
						<span v-if="arrival.route" class="text-xs text-gray-400 ml-2">{{
							arrival.route
						}}</span>
					</div>
				</div>
				<div class="text-right">
					<span
						v-if="arrival.isApproaching"
						class="text-sm font-bold text-green-600 animate-pulse"
					>
						DUE
					</span>
					<span
						v-else-if="arrival.isDelayed"
						class="text-sm font-medium text-red-500"
					>
						Delayed
					</span>
					<span v-else class="text-sm font-medium text-gray-800">
						{{ arrival.minutes }} min
					</span>
					<span
						v-if="arrival.isScheduled"
						class="text-xs text-gray-400 ml-1"
						title="Scheduled (not live tracked)"
					>
						📅
					</span>
				</div>
			</div>

			<!-- Empty state -->
			<div
				v-if="!formattedArrivals.length"
				class="px-4 py-6 text-center text-gray-400 text-sm"
			>
				No upcoming arrivals
			</div>
		</div>
	</div>
</template>
