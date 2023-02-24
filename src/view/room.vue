<script setup lang='ts'>
import { computed, onBeforeMount } from 'vue';
import { useRoomInfo } from '../store';
import router from '../router/index';
import roomUserCard from '../components/common/room-user-card.vue';
import { GameSocketClient } from '../utils/websocket/fp-ws-client';
import { useUserInfo } from '../store/index';

const roomInfoStroe = useRoomInfo();
const userInfoStore = useUserInfo();

const playerList = computed(() => roomInfoStroe.userList);
const ownerName = computed(() => roomInfoStroe.ownerName);
const ownerId = computed(() => roomInfoStroe.ownerId);
const isOwner = computed(() => userInfoStore.userId === roomInfoStroe.ownerId);

onBeforeMount(() => {
  if (!useRoomInfo().roomId) {
    router.replace({ name: 'room-list' });
  }
})
const socketClient = GameSocketClient.getInstance();

const handleLeaveRoom = () => {
  socketClient.leaveRoom(roomInfoStroe.roomId);
}

const handleReadyToggle = () => {
  socketClient.readyToggle(roomInfoStroe.roomId);
}

const handleGameStart = () => {
  socketClient.startGame(roomInfoStroe.roomId);
}

</script>

<template>
  <div class="room-page">

    <div class="left-container">
      <div class="room-topbar">
        <button class="leave-room-button" @click="handleLeaveRoom">退出房间</button>
        <span style="flex: 1; text-align:center;">{{ ownerName }}的房间</span>
      </div>
      <div class="room-footbar">
        <button v-if="isOwner" class="ready-button" @click="handleGameStart">开始游戏</button>
        <button v-else class="ready-button" @click="handleReadyToggle">准备</button>
      </div>
    </div>

    <div class="right-container">
      <div class="player-list-container">
        <roomUserCard v-for="player in playerList" :key="player.userId" :username="player.username" :color="player.color"
          :icon="player.avatar" :is-ready="player.isReady" :is-room-owner="player.userId === ownerId" />
        <roomUserCard v-for="i in (6 - playerList.length)" :key="i" />
      </div>
    </div>

  </div>
</template>

<style lang='scss' scoped>
.room-page {
  width: 70vw;
  height: 80%;
  padding: 20px;
  margin: auto;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;

  &>div {
    height: 100%;
  }

  &>.left-container {
    width: 25vw;
    margin-right: 8px;
    box-sizing: border-box;
    border-radius: 15px;
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(3px);
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  &>.right-container {
    flex: 1;
    display: flex;
    flex-direction: column;

    &>.player-list-container {
      flex: 1;
      display: grid;
      grid-template-rows: 1fr 1fr;
      grid-template-columns: 1fr 1fr 1fr;
      row-gap: 8px;
      column-gap: 8px;
    }
  }
}

.room-topbar {
  font-size: 1.3em;
  height: 2em;
  line-height: 2em;
  width: 100%;
  color: #ffffff;
  margin-bottom: 8px;
  background-color: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(3px);
  background-color: rgb(255, 221, 25);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.1);
  text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  &>.leave-room-button {
    height: 100%;
    padding: 0 0.7em;
    border: 0;
    color: #ffffff;
    font-size: 0.8em;
    background-color: #ffa33a;
    text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.1);
    cursor: pointer;

    &:hover {
      background-color: #ec8209;
    }
  }
}

.room-footbar {
  font-size: 2em;
  height: 1.5em;
  line-height: 1.5em;
  width: 100%;
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(3px);
  background-color: rgb(255, 221, 25);
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  &>.ready-button {
    width: 100%;
    height: 100%;
    padding: 0 0.7em;
    border: 0;
    color: #ffffff;
    font-size: 0.8em;
    background-color: #ffa33a;
    text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.1);
    cursor: pointer;

    &:hover {
      background-color: #ec8209;
    }
  }
}
</style>