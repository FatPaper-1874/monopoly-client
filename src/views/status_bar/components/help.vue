<script setup lang="ts">
import FpDialog from "@/components/utils/fp-dialog/fp-dialog.vue";
import { CardUseMode } from "@/enums/bace";
import { useSettig } from "@/store";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref } from "vue";
import { useRoute } from "vue-router";

const helpVisible = ref(false);
const router = useRoute();
</script>

<template>
	<button @click="helpVisible = true" class="help-button"><FontAwesomeIcon icon="question" /></button>
	<FpDialog :style="'width: 70%; height: 70%;'" v-model:visible="helpVisible">
		<template #title>帮助</template>
		<div class="help-container"></div>
	</FpDialog>
</template>

<style lang="scss" scoped>
.help-button {
	height: 2.5rem;
	width: 2.5rem;
	border: 0.2rem solid rgba($color: #fff, $alpha: 0.75);
	border-radius: 0.5rem;
	font-size: 1.1rem;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 0.4rem;
}
.help-container {
	display: flex;
	align-items: center;
	// overflow-y: auto;
}
</style>
