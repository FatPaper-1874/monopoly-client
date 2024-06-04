<script setup lang="ts">
import { ref, onBeforeMount, onBeforeUnmount, reactive, onMounted, nextTick } from "vue";
import router from "@/router";
import { __LOGINPAGEURL__ } from "../../../global.config";
import { getUserByToken } from "@/utils/api/user";
import { exitFullScreen, setTimeOutAsync } from "@/utils";
import FPMessage from "@/components/utils/fp-message/index";
import { useUserInfo } from "@/store";
import { LoginCodeRenderer } from "@/utils/three/login-code-renderer";

let loginCodeRenderer: LoginCodeRenderer | null;
let diceRotate: boolean = true;
const firstClick = ref(false);

onBeforeMount(async () => {});

function doLogin() {
	firstClick.value = true;
	const _URLSearchParams = new URLSearchParams(location.search);
	const tokenFromURL = _URLSearchParams.get("token") || "";
	const tokenFromLocal = localStorage.getItem("token") || "";
	if (!tokenFromURL && !tokenFromLocal) {
		toLogin();
	} else {
		let token = tokenFromLocal;
		if (tokenFromURL) {
			localStorage.setItem("token", tokenFromURL);
			token = tokenFromURL;
			location.search = "";
		}
		nextTick(() => {
			const canvasEl = document.getElementById("dice-canvas") as HTMLCanvasElement;
			loginCodeRenderer = new LoginCodeRenderer(canvasEl, diceRotate);
			getUserInfoToRoomList(token);
		});
	}
}

// onMounted(() => {
// 	const canvasEl = document.getElementById("dice-canvas") as HTMLCanvasElement;
// 	loginCodeRenderer = new LoginCodeRenderer(canvasEl, diceRotate);
// });

onBeforeUnmount(() => {
	loginCodeRenderer && loginCodeRenderer.clear();
	loginCodeRenderer = null;
});

async function getUserInfoToRoomList(token: string) {
	try {
		const { id: userId, useraccount, username, avatar, color } = await getUserByToken(token);
		const userInfoStore = useUserInfo();
		userInfoStore.$patch({ userId, useraccount, username, avatar, color });
		await setTimeOutAsync(1500);
		if (loginCodeRenderer) await loginCodeRenderer.showImage(`http://${avatar}`);
		await setTimeOutAsync(2000, toRoomList);
	} catch (e: any) {
		FPMessage({
			type: "error",
			message: e || e.message || "在验证身份时发生了未知的错误",
			onClosed: () => {
				toLogin();
			},
		});
	}
}

async function toLogin() {
	await exitFullScreen();
	location.assign(__LOGINPAGEURL__);
}

function toRoomList() {
	if (localStorage.getItem("token")) {
		router.replace({ name: "room-list" });
	}
}
</script>

<template>
	<div @click.once="doLogin" class="login-page">
		<div class="title">
			<span>FatPaper的大富翁</span>
		</div>
		<div class="login-code-container">
			<div class="tip" v-show="!firstClick">点击任意位置继续</div>
			<!-- <img class="login-code loading" :src="imgUrl" alt=""> -->
			<canvas id="dice-canvas" class="dice" v-show="firstClick"></canvas>
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

	& > .tip {
		font-size: 2rem;
		margin-top: auto;
		margin-bottom: 3rem;
		color: #ffffff;
		text-shadow: var(--text-shadow);
		animation: blink infinite 1.8s;

		@keyframes blink {
			0% {
				opacity: 1;
			}
			50% {
				opacity: 0.3;
			}
			100% {
				opacity: 1;
			}
		}
	}

	.dice {
		$img_size: 28rem;

		width: $img_size;
		height: $img_size;
		cursor: pointer;
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
