<script setup lang="ts">
import { ref, onBeforeMount, onBeforeUnmount, reactive, onMounted } from "vue";
import router from "@/router";
import LoginDice from "./login-dice.vue";
import { __LOGINPAGEURL__ } from "../../../global.config";
import { getUserByToken } from "@/utils/api/user";
import FPMessage from "@/components/utils/fp-message/index";
import { useUserInfo } from "@/store";

const userAvatarUrl = ref("");

onBeforeMount(async () => {
	const _URLSearchParams = new URLSearchParams(location.search);
	const tokenFromURL = _URLSearchParams.get("token");
	const tokenFromLocal = localStorage.getItem("token");
	if (tokenFromURL) {
		localStorage.setItem("token", tokenFromURL);
		location.search = "";
		getUserInfoToRoomList(tokenFromURL);
	} else if (tokenFromLocal) {
		getUserInfoToRoomList(tokenFromLocal);
	} else {
		toLogin();
	}
});

async function getUserInfoToRoomList(token: string) {
	try {
		const userDataRes = await getUserByToken(token);
		const userInfoStore = useUserInfo();
		const user = {
			userId: userDataRes.id,
			useraccount: userDataRes.useraccount,
			username: userDataRes.username,
			avatar: userDataRes.avatar,
			color: userDataRes.color,
		};
		userInfoStore.$patch(user);
		await setTimeOutAsync(1500);
		userAvatarUrl.value = userDataRes.avatar;
		await setTimeOutAsync(2000, toRoomList);
	} catch (e: any) {
		FPMessage({
			type: "error",
			message: e || e.message || "在验证身份时发生了未知的错误",
			onClosed: () => {
				console.log("w");
				toLogin();
			},
		});
	}
}

function setTimeOutAsync(delay: number = 1000, fn?: Function) {
	return new Promise((reslove) => {
		setTimeout(() => {
			if (fn) fn();
			reslove("");
		}, delay);
	});
}

function toLogin() {
	location.assign(__LOGINPAGEURL__);
}

function toRoomList() {
	if (localStorage.getItem("token")) {
		router.replace({ name: "room-list" });
	}
}
</script>

<template>
	<div class="login-page">
		<div class="title">
			<span>FatPaper的大富翁</span>
		</div>
		<div class="login-code-container">
			<!-- <img class="login-code loading" :src="imgUrl" alt=""> -->
			<LoginDice :img_data="userAvatarUrl" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.login-page {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.login-code-container {
	width: 100%;
	height: 100%;
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 5rem;

	.login-code {
		$img_size: 16rem;

		width: $img_size;
		height: $img_size;
	}
}

.title {
	margin-top: 30px;

	& > span {
		font-size: 6em;
		color: #ffffff;
		letter-spacing: 0.1em;
		display: block;
		position: relative;
		user-select: none;

		&::before,
		&::after {
			content: "FatPaper的大富翁";
		}

		&:before,
		&:after {
			position: absolute;
			left: 0;
			top: 0;
		}

		&:before {
			color: #ff9114;
			z-index: -1;
			animation: rotate1 5s ease-in-out infinite;
		}

		&:after {
			color: #7e7e7e;
			z-index: -2;
			animation: rotate2 5s ease-in-out infinite;
		}
	}

	@keyframes rotate1 {
		0%,
		100% {
			-webkit-transform: translate3d(3px, 3px, 3px);
			transform: translate3d(3px, 3px, 3px);
		}

		50% {
			-webkit-transform: translate3d((-3px, 3px, -3px));
			transform: translate3d((-3px, 3px, -3px));
		}
	}

	@keyframes rotate2 {
		0%,
		100% {
			-webkit-transform: translate3d(5px, 5px, 5px);
			transform: translate3d(5px, 5px, 5px);
		}

		50% {
			-webkit-transform: translate3d((-5px, 5px, -5px));
			transform: translate3d((-5px, 5px, -5px));
		}
	}
}
</style>
../../global.config
