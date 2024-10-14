<script setup lang="ts">
import { useGameInfo } from "@/store";
import { computed, ref } from "vue";
import PlayerCard from "./player-card.vue";
import { PlayerInfo } from "@/interfaces/game";
import FpDialog from "@/components/utils/fp-dialog/fp-dialog.vue";
import PlayerDetail from "./player-detail.vue";

const gameInfoStore = useGameInfo();
const _playersList = computed(() => gameInfoStore.playersList);
const playerDetailVisiable = ref(false);
const currentPlayer = ref<PlayerInfo | null>(null);
const roundTurnPlayerId = computed(() => gameInfoStore.currentPlayerIdInRound);
function handleShowPlayerDetail(player: PlayerInfo) {
	currentPlayer.value = player;
	playerDetailVisiable.value = true;
}
</script>

<template>
	<FpDialog :style="'width: 70%; height: 70%;'" v-model:visible="playerDetailVisiable">
		<template #title>
			<div class="title">{{ currentPlayer?.user.username }}的底细</div>
		</template>

		<PlayerDetail #default v-if="currentPlayer" :player="currentPlayer" />
	</FpDialog>

	<div class="player-container">
		<div class="tips">点击玩家卡片查看底细</div>
		<PlayerCard
			@click="handleShowPlayerDetail(player)"
			v-for="player in _playersList"
			:key="player.id"
			:player="player"
			:round-mark="player.id === roundTurnPlayerId"
		></PlayerCard>
	</div>
</template>

<style lang="scss" scoped>
.player-container {
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;

	& > .tips {
		width: 100%;
		background-color: rgba(255, 255, 255, 0.75);
		padding: 0.3rem;
		border-radius: 0.5rem;
		color: var(--color-primary);
		padding: 0.3rem 0.6rem;
		box-sizing: border-box;
		text-shadow: var(--text-shadow-surround-white);
		margin-bottom: 0.3rem;
	}
}
</style>
