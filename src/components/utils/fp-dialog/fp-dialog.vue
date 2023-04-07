<script setup lang="ts">
import { ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const { visible, sumbitDisable } = defineProps({
	visible: { type: Boolean, default: false },
	sumbitDisable: { type: Boolean, default: false },
});

const emits = defineEmits(["update:visible", "submit", "cancel"]);

const handleSumbit = () => {
	emits("submit");
	emits("update:visible", false);
};

const closeDialog = () => {
	emits("cancel");
	emits("update:visible", false);
};
</script>

<template>
	<div class="fp-dialog" :style="visible ? '' : 'display:none'">
		<div class="fp-dialog-modal" @click.self="closeDialog"></div>

		<!-- 主体 -->
		<div class="fp-dialog-main" v-if="visible">
			<div class="fp-dialog-header">
				<div class="title">
					<slot name="title"></slot>
				</div>
				<button class="close-button" @click="closeDialog">
					<FontAwesomeIcon icon="close"></FontAwesomeIcon>
				</button>
			</div>

			<!-- 内容区 -->
			<div class="fp-dialog-body">
				<slot></slot>
			</div>

			<div class="fp-dialog-footer">
				<button :disabled="sumbitDisable" @click="handleSumbit">确认</button>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.fp-dialog {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
	z-index: 5500;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: 0.3s;
	pointer-events: initial;
	.fp-dialog-modal {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		background-color: rgba(0, 0, 0, 0.3);
	}
	.fp-dialog-main {
		transition: 0.3s;
		min-width: 30em;
		min-height: 20em;
		max-height: 80vh;
		background-color: #fff;
		position: relative;
		border-radius: 10px;
		box-shadow: var(--box-shadow);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	.fp-dialog-header {
		background-color: var(--color-third);
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: var(--box-shadow);

		& > .title {
			margin-left: 10px;
			color: var(--color-text-white);
		}

		& > .close-button {
			font-size: 1em;
			padding: 5px 10px;
		}
	}
	.fp-dialog-body {
		flex: 1;
		padding: 0.8em;
		background-color: var(--color-bg-light);
		overflow-y: scroll;
	}

	.fp-dialog-footer {
		text-align: right;
		padding: 0.6em;
		background-color: var(--color-bg-light);
		box-shadow: var(--box-shadow);

		& > button {
			padding: 0.4em 0.8em;
			border-radius: 10px;
			font-size: 1.3em;
		}
	}
}
</style>
