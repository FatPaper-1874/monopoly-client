<script setup lang="ts">
import { onBeforeMount, onMounted, computed, ref, onUpdated } from "vue";
import { useUserInfo, useUserList, useRoomList, useRoomInfo, useLoading } from "@/store";
import { useMonopolyClient } from "@/classes/monopoly-client/MonopolyClient";
import userCard from "@/components/common/user-card.vue";
import router from "@/router";
import { getUserByToken } from "@/utils/api/user";
import FPMessage from "@/components/utils/fp-message";
import { __FATPAPER_HOST__, __ICE_SERVER_PORT__ } from "@G/global.config";

const userInfoStore = useUserInfo();
const userListStore = useUserList();
const roomListStore = useRoomList();

const user = computed(() => userInfoStore);
const roomId = ref("");

onMounted(async () => {
	if (!userInfoStore.hasUserInfo()) {
		useLoading().showLoading("读取用户信息中");
		let token = localStorage.getItem("token") || "";
		if (token) {
			//账号登录
			try {
				const { id: userId, useraccount, username, avatar, color } = await getUserByToken(token);
				const userInfoStore = useUserInfo();
				userInfoStore.$patch({ userId, useraccount, username, avatar, color });
				useLoading().hideLoading();
				return;
			} catch (e: any) {
				FPMessage({ type: "error", message: e.message || e });
				handleLogout();
			}
		}
		let userInfo = localStorage.getItem("user") || "";
		if (userInfo) {
			//游客登录
			try {
				const { userId, useraccount = "", username, avatar = "", color } = JSON.parse(userInfo);
				const userInfoStore = useUserInfo();
				userInfoStore.$patch({ userId, useraccount, username, avatar, color });
				useLoading().hideLoading();
				return;
			} catch (e: any) {
				FPMessage({ type: "error", message: "读取用户信息失败, 请重新进行游客登记" });
				handleLogout();
			}
		}
		handleLogout();
	}
});

function handleLogout() {
	localStorage.removeItem("token");
	localStorage.removeItem("user");
	router.replace({ name: "login" });
}

async function joinRoom() {
	const _roomId = roomId.value;
	if (!_roomId) {
		FPMessage({ type: "error", message: "请输入房间号" });
		return;
	}
	const monopolyClient = await useMonopolyClient({
		iceServer: {
			host: __FATPAPER_HOST__,
			port: __ICE_SERVER_PORT__,
		},
	});
	try {
		useLoading().showLoading("正在尝试连接");
		await monopolyClient.joinRoom(_roomId);
	} finally {
		useLoading().hideLoading();
	}
}
</script>

<template>
	<div class="hall-page">
		<div class="user-container">
			<userCard :avatar="user.avatar" :username="user.username" :color="user.color" />

			<div class="side-bar">
				<button class="quit" @click="handleLogout">登出</button>
			</div>
		</div>
		<div class="join-room">
			<div class="title">Room-Router</div>
			<div class="describe">输入房间号可加入房间，第一个使用房间号的将成为主机(房主)</div>
			<div>
				<input v-model="roomId" type="text" placeholder="房间号" />
				<button @click="joinRoom">加入/创建房间</button>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.hall-page {
	width: 100%;
	height: 100%;
	display: flex;
	//flex-direction: column;
	justify-content: center;
	align-items: center;

	& > div {
		border: 0.3rem solid rgba(255, 255, 255, 0.65);
		border-radius: 1.5rem;
		background-color: rgba(255, 255, 255, 0.65);
		backdrop-filter: blur(3px);
	}

	.user-container {
		width: 18rem;
		height: 7.5rem;
		margin-right: 0.7rem;
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

	.join-room {
		padding: 1rem;

		& .title {
			display: inline-block;
			font-size: 1.6rem;
			color: var(--color-primary);
			margin-bottom: 0.7rem;
			background-color: rgba(255, 255, 255, 0.45);
			padding: 0.4rem 0.8rem;
			border-radius: 1rem;
		}

		& .describe {
			font-size: 0.9rem;
			color: #393939;
			margin-bottom: 0.8rem;
			padding-left: 0.8rem;
		}

		& input {
			height: 3rem;
		}

		& button {
			margin-left: 1rem;
			border-radius: 0.7rem;
			height: 3rem;
		}
	}
}
</style>
