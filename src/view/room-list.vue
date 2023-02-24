<script setup lang='ts'>
import { onBeforeMount, computed, ref } from 'vue';
import { getUserInfo } from '../utils/api/user';
import { useUserInfo, useUserList, useRoomList, useRoomInfo } from '../store/index';
import { GameSocketClient } from '../utils/websocket/fp-ws-client';
import userCard from '../components/common/user-card.vue';
import userListItem from '../components/common/user-list-item.vue';
import roomListItem from '../components/common/room-list-item.vue';
import router from '../router/index';

let socketClient: GameSocketClient;
onBeforeMount(async () => {
  if (await getUserInfo()) {
    socketClient = GameSocketClient.getInstance();
  }
  if(useRoomInfo().roomId){
    router.replace({name: "room"})
  }
})

const userInfoStore = useUserInfo();
const userListStore = useUserList();
const roomListStroe = useRoomList();

const userId = computed(() => userInfoStore.userId);
const username = computed(() => userInfoStore.username);
const avatar = computed(() => userInfoStore.avatar);
const color = computed(() => userInfoStore.color);

const userList = computed(() => userListStore.userList);
const roomList = computed(() => roomListStroe.roomList);

const handleCreateRoom = () => {
  if (socketClient) {
    socketClient.joinRoom("");
  }
}

const handleJoinRoom = (roomId: string) => {
  if (socketClient) {
    socketClient.joinRoom(roomId);
  }
}

</script>

<template>
  <div class="room-list-page">
    <div class="left-container">
      <div class="user-container">
        <userCard :icon="avatar" :username="username" :color="color" />
      </div>
      <div class="player-list-container">
        <div class="player-list-title">玩家列表({{ userList.length }})</div>
        <div class="player-list">
          <userListItem v-for="user in userList" :key="user.userId" :icon="user.avatar" :username="user.username"
            :color="user.color" />
        </div>
      </div>
    </div>
    <div class="right-container">
      <div class="room-list-topbar">
        <div class="room-list-info">房间列表({{ roomList.length }})</div>
        <button class="create-room-button" @click="handleCreateRoom">创建房间</button>
      </div>
      <div class="room-list">
        <roomListItem @click="handleJoinRoom(room.roomId)" v-for="room in roomList" :key="room.roomId"
          :owner-name="room.ownerName" :player-num="room.userNum" />
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
.room-list-page {
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
    width: 20vw;
    max-width: 400px;
    margin-right: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &>div {
      border-radius: 20px;
      background-color: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(3px)
    }

    &>.user-container {
      width: 100%;
      height: 150px;
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    &>.player-list-container {
      width: 100%;
      flex: 1;
      box-sizing: border-box;
      overflow: hidden;

      &>.player-list {
        flex: 1;
        padding: 7px 10px;
      }
    }
  }

  &>.right-container {
    flex: 1;
    height: 100%;
    border-radius: 20px;
    background-color: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(3px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &>.room-list {
      flex: 1;
    }
  }
}

.player-list-title {
  font-size: 1.1em;
  height: 1.8em;
  line-height: 1.8em;
  width: 100%;
  color: #ffffff;
  text-align: center;
  background-color: #ffe02d;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.1);
}

.room-list-topbar {
  font-size: 1.3em;
  height: 2em;
  line-height: 2em;
  width: 100%;
  color: #ffffff;
  background-color: #ffe02d;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.1);

  &>.room-list-info {
    padding-left: 0.8em;
  }

  &>.create-room-button {
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