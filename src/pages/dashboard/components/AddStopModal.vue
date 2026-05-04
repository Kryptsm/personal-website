<script setup>
import { ref } from "vue";
import { CTA_LINES } from "../services/ctaService.js";

const emit = defineEmits(["close", "add"]);

const stopType = ref("train");
const label = ref("");
const mapid = ref("");
const stpid = ref("");
const rt = ref("");

// Common L stations for quick selection
const commonStations = [
  { label: "Fullerton (Red/Brown/Purple)", mapid: "41220" },
  { label: "Belmont (Red/Brown/Purple)", mapid: "41320" },
  { label: "Chicago (Red)", mapid: "41450" },
  { label: "Grand (Red)", mapid: "40330" },
  { label: "Monroe (Red)", mapid: "41090" },
  { label: "Jackson (Red)", mapid: "40560" },
  { label: "Clark/Lake (All Loop)", mapid: "40380" },
  { label: "State/Lake (All Loop)", mapid: "40260" },
  { label: "Washington/Wabash", mapid: "41700" },
  { label: "Adams/Wabash", mapid: "40680" },
  { label: "Logan Square (Blue)", mapid: "41020" },
  { label: "Western (Blue - O'Hare)", mapid: "40670" },
  { label: "Damen (Blue)", mapid: "40590" },
  { label: "Division (Blue)", mapid: "40320" },
  { label: "Chicago (Blue)", mapid: "41410" },
  { label: "O'Hare (Blue)", mapid: "40890" },
  { label: "Midway (Orange)", mapid: "40930" },
  { label: "Roosevelt (Green/Orange)", mapid: "41400" },
  { label: "35th-Bronzeville-IIT (Green)", mapid: "41120" },
  { label: "Sox-35th (Red)", mapid: "40190" },
  { label: "Sedgwick (Brown/Purple)", mapid: "40800" },
  { label: "Merchandise Mart (Brown/Purple)", mapid: "40460" },
  { label: "Irving Park (Brown)", mapid: "41460" },
  { label: "Addison (Brown)", mapid: "41440" },
  { label: "Addison (Red)", mapid: "41420" },
  { label: "Howard (Red/Purple/Yellow)", mapid: "40900" },
  { label: "95th/Dan Ryan (Red)", mapid: "40450" },
  { label: "Forest Park (Blue)", mapid: "40390" },
  { label: "Harlem (Blue - Forest Park)", mapid: "40980" },
];

function selectStation(station) {
  label.value = station.label;
  mapid.value = station.mapid;
}

function handleSubmit() {
  if (!label.value) return;

  const stop = {
    type: stopType.value,
    label: label.value,
    ...(stopType.value === "train"
      ? { mapid: mapid.value, stpid: stpid.value || undefined, rt: rt.value || "" }
      : { stpid: stpid.value, rt: rt.value || "" }),
  };

  emit("add", stop);
  emit("close");
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="emit('close')">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between p-5 border-b">
        <h3 class="text-lg font-semibold text-gray-800">Add Transit Stop</h3>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
        <!-- Type Toggle -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div class="flex gap-2">
            <button
              type="button"
              @click="stopType = 'train'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                stopType === 'train'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ]"
            >
              🚆 Train
            </button>
            <button
              type="button"
              @click="stopType = 'bus'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                stopType === 'bus'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ]"
            >
              🚌 Bus
            </button>
          </div>
        </div>

        <!-- Quick Station Select (Train only) -->
        <div v-if="stopType === 'train'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Quick Select Station</label>
          <select
            @change="(e) => { const s = commonStations.find(st => st.mapid === e.target.value); if (s) selectStation(s); }"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Select a station --</option>
            <option v-for="station in commonStations" :key="station.mapid" :value="station.mapid">
              {{ station.label }}
            </option>
          </select>
        </div>

        <!-- Label -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
          <input
            v-model="label"
            type="text"
            placeholder="e.g. Fullerton (Red Line)"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <!-- Map ID (Train) -->
        <div v-if="stopType === 'train'">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Station Map ID
            <span class="text-gray-400 font-normal">(from CTA data portal)</span>
          </label>
          <input
            v-model="mapid"
            type="text"
            placeholder="e.g. 41220"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <!-- Stop ID (Bus or specific platform) -->
        <div v-if="stopType === 'bus'">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Stop ID
            <span class="text-gray-400 font-normal">(from bus stop sign or CTA website)</span>
          </label>
          <input
            v-model="stpid"
            type="text"
            placeholder="e.g. 1836"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <!-- Route Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Route Filter
            <span class="text-gray-400 font-normal">(optional - e.g. "Red", "Blue", or bus route "77")</span>
          </label>
          <input
            v-model="rt"
            type="text"
            placeholder="Leave blank for all routes at this stop"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <!-- Submit -->
        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Add Stop
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
