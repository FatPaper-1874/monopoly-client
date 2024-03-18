<script setup lang="ts">
import { findIconDefinition, IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";
import { ChanceCardInfo } from '@/interfaces/bace';

const props = defineProps<{ chanceCard: ChanceCardInfo, disable: boolean }>();
const chanceCard = props.chanceCard;

const legalIconName = computed(() => {
	if (findIconDefinition({ prefix: "fas", iconName: chanceCard.icon as IconName })) {
		return chanceCard.icon;
	} else {
		return "circle-question";
	}
});
</script>

<template>
	<div v-chanceCardSource="chanceCard" class="chance-card" :style="{ border: `0.4em solid ${chanceCard.color}` }"
		:class="{ disable }">
		<div class="icon" :style="{ 'color': chanceCard.color }">
			<FontAwesomeIcon :icon="['fas', legalIconName]"></FontAwesomeIcon>
		</div>
		<div class="name" :style="{ 'color': chanceCard.color }">{{ chanceCard.name }}</div>
		<div class="describe" :style="{ 'color': chanceCard.color }">{{ chanceCard.describe }}</div>
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
	box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
	user-select: none;
	display: flex;
	flex-direction: column;
	align-items: center;
	overflow: hidden;
	transition: .3s;
	cursor: pointer;

	&.disable {
		filter: grayscale(1);
		pointer-events: none;
		cursor: not-allowed;
	}

	&>.icon {
		font-size: 3.4em;
		margin-top: 0.4em;
		margin-bottom: 0.3em;
	}

	&>.name {
		font-size: 1.6em;
		margin-bottom: 0.7em;
	}

	&>.describe {
		width: 80%;
		font-size: 1em;
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
