<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
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
});
</script>

<template>
	<div class="user-card">
		<div class="avatar" :style="{ 'background-color': color }">
			<font-awesome-icon class="icon" :icon="icon" />
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
		min-width: $icon-size;
		min-height: $icon-size;
		text-align: center;
		line-height: $icon-size;
		border: 0.2rem solid #ffffff;
		border-radius: 50%;
		font-size: 2.5rem;
		color: #ffffff;
		box-shadow: var(--box-shadow);
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
		}
	}
}
</style>
