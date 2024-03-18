<script setup lang="ts">
import { __USERSERVER__ } from "@/global.config";
import { computed } from "vue";
const props = defineProps<{ username: string; color: string; avatar: string }>();

const avatarSrc = computed(() => {
	return props.avatar ? `${__USERSERVER__}/static/avatars/${props.avatar}` : "";
});
</script>

<template>
	<div class="user-card">
		<div class="avatar" :style="{ 'background-color': color }">
			<img :src="avatarSrc" />
		</div>
		<div class="info">
			<p class="username">{{ username }}</p>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.user-card {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 1.2rem;
	box-sizing: border-box;

	& > .avatar {
		$icon-size: 5rem;
		width: $icon-size;
		height: $icon-size;
		min-width: $icon-size;
		min-height: $icon-size;
		text-align: center;
		line-height: $icon-size;
		border: 0.2rem solid #ffffff;
		border-radius: 50%;
		font-size: 2.5rem;
		color: #ffffff;
		box-shadow: var(--box-shadow);
		overflow: hidden;

		& > img {
			width: $icon-size;
			height: $icon-size;
		}
	}

	& > .info {
		flex: 1;
		display: flex;
		justify-content: space-around;
		align-items: center;
		flex-direction: column;

		& > .username {
			color: #ffffff;
			font-size: 2em;
			text-shadow: var(--text-shadow);
			word-break: break-all;
		}
	}
}
</style>
@/global.config
