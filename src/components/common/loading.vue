<script setup lang="ts">
import { useLoading } from "../../store/index";
import { computed } from "vue";

const loadingStore = useLoading();
const loading = computed(() => loadingStore.loading);
</script>

<template>
	<transition name="fade">
		<div v-if="loading" class="loading">
			<div class="spinner"></div>
		</div>
	</transition>
</template>

<style lang="scss" scoped>
.loading {
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 9999;
}

.spinner {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	border: 3px solid white;
	border-top-color: transparent;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
	opacity: 0;
}
</style>
