<script setup lang="ts">
import { useGameInfo, useUserInfo } from "@/store";
import { computed, provide, ref, watch, toRaw } from "vue";
import { ChanceCardInfo } from "@/interfaces/game";
import ChanceCard from "./chance-card.vue";
import { useUtil } from "@/store";

const gameInfoStore = useGameInfo();
const userInfoStore = useUserInfo();
const utilStore = useUtil();

const _chanceCardsList = computed(() => {
	const player = gameInfoStore.playersList.find((player) => player.id === userInfoStore.userId);
	if (player) {
		return player.chanceCards;
	} else {
		return [];
	}
});

const _canUseChanceCard = computed(() => utilStore.canUseCard);
</script>

<template>
	<div class="chance-card-container-vue" :style="{ '--num': _chanceCardsList.length }">
		<div class="bg"></div>
		<TransitionGroup name="card">
			<ChanceCard
				class="chance-card-item"
				v-for="card in _chanceCardsList"
				:key="card.id"
				:chance-card="card"
				:disable="!_canUseChanceCard"
			/>
		</TransitionGroup>
	</div>
</template>

<style lang="scss" scoped>
.card-enter-active,
.card-leave-active {
	transition: all 0.5s ease;
}

.card-enter-from,
.card-leave-to {
	opacity: 0;
	transform: translateY(-50rem);
}

.chance-card-container-vue {
	width: 10rem;
	height: 12rem;
	display: flex;
	justify-content: space-around;
	padding: 0.8rem;
	position: relative;

	$n: 5;
	@for $i from 1 through $n {
		$r: calc(($i - ($n / 2 + 1)) * 6deg);
		.chance-card-item:nth-child(#{$i}) {
			transform: rotate($r);

			&:hover {
				transform: translateY(-1rem) rotate($r);
			}
		}
	}

	.chance-card-item {
		position: absolute;
		transform-origin: center 90rem;
	}

	//& > .bg {
	//  position: absolute;
	//  left: 0;
	//  bottom: 0;
	//  width: 100%;
	//  height: 30%;
	//  background-color: var(--color-second);
	//  border: 0.4rem solid rgba(255, 255, 255, 0.5);
	//  border-radius: 0.8rem 0.8rem 0 0;
	//  border-bottom: 0;
	//  z-index: -1;
	//  backdrop-filter: blur(2px);
	//  pointer-events: none;
	//}
}
</style>
