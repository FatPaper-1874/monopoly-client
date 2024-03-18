<script setup lang="ts">
import { ChanceCard } from "@/utils/three/interfaces";
import ChangeCardVue from "./chance-card.vue";
import { ref, computed, onBeforeUnmount, provide, inject, Ref, watch } from "vue";
import { ChanceCardType } from "@/enums/game";
import ItemSelector from "@/components/utils/item-selector/item-selector.vue";
import { useGameInfo, useUserInfo } from "../../../store/index";
import PlayerCard from "./player-card.vue";
import { ChanceCardInfo } from "../../../interfaces/bace";

const props = defineProps<{ chanceCard: ChanceCardInfo | null }>();

const gameInfoStore = useGameInfo();
const userInfoStore = useUserInfo();

const _chanceCard = ref<ChanceCardInfo | null>(props.chanceCard);
const _playerList = computed(() => gameInfoStore.playersList.filter((player) => player.id !== userInfoStore.userId));

const _parentSelectedId = inject("selectedId") as Ref<string | string[]>;
</script>

<template>
	<div class="use-chance-card">
		<div class="chance-card">
			<ChangeCardVue
				v-if="_chanceCard"
				:id="_chanceCard.id"
				:name="_chanceCard.name"
				:describe="_chanceCard.describe"
				:icon="_chanceCard.icon"
				:color="_chanceCard.color"
			/>
		</div>
		<div v-if="_chanceCard?.type !== ChanceCardType.ToSelf" class="target-selector">
			<div v-if="_chanceCard?.type === ChanceCardType.ToSinglePlayer">
				<span>选择目标玩家</span>
				<ItemSelector
					:column="2"
					:item-list="_playerList"
					key-name="id"
					v-model:selected-key="_parentSelectedId"
					:multiple="false"
				>
					<template #item="player">
						<PlayerCard :round-mark="false" :player="player" />
					</template>
				</ItemSelector>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.use-chance-card {
	display: flex;
	padding: 0.6rem 1rem;

	& > .chance-card {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	& > .target-selector {
		width: 28rem;
		height: 20rem;
		& > div {
			text-align: center;
			color: var(--color-second);
			& > span {
				font-size: 1.5rem;
			}
		}
	}
}
</style>
