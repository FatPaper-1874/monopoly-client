<template>
  <div id="room_page">
    <div class="top_bar">
      <button id="go_back" @click="handleBack">返回</button>
      <span class="title">{{roomInfo.owner}}的房间</span>
      <button id="game_start" @click="handleStartGame">开始游戏</button>
    </div>
    <div class="player_list">
      <playerContainer v-for="player in roomInfo.playerList" :key="player.id" :player="player"
        :isRoomOwner="roomInfo.ownerId === player.id"></playerContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import store from '@/store';
import { computed } from 'vue';
import router from '../router/index';
import SocketClient from '../class/SocketClient';
import playerContainer from '@/components/player-container.vue';

const roomInfo = computed(() => store.state.roomInfo);
const socketClient = SocketClient.getInstance();

const handleBack = () => {
  socketClient.leaveRoom(roomInfo.value.roomId);
  router.replace('/room-list');
}

const handleStartGame = () => {
  socketClient.startGame(roomInfo.value.roomId);
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
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
}
</style>