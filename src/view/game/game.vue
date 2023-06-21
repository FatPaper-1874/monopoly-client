<script setup lang="ts">
import { onMounted, computed, onUnmounted, ref, onBeforeMount, onBeforeUnmount } from "vue";
import { ThreeBuilder } from "../../utils/three/three-builder";
import { useLoading, useMapData, useRoomInfo, useGameInfo, useUtil } from "../../store/index";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import router from "../../router/index";
import { GameSocketClient } from "../../utils/websocket/fp-ws-client";
import Dice from "./components/dice.vue";
import PlayerCard from "./components/player-card.vue";
import ChanceCardContainer from "./components/chance-card-container.vue";
import CountdownTimer from "./components/countdown-timer.vue";
import scoreboard from "./components/scoreboard.vue";

//pinia仓库
const gameInfoStore = useGameInfo();
const utilStore = useUtil();

const windowWidth = computed(() => window.innerWidth);
const windowHeight = computed(() => window.innerHeight);

let socketClient: GameSocketClient;
let threeBuilder: ThreeBuilder;
const islockingCamera = ref(true);
const lockCameraIcon = computed(() => (islockingCamera.value ? "fa-video" : "fa-video-slash"));

//动态数据部分
const _currentRound = computed(() => gameInfoStore.currentRound);
const _currentMultiplier = computed(() => gameInfoStore.currentMultiplier);
const _isMyTurn = computed(() => gameInfoStore.isMyTurn);
const _playersList = computed(() => gameInfoStore.playersList);
const _propertiesList = computed(() => gameInfoStore.propertiesList);

const diceDisable = computed(() => !utilStore.canRoll);

const handleToggleLockCamera = () => {
	islockingCamera.value = threeBuilder.toggleLockCamera();
};

const handleRollDice = () => {
	if (socketClient) {
		socketClient.rollDice();
	}
};

onMounted(async () => {
	socketClient = GameSocketClient.getInstance();
	const mapDataStore = useMapData();
	if (mapDataStore.mapItemsList.length === 0) router.replace("room");
	const loadingStore = useLoading();
	loadingStore.text = "加载模型中...";

	const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
	const container = document.getElementsByClassName("game-page")[0] as HTMLDivElement;
	threeBuilder = new ThreeBuilder(canvas, container);
	await threeBuilder.init();
	loadingStore.loading = false;
});

onBeforeMount(() => {
	if (!useRoomInfo().roomId) {
		router.replace({ name: "room-list" });
		return;
	}
});

onBeforeUnmount(() => {
	if (threeBuilder) threeBuilder.distory();
});
</script>

<template>
	<div class="game-page">
		<canvas id="game-canvas" :width="windowWidth" :height="windowHeight"></canvas>
		<div class="ui-container">
			<div class="game-info">
				<span class="round">第{{ _currentRound }}回合</span>
				<span class="multiplier">当前倍率：{{ _currentMultiplier }}倍</span>
			</div>

			<div class="tool-bar">
				<button class="border-button lock-camera" @click="handleToggleLockCamera">
					<FontAwesomeIcon :icon="lockCameraIcon" />
				</button>
			</div>

			<div class="player-container">
				<PlayerCard v-for="player in _playersList" :key="player.id" :player="player"></PlayerCard>
			</div>

			<div class="chance-card-container">
				<ChanceCardContainer />
			</div>

			<div class="dice">
				<dice :disable="diceDisable" class="border-button roll-dice" @click="handleRollDice"> </dice>
			</div>
		</div>

		<div class="countdown-timer">
			<CountdownTimer />
		</div>

		<scoreboard />
	</div>
</template>

<style lang="scss" scoped>
.game-page {
	position: relative;
	width: 100%;
	height: 100%;
	background-color: #ffffff;
}
.border-button {
	border-style: solid;
	border-color: rgba($color: #ffffff, $alpha: 0.5);
	border-radius: 0.8rem;

	&.lock-camera {
		border-width: 0.25rem;
		font-size: 1.2em;
		width: 4rem;
		height: 4rem;
	}

	&.roll-dice {
		border-width: 0.2rem;
		font-size: 2rem;
		width: 8rem;
		height: 8rem;
	}
}
.game-info {
	position: absolute;
	left: 0;
	top: 0;
	color: var(--color-text-white);
	background-color: var(--color-second);
	text-shadow: var(--text-shadow);
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 10px;
	border: 6px solid rgba($color: #ffffff, $alpha: 0.5);
	border-top: 0;
	border-left: 0;
	border-radius: 0 0 10px 0;

	& > .round {
		font-size: 2rem;
		margin-right: 2rem;
	}
	& > .multiplier {
		font-size: 1.3rem;
	}
}

.countdown-timer {
	position: absolute;
	top: 15%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 5000;
}

.tool-bar {
	position: absolute;
	right: 0;
	top: 0;
	display: flex;
	justify-content: space-between;
	pointer-events: none;
}

.player-container {
	position: absolute;
	right: 0;
	top: 50%;
	transform: translate(0, -65%);
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	padding-right: 0.4rem;
}

.dice {
	position: absolute;
	right: 0.4rem;
	bottom: 0.4rem;
}

.ui-container,
#game-canvas {
	position: absolute;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
}

#game-canvas {
	z-index: 500;
	display: block;
}

.ui-container {
	z-index: 1000;
	pointer-events: none;

	& > div {
		pointer-events: none;
	}

	& * {
		pointer-events: initial;
	}
}
</style>
