<script setup lang="ts">
import { getRandomInteger } from "@/utils";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { type } from "os";
import { ref, computed, watch } from "vue";
import { useUtil } from "../../../store/index";

const porps = defineProps({ disable: { type: Boolean, default: true } });

const diceNameIndex = ["one", "two", "three", "four", "five", "six"];
const rollResult = ref([6, 6]);
const isShaking = ref(false);
const utilStore = useUtil();
const rollDiceResult = computed(() => utilStore.rollDiceResult);

let timerId: any;

watch(rollDiceResult, (newRollResult) => {
	if (timerId) {
		clearInterval(timerId);
		timerId = null;
	}
	isShaking.value = false;
	rollResult.value = newRollResult;
});

const fakeRollDice = () => {
	timerId = setInterval(() => {
		rollResult.value = [getRandomInteger(1, 6), getRandomInteger(1, 6)];
	}, 100);
};

const emit = defineEmits(["roll"]);

const handleRollDice = () => {
	if (!porps.disable) {
		isShaking.value = true;
		fakeRollDice();
		emit("roll");
	}
};
</script>

<template>
	<button class="dice-btn" :disabled="disable" @click="handleRollDice">
		<span v-for="(num, index) in rollResult" :key="index">
			<FontAwesomeIcon
				v-if="num !== 0"
				:class="{ 'animate-shaking': isShaking }"
				class="icon"
				:icon="['fas', `dice-${diceNameIndex[num - 1]}`]"
			/>
		</span>
	</button>
</template>

<style lang="scss" scoped>
.dice-btn {
	display: flex;
	justify-content: space-around;
	align-items: center;
	flex-wrap: wrap;

	& > span {
		font-size: 3rem;
	}
}
@-webkit-keyframes shaking {
	25% {
		-webkit-transform: translateX(4px);
	}

	50%,
	100% {
		-webkit-transform: translateX(0);
	}

	75% {
		-webkit-transform: translateX(-4px);
	}
}

@keyframes shaking {
	25% {
		transform: translateX(4px);
	}

	50%,
	100% {
		transform: translateX(0);
	}

	75% {
		transform: translateX(-4px);
	}
}

.animate-shaking {
	-webkit-animation: shaking 0.1s linear 11;
	animation: shaking 0.1s linear 11;
}
</style>
