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
	<div class="user-list-item">
		<div class="avatar" :style="{ 'background-color': color }">
			<font-awesome-icon class="icon" :icon="icon" />
		</div>
		<p class="username" :style="{ color: color }">{{ username }}</p>
	</div>
</template>

<style lang="scss" scoped>
.user-list-item {
	height: 2rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: #ffffff;
	border-radius: 0.4rem;
	margin-bottom: 0.6rem;
	overflow: hidden;
	box-shadow: var(--box-shadow);

	& > .avatar {
		width: 3rem;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ffffff;
		font-size: 1rem;
	}

	& > .username {
		flex: 1;
		text-align: center;
	}
}
</style>
