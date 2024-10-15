<script setup lang="ts">
import { MapItem } from "@/interfaces/game";
import { useGameInfo, useMapData } from "@/store";
import { onMounted, nextTick, computed } from "vue";

const mapDataStore = useMapData();

const props = defineProps<{ highLightList: string[]; selectedId: string }>();
const emits = defineEmits(["update:selectedId"]);

const properties = useGameInfo().propertiesList;
const myInfo = useGameInfo().getMyInfo;

const mapItemsList = computed(() => {
	const mapItemsList = mapDataStore.mapItemsList;
	const minX = Math.min(...mapItemsList.map((item) => item.x));
	const minY = Math.min(...mapItemsList.map((item) => item.y));

	return mapItemsList.map((item) => {
		item.x = item.x - minX;
		item.y = item.y - minY;
		if (item.property) {
			const propertyId = item.property.id;
			const livePropertyInfo = properties.find((p) => p.id === propertyId);
			if (livePropertyInfo) {
				item.property.owner = livePropertyInfo.owner;
			}
		}
		return item;
	});
});

const myCurrentMapItemId = computed(() => {
	if (myInfo) {
		return (
			mapDataStore.mapItemsList.find((item) => item.id === mapDataStore.mapIndexList[myInfo.positionIndex])?.id || null
		);
	} else {
		return null;
	}
});

function handleMapItemClick(mapItem: MapItem) {
	emits("update:selectedId", mapItem.id);
}

onMounted(() => {
	nextTick(initMiniMap);
});

function initMiniMap() {
	const miniMapContainer = document.getElementsByClassName("mini-map-container")[0] as HTMLElement;
	if (!miniMapContainer) return;
	const mapItemsList = mapDataStore.mapItemsList;
	const maxX = Math.max(...mapItemsList.map((item) => item.x));
	const maxY = Math.max(...mapItemsList.map((item) => item.y));

	// 动态设置 CSS Grid 行列数
	miniMapContainer.style.gridTemplateColumns = `repeat(${maxX + 1}, 3rem)`; // 列数为最大 x + 1
	miniMapContainer.style.gridTemplateRows = `repeat(${maxY + 1}, 3rem)`; // 行数为最大 y + 1
}
</script>

<template>
	<div class="mini-map-container">
		<div
			@click="handleMapItemClick(mapItem)"
			:disable="!props.highLightList.includes(mapItem.id)"
			class="map-item"
			:class="{ highlight: props.highLightList.includes(mapItem.id), selected: props.selectedId === mapItem.id }"
			:style="{
				gridRowStart: mapItem.y + 1,
				gridColumnStart: mapItem.x + 1,
				color: mapItem.property ? (mapItem.property.owner ? mapItem.property.owner.color : 'white') : 'white',
				borderColor: mapItem.property ? (mapItem.property.owner ? mapItem.property.owner.color : 'white') : 'white',
			}"
			v-for="mapItem in mapItemsList"
			:key="mapItem.id"
		>
			{{ mapItem.property?.owner?.name[0] }}
			<div
				v-if="myCurrentMapItemId === mapItem.id"
				:style="{ backgroundColor: myInfo ? myInfo.user.color : 'initial' }"
				class="player-block"
			>
				你
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.mini-map-container {
	display: grid;
	padding: 3rem;
	background-color: #3b3b3b;
	border-radius: 0.8rem;
	margin-bottom: 2rem;
	justify-items: center;
	align-items: center;

	$map-item-size: 2.6rem;
	& > .map-item {
		width: $map-item-size;
		height: $map-item-size;
		border-radius: 0.3rem;
		background-color: #707070;
		cursor: pointer;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: center;

		& .player-block {
			$block-size: calc($map-item-size - 0.6rem);
			width: $block-size;
			height: $block-size;
			border-radius: 50%;
			line-height: $block-size;
			text-align: center;
			vertical-align: middle;
		}

		&.highlight {
			background-color: #fff;
			border: 0.3rem solid #fff;
			line-height: $map-item-size;
			text-align: center;
			vertical-align: middle;
			animation: pulse-highlight 0.6s infinite alternate;

			@keyframes pulse-highlight {
					0% {
						transform: scale(1);
						opacity: 0.8;
					}
					100% {
						transform: scale(1.03);
						opacity: 1;
					}
				}
		}

		&.selected {
			position: relative;
			&::after {
				content: "";
				position: absolute;
				width: $map-item-size;
				height: $map-item-size;
				border: 0.3rem solid var(--color-primary);
				border-radius: 0.6rem;
				animation: pulse-selected 0.6s infinite alternate;
				z-index: 999;
				@keyframes pulse-selected {
					0% {
						transform: scale(1);
						opacity: 0.8;
					}
					100% {
						transform: scale(1.1);
						opacity: 1;
					}
				}
			}
		}

		&[disable="true"] {
			user-select: none;
			pointer-events: none;
			cursor: not-allowed;
		}
	}
}
</style>
