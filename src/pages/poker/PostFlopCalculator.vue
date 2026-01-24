<template>
  <div
    class="post-flop-calculator min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4 md:p-8"
  >
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-2">
          🎯 Post-Flop Calculator
        </h1>
        <p class="text-green-200 text-lg">
          Calculate your odds and get recommendations for any situation
        </p>
      </div>

      <!-- Back Link -->
      <div class="mb-6 flex items-center justify-between">
        <router-link
          to="/poker"
          class="inline-flex items-center text-green-300 hover:text-yellow-400 transition-colors text-sm md:text-base"
        >
          ← Back to Pre-Flop Odds
        </router-link>
        <div class="text-green-200 text-xs md:text-sm">
          🎯 Real-time calculator for live games
        </div>
      </div>

      <!-- Number of Players -->
      <div
        class="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 mb-6 shadow-2xl border border-white/20"
      >
        <label class="block text-white font-semibold mb-2 text-sm md:text-base">
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

      <!-- Post-Flop Calculator -->
      <div
        class="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 mb-6 shadow-2xl border border-white/20"
      >
        <h2 class="text-xl md:text-2xl font-bold text-white mb-4">
          Your Hand & Community Cards
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <!-- Your Hand -->
          <div>
            <label
              class="block text-white font-semibold mb-2 text-sm md:text-base"
            >
              Your Hand
            </label>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="postFlopHand.card1"
                @input="normalizeCardInput('card1')"
                placeholder="Ah"
                maxlength="3"
                class="px-2 md:px-4 py-2 md:py-3 rounded-lg bg-white/20 text-white placeholder-green-300 border-2 border-white/30 focus:border-yellow-400 focus:outline-none text-base md:text-lg font-bold uppercase text-center"
              />
              <input
                v-model="postFlopHand.card2"
                @input="normalizeCardInput('card2')"
                placeholder="Kh"
                maxlength="3"
                class="px-2 md:px-4 py-2 md:py-3 rounded-lg bg-white/20 text-white placeholder-green-300 border-2 border-white/30 focus:border-yellow-400 focus:outline-none text-base md:text-lg font-bold uppercase text-center"
              />
            </div>
            <p class="text-green-200 text-xs mt-2">
              Format: Rank + Suit (e.g., Ah, Kd, Qc, Js, Th or 10h)
            </p>
          </div>

          <!-- Community Cards -->
          <div>
            <label
              class="block text-white font-semibold mb-2 text-sm md:text-base"
            >
              Community Cards (Flop/Turn/River)
            </label>
            <div class="grid grid-cols-5 gap-1 md:gap-2">
              <input
                v-model="postFlopHand.flop1"
                @input="normalizeCardInput('flop1')"
                placeholder="2h"
                maxlength="3"
                class="px-1 md:px-2 py-2 md:py-3 rounded-lg bg-white/20 text-white placeholder-green-300 border-2 border-white/30 focus:border-yellow-400 focus:outline-none text-xs md:text-sm font-bold uppercase text-center"
              />
              <input
                v-model="postFlopHand.flop2"
                @input="normalizeCardInput('flop2')"
                placeholder="3d"
                maxlength="3"
                class="px-1 md:px-2 py-2 md:py-3 rounded-lg bg-white/20 text-white placeholder-green-300 border-2 border-white/30 focus:border-yellow-400 focus:outline-none text-xs md:text-sm font-bold uppercase text-center"
              />
              <input
                v-model="postFlopHand.flop3"
                @input="normalizeCardInput('flop3')"
                placeholder="4c"
                maxlength="3"
                class="px-1 md:px-2 py-2 md:py-3 rounded-lg bg-white/20 text-white placeholder-green-300 border-2 border-white/30 focus:border-yellow-400 focus:outline-none text-xs md:text-sm font-bold uppercase text-center"
              />
              <input
                v-model="postFlopHand.turn"
                @input="normalizeCardInput('turn')"
                placeholder="5s"
                maxlength="3"
                class="px-1 md:px-2 py-2 md:py-3 rounded-lg bg-white/20 text-white placeholder-green-300 border-2 border-white/30 focus:border-yellow-400 focus:outline-none text-xs md:text-sm font-bold uppercase text-center"
              />
              <input
                v-model="postFlopHand.river"
                @input="normalizeCardInput('river')"
                placeholder="6h"
                maxlength="3"
                class="px-1 md:px-2 py-2 md:py-3 rounded-lg bg-white/20 text-white placeholder-green-300 border-2 border-white/30 focus:border-yellow-400 focus:outline-none text-xs md:text-sm font-bold uppercase text-center"
              />
            </div>
            <p class="text-green-200 text-xs mt-2">
              Leave empty for cards not yet dealt
            </p>
          </div>
        </div>

        <div class="mt-4 flex justify-center">
          <button
            @click="calculatePostFlopOdds"
            :disabled="!isValidPostFlopInput"
            class="px-4 md:px-8 py-2 md:py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-500 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors text-sm md:text-lg w-full md:w-auto"
          >
            Calculate Odds & Get Recommendation
          </button>
        </div>

        <!-- Post-Flop Results -->
        <div
          v-if="postFlopResults"
          class="mt-6 p-4 md:p-6 bg-black/40 rounded-lg border-2"
          :class="postFlopResults.recommendationColor"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <!-- Stats -->
            <div>
              <h3 class="text-xl font-bold text-white mb-4">
                Current Situation
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-green-200">Your Hand:</span>
                  <span class="text-white font-bold text-lg">{{
                    postFlopResults.handName
                  }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-green-200">Win Rate:</span>
                  <span class="text-white font-bold text-2xl"
                    >{{ postFlopResults.winRate }}%</span
                  >
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-green-200">Tie Rate:</span>
                  <span class="text-white font-bold"
                    >{{ postFlopResults.tieRate }}%</span
                  >
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-green-200">Lose Rate:</span>
                  <span class="text-white font-bold"
                    >{{ postFlopResults.loseRate }}%</span
                  >
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-green-200">Opponents:</span>
                  <span class="text-white font-bold">{{ numPlayers - 1 }}</span>
                </div>
              </div>
            </div>

            <!-- Recommendation -->
            <div>
              <h3 class="text-xl font-bold text-white mb-4">Recommendation</h3>
              <div class="bg-black/30 rounded-lg p-4 mb-3">
                <div
                  class="text-3xl font-bold mb-2"
                  :style="{ color: postFlopResults.actionColor }"
                >
                  {{ postFlopResults.action }}
                </div>
                <p class="text-white text-sm leading-relaxed">
                  {{ postFlopResults.reasoning }}
                </p>
              </div>
              <div class="text-green-200 text-xs">
                Based on
                {{ postFlopResults.simulations.toLocaleString() }} simulations
              </div>
            </div>
          </div>
        </div>

        <p v-if="postFlopError" class="text-red-300 text-sm mt-3 text-center">
          {{ postFlopError }}
        </p>
      </div>

      <!-- Pot Odds Calculator -->
      <div
        class="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 mb-6 shadow-2xl border border-white/20"
      >
        <h2 class="text-xl md:text-2xl font-bold text-white mb-4">
          💰 Pot Odds Calculator
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-white font-semibold mb-2 text-sm">
              Current Pot Size ($)
            </label>
            <input
              type="number"
              v-model.number="potOdds.potSize"
              @input="calculatePotOdds"
              placeholder="100"
              class="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-green-300 border-2 border-white/30 focus:border-yellow-400 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-white font-semibold mb-2 text-sm">
              Bet to Call ($)
            </label>
            <input
              type="number"
              v-model.number="potOdds.betToCall"
              @input="calculatePotOdds"
              placeholder="20"
              class="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-green-300 border-2 border-white/30 focus:border-yellow-400 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-white font-semibold mb-2 text-sm">
              Your Win % Needed
            </label>
            <input
              type="number"
              v-model.number="potOdds.winRateNeeded"
              readonly
              class="w-full px-4 py-2 rounded-lg bg-black/40 text-yellow-400 font-bold border-2 border-white/30"
            />
          </div>
        </div>
        <div v-if="potOddsResult" class="mt-4 p-4 rounded-lg" :class="potOddsResult.bgClass">
          <div class="text-white font-bold text-lg mb-2">{{ potOddsResult.decision }}</div>
          <p class="text-white text-sm">{{ potOddsResult.explanation }}</p>
        </div>
      </div>

      <!-- Tips -->
      <div
        class="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20"
      >
        <h3 class="text-xl font-bold text-white mb-3">Quick Tips</h3>
        <ul class="text-green-200 space-y-2">
          <li>• Enter your hole cards and the community cards as they're dealt</li>
          <li>• Calculate after the flop, turn, or river to see your changing odds</li>
          <li>• Use pot odds calculator to determine if a call is profitable</li>
          <li>• Win rate 60%+ = strong position, bet aggressively</li>
          <li>• Win rate 40-60% = marginal, proceed with caution</li>
          <li>• Win rate &lt;40% = usually fold unless pot odds are excellent</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import {
  parseCard,
  calculateWinProbability,
  evaluateHand,
} from "../../functions/pokerHandEvaluator.js";

export default {
  name: "PostFlopCalculator",

  setup() {
    const numPlayers = ref(6);

    // Post-flop calculator state
    const postFlopHand = ref({
      card1: "",
      card2: "",
      flop1: "",
      flop2: "",
      flop3: "",
      turn: "",
      river: "",
    });
    const postFlopResults = ref(null);
    const postFlopError = ref("");

    // Pot odds calculator
    const potOdds = ref({
      potSize: 100,
      betToCall: 20,
      winRateNeeded: 16.7,
    });
    const potOddsResult = ref(null);

    const isValidPostFlopInput = computed(() => {
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
      const validSuits = ["H", "D", "C", "S"];

      function isValidCard(card) {
        if (!card || card.length !== 2) return false;
        return validRanks.includes(card[0]) && validSuits.includes(card[1]);
      }

      // Must have both hole cards
      if (
        !isValidCard(postFlopHand.value.card1) ||
        !isValidCard(postFlopHand.value.card2)
      ) {
        return false;
      }

      // Must have at least the flop (3 cards)
      if (
        !isValidCard(postFlopHand.value.flop1) ||
        !isValidCard(postFlopHand.value.flop2) ||
        !isValidCard(postFlopHand.value.flop3)
      ) {
        return false;
      }

      // Turn and river are optional but must be valid if provided
      if (postFlopHand.value.turn && !isValidCard(postFlopHand.value.turn))
        return false;
      if (postFlopHand.value.river && !isValidCard(postFlopHand.value.river))
        return false;

      return true;
    });

    // Normalize card input (convert 10 to T, uppercase)
    function normalizeCardInput(field) {
      let value = postFlopHand.value[field].toUpperCase();
      // Convert "10" to "T"
      if (value.startsWith('10')) {
        value = 'T' + value.substring(2);
      }
      postFlopHand.value[field] = value;
    }

    function calculatePostFlopOdds() {
      postFlopError.value = "";
      postFlopResults.value = null;

      try {
        // Parse cards
        const holeCards = [
          parseCard(postFlopHand.value.card1),
          parseCard(postFlopHand.value.card2),
        ];

        const communityCards = [
          parseCard(postFlopHand.value.flop1),
          parseCard(postFlopHand.value.flop2),
          parseCard(postFlopHand.value.flop3),
        ];

        if (postFlopHand.value.turn) {
          communityCards.push(parseCard(postFlopHand.value.turn));
        }
        if (postFlopHand.value.river) {
          communityCards.push(parseCard(postFlopHand.value.river));
        }

        // Check for duplicate cards
        const allCards = [...holeCards, ...communityCards];
        const cardStrings = allCards.map((c) => c.display);
        if (new Set(cardStrings).size !== cardStrings.length) {
          postFlopError.value = "Duplicate cards detected!";
          return;
        }

        // Calculate current hand strength
        const currentHand = evaluateHand([...holeCards, ...communityCards]);

        // Run Monte Carlo simulation
        const odds = calculateWinProbability(
          holeCards,
          communityCards,
          numPlayers.value - 1,
          5000 // 5k simulations for speed
        );

        // Generate recommendation
        const recommendation = getRecommendation(
          odds.winRate,
          communityCards.length,
          currentHand.name
        );

        postFlopResults.value = {
          handName: currentHand.name,
          winRate: odds.winRate.toFixed(1),
          tieRate: odds.tieRate.toFixed(1),
          loseRate: odds.loseRate.toFixed(1),
          simulations: odds.simulations,
          action: recommendation.action,
          reasoning: recommendation.reasoning,
          actionColor: recommendation.color,
          recommendationColor: recommendation.borderColor,
        };

        // Recalculate pot odds if they exist
        calculatePotOdds();
      } catch (error) {
        console.error("Error calculating post-flop odds:", error);
        postFlopError.value = "Error calculating odds. Check your card inputs.";
      }
    }

    function getRecommendation(winRate, numCommunityCards, handName) {
      const stage =
        numCommunityCards === 3
          ? "flop"
          : numCommunityCards === 4
          ? "turn"
          : "river";

      // Strong hand (60%+ win rate)
      if (winRate >= 60) {
        return {
          action: "✅ RAISE/BET",
          reasoning: `You have a ${winRate.toFixed(
            1
          )}% chance to win with ${handName}. This is a very strong position - you should bet aggressively or raise to build the pot and pressure opponents.`,
          color: "#22c55e",
          borderColor: "border-green-500",
        };
      }

      // Good hand (50-60% win rate)
      if (winRate >= 50) {
        return {
          action: "✓ CALL/RAISE",
          reasoning: `With a ${winRate.toFixed(
            1
          )}% win rate (${handName}), you're slightly ahead. Call to see the next card, or raise if you want to pressure weaker hands to fold.`,
          color: "#22c55e",
          borderColor: "border-green-400",
        };
      }

      // Marginal hand (35-50% win rate)
      if (winRate >= 35) {
        return {
          action: "⚠️ CALL (if cheap)",
          reasoning: `At ${winRate.toFixed(
            1
          )}% win rate with ${handName}, you're in a marginal position. Call if the bet is small relative to the pot, but fold to large bets. Consider your pot odds.`,
          color: "#eab308",
          borderColor: "border-yellow-500",
        };
      }

      // Weak hand (25-35% win rate)
      if (winRate >= 25) {
        return {
          action: "❌ LIKELY FOLD",
          reasoning: `With only ${winRate.toFixed(
            1
          )}% win rate (${handName}), you're likely behind. Only continue if you have very good pot odds or potential for improvement. Generally fold to any significant betting.`,
          color: "#f97316",
          borderColor: "border-orange-500",
        };
      }

      // Very weak hand (<25% win rate)
      return {
        action: "🚫 FOLD",
        reasoning: `Your ${winRate.toFixed(
          1
        )}% win rate with ${handName} is too weak to continue. You're heavily behind and should fold unless you're getting exceptional pot odds (rare). Save your chips for better spots.`,
        color: "#ef4444",
        borderColor: "border-red-500",
      };
    }

    // Pot odds calculator
    function calculatePotOdds() {
      if (potOdds.value.potSize && potOdds.value.betToCall) {
        const totalPot = potOdds.value.potSize + potOdds.value.betToCall;
        const winRateNeeded = (potOdds.value.betToCall / totalPot) * 100;
        potOdds.value.winRateNeeded = winRateNeeded.toFixed(1);

        // Compare with current hand if available
        if (postFlopResults.value) {
          const currentWinRate = parseFloat(postFlopResults.value.winRate);
          if (currentWinRate >= winRateNeeded) {
            potOddsResult.value = {
              decision: "✅ CALL - Good Pot Odds",
              explanation: `You need ${winRateNeeded.toFixed(1)}% to break even, and you have ${currentWinRate}% win rate. This is a profitable call.`,
              bgClass: "bg-green-500/30",
            };
          } else {
            potOddsResult.value = {
              decision: "❌ FOLD - Bad Pot Odds",
              explanation: `You need ${winRateNeeded.toFixed(1)}% to break even, but only have ${currentWinRate}% win rate. This call loses money long-term.`,
              bgClass: "bg-red-500/30",
            };
          }
        } else {
          potOddsResult.value = {
            decision: "ℹ️ Calculate Your Hand First",
            explanation: `You need ${winRateNeeded.toFixed(1)}% win rate to profitably call. Use the calculator above to see if you have the odds.`,
            bgClass: "bg-blue-500/30",
          };
        }
      }
    }

    return {
      numPlayers,
      postFlopHand,
      postFlopResults,
      postFlopError,
      isValidPostFlopInput,
      potOdds,
      potOddsResult,
      normalizeCardInput,
      calculatePostFlopOdds,
      calculatePotOdds,
    };
  },
};
</script>

<style scoped>
/* Input styling */
input[type="text"]:focus,
input[type="number"]:focus {
  box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.3);
}
</style>
