<script setup lang="ts">
import { apiLogin, apiRegister } from "../utils/api/user";
import { ref, onBeforeMount, reactive } from "vue";
import router from "../router";
import FPMessage from "@/components/utils/fp-message";

onBeforeMount(() => {
	if (localStorage.getItem("token")) {
		router.push({ name: "room-list" });
	}
});

const loginForm = reactive({
	username: "",
	password: "",
});

const registerForm = reactive({
	username: "",
	icon: "",
	color: "",
	password: "",
	confirmPassword: "",
});

const handleLogin = async () => {
	if (await apiLogin(loginForm.username, loginForm.password)) {
		router.push({ name: "room-list" });
	}
};

const handleRegister = async () => {
	if (registerForm.password === registerForm.confirmPassword) {
		if (await apiRegister(registerForm.username, registerForm.password)) {
			loginForm.username = registerForm.username;
			loginForm.password = registerForm.password;
			loginMode.value = true;
		}
	} else {
		FPMessage({
			type: "error",
			message: "两次输入的密码不一样",
		});
		registerForm.confirmPassword = "";
	}
};

const loginMode = ref(true);
</script>

<template>
	<div class="login-page">
		<div class="title">
			<span>多人在线《大富翁》</span>
		</div>
		<!-- <Transition name="change"> -->
		<div v-if="loginMode" class="login-form form-container">
			<span>用户名</span>
			<input class="fp-input" type="text" id="username" v-model="loginForm.username" />
			<span>密码</span>
			<input class="fp-input" type="password" id="password" v-model="loginForm.password" />

			<div class="tip">
				<span>没有账号？点击<span @click="loginMode = false">注册</span></span>
			</div>

			<button @click="handleLogin" class="submit-button">登录</button>
		</div>

		<div v-else class="register-form form-container">
			<span>用户名</span>
			<input class="fp-input" type="text" id="username" v-model="registerForm.username" />
			<span>密码</span>
			<input class="fp-input" type="password" id="password" v-model="registerForm.password" />
			<span>确认密码</span>
			<input class="fp-input" type="password" id="confirmPassword" v-model="registerForm.confirmPassword" />

			<div class="tip">
				<span>已有账号？点击<span @click="loginMode = true">登录</span></span>
			</div>

			<button @click="handleRegister" class="submit-button">注册</button>
		</div>
		<!-- </Transition> -->
	</div>
</template>

<style lang="scss" scoped>
.login-page {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.login-form {
	width: 26rem;
	margin-top: 5rem;
	padding: 1.8rem 1.25rem;
	border-radius: 1rem;
	background-color: rgba(255, 255, 255, 0.5);
	& > * {
		margin: 0.4rem 0;
	}

	& > input {
		margin: 0.5rem 0;
		height: 3.4rem;
		font-size: 1rem;
		color: var(--color-primary);
	}

	& > span {
		display: block;
		font-size: 1.6rem;
		color: #ffffff;
		text-shadow: 2px 2px var(--color-primary);
	}

	& > .submit-button {
		width: 100%;
		padding: 0.6rem;
		border-radius: 0.8rem;
		font-size: 1.6rem;
	}

	& > .tip > span {
		float: right;
		font-size: 0.8rem;
		color: var(--color-text-second);
		user-select: none;

		& > span {
			color: var(--color-primary);
			border-bottom: 0.1rem solid var(--color-primary);
			cursor: pointer;
		}
	}
}
.register-form {
	width: 20rem;
	margin-top: 4rem;
	padding: 1.4rem 1.25rem;
	border-radius: 1rem;
	background-color: rgba(255, 255, 255, 0.5);
	& > * {
		margin: 0.4rem 0;
	}

	& > input {
		margin: 0.5rem 0;
		height: 2.8rem;
		font-size: 0.8rem;
		color: var(--color-primary);
	}

	& > span {
		display: block;
		font-size: 1rem;
		margin-bottom: 0;
		color: #ffffff;
		text-shadow: 2px 2px var(--color-primary);
	}

	& > .submit-button {
		width: 100%;
		padding: 0.4rem;
		border-radius: 0.8rem;
		font-size: 1.4rem;
	}

	& > .tip > span {
		float: right;
		font-size: 0.8rem;
		color: var(--color-text-second);
		user-select: none;

		& > span {
			color: var(--color-primary);
			border-bottom: 0.1rem solid var(--color-primary);
			cursor: pointer;
		}
	}
}

.change-enter-active,
.change-leave-active {
	transition: opacity 0.5s ease;
}

.change-enter-from,
.change-leave-to {
	opacity: 0;
}

.title {
	margin-top: 30px;

	& > span {
		font-size: 6em;
		color: #ffffff;
		letter-spacing: 0.3em;
		display: block;
		position: relative;

		&::before,
		&::after {
			content: "天上人间大富翁";
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
