<template>
  <div id="room_page">
    <div class="top_bar">
      <button id="go_back" @click="handleBack">返回</button>
      <span class="title">{{roomInfo.owner}}的房间</span>
      <button id="game_start">开始游戏</button>
    </div>
    <div class="player_list">
      <div class="player_item" v-for="player in roomInfo.playerList" :key="player.id">
        <div class="owner_tag" v-show="roomInfo.ownerId === player.id">
          <font-awesome-icon icon="fa-solid fa-house-user" />
        </div>
        <div class="avatar" :style="{'background-color': player.color}">
          <font-awesome-icon class="icon" :icon="['fas', player.icon]" />
        </div>
        <p class="name" :style="{'color': player.color}">{{player.name}}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import store from '@/store';
import { computed } from 'vue';
import router from '../router/index';
import SocketClient from '../class/SocketClient';

const roomInfo = computed(() => store.state.roomInfo);
const socketClient = SocketClient.getInstance();

const handleBack = () => {
  socketClient.leaveRoom(roomInfo.value.roomId);
  router.replace('/room-list');
}

</script>

<style lang="scss" scoped>
#room_page {
  width: 95%;
  height: 90%;
  border-radius: 20px;
  background-color: rgba($color: #ffffff, $alpha: 0.7);
  display: flex;
  flex-direction: column;
}

.top_bar {
  height: 50px;
  display: flex;
  justify-content: space-between;
  border-radius: 15px 15px 0 0;
  background-color: #ff8534da;

  .title {
    flex: 1;
    color: #ffffff;
    font-size: 1.3rem;
    line-height: 50px;
    padding-left: 10px;
  }

  button {
    border: 0;
    padding: 0 20px;
    color: #ffffff;
    font-size: 1.3rem;
    border-radius: 15px 0 0 0;
    font-family: "ContentFont";
    line-height: 50px;
    background-color: #ffc400da;
    cursor: pointer;

    &:hover {
      background-color: #ffcd2ada;
    }

    &:last-child {
      padding: 0 20px 0 35px;
      border-radius: 0 15px 0 0;
      -webkit-clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%);
      clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%);
    }
  }
}

.player_list {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 33.3%);
  grid-template-rows: repeat(2, 50%);

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
}
</style>