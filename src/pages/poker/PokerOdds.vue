<template>
  <div
    class="poker-odds min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4 md:p-8"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-2">
          🃏 Texas Hold'em Odds Calculator
        </h1>
        <p class="text-green-200 text-lg">
          Pre-flop hand strength analysis and win probabilities
        </p>
      </div>

      <!-- Controls -->
      <div
        class="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 mb-6 shadow-2xl border border-white/20"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <!-- Player Count -->
          <div>
            <label
              class="block text-white font-semibold mb-2 text-sm md:text-base"
            >
              Number of Players at Table
            </label>
            <div class="flex items-center space-x-3">
              <input
                type="range"
                v-model.number="numPlayers"
                min="2"
                max="10"
                class="flex-1 h-2 bg-green-600 rounded-lg appearance-none cursor-pointer accent-yellow-400"
              />
              <span
                class="text-xl md:text-2xl font-bold text-yellow-400 min-w-[2.5rem] md:min-w-[3rem] text-center"
              >
                {{ numPlayers }}
              </span>
            </div>
            <p class="text-green-200 text-sm mt-2">
              {{ numPlayers - 1 }} opponent{{ numPlayers > 2 ? "s" : "" }}
            </p>
          </div>

          <!-- Hand Input -->
          <div>
            <label
              class="block text-white font-semibold mb-2 text-sm md:text-base"
            >
              Enter Your Hand (e.g., AKs, QQ, JTo)
            </label>
            <div class="flex space-x-2">
              <input
                type="text"
                v-model="selectedHand"
                @input="handleHandInput"
                placeholder="AKs"
                maxlength="3"
                class="flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-white/20 text-white placeholder-green-300 border-2 border-white/30 focus:border-yellow-400 focus:outline-none text-base md:text-lg font-bold uppercase"
              />
              <button
                @click="calculateDetailedOdds"
                :disabled="!isValidHand"
                class="px-4 md:px-6 py-2 md:py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-500 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors text-sm md:text-base whitespace-nowrap"
              >
                Calculate
              </button>
            </div>
            <p v-if="handError" class="text-red-300 text-sm mt-2">
              {{ handError }}
            </p>
          </div>
        </div>

        <!-- Quick Presets -->
        <div class="mt-4">
          <label class="block text-white font-semibold mb-2 text-sm">
            Quick Presets
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="preset in quickPresets"
              :key="preset.hand"
              @click="selectPreset(preset.hand)"
              class="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors border border-white/30"
            >
              {{ preset.hand }} - {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- Detailed Results -->
        <div v-if="detailedResults" class="mt-6 p-4 bg-black/30 rounded-lg">
          <h3 class="text-xl font-bold text-white mb-3">
            {{ detailedResults.hand }} Results
          </h3>

          <!-- Hand Strength Badge -->
          <div class="mb-4 p-3 rounded-lg bg-black/40">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-sm text-green-200">Hand Strength: </span>
                <span
                  class="text-lg font-bold"
                  :style="{ color: detailedResults.strengthColor }"
                >
                  {{ detailedResults.strengthCategory }}
                </span>
              </div>
              <div class="text-sm text-green-200 text-right max-w-xs">
                {{ detailedResults.recommendation }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-green-400">
                {{ detailedResults.winRate }}%
              </div>
              <div class="text-green-200 text-sm">Win Rate</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-yellow-400">
                {{ detailedResults.tieRate }}%
              </div>
              <div class="text-green-200 text-sm">Tie Rate</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-red-400">
                {{ detailedResults.loseRate }}%
              </div>
              <div class="text-green-200 text-sm">Lose Rate</div>
            </div>
          </div>
          <div class="mt-3 text-center text-green-300 text-sm">
            Based on
            {{ detailedResults.simulations.toLocaleString() }} simulations
          </div>
        </div>
      </div>

      <!-- Link to Post-Flop Calculator -->
      <div
        class="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-6 mb-6 shadow-2xl border-2 border-yellow-400/50"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white mb-2">
              🎯 Need Post-Flop Analysis?
            </h2>
            <p class="text-green-200">
              Calculate odds with your actual cards and get real-time
              recommendations
            </p>
          </div>
          <router-link
            to="/poker/post-flop"
            class="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors text-lg whitespace-nowrap"
          >
            Open Calculator →
          </router-link>
        </div>
      </div>

      <!-- Legend -->
      <div
        class="bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-4 mb-6 shadow-xl border border-white/20"
      >
        <div
          class="flex flex-wrap justify-center items-center gap-3 md:gap-6 text-xs md:text-sm mb-3"
        >
          <div class="text-white font-semibold">Hand Types:</div>
          <div class="flex items-center space-x-2">
            <div
              class="w-8 h-8 bg-white/30 rounded border-2 border-white"
            ></div>
            <span class="text-white">Pairs (AA, KK...)</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-500/40 rounded"></div>
            <span class="text-white">Suited (AKs, QJs...)</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-white/10 rounded"></div>
            <span class="text-white">Offsuit (AKo, QJo...)</span>
          </div>
        </div>
        <div
          class="flex justify-center items-center space-x-2 md:space-x-4 mt-3"
        >
          <span class="text-green-200 text-xs md:text-sm font-semibold"
            >Color Scale:</span
          >
          <button
            @click="colorMode = 'absolute'"
            :class="[
              'px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold transition-all text-xs md:text-sm',
              colorMode === 'absolute'
                ? 'bg-yellow-500 text-black'
                : 'bg-white/20 text-white hover:bg-white/30',
            ]"
          >
            Absolute
          </button>
          <button
            @click="colorMode = 'relative'"
            :class="[
              'px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold transition-all text-xs md:text-sm',
              colorMode === 'relative'
                ? 'bg-yellow-500 text-black'
                : 'bg-white/20 text-white hover:bg-white/30',
            ]"
          >
            Relative
          </button>
        </div>
        <div class="mt-3 text-center text-green-200 text-sm">
          <span v-if="colorMode === 'absolute'"
            >Win rate: Green (50%+) → Yellow (35-50%) → Red (&lt;35%)</span
          >
          <span v-else
            >Win rate: Green (best) → Yellow (medium) → Red (worst) for
            {{ numPlayers }} players</span
          >
        </div>
      </div>

      <!-- Odds Table -->
      <div
        class="bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-6 shadow-2xl border border-white/20"
      >
        <h2
          class="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4 text-center"
        >
          Pre-Flop Win Rates ({{ numPlayers }} players)
        </h2>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <tbody>
              <tr v-for="(row, i) in oddsTable" :key="i">
                <td
                  v-for="(cell, j) in row"
                  :key="j"
                  @click="selectHandFromTable(cell.hand)"
                  class="border border-white/20 p-2 text-center cursor-pointer hover:scale-105 transition-transform"
                  :style="getCellStyle(cell)"
                >
                  <div class="font-bold text-sm">{{ cell.hand }}</div>
                  <div class="text-xs mt-1 font-semibold">
                    {{ cell.winRate }}%
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 text-center text-green-200 text-sm">
          Click any hand to see detailed statistics
        </div>
      </div>

      <!-- Hand History -->
      <div
        v-if="handHistory.length > 0"
        class="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 shadow-xl border border-white/20"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-white">📊 Session History</h3>
          <button
            @click="clearHistory"
            class="px-3 py-1.5 bg-red-500/30 hover:bg-red-500/50 text-white text-sm rounded-lg transition-colors"
          >
            Clear History
          </button>
        </div>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="(entry, index) in handHistory.slice().reverse()"
            :key="index"
            class="bg-black/30 rounded-lg p-3 text-sm"
          >
            <div class="flex justify-between items-center">
              <span class="text-white font-bold">{{ entry.hand }}</span>
              <span class="text-green-400">{{ entry.winRate }}% win</span>
            </div>
            <div class="text-green-200 text-xs mt-1">
              {{ entry.players }} players • {{ entry.timestamp }}
            </div>
          </div>
        </div>
        <div class="mt-4 p-3 bg-black/40 rounded-lg">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-xl font-bold text-white">
                {{ sessionStats.handsPlayed }}
              </div>
              <div class="text-green-200 text-xs">Hands Analyzed</div>
            </div>
            <div>
              <div class="text-xl font-bold text-green-400">
                {{ sessionStats.avgWinRate }}%
              </div>
              <div class="text-green-200 text-xs">Avg Win Rate</div>
            </div>
            <div>
              <div class="text-xl font-bold text-yellow-400">
                {{ sessionStats.bestHand }}
              </div>
              <div class="text-green-200 text-xs">Best Hand</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div
        class="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20"
      >
        <h3 class="text-xl font-bold text-white mb-3">How to Use</h3>
        <ul class="text-green-200 space-y-2">
          <li>
            • <strong>Adjust players:</strong> Use the slider to set table size
            (2-10 players)
          </li>
          <li>
            • <strong>View table:</strong> The grid shows all 169 possible
            starting hands
          </li>
          <li>
            • <strong>Hand notation:</strong> "s" = suited, "o" = offsuit (e.g.,
            AKs vs AKo)
          </li>
          <li>• <strong>Diagonal:</strong> Pocket pairs (AA, KK, QQ, etc.)</li>
          <li>
            • <strong>Click or type:</strong> Select any hand for detailed Monte
            Carlo simulation
          </li>
          <li>
            • <strong>Keyboard shortcuts:</strong> Press Enter to calculate,
            Escape to clear
          </li>
          <li>
            • <strong>Session tracking:</strong> View your hand history to
            analyze patterns
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  createOddsTable,
  getWinRateColor,
  calculateHandOdds,
  getHandStrength,
} from "../../functions/pokerOddsCalculator.js";

