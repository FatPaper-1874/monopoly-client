<script setup lang="ts">
import { onBeforeMount, onMounted, computed, ref, onUpdated } from "vue";
import { useUserInfo, useUserList, useRoomList, useRoomInfo, useLoading } from "@/store";
import { GameSocketClient } from "@/utils/websocket/fp-ws-client";
import userCard from "@/components/common/user-card.vue";
import userListItem from "@/components/common/user-list-item.vue";
import roomListItem from "@/components/common/room-list-item.vue";
import router from "@/router";

const userInfoStore = useUserInfo();
const userListStore = useUserList();
const roomListStroe = useRoomList();
let socketClient: GameSocketClient;

onBeforeMount(async () => {
	const loadingStore = useLoading();
	loadingStore.loading = true;
	loadingStore.text = "连接WebSocket服务器中";

	const token = localStorage.getItem("token");
	if (!token || !userInfoStore.userId) {
		router.replace({ name: "login" });
	} else {
		socketClient = GameSocketClient.getInstance(token);
	}
	if (useRoomInfo().roomId) {
		router.replace({ name: "room" });
	}
	loadingStore.loading = false;
});

const user = computed(() => userInfoStore);

const userList = computed(() => userListStore.userList);
const roomList = computed(() => roomListStroe.roomList);

const handleCreateRoom = () => {
	if (socketClient) {
		socketClient.joinRoom("");
	}
};

const handleJoinRoom = (roomId: string) => {
	if (socketClient) {
		socketClient.joinRoom(roomId);
	}
};

const handleLogout = () => {
	if (socketClient) {
		socketClient.disConnect();
	}
	localStorage.removeItem("token");
	router.replace({ name: "login" });
};
</script>

<template>
	<div class="room-list-page">
		<div class="left-container">
			<div class="user-container">
				<userCard :avatar="user.avatar" :username="user.username" :color="user.color" />

				<div class="side-bar">
					<button class="quit" @click="handleLogout">登出</button>
				</div>
			</div>
			<div class="player-list-container">
				<div class="player-list-title">玩家列表({{ userList.length }})</div>
				<div class="player-list">
					<userListItem
						v-for="user in userList"
						:key="user.userId"
						:avatar="user.avatar"
						:username="user.username"
						:color="user.color"
					/>
				</div>
			</div>
		</div>
		<div class="right-container">
			<div class="room-list-topbar">
				<div class="room-list-info">房间列表({{ roomList.length }})</div>
				<button class="create-room-button" @click="handleCreateRoom">创建房间</button>
			</div>
			<div class="room-list">
				<roomListItem
					@click="handleJoinRoom(room.roomId)"
					v-for="room in roomList"
					:key="room.roomId"
					:owner-name="room.ownerName"
					:player-num="room.userNum"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.room-list-page {
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
		width: 20vw;
		max-width: 25rem;
		margin-right: 0.8rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		& > div {
			border-radius: 1rem;
			background-color: rgba(255, 255, 255, 0.65);
			backdrop-filter: blur(3px);
			box-shadow: var(--box-shadow);
		}

		& > .user-container {
			width: 100%;
			height: 7.5rem;
			margin-bottom: 0.7rem;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			position: relative;
			overflow: hidden;

			& > .side-bar {
				position: absolute;
				right: 0;
				top: 0;
				display: flex;
				flex-direction: column;
				align-items: center;

				& > button {
					width: 100%;
					height: 1.8rem;
					border-radius: 0.2rem 1rem 0.2rem 0.6rem;
					font-size: 0.8rem;
					padding: 0 0.6rem;
				}
			}
		}

		& > .player-list-container {
			width: 100%;
			flex: 1;
			box-sizing: border-box;
			overflow: hidden;
      display: flex;
			flex-direction: column;

			& > .player-list {
				flex: 1;
        overflow-y: scroll;
				padding: 0.5rem 0.7rem;
			}
		}
	}

	& > .right-container {
		flex: 1;
		height: 100%;
		border-radius: 1rem;
		background-color: rgba(255, 255, 255, 0.65);
		backdrop-filter: blur(3px);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-shadow: var(--box-shadow);

		& > .room-list {
			flex: 1;
		}
	}
}

.player-list-title {
	font-size: 1rem;
	height: 1.8rem;
	line-height: 1.8rem;
	width: 100%;
	color: #ffffff;
	text-align: center;
	background-color: var(--color-third);
	box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
	text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.1);
}

.room-list-topbar {
	height: 2rem;
	line-height: 2rem;
	width: 100%;
	color: #ffffff;
	background-color: var(--color-third);
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
	text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.1);

	& > .room-list-info {
		padding-left: 0.8rem;
	}

	& > .create-room-button {
		height: 100%;
		padding: 0 0.7rem;
		font-size: 0.8rem;
		text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.1);
	}
}
</style>
