<script setup lang="ts">
import FpDialog from "@/components/utils/fp-dialog/fp-dialog.vue";
import { ChanceCardInfo } from "@/interfaces/game";
import { useGameInfo, useMapData } from "@/store";
import { computed, nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from "vue";
import ChanceCard from "@/views/game/components/chance-card.vue";
import PlayerCard from "@/views/game/components/player-card.vue";
import { generateSvgArrows } from "@/utils";

const mapDataStore = useMapData();
const gameInfoStore = useGameInfo();

const props = defineProps<{ chanceCard: ChanceCardInfo }>();
const emit = defineEmits<{ (e: "useCard", targetId: string): void; (e: "cancel"): void }>();

const myPlayer = computed(() => {
	return gameInfoStore.getMyInfo;
});
const myId = computed(() => (myPlayer.value ? myPlayer.value.id : ""));

let svg: SVGSVGElement | null = null;
let setPath: ((startX: number, startY: number, endX: number, endY: number) => void) | null = null;

const containerEl = ref<HTMLElement | null>(null);

onMounted(() => {
	const { svg, setPath } = generateSvgArrows(props.chanceCard.color);
	if (containerEl.value) containerEl.value.appendChild(svg);

	nextTick(() => {
		const chanceCardEl = document.getElementById("chance-card") as HTMLElement;
		console.log("🚀 ~ onMounted ~ chanceCardEl:", chanceCardEl);
		const targetEl = document.getElementById("player-" + myId.value) as HTMLElement;
		console.log("🚀 ~ onMounted ~ targetEl:", targetEl);

		if (chanceCardEl && targetEl) {
			const chanceCardElRect = chanceCardEl.getBoundingClientRect();
			const startX = chanceCardElRect.right; // 中心的X坐标
			const startY = chanceCardElRect.top + chanceCardElRect.height / 2; // 中心的Y坐标

			const targetElRect = targetEl.getBoundingClientRect();
			const endX = targetElRect.left; // 左边缘的X坐标
			const endY = targetElRect.top + targetElRect.height / 2; // 左边缘中心的Y坐标

			setPath && setPath(startX, startY, endX, endY);
		}
	});
});

onBeforeUnmount(() => {
	if (containerEl.value && svg) containerEl.value.removeChild(svg);
});

function handleTargetSelected() {
	if (myId.value !== "") emit("useCard", myId.value);
	else emit("cancel");
}

function handleCancel() {
	emit("cancel");
}
</script>

<template>
	<FpDialog visible @submit="handleTargetSelected" @cancel="handleCancel">
		<template #title> 使用机会卡: {{ chanceCard.name }} </template>
		<div ref="containerEl" class="target-selector-container">
			<div class="chance-card-container">
				<ChanceCard id="chance-card" :chance-card="chanceCard" :disable="false" />
			</div>
			<div class="target-container">
				<div class="tips">要对自己使用这张机会卡吗</div>
				<div class="target-list">
					<PlayerCard v-if="myPlayer" :id="'player-' + myPlayer.id" :player="myPlayer" :round-mark="true" />
				</div>
			</div>
		</div>
	</FpDialog>
</template>

<style lang="scss" scoped>
.target-selector-container {
	display: flex;
	justify-content: space-between;

	& > .chance-card-container {
		padding: 4rem 7rem 4rem 5rem;

		& > #chance-card {
			scale: 1.2;
		}
	}

	& > .target-container {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		margin-right: 4rem;

		& > .tips {
			color: var(--color-primary);
			text-align: center;
			margin-bottom: 1rem;
		}

		& > .target-list {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 1rem;
			margin-bottom: 2rem;

			& > div {
				box-shadow: var(--box-shadow);
			}
		}
	}
}
</style>
