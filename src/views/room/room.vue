<script setup lang="ts">
import MapPreviewer from "@/views/room/components/map-previewer/index.vue";
import roomUserCard from "@/views/room/components/room-user-card.vue";
import FpDialog from "@/components/utils/fp-dialog/fp-dialog.vue";
import FPMessage from "@/components/utils/fp-message";
import ItemSelector from "@/components/utils/item-selector/item-selector.vue";
import { GameSetting } from "@/interfaces/bace";
import router from "@/router";
import { useLoading, useRoomInfo } from "@/store";
import { useUserInfo } from "@/store";
import { getMapsList } from "@/utils/api/map";
import { GameMap } from "@/interfaces/game";
import { MapPreviewerRenderer } from "@/views/room/utils/MapPreviewerRenderer";
import { GameSocketClient } from "@/utils/websocket/fp-ws-client";
import { computed, onBeforeMount, onBeforeUnmount, onMounted, reactive, ref, toRaw, watch } from "vue";

const roomInfoStore = useRoomInfo();
const userInfoStore = useUserInfo();

let mapPreview: MapPreviewerRenderer;

const playerList = computed(() => roomInfoStore.userList);
const ownerName = computed(() => roomInfoStore.ownerName);
const ownerId = computed(() => roomInfoStore.ownerId);
const roleList = computed(() => roomInfoStore.roleList);

const isOwner = computed(() => userInfoStore.userId === roomInfoStore.ownerId);
const isReady = computed(() => roomInfoStore.userList.find((user) => user.userId === userInfoStore.userId)?.isReady);

const _mapList = ref<GameMap[]>([]);
const gameSetting = computed(() => roomInfoStore.gameSetting);
const _tempMapSelectedId = ref<string>(gameSetting.value.mapId || "");

const _tempGameSettingFrom = ref<GameSetting>(JSON.parse(JSON.stringify(roomInfoStore.gameSetting)));

const _currentMap = ref<GameMap>();

const mapSelectorVisible = ref(false);

const _selectMapButtonText = computed(() => (_currentMap.value ? _currentMap.value.name : "选择地图"));

const canStart = computed(
	() =>
		!(
			Boolean(gameSetting.value.mapId) &&
			roomInfoStore.userList.every((user) => user.userId === ownerId.value || user.isReady)
		)
);

watch(
	gameSetting,
	async (newGameSetting, oldGameSetting) => {
		const map = _mapList.value.find((_item) => _item.id === newGameSetting.mapId);
		if (map) {
			map;
			_currentMap.value = map;
			await mapPreview.loadModels(map.itemTypes);
			await mapPreview.reloadMapItems(map.mapItems);
		}
		_tempGameSettingFrom.value = JSON.parse(JSON.stringify(roomInfoStore.gameSetting));
	},
	{ deep: true }
);

onBeforeMount(() => {
	if (!useRoomInfo().roomId) {
		router.replace({ name: "room-list" });
		return;
	} else {
		socketClient = GameSocketClient.getInstance();
	}
});

onMounted(async () => {
	const { mapsList } = await getMapsList(1, 1000);
	_mapList.value = mapsList;
	_currentMap.value = _mapList.value.find((_item) => _item.id === gameSetting.value.mapId);
	const threeCanvas = document.getElementById("map-preview__canvas_inroom") as HTMLCanvasElement;
	if (threeCanvas) {
		mapPreview = new MapPreviewerRenderer(threeCanvas);
		if (_currentMap.value) {
			await mapPreview.loadModels(_currentMap.value.itemTypes);
			await mapPreview.loadMapItems(_currentMap.value.mapItems);
		}
		mapPreview.lockCamera(true);
	}
});

onBeforeUnmount(() => {
	if (mapPreview) mapPreview.destroy();
});

let socketClient: GameSocketClient;

const handleLeaveRoom = () => {
	if (socketClient) {
		socketClient.leaveRoom();
	}
};

const handleReadyToggle = () => {
	if (socketClient) {
		socketClient.readyToggle();
	}
};

const handleGameStart = () => {
	if (socketClient) {
		socketClient.startGame();
	}
};

const handleChangeMap = () => {
	if (socketClient) {
		_tempGameSettingFrom.value.mapId = _tempMapSelectedId.value;
		socketClient.changeGameSetting(toRaw(_tempGameSettingFrom.value));
	}
};

const handleUpdateGameSetting = () => {
	if (socketClient) {
		socketClient.changeGameSetting(toRaw(_tempGameSettingFrom.value));
	}
};
</script>

