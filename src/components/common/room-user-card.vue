<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { lightenColor } from "../../utils";
import { computed, ref, reactive } from "vue";
import { Role } from "../../interfaces/bace";
import { useRoomInfo } from "../../store/index";
import { ChangeRoleOperate } from "../../../../monopoly-server/src/enums/bace";
import { GameSocketClient } from "../../utils/websocket/fp-ws-client";
const props = defineProps({
	username: {
		type: String,
		default: "",
	},
	color: {
		type: String,
		default: "#ffb24e",
	},
	icon: {
		type: String,
		default: "user",
	},
	isban: {
		type: Boolean,
		default: false,
	},
	isReady: {
		type: Boolean,
		default: false,
	},
	isRoomOwner: {
		type: Boolean,
		default: false,
	},
	isMe: {
		type: Boolean,
		default: false,
	},
	role: {
		type: Object as () => Role,
		default: undefined,
	},
});

const roomInfo = useRoomInfo();
const lightColor = computed(() => lightenColor(props.color));
const roleImgSrc = computed(()=> `/roles/${props.role?.filename}.png`);

const handleChangeRole = (operate: ChangeRoleOperate) => {
	const serverClient = GameSocketClient.getInstance();
	serverClient.changeRole(roomInfo.roomId, operate);
};
</script>

<template>
	<div class="room-user-card">
		<div class="ready-tag" v-if="isReady">准备</div>
		<div class="choose-role" v-else-if="username && role" :style="{ 'background-color': role.color }">
			<font-awesome-icon v-if="isMe" @click="handleChangeRole(ChangeRoleOperate.Prev)" class="icon" icon="angle-left" />
			<span>{{ role.rolename }}</span>
			<font-awesome-icon
				v-if="isMe"
				@click="handleChangeRole(ChangeRoleOperate.Next)"
				class="icon"
				icon="angle-right"
			/>
		</div>
		<div class="choose-role" v-else-if="username && !role">
			<span>选择角色</span>
		</div>

		<div v-if="username" class="user-info">
			<div class="avatar" :style="{ 'background-color': color }">
				<font-awesome-icon class="icon" :icon="icon" />
			</div>
			<div class="info" :style="{ 'background-color': lightColor }">
				<span class="username">{{ username }}</span>
			</div>
		</div>

		<div v-else-if="isban" class="ban">
			<font-awesome-icon class="icon" icon="ban" />
		</div>

		<div class="role-contianer">
			<img :src="roleImgSrc" alt="">
		</div>
	</div>
</template>

<style lang="scss" scoped>
.room-user-card {
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
	border-radius: 20px;
	overflow: hidden;
	background-color: rgba(255, 255, 255, 0.7);
	backdrop-filter: blur(3px);
	padding: 20px 10px;
	box-sizing: border-box;
	box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);

	& > .ready-tag,
	.choose-role {
		position: absolute;
		bottom: 10%;
		width: 100%;
		font-size: 1.5em;
		height: 1.8em;
		line-height: 1.8em;
		color: #ffffff;
		background-color: rgb(255, 221, 25);
		text-align: center;
		box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.1);
		text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.1);
		z-index: 100;
	}

	& > .choose-role {
		display: flex;
		justify-content: space-between;
		align-items: center;
		line-height: 0;
		user-select: none;
		background-color: rgba(185, 185, 185, 0.8);
		padding: 0 10px;
		box-sizing: border-box;

		& > span {
			flex: 1;
		}
	}

	& > .ban {
		font-size: 5em;
		color: rgba(196, 196, 196, 0.6);
	}

	& > .user-info {
		width: 100%;
		display: flex;
		justify-content: space-between;
		position: absolute;
		left: 0px;
		top: 0px;

		& > .avatar {
			$icon-size: 40px;
			min-width: $icon-size;
			min-height: $icon-size;
			width: $icon-size;
			height: $icon-size;
			text-align: center;
			line-height: $icon-size;
			padding: 0px 4px;
			// border: 4px solid #ffffff;
			font-size: 1.3em;
			color: #ffffff;
			box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
			z-index: 101;
		}

		& > .info {
			height: 40px;
			text-align: center;
			flex: 1;
			// border: 4px solid #ffffff;
			border-left: 0px;
			box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
			& > .username {
				line-height: 40px;
				color: #ffffff;
				font-size: 1.3em;
				text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.2);
			}
		}
	}
}

.role-contianer {
	& > img {
		max-width: 100%;
	}
}
</style>
