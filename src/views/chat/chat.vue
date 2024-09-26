<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useChat, useRoomInfo } from "@/store";
import { useMonopolyClient } from "@/classes/monopoly-client/MonopolyClient";
import ChatMessageItem from "./components/chat-message-item.vue";
import gsap from "gsap";

const chatMessageList = useChat().chatMessageQueue;
const newMessageNum = computed(() => useChat().newMessageNum);
const isChatShow = computed(() => useChat().chatShow);

const newMessageNotify = computed(() => (newMessageNum.value > 0 ? `(${newMessageNum.value}条新消息)` : ""));

const inputMessage = ref("");
const roomId = useRoomInfo().roomId;

function sendChatMessage() {
	const socketClient = useMonopolyClient();
	socketClient && socketClient.sendRoomChatMessage(inputMessage.value, roomId);
	inputMessage.value = "";
}

watch(chatMessageList, () => {
	nextTick(() => {
		const container = document.querySelector(".chat_content-container");
		if (container) {
			container.scrollTop = container.scrollHeight;
		}
	});
});

watch(isChatShow, (isShow) => {
	gsap.to(".chat_main-container", {
		height: isShow ? "18rem" : "0",
	});
});

function handleChatShow() {
	const chatStore = useChat();
	chatStore.chatShow = !chatStore.chatShow;
	chatStore.resetNewMessageNum();
}
</script>

<template>
	<div class="chat">
		<button class="chat_show-button" @click="handleChatShow">
			<FontAwesomeIcon icon="comments" style="margin-right: 0.3rem" />
			聊天 <span style="font-size: 0.8em">{{ newMessageNotify }}</span>
		</button>
		<div class="chat_main-container">
			<div class="chat_content-container">
				<TransitionGroup name="list">
					<ChatMessageItem
						v-for="message in chatMessageList"
						:key="message.user.userId + message.time"
						:chat-message="message"
					/>
				</TransitionGroup>
			</div>
		</div>

		<form @submit="sendChatMessage" class="chat_input-container">
			<input v-model="inputMessage" type="text" />
			<input type="submit" value="发送" />
		</form>
	</div>
</template>

<style lang="scss" scoped>
.list-enter-active,
.list-leave-active {
	transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
	opacity: 0;
	transform: translateX(30px);
}

.chat {
	position: fixed;
	bottom: 0;
	left: 0.5rem;
	z-index: 10000;
	width: 23rem;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;

	.chat_show-button {
		width: fit-content;
		padding: 0.4rem 1.2rem;
		font-size: 0.9rem;
		box-shadow: var(--box-shadow);
		text-align: center;
		color: var(--color-text-white);
		border-radius: 0.5rem 0.5rem 0 0;
	}

	.chat_main-container {
		display: flex;
		height: 0;
		flex-direction: column;
		box-shadow: var(--box-shadow-dark);
		border-radius: 0 1rem 0 0;
		background-color: rgba($color: #ffffff, $alpha: 0.8);
		overflow: hidden;

		.chat_content-container {
			flex: 1;
			width: 100%;
			padding: 0.6rem;
			box-sizing: border-box;
			overflow-y: scroll;
			overflow-x: hidden;
			backdrop-filter: blur(2px);
		}
	}

	.chat_input-container {
		width: 100%;
		display: flex;
		justify-content: space-between;
		background-color: var(--color-second);
		padding: 0.5rem 0.4rem;
		border-radius: 0 0.5rem 0 0;
		box-shadow: var(--box-shadow);
		box-sizing: border-box;
		z-index: 1011;

		& > input {
			flex: 1;
			height: 1.8rem;
			line-height: 1.8rem;
			border-radius: 0.3rem;
			margin-right: 0.6rem;
			caret-color: var(--color-primary);
			font-size: unset;
		}

		& > input[type="submit"] {
			width: fit-content;
			word-break: keep-all;
			border-radius: 0.3rem;
			box-sizing: border-box;
			font-size: 1.2rem;
			padding: 0;
		}
	}
}
</style>
