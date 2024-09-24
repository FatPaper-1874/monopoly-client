<script setup lang="ts">
import { PlayerInfo } from "@/interfaces/game";
import { PropType, computed } from "vue";
import { useGameInfo } from "@/store/index";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { __PROTOCOL__ } from "@G/global.config";

// const props = defineProps({
// 	player: { type: Object as PropType<PlayerInfo>, default: {} },
// 	roundMark: { type: Boolean, default: true },
// });

const props = defineProps<{ player: PlayerInfo; roundMark: boolean }>();

const gameInfoStroe = useGameInfo();

const _userInfo = computed(() => props.player.user);
const _isMyTrun = computed(() => gameInfoStroe.currentPlayerInRound === props.player.id);
const _isBankrupted = computed(() => props.player.isBankrupted);
const avatarSrc = computed(() => {
	return _userInfo.value.avatar ? `${__PROTOCOL__}://${_userInfo.value.avatar}` : "";
});
</script>

<template>
	<div
		class="player-card"
		:class="{ is_bankrupted: _isBankrupted }"
		:style="{ 'border-color': _isMyTrun ? 'var(--color-third)' : '' }"
	>
		<div class="avatar">
			<div v-if="player.isOffline" class="disconnect-marker">
				<FontAwesomeIcon icon="link-slash" />
			</div>
			<img v-if="avatarSrc" :src="avatarSrc" />
			<FontAwesomeIcon v-else :style="{ color: _userInfo.color }" icon="gamepad" />
		</div>
		<div class="info" :style="{ color: _userInfo.color }">
			<span class="username">{{ _userInfo.username }}</span>
			<span class="money">￥{{ player.money }}</span>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.player-card {
	width: 100%;
	min-width: 11rem;
	display: flex;
	justify-content: space-around;
	border-radius: 0.8rem;
	padding: 0.3rem 0.6rem;
	background-color: rgba($color: #ffffff, $alpha: 0.85);
	backdrop-filter: blur(3px);
	border: 0.25rem solid rgba($color: #ffffff, $alpha: 0.85);
	box-sizing: border-box;
	user-select: none;
	margin: 0.2rem 0;

	&.is_bankrupted {
		position: relative;
		filter: grayscale(1);
	}

	&.is_bankrupted::after {
		content: "OUT!";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #444444;
		font-size: 2.5rem;
		line-height: 2.5rem;
		text-align: center;
		display: block;
		border-radius: 0.8rem;
		padding: 0.4rem;
		background-color: rgba(255, 255, 255, 0.6);
	}

	& > .avatar {
		$avatar_size: 3rem;

		color: #ffffff;
		width: $avatar_size;
		height: $avatar_size;
		font-size: 1.5rem;
		line-height: 3rem;
		text-align: center;
		border-radius: 50%;
		border: 0.2rem solid #ffffff;
		overflow: hidden;
		box-shadow: var(--box-shadow);
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(255, 255, 255, 0.45);

		& > .disconnect-marker {
			font-size: 1.5rem;
			width: $avatar_size;
			height: $avatar_size;
			color: var(--color-text-error);
			background-color: rgba($color: #ffffff, $alpha: 0.5);
			position: absolute;
			left: 0;
			top: 0;
		}

		& > img {
			width: $avatar_size;
			height: $avatar_size;
		}
	}

	& > .info {
		margin: 0 0.4rem;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		text-shadow: var(--text-shadow-surround-white);

		& > .money {
			font-size: 1.1rem;
		}
	}
}
</style>
@/global.config
