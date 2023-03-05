<script setup lang="ts">
import { onMounted, computed, onUnmounted, ref } from "vue";
import { ThreeBuilder } from "../utils/three/three-builder";
import { useMap } from "../store/index";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import router from "../router/index";

const windowWidth = computed(() => window.innerWidth);
const windowHeight = computed(() => window.innerHeight);

let threeBuilder: ThreeBuilder;
const islockingCamera = ref(true);
const lockCameraIcon = computed(() => (islockingCamera.value ? "fa-video" : "fa-video-slash"));

onMounted(() => {
	const mapDataStore = useMap();
	if (mapDataStore.mapData.length === 0) router.replace("room");

	const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
	threeBuilder = new ThreeBuilder(canvas);
	threeBuilder.init();
});

onUnmounted(() => {
	threeBuilder.distory();
});

const handleToggleLockCamera = () => {
	islockingCamera.value = threeBuilder.toggleLockCamera();
};
</script>

<template>
	<div class="game-page">
		<canvas id="game-canvas" :width="windowWidth" :height="windowHeight"></canvas>
		<div class="ui-container">
			<div>
				<button @click="handleToggleLockCamera">
					<FontAwesomeIcon :icon="lockCameraIcon" />
				</button>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.game-page {
	position: relative;
	width: 100%;
	height: 100%;
	background-color: #ffffff;
}

.ui-container,
#game-canvas {
	position: absolute;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
}

.ui-container {
	z-index: 1000;
	pointer-events: none;

	& * {
		pointer-events: auto;
	}
}

#game-canvas {
	z-index: 500;
	display: block;
}
</style>
