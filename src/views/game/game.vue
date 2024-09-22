<script setup lang="ts">
import { onMounted, computed, onUnmounted, ref, onBeforeMount, onBeforeUnmount } from "vue";
import { GameRenderer } from "@/classes/game/GameRenderer";
import { useLoading, useMapData, useRoomInfo, useGameInfo, useUtil } from "@/store";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import router from "@/router/index";
import { MonopolyClient, useMonopolyClient } from "@/classes/monopoly-client/MonopolyClient";
import Dices from "./components/dices.vue";
import ChanceCardContainer from "./components/chance-card-container.vue";
import CountdownTimer from "./components/countdown-timer.vue";
import scoreboard from "./components/scoreboard.vue";
import GameInfo from "@/views/game/components/game-info.vue";
import ProgressBar from "@/views/game/components/progress-bar.vue";

//pinia仓库
const gameInfoStore = useGameInfo();
const utilStore = useUtil();

const windowWidth = computed(() => window.innerWidth);
const windowHeight = computed(() => window.innerHeight);

let socketClient: MonopolyClient;
let gameRenderer: GameRenderer;
const islockingCamera = ref(true);
const lockCameraIcon = computed(() => (islockingCamera.value ? "fa-video" : "fa-video-slash"));

//动态数据部分
const _isMyTurn = computed(() => gameInfoStore.isMyTurn);
const _propertiesList = computed(() => gameInfoStore.propertiesList);

function handleToggleLockCamera() {
	islockingCamera.value = gameRenderer.toggleLockCamera();
}

function handleRollDice() {
	if (socketClient) {
		socketClient.rollDice();
	}
}

onMounted(async () => {
	try {
		socketClient = useMonopolyClient();
		const mapDataStore = useMapData();
		if (mapDataStore.mapItemsList.length === 0) router.replace("room");
		useLoading().showLoading("加载数据中...");

		const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
		const container = document.getElementsByClassName("game-page")[0] as HTMLDivElement;
		gameRenderer = new GameRenderer(canvas, container);
		await gameRenderer.init();
		useLoading().showLoading("数据加载完成，等待其他玩家加载...");
		socketClient.gameInitFinished();
	} catch (e: any) {
		router.replace({ name: "room-router" });
	}
});

onBeforeUnmount(() => {
	if (gameRenderer) gameRenderer.destroy();
});
</script>

<template>
	<div class="game-page">
		<canvas id="game-canvas" :width="windowWidth" :height="windowHeight"></canvas>
		<div class="ui-container">
			<div class="progress-bar ui-item">
				<ProgressBar />
			</div>

			<div class="game-info ui-item">
				<GameInfo />
			</div>

			<div class="tool-bar">
				<button class="border-button lock-camera" @click="handleToggleLockCamera">
					<FontAwesomeIcon :icon="lockCameraIcon" />
				</button>
			</div>

			<div class="chance-card-container">
				<ChanceCardContainer />
			</div>

			<div class="dice">
				<Dices @click="handleRollDice"></Dices>
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

.progress-bar {
	position: absolute;
	left: 0;
	top: 50%;
	transform: translateY(-50%);
}

.game-info {
	top: 0;
	right: 0;
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
	display: none;
	justify-content: space-between;
	pointer-events: none;
}

.chance-card-container {
	position: absolute;
	left: 50%;
	bottom: 0;
	transform: translateX(-50%);
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

	// &>div {
	// 	pointer-events: none;
	// }

	.ui-item {
		position: absolute;
	}

	& * {
		pointer-events: initial;
	}
}
</style>
