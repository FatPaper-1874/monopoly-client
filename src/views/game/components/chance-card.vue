<script setup lang="ts">
import { computed, watch } from "vue";
import { ChanceCardInfo } from "@/interfaces/game";
import { __PROTOCOL__ } from "@G/global.config";

const props = defineProps<{ chanceCard: ChanceCardInfo; disable: boolean }>();

const iconUrl = computed(() => {
	return props.chanceCard.icon.includes("http") ? props.chanceCard.icon : `${__PROTOCOL__}://${props.chanceCard.icon}`;
});
</script>

<template>
	<div
		v-chanceCardSource="chanceCard"
		class="chance-card"
		:class="{ disable }"
		:style="{ border: `0.4em solid ${chanceCard.color}` }"
	>
		<div class="icon" v-if="chanceCard.icon"><img :src="iconUrl" alt="" /></div>
		<div class="name" :style="{ color: chanceCard.color }">{{ chanceCard.name }}</div>
		<div class="describe" :style="{ color: chanceCard.color }">{{ chanceCard.describe }}</div>
	</div>
</template>

<style lang="scss" scoped>
.chance-card {
	min-width: 9rem;
	min-height: 12rem;
	width: 9rem;
	height: 12rem;
	font-size: 0.8rem;
	background-color: #ffffff;
	box-sizing: border-box;
	border-radius: 20px;
	box-shadow: 0 0 12px rgba(0, 0, 0, 0.12);
	user-select: none;
	display: flex;
	justify-content: center;
	flex-direction: column;
	align-items: center;
	overflow: hidden;
	transition: 0.3s;

	&.disable {
		filter: grayscale(1);
		pointer-events: none;
		cursor: not-allowed;
	}

	& > .icon {
		margin-bottom: 0.6em;

		& > img {
			$img-size: 4.4em;
			width: $img-size;
			height: $img-size;
			pointer-events: none;
			user-select: none;
		}
	}

	& > .name {
		font-size: 1.3em;
		font-weight: 700;
		margin-bottom: 0.8em;
	}

	& > .describe {
		width: 80%;
		font-weight: 700;
		font-size: 0.75em;
		margin-bottom: 1em;
		word-wrap: break-word;
		overflow-y: scroll;
		text-align: center;

		&::-webkit-scrollbar {
			display: none;
		}
	}
}
</style>
