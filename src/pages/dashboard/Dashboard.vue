<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import {
  getTrainArrivals,
  getBusPredictions,
  getAlerts,
  CTA_LINES,
  minutesUntilArrival,
} from "./services/ctaService.js";
import TransitCard from "./components/TransitCard.vue";
import AddStopModal from "./components/AddStopModal.vue";

const savedStops = ref(loadStops());
const trainArrivals = ref({});
const busPredictions = ref({});
const alerts = ref([]);
const loading = ref(true);
const showAddModal = ref(false);
const lastRefresh = ref(null);
let refreshInterval = null;

const REFRESH_INTERVAL_MS = 30000; // 30 seconds

function loadStops() {
  const stored = localStorage.getItem("cta-dashboard-stops");
  if (stored) return JSON.parse(stored);
  // Default example stops - user can customize
  return [
    { id: "train-1", type: "train", label: "Fullerton (Red/Brown/Purple)", mapid: "41220", rt: "" },
    { id: "train-2", type: "train", label: "Logan Square (Blue)", mapid: "41020", rt: "Blue" },
  ];
}

function saveStops() {
  localStorage.setItem("cta-dashboard-stops", JSON.stringify(savedStops.value));
}

function addStop(stop) {
  savedStops.value.push({
    ...stop,
    id: `${stop.type}-${Date.now()}`,
  });
  saveStops();
  refreshData();
}

function removeStop(stopId) {
  savedStops.value = savedStops.value.filter((s) => s.id !== stopId);
  saveStops();
}

async function refreshData() {
  try {
    const trainStops = savedStops.value.filter((s) => s.type === "train");
    const busStops = savedStops.value.filter((s) => s.type === "bus");

    const trainPromises = trainStops.map(async (stop) => {
      const arrivals = await getTrainArrivals({
        mapid: stop.mapid,
        stpid: stop.stpid,
        rt: stop.rt || undefined,
      });
      trainArrivals.value[stop.id] = arrivals;
    });

    const busPromises = busStops.map(async (stop) => {
      const predictions = await getBusPredictions({
        stpid: stop.stpid,
        rt: stop.rt || undefined,
      });
      busPredictions.value[stop.id] = predictions;
    });

    await Promise.all([...trainPromises, ...busPromises]);

    // Fetch alerts
    alerts.value = await getAlerts();

    lastRefresh.value = new Date();
  } catch (err) {
    console.error("Error fetching CTA data:", err);
  } finally {
    loading.value = false;
  }
}

const relevantAlerts = computed(() => {
  if (!alerts.value.length) return [];
  // Filter to alerts that affect tracked routes/stations
  const trackedRoutes = new Set();
  savedStops.value.forEach((stop) => {
    if (stop.rt) trackedRoutes.add(stop.rt);
  });
  if (trackedRoutes.size === 0) return alerts.value.slice(0, 5);

  return alerts.value.filter((alert) => {
    const services = alert.ImpactedService?.Service;
    if (!services) return false;
    const serviceList = Array.isArray(services) ? services : [services];
    return serviceList.some(
      (svc) => trackedRoutes.has(svc.ServiceId) || trackedRoutes.has(svc.ServiceName)
    );
  }).slice(0, 10);
});

onMounted(() => {
  refreshData();
  refreshInterval = setInterval(refreshData, REFRESH_INTERVAL_MS);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});

function getLineColor(routeCode) {
  const line = Object.values(CTA_LINES).find(
    (l) => l.code === routeCode || l.code.toLowerCase() === routeCode?.toLowerCase()
  );
  return line?.color || "#666";
}

function formatRefreshTime(date) {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
</script>

<template>
  <div class="dashboard-container p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Transit Dashboard</h1>
      <div class="flex items-center gap-4">
        <span v-if="lastRefresh" class="text-sm text-gray-500">
          Updated {{ formatRefreshTime(lastRefresh) }}
        </span>
        <button
          @click="refreshData"
          class="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
        >
          Refresh
        </button>
        <button
          @click="showAddModal = true"
          class="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
        >
          + Add Stop
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Train Arrivals -->
    <div v-if="!loading">
      <section v-if="savedStops.filter((s) => s.type === 'train').length" class="mb-8">
        <h2 class="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 2a2 2 0 00-2 2v10a2 2 0 002 2h1l-1 2h2l1-2h4l1 2h2l-1-2h1a2 2 0 002-2V4a2 2 0 00-2-2H5zm0 2h10v5H5V4zm2.5 8a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm5 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" clip-rule="evenodd" />
          </svg>
          L Train Arrivals
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TransitCard
            v-for="stop in savedStops.filter((s) => s.type === 'train')"
            :key="stop.id"
            :stop="stop"
            :arrivals="trainArrivals[stop.id] || []"
            :getLineColor="getLineColor"
            :minutesUntilArrival="minutesUntilArrival"
            @remove="removeStop(stop.id)"
          />
        </div>
      </section>

      <!-- Bus Predictions -->
      <section v-if="savedStops.filter((s) => s.type === 'bus').length" class="mb-8">
        <h2 class="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 3H7a4 4 0 00-4 4v4a4 4 0 001 2.65V16a1 1 0 001 1h1a1 1 0 001-1v-1h4v1a1 1 0 001 1h1a1 1 0 001-1v-2.35A4 4 0 0017 11V7a4 4 0 00-4-4zM7 5h6a2 2 0 012 2v3H5V7a2 2 0 012-2zm-1.5 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
          </svg>
          Bus Arrivals
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TransitCard
            v-for="stop in savedStops.filter((s) => s.type === 'bus')"
            :key="stop.id"
            :stop="stop"
            :arrivals="busPredictions[stop.id] || []"
            :getLineColor="() => '#1565c0'"
            :minutesUntilArrival="minutesUntilArrival"
            type="bus"
            @remove="removeStop(stop.id)"
          />
        </div>
      </section>

      <!-- Service Alerts -->
      <section v-if="relevantAlerts.length" class="mb-8">
        <h2 class="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Service Alerts
        </h2>
        <div class="space-y-3">
          <div
            v-for="alert in relevantAlerts"
            :key="alert.AlertId"
            class="bg-amber-50 border border-amber-200 rounded-lg p-4"
          >
            <div class="font-medium text-amber-800">{{ alert.Headline }}</div>
            <div class="text-sm text-amber-700 mt-1">{{ alert.ShortDescription }}</div>
          </div>
        </div>
      </section>

      <!-- Empty State -->
      <div v-if="!savedStops.length" class="text-center py-20 text-gray-500">
        <p class="text-lg mb-4">No stops configured yet.</p>
        <button
          @click="showAddModal = true"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add Your First Stop
        </button>
      </div>
    </div>

    <!-- Add Stop Modal -->
    <AddStopModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @add="addStop"
    />
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: calc(100vh - 80px);
}
</style>
