<template>
  <div class="player_item">
    <div class="owner_tag" v-show="isRoomOwner">
      <font-awesome-icon icon="fa-solid fa-house-user" />
    </div>
    <div class="avatar" :style="{'background-color': player.color}">
      <font-awesome-icon class="icon" :icon="['fas', player.icon]" />
    </div>
    <p class="name" :style="{'color': player.color}">{{player.name}}</p>
  </div>
</template>

<script setup lang="ts">
import PlayerInfoInterface from '../class/Interface/game/PlayerInfoInterface';
import { defineProps } from 'vue';

const props = defineProps<{
  player: PlayerInfoInterface
  isRoomOwner?: boolean;
}>()

</script>

<style scoped lang="scss">
.player_item {
  background-color: rgba($color: #ffffff, $alpha: 0.6);
  margin: 10px;
  border: 10px solid rgba($color: #ffffff, $alpha: 0.8);
  border-radius: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;

  .owner_tag {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 5vw;
    height: 5vw;
    border-radius: 0 20px 0 20px;
    font-size: 2.5vw;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;
    background-color: rgba($color: #ffdd1e, $alpha: 0.7);

  }
}

.avatar {
  width: 10vw;
  height: 10vw;
  border: 6px solid rgba($color: #ffffff, $alpha: 0.8);
  box-sizing: border-box;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  .icon {
    width: 5vw;
    height: 5vw;
    color: #ffffff;
  }
}

.name {
  font-size: 2vw;
}
</style>