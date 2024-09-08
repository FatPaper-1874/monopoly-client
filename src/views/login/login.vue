<script setup lang="ts">
import { ref, onBeforeMount, onBeforeUnmount, reactive, onMounted, nextTick } from "vue";
import router from "@/router";
import { __LOGINPAGEURL__ } from "../../../global.config";
import { getUserByToken } from "@/utils/api/user";
import { createLoginIframeOnBody, exitFullScreen, setTimeOutAsync } from "@/utils";
import FPMessage from "@/components/utils/fp-message/index";
import { useUserInfo } from "@/store";
import { LoginDiceRenderer } from "@/classes/three/LoginDiceRenderer";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import FpPopover from "@/components/utils/fp-popover/fp-popover.vue";

let loginCodeRenderer: LoginDiceRenderer | null;
let diceRotate: boolean = true;
const firstClick = ref(false);

async function doLogin() {
	firstClick.value = true;
	let token = localStorage.getItem("token") || "";
	if (!token) {
		token = await toLogin();
		localStorage.setItem("token", token);
	}
	nextTick(() => {
		const canvasEl = document.getElementById("dice-canvas") as HTMLCanvasElement;
		loginCodeRenderer = new LoginDiceRenderer(canvasEl, diceRotate);
		getUserInfoToRoomList(token);
	});
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
				doLogin();
				loginCodeRenderer && loginCodeRenderer.clear();
				loginCodeRenderer = null;
			},
		});
	}
}

async function toLogin() {
	// await exitFullScreen();
	return await createLoginIframeOnBody(__LOGINPAGEURL__);
}

function toRoomList() {
	if (localStorage.getItem("token")) {
		router.replace({ name: "room-list" });
	}
}

function toGithub() {
	window.open("https://github.com/FatPaper-1874/fatpaper-monopoly");
}

function toIssues() {
	window.open("https://github.com/FatPaper-1874/fatpaper-monopoly/issues");
}

function toBilibili() {
	window.open("https://www.bilibili.com/video/BV1mPHFedEH1");
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

		<div class="login-extra">
			<fp-popover placement="right" trigger="hover">
				<div @click="toGithub" class="login-extra-item about">
					<FontAwesomeIcon icon="code" />
				</div>
				<template #content>
					<div class="extra-content">点击直达Git仓库</div>
				</template>
			</fp-popover>
			<fp-popover placement="right" trigger="hover">
				<div @click="toIssues" class="login-extra-item bug">
					<FontAwesomeIcon icon="bug" />
				</div>
				<template #content>
					<div class="extra-content">有Bug？点击提交</div>
				</template>
			</fp-popover>
			<fp-popover placement="right" trigger="hover">
				<div @click="toBilibili" class="login-extra-item to-bilibili">Bili</div>
				<template #content>
					<div class="extra-content">点击看介绍视频</div>
				</template>
			</fp-popover>
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
		cursor: pointer;

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
		user-select: none;
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

.login-extra {
	position: absolute;
	left: 2rem;
	bottom: 2rem;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;

	.login-extra-item {
		width: 5rem;
		height: 5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 1rem 0;
		background-color: rgba(255, 255, 255, 0.8);
		font-size: 2rem;
		border-radius: 0.7rem;
		color: var(--color-second);
		text-shadow: var(--text-shadow);
		cursor: pointer;
		box-shadow: var(--box-shadow);

		&.to-bilibili {
			color: #fb7299;
			text-shadow: 3px 3px 2px #ffb9b3;
		}

		& svg {
			filter: drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.15));
		}
	}

	.extra-content {
		width: 5rem;
		margin-left: 1rem;
		font-size: 1.2rem;
		background-color: rgba(255, 255, 255, 0.7);
		border-radius: 0.7rem;
		padding: 0.6rem;
		color: var(--color-primary);
		text-shadow: var(--text-shadow);
	}
}
</style>