export default {
  name: "PokerOdds",

  setup() {
    const numPlayers = ref(2);
    const selectedHand = ref("");
    const detailedResults = ref(null);
    const handError = ref("");
    const isCalculating = ref(false);
    const colorMode = ref("absolute"); // 'absolute' or 'relative'

    // Hand history tracking
    const handHistory = ref([]);

    // Quick presets
    const quickPresets = [
      { hand: "AA", label: "Pocket Aces" },
      { hand: "KK", label: "Pocket Kings" },
      { hand: "AKs", label: "Big Slick" },
      { hand: "QQ", label: "Ladies" },
      { hand: "JJ", label: "Jacks" },
      { hand: "AQs", label: "Big Chick" },
    ];

    const oddsTable = computed(() => {
      return createOddsTable(numPlayers.value);
    });

    const sessionStats = computed(() => {
      if (handHistory.value.length === 0) {
        return { handsPlayed: 0, avgWinRate: 0, bestHand: "N/A" };
      }
      const avgWinRate =
        handHistory.value.reduce((sum, h) => sum + parseFloat(h.winRate), 0) /
        handHistory.value.length;
      const bestHand = handHistory.value.reduce((best, h) =>
        parseFloat(h.winRate) > parseFloat(best.winRate) ? h : best
      );
      return {
        handsPlayed: handHistory.value.length,
        avgWinRate: avgWinRate.toFixed(1),
        bestHand: bestHand.hand,
      };
    });

    const isValidHand = computed(() => {
      const hand = selectedHand.value.toUpperCase();
      if (hand.length < 2) return false;

      const validRanks = [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "T",
        "J",
        "Q",
        "K",
        "A",
      ];
      const rank1 = hand[0];
      const rank2 = hand[1];

      if (!validRanks.includes(rank1) || !validRanks.includes(rank2))
        return false;

      if (hand.length === 2) return true; // Pair
      if (hand.length === 3 && (hand[2] === "S" || hand[2] === "O"))
        return true;

      return false;
    });

    function handleHandInput() {
      selectedHand.value = selectedHand.value.toUpperCase();
      handError.value = "";

      if (selectedHand.value.length >= 2 && !isValidHand.value) {
        handError.value = "Invalid hand format (use: AKs, QQ, JTo)";
      }
    }

    function getCellStyle(cell) {
      const winRate = parseFloat(cell.winRate);
      let bgColor;

      if (colorMode.value === "relative") {
        // Get relative color based on current player count
        bgColor = getRelativeWinRateColor(winRate, numPlayers.value);
      } else {
        // Use absolute color scaling
        bgColor = getWinRateColor(winRate);
      }

      let alpha = "40";
      if (cell.isPair) {
        alpha = "60";
      } else if (cell.suited) {
        alpha = "50";
      }

      return {
        backgroundColor: bgColor + alpha,
        color: "white",
        fontWeight: cell.isPair ? "bold" : "normal",
        border:
          selectedHand.value.toUpperCase() === cell.hand.toUpperCase()
            ? "3px solid yellow"
            : "1px solid rgba(255,255,255,0.2)",
      };
    }

    function getRelativeWinRateColor(winRate, players) {
      // Get min/max win rates for current player count from the table
      const allRates = oddsTable.value
        .flat()
        .map((cell) => parseFloat(cell.winRate));
      const minRate = Math.min(...allRates);
      const maxRate = Math.max(...allRates);

      // Normalize to 0-1 scale based on current range
      const normalized = (winRate - minRate) / (maxRate - minRate);

      // Map to color gradient: green → yellow → red
      if (normalized >= 0.67) return "#22c55e"; // Green (top third)
      if (normalized >= 0.33) return "#eab308"; // Yellow (middle third)
      return "#ef4444"; // Red (bottom third)
    }

    function selectHandFromTable(hand) {
      selectedHand.value = hand;
      calculateDetailedOdds();
    }

    async function calculateDetailedOdds() {
      if (!isValidHand.value) {
        handError.value = "Please enter a valid hand";
        return;
      }

      isCalculating.value = true;
      handError.value = "";

      try {
        // Run calculation in next tick to allow UI to update
        setTimeout(() => {
          const results = calculateHandOdds(
            selectedHand.value.toUpperCase(),
            numPlayers.value - 1,
            10000 // 10k simulations for accuracy
          );

          if (results) {
            const strength = getHandStrength(
              selectedHand.value.toUpperCase(),
              numPlayers.value
            );

            const handData = {
              hand: selectedHand.value.toUpperCase(),
              winRate: results.winRate.toFixed(1),
              tieRate: results.tieRate.toFixed(1),
              loseRate: results.loseRate.toFixed(1),
              simulations: results.simulations,
              strengthCategory: strength.category,
              strengthColor: strength.color,
              recommendation: strength.recommendation,
            };
            detailedResults.value = handData;

            // Add to history
            addToHistory(handData.hand, handData.winRate, numPlayers.value);
          } else {
            handError.value = "Unable to calculate odds for this hand";
          }

          isCalculating.value = false;
        }, 50);
      } catch (error) {
        console.error("Error calculating odds:", error);
        handError.value = "Error calculating odds";
        isCalculating.value = false;
      }
    }

    // Hand history functions
    function addToHistory(hand, winRate, players) {
      handHistory.value.push({
        hand,
        winRate,
        players,
        timestamp: new Date().toLocaleTimeString(),
      });
      // Keep only last 50 hands
      if (handHistory.value.length > 50) {
        handHistory.value.shift();
      }
    }

    function clearHistory() {
      handHistory.value = [];
    }

    // Quick preset selection
    function selectPreset(hand) {
      selectedHand.value = hand;
      calculateDetailedOdds();
    }

    // Keyboard shortcuts
    function handleKeyboard(event) {
      if (event.key === "Enter" && isValidHand.value) {
        calculateDetailedOdds();
      } else if (event.key === "Escape") {
        selectedHand.value = "";
        detailedResults.value = null;
        handError.value = "";
      }
    }

    onMounted(() => {
      // Auto-calculate for AA as an example
      selectedHand.value = "AA";
      calculateDetailedOdds();

      // Add keyboard listener
      window.addEventListener("keydown", handleKeyboard);
    });

    // Cleanup on unmount
    onUnmounted(() => {
      window.removeEventListener("keydown", handleKeyboard);
    });

    return {
      numPlayers,
      selectedHand,
      detailedResults,
      handError,
      isValidHand,
      isCalculating,
      colorMode,
      oddsTable,
      handHistory,
      sessionStats,
      quickPresets,
      handleHandInput,
      getCellStyle,
      selectHandFromTable,
      calculateDetailedOdds,
      clearHistory,
      selectPreset,
    };
  },
};
</script>

<style scoped>
/* Custom scrollbar for table and history */
.overflow-x-auto::-webkit-scrollbar,
.overflow-y-auto::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Animation for table cells */
table td {
  transition: all 0.2s ease;
}

table td:hover {
  transform: scale(1.05);
  z-index: 10;
}

/* Input styling */
input[type="text"]:focus {
  box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.3);
}
</style>
