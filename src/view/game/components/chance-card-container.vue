<script setup lang="ts">
import { FPMessageBox } from "@/components/utils/fp-message-box";
import { useGameInfo, useUserInfo } from "@/store/index";
import { computed, createVNode, provide, ref, watch, toRaw } from "vue";
import { ChanceCardInfo } from "@/interfaces/bace";
import ChanceCard from "./chance-card.vue";
import UseChanceCard from "./use-chance-card.vue";
import { GameSocketClient } from "../../../utils/websocket/fp-ws-client";
import FpDialog from "@/components/utils/fp-dialog/fp-dialog.vue";
import { ChanceCardType } from "@/enums/game";
import { useUtil } from "../../../store/index";

const gameInfoStore = useGameInfo();
const userInfoStore = useUserInfo();
const utilStore = useUtil();

const socketClient = GameSocketClient.getInstance();

const _chanceCardsList = computed(() => {
	const player = gameInfoStore.playersList.find((player) => player.id === userInfoStore.userId);
	if (player) {
		return player.chanceCards;
	} else {
		return [];
	}
});

const _useChanceCardVisible = ref<boolean>(false);
const _currentChanceCard = ref<ChanceCardInfo | null>(null);

const _selectedId = ref<string | string[]>("");
const _canUseChanceCard = computed(() => utilStore.canRoll);

const handleChangeCardClick = (card: ChanceCardInfo) => {
	if (_canUseChanceCard.value) {
		_useChanceCardVisible.value = true;
		_currentChanceCard.value = card;
	}
};

const handleUseChanceCard = () => {
	if (_currentChanceCard.value) {
		const targetId = toRaw(_selectedId.value);
		console.log(targetId);
		console.log(_currentChanceCard.value);

		socketClient.useChanceCard(_currentChanceCard.value.id, targetId);
	}
};

const handleCancleChanceCard = () => {
	_currentChanceCard.value = null;
};

const _dialogSubmitBtnDisable = computed(() => {
	if (_currentChanceCard.value) {
		switch (_currentChanceCard.value.type) {
			case ChanceCardType.ToSelf:
				return false;
			default:
				if (_selectedId.value) return false;
				else return true;
		}
	}
});

watch(
	() => utilStore.timeOut,
	(newVal) => {
		if (newVal) {
			_selectedId.value = "";
			_currentChanceCard.value = null;
			_useChanceCardVisible.value = false;
		}
	}
);

provide("selectedId", _selectedId);
</script>

<template>
	<div class="chance-card-container-vue">
		<div class="bg"></div>
		<div class="container" :class="{ disable: !_canUseChanceCard }">
			<ChanceCard
				@click="handleChangeCardClick(card)"
				v-for="card in _chanceCardsList"
				:key="card.id"
				:id="card.id"
				:name="card.name"
				:describe="card.describe"
				:icon="card.icon"
				:color="card.color"
			/>
		</div>
	</div>
	<FpDialog
		@cancel="handleCancleChanceCard"
		@submit="handleUseChanceCard"
		v-model:visible="_useChanceCardVisible"
		:sumbit-disable="_dialogSubmitBtnDisable"
	>
		<template #title>使用道具卡</template>
		<template #default>
			<UseChanceCard :chance-card="_currentChanceCard" />
		</template>
	</FpDialog>
</template>

<style lang="scss" scoped>
.chance-card-container-vue {
	position: absolute;
	left: 50%;
	bottom: 0;
	transform: translateX(-50%);

	& > .container {
		min-width: 50rem;
		display: grid;
		grid-template-columns: repeat(5, 20%);
		justify-items: center;
		padding: 0.8rem;

		background-position: 0 -50%;
		pointer-events: none;

		& > div {
			pointer-events: initial;
		}

		&.disable {
			filter: grayscale(1);
		}
	}
	& > .bg {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 45%;
		background-color: var(--color-second);
		border: 0.2rem solid rgba(255, 255, 255, 0.5);
		border-radius: 0.8rem 0.8rem 0 0;
		z-index: -1;
		backdrop-filter: blur(2px);
		pointer-events: none;
	}
}
</style>
