<script setup lang="ts">
import { useGameInfo } from "../../../store/index";
import { computed } from "vue";
import playerCard from "./player-card.vue";

const isGameOver = computed(() => useGameInfo().isGameOver);
const playerList = computed(() => useGameInfo().playersList.sort((playerA, playerB) => playerB.money - playerA.money));
</script>

<template>
	<transition name="fade">
		<div v-if="isGameOver" class="scoreboard">
			<div class="contianer">
				<div class="title">计分板</div>
				<div class="playerListContainer">
					<div class="playerContianer" v-for="(player, index) in playerList">
            <div class="No">{{ index + 1 }}</div>
            <playerCard :player="player" :round-mark="false" />
          </div>
				</div>
			</div>
		</div>
	</transition>
</template>

<style lang="scss" scoped>
.scoreboard {
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 10000;

	& > span {
		margin-top: 0.8em;
		color: #eeeeee;
	}
}

.contianer {
  width: 30rem;
  height: 60%;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--color-bg-light);
}

.title {
	width: 100%;
	height: 3rem;
	line-height: 3rem;
	font-size: 1.8rem;
	background-color: var(--color-primary);
	color: white;
	padding: 0 10px;
}

.No{
  width: 3rem;
  height: 3rem;
  border-radius: 10px;
  text-align: center;
  line-height: 3rem;
  font-size: 2rem;
  background-color: var(--color-primary);
}

.playerListContainer {
	flex: 1;
	display: flex;
	flex-direction: column;
  align-items: center;
  color: #fff;
}

.playerContianer{
  width: 25rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
	opacity: 0;
}
</style>