<template>
	<div class="room-page">
		<div class="left-container">
			<div class="room-topbar">
				<button class="leave-room-button" @click="handleLeaveRoom">退出房间</button>
				<span style="flex: 1; text-align: center">{{ ownerName }}的房间</span>
			</div>

			<div class="map-preview-inroom">
				<canvas id="map-preview__canvas_inroom"></canvas>
				<button class="select-map-button" :disabled="!isOwner" @click="mapSelectorVisible = true">
					{{ _selectMapButtonText }}
				</button>
			</div>

			<div class="map-option">
				<div class="options">
					<span class="label">回合时间</span>
					<div>
						<input :disabled="!isOwner" type="number" min="5" max="30" v-model="_tempGameSettingFrom.roundTime" />秒
					</div>
				</div>
				<div class="options">
					<span class="label">初始金钱</span>
					<div>
						<input
							:disabled="!isOwner"
							type="number"
							min="1000"
							step="1000"
							v-model="_tempGameSettingFrom.initMoney"
						/>￥
					</div>
				</div>
				<div class="options">
					<span class="label">倍率涨幅</span>
					<div><input :disabled="!isOwner" type="number" min="0" v-model="_tempGameSettingFrom.multiplier" />倍</div>
				</div>
				<div class="options">
					<span class="label">涨幅频率</span>
					<div>
						<input
							:disabled="!isOwner"
							type="number"
							min="1"
							v-model="_tempGameSettingFrom.multiplierIncreaseRounds"
						/>回合
					</div>
				</div>
				<button v-if="isOwner" class="submit" @click="handleUpdateGameSetting">更新设置</button>
			</div>

			<div class="room-footbar">
				<button v-if="isOwner" :disabled="canStart" class="ready-button" @click="handleGameStart">开始游戏</button>
				<button v-else class="ready-button" @click="handleReadyToggle">
					{{ isReady ? "取消准备" : "准备" }}
				</button>
			</div>
		</div>

		<div class="right-container">
			<div class="player-list-container">
				<roomUserCard v-for="player in playerList" :key="player.userId" :user="player" />
				<roomUserCard v-for="i in 6 - playerList.length" :key="i" :user="undefined" />
			</div>
		</div>
	</div>
	<FpDialog @submit="handleChangeMap" v-model:visible="mapSelectorVisible">
		<template #title>选择地图</template>
		<template #default>
			<ItemSelector
				:column="1"
				:multiple="false"
				:item-list="_mapList"
				key-name="id"
				v-model:selected-key="_tempMapSelectedId"
			>
				<template #item="map">
					<MapPreviewer :map="map" />
				</template>
			</ItemSelector>
		</template>
	</FpDialog>
</template>

<style lang="scss" scoped>
.room-page {
	width: 75vw;
	height: 90%;
	padding: 1.2rem;
	margin: auto;
	box-sizing: border-box;
	display: flex;
	justify-content: space-between;

	& > div {
		height: 100%;
	}

	& > .left-container {
		width: 20rem;
		margin-right: 0.5rem;
		box-sizing: border-box;
		border-radius: 0.6rem;
		background-color: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(3px);
		box-shadow: var(--box-shadow);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
	}

	& > .right-container {
		flex: 1;
		display: flex;
		flex-direction: column;

		& > .player-list-container {
			flex: 1;
			display: grid;
			grid-template-rows: 1fr 1fr;
			grid-template-columns: 1fr 1fr 1fr;
			row-gap: 8px;
			column-gap: 8px;
		}
	}
}

.room-topbar {
	height: 2rem;
	line-height: 2rem;
	width: 100%;
	color: #ffffff;
	margin-bottom: 0.5rem;
	background-color: rgba(255, 255, 255, 0.65);
	backdrop-filter: blur(3px);
	background-color: var(--color-third);
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: var(--box-shadow);
	text-shadow: var(--text-shadow);
	overflow: hidden;

	& > .leave-room-button {
		height: 100%;
		padding: 0 0.7rem;
		font-size: 1rem;
		text-shadow: var(--text-shadow);
	}
}

.map-preview-inroom {
	width: 95%;
	height: 12rem;
	border-radius: 0.6rem;
	border: 0.2rem solid #ffffff;
	background-color: #ffffff;
	position: relative;
	overflow: hidden;

	& > .select-map-info {
		position: absolute;
		left: 0;
		top: 0;

		& > .name {
			width: auto;
			display: inline-block;
			padding: 0.6rem 1rem;
			border-radius: 0 0.3rem 0.3rem 0.3rem;
			background-color: var(--color-second);
			color: var(--color-text-white);
		}
	}

	& > .select-map-button {
		position: absolute;
		right: 0;
		bottom: 0;
		border: 0;
		font-size: 0.8rem;
		padding: 0.6rem 1.2rem;
		border-radius: 0.6rem;
	}

	& > #map-preview__canvas_inroom {
		display: block;
		border-radius: 0.6rem;
		width: 100%;
		height: 100%;
	}
}

.map-option {
	width: 95%;
	flex: 1;

	& > .options {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0.2rem 0;
		color: var(--color-text-primary);
		padding: 0 0.5rem;

		& > span {
			width: 5rem;
		}

		& > div {
			display: flex;
			align-items: center;
			justify-content: space-between;
			flex: 1;

			& > input {
				width: 6rem;
				flex: 1;
				color: var(--color-text-primary);
				margin-right: 0.5rem;
			}
		}
	}

	& > .submit {
		float: right;
		font-size: 0.8rem;
		padding: 0.5rem;
		margin-top: 0.1rem;
		border-radius: 0.6rem;
	}
}

.room-footbar {
	height: 2.3rem;
	line-height: 2.3rem;
	width: 100%;
	color: #ffffff;
	background-color: rgba(255, 255, 255, 0.65);
	backdrop-filter: blur(3px);
	background-color: var(--color-third);
	display: flex;
	justify-content: space-between;
	align-items: center;
	text-shadow: var(--text-shadow);
	overflow: hidden;

	& > .ready-button {
		width: 100%;
		height: 100%;
		padding: 0 0.7rem;
		border: 0;
		font-size: 1.2rem;
		text-shadow: var(--text-shadow);
	}
}
</style>
