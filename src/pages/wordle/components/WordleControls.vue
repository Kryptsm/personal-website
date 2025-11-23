<template>
  <div class="game-controls">
    <!-- Submit Button -->
    <button
      @click="handleSubmit"
      :disabled="!canSubmit"
      class="submit-button"
      :class="{ 'won-button': hasWon }"
    >
      {{ hasWon ? "You Won!" : "Submit" }}
    </button>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button @click="handleReset" class="secondary-button">New Game</button>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  hasWon: Boolean,
  winningWord: String,
  canSubmit: Boolean,
  guessCount: Number,
});

// Emits
const emit = defineEmits(["submit", "reset"]);

// Methods
const handleSubmit = () => {
  emit("submit");
};

const handleReset = () => {
  emit("reset");
};
</script>

<style scoped>
.game-controls {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.submit-button {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.won-button {
  background: linear-gradient(135deg, #22c55e, #16a34a) !important;
  box-shadow: 0 2px 4px rgba(34, 197, 94, 0.2) !important;
}

.action-buttons {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.secondary-button {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-button:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.secondary-button.active {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #3b82f6;
}

/* Celebration Overlay */
.celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: celebrationFadeIn 0.5s ease-out;
}

.celebration-content {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: celebrationBounce 0.6s ease-out;
  max-width: 400px;
  margin: 20px;
}

.celebration-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 15px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.celebration-text {
  font-size: 18px;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.celebration-stats {
  font-size: 16px;
  opacity: 0.9;
}

.celebration-stats p {
  margin: 5px 0;
}

@keyframes celebrationFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes celebrationBounce {
  0% {
    transform: scale(0.3) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.05) rotate(2deg);
  }
  70% {
    transform: scale(0.95) rotate(-1deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .secondary-button {
    width: 200px;
  }

  .celebration-content {
    padding: 30px 20px;
    margin: 20px;
  }

  .celebration-title {
    font-size: 24px;
  }
}
</style>
