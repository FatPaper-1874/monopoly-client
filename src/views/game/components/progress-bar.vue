<script setup lang="ts">
import {computed} from "vue";
import {useGameInfo} from "@/store";
import {lightenColor} from "@/utils";
import {__USERSERVER__} from "@/global.config";

const playerList = computed(() => useGameInfo().playersList);

function getBlockHeight(money: number) {
  const height = money / 100000;
  return height < 1 ? (height * 100 + '%') : "100%"
}
</script>

<template>
  <div class="progress-bar">
    <div class="target-bar">￥{{ 100000 }}</div>
    <div :style="{height: getBlockHeight(player.money), backgroundColor: player.user.color}"
         class="player-block" v-for="player in playerList"
         :key="player.id">
      <div class="avatar-container" :style="{'--c': lightenColor(player.user.color, 15)}">
        <div class="avatar">
          <img alt="" :src="`${__USERSERVER__}/static/avatars/${player.user.avatar}`"/>
        </div>
        <div class="money">￥{{ player.money }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.progress-bar {
  position: relative;
  width: 1.3rem;
  height: 30rem;
  background-color: var(--color-bg);
  border-radius: 0 0 .8rem 0;
  box-sizing: border-box;
  border: .45rem solid rgba(255, 255, 255, .7);
  border-left: 0;
}

.target-bar {
  position: absolute;
  top: -2rem;
  height: 2rem;
  background-color: var(--color-third);
  color: var(--color-text-white);
  padding: .45rem;
  font-size: .8rem;
  border-radius: 0 .3rem .3rem 0;
  box-sizing: border-box;
  box-shadow: var(--box-shadow);
}

.player-block {
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 0;
  transition: height .5s ease;
  border-radius: 0 .2rem .5rem 0;
  user-select: none;

  $top-bar-width: 1.5rem;

  & > .avatar-container::before {
    content: '';
    position: absolute;
    top: 0;
    width: $top-bar-width;
    height: .2rem;
    background-color: var(--c);
    transform: translateY(-50%);
  }

  .avatar-container {
    width: fit-content;
    display: flex;
    $font-size: 1rem;


    & > .avatar {
      $avatar_size: 2rem;

      width: $avatar_size;
      height: $avatar_size;
      border-radius: 50%;
      border: 0.2rem solid #ffffff;
      overflow: hidden;
      box-shadow: var(--box-shadow);
      transform: translate($top-bar-width, -50%);

      & > img {
        width: $avatar_size;
        height: $avatar_size;
      }
    }

    & > .money {
      font-size: $font-size;
      line-height: $font-size;
      height: $font-size;
      margin-left: .2rem;
      color: var(--c);
      text-shadow: var(--text-shadow-surround-white);
      transform: translate($top-bar-width, -50%);
    }
  }

}
</style>