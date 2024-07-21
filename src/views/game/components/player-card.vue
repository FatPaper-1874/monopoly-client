<script setup lang="ts">
import { PlayerInfo } from "@/interfaces/game";
import { PropType, computed } from "vue";
import { useGameInfo } from "@/store/index";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// const props = defineProps({
// 	player: { type: Object as PropType<PlayerInfo>, default: {} },
// 	roundMark: { type: Boolean, default: true },
// });

const props = defineProps<{ player: PlayerInfo; roundMark: boolean }>();

const gameInfoStroe = useGameInfo();

const _userInfo = computed(() => props.player.user);
const _isMyTrun = computed(() => gameInfoStroe.currentPlayerInRound === props.player.id);
const avatarSrc = computed(() => {
	return _userInfo.value.avatar ? `http://${_userInfo.value.avatar}` : "";
});
</script>

<template>
	<div class="player-card" :style="{ 'border-color': _isMyTrun ? 'var(--color-third)' : '' }">
		<div class="avatar" :style="{ 'background-color': _userInfo.color }">
			<div v-if="player.isOffline" class="disconnect-marker">
				<FontAwesomeIcon icon="link-slash" />
			</div>
			<img alt="" :src="avatarSrc" />
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
