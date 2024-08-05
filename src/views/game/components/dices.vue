<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useUtil } from "@/store/index";
import { DiceRenderer } from "@/classes/three/DiceRenderer";

const utilStore = useUtil();
const rollDiceResult = computed(() => utilStore.rollDiceResult);
const isRollDiceAnimationPlay = computed(() => utilStore.isRollDiceAnimationPlay);
const canRoll = computed(() => utilStore.canRoll);

let diceRenderer: DiceRenderer | undefined;

watch(rollDiceResult, (newRollResult) => {
	diceRenderer && diceRenderer.stopRotate(newRollResult)
});

watch(isRollDiceAnimationPlay, (animationPlay) => {
	if (!diceRenderer) return
	if (animationPlay) {
		diceRenderer.startRotate();
	}
})

onMounted(() => {
	const canvasEl = document.getElementById('game_dice_canvas') as HTMLCanvasElement;
	diceRenderer = new DiceRenderer(canvasEl, false, 2, 1.1, false, 2.1);
})

const emit = defineEmits(["roll"]);

const handleRollDice = () => {
	if (canRoll.value) {
		emit("roll");
	}
};
</script>

<template>
	<canvas id="game_dice_canvas" class="dice-button" :disabled="!canRoll" :class="{ 'canroll': canRoll }"
		@click="handleRollDice" />
</template>

<style lang="scss" scoped>
.dice-button {
	width: 16rem !important;
	height: 10rem !important;
	cursor: pointer;
	border-radius: 2rem;
	border: .5rem solid rgba(255, 255, 255, .6);
	background-color: rgba(255, 255, 255, 0.5);
	transition: background-color .15s ease-in-out;

	&.canroll {
		background-color: var(--color-second);
		animation: identifier 1.5s infinite ease-in-out;

		&:hover {
			background-color: var(--color-third);
		}

		@keyframes identifier {
			50% {
				background-color: var(--color-third);
			}
		}
	}
}
</style>
