<script setup lang="ts">
import {computed} from "vue";
import {useGameInfo} from "@/store";
import PlayerCard from "@/views/game/components/player-card.vue";

const gameInfoStore = useGameInfo();

const _currentRound = computed(() => gameInfoStore.currentRound);
const _currentMultiplier = computed(() => gameInfoStore.currentMultiplier);
const _playersList = computed(() => gameInfoStore.playersList);
</script>

<template>
  <div class="game-info">
    <div class="round-info">
      <span class="round">第{{ _currentRound }}回合</span>
      <span class="multiplier">当前倍率：{{ _currentMultiplier }}倍</span>
    </div>

    <div class="player-container">
      <PlayerCard v-for="player in _playersList" :key="player.id" :player="player" :round-mark="false"></PlayerCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
.game-info {
  display: flex;
  justify-content: space-around;
  align-items: end;
  flex-direction: column;

  & > .round-info {
    color: var(--color-text-white);
    background-color: var(--color-second);
    text-shadow: var(--text-shadow);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: .7rem;
    border: .4rem solid rgba($color: #ffffff, $alpha: 0.5);
    border-top: 0;
    border-right: 0;
    border-radius: 0 0 0 1rem;

    & > .round {
      font-size: 2rem;
      margin-right: 2rem;
    }

    & > .multiplier {
      font-size: 1.3rem;
    }
  }

  & > .player-container {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    padding: 0.3rem 0.3rem 0 0;
  }
}

</style>