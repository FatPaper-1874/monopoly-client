<script setup lang="ts">
import { useRoomInfo, useUtil } from "../../../store/index";
import { computed } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const roomInfoStore = useRoomInfo();
const utilStore = useUtil();

const _roundTotalTime = roomInfoStore.gameSetting.roundTime;
const _remainingTime = computed(() => utilStore.remainingTime);
const _timeOut = computed(() => utilStore.timeOut);

const _blockWidth = computed(() => `${(_remainingTime.value / _roundTotalTime) * 100}%`);
</script>

<template>
	<div class="countdown-timer">
		<div class="block" :style="{ width: _blockWidth }"></div>
		<div class="text" v-if="!_timeOut">
			<FontAwesomeIcon icon="clock" /><span>剩余时间: {{ _remainingTime }} 秒</span>
		</div>
		<div class="text" v-else><FontAwesomeIcon icon="clock-rotate-left" /><span>等待下一步</span></div>
	</div>
</template>

<style lang="scss" scoped>
.countdown-timer {
	width: 16rem;
	display: flex;
	justify-content: space-around;
	align-items: center;
	font-size: 1.4rem;
	background-color: var(--color-third);
	padding: 1.2rem;
	border-radius: 1rem;
	border: 0.4rem solid rgba(255, 255, 255, 0.5);
	box-sizing: border-box;
	box-shadow: var(--box-shadow);
	overflow: hidden;

	position: relative;

	& > .block {
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		z-index: -1;
		background-color: var(--color-second);
		transition: width 0.3s ease-in-out;
	}

	& > .text {
		color: var(--color-text-white);
		white-space: nowrap;

		& > * {
			margin: 0 0.4rem;
		}
	}
}
</style>
