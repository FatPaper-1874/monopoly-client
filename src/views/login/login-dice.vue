<script setup lang="ts">
import { onMounted, onBeforeMount, watch, onBeforeUnmount } from "vue";
import { LoginCodeRenderer } from "@/utils/three/login-code-renderer";
import { __USERSERVER__ } from "@/global.config";

const props = withDefaults(defineProps<{ img_data: string }>(), {});

let loginCodeRenderer: LoginCodeRenderer | null;
let diceRotate: boolean = true;

watch(
	() => props.img_data,
	(newImgData) => {
		if (!loginCodeRenderer) return;
		if (newImgData) {
			loginCodeRenderer.showImage(`${__USERSERVER__}/static/avatars/${newImgData}`);
		} else {
			loginCodeRenderer.cleanImage();
		}
	}
);

onMounted(() => {
	const canvasEl = document.getElementById("dice-canvas") as HTMLCanvasElement;
	loginCodeRenderer = new LoginCodeRenderer(canvasEl, diceRotate);
});

onBeforeUnmount(() => {
	const canvasEl = document.getElementById("dice-canvas") as HTMLCanvasElement;
	canvasEl.style.width = "0";
	canvasEl.style.height = "0";
	canvasEl.style.display = "none";
	loginCodeRenderer && loginCodeRenderer.clear();
	loginCodeRenderer = null;
});
</script>

<template>
	<canvas id="dice-canvas" class="dice"></canvas>
</template>

<style lang="scss" scoped>
.dice {
	$img_size: 28rem;

	width: $img_size;
	height: $img_size;
	cursor: pointer;
}
</style>
