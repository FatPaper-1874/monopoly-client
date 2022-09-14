<template>
  <div id="room_list">
    <div class="top_bar">
      <div class="title">欢迎你 {{userName}}</div>
      <button @click="handleCreateRoom">创建房间</button>
    </div>
    <div id="no_rooms" v-if="roomList.length == 0">
      <font-awesome-icon icon="fa-solid fa-house-circle-exclamation" />
      <span>芜！还没有房间诶，快去新建一个吧！</span>
    </div>
    <div v-else id="list_container">
      <div class="list_items" v-for="item in roomList" :key="item.owner" @click="handleJoinRoom(item.roomId)">

        <div class="info_container">
          <div class="room_name">
            <span>{{item.owner}}</span>
            <span>的房间</span>
          </div>
          <div class="room_id">
            <span>房间ID: </span>
            <span>{{item.roomId}}</span>
          </div>
        </div>

        <div class="player_num_container">
          <span>{{item.playerList.length}}</span>
          <span>/</span>
          <span>6</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import store from '@/store';
import { computed } from 'vue';
import SocketClient from '../class/SocketClient';
import router from '../router/index';

const roomList = computed(() => store.state.roomList);
const userName = computed(() => store.state.userName);

const socketClient = SocketClient.getInstance();

const handleJoinRoom = (roomId: string) =>{
  socketClient.joinRoom(userName.value, roomId);
  router.replace('/room-page');
}

const handleCreateRoom = () => {
  socketClient.joinRoom(userName.value, '');
  router.replace('/room-page');
}

</script>

<style lang="scss" scoped>
#room_list {
  width: 95%;
  height: 90%;
  border-radius: 20px;
  background-color: rgba($color: #ffffff, $alpha: 0.7);
  display: flex;
  flex-direction: column;
}

#no_rooms{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 3vw;
    color: #ffa052;
  }

#list_container {
  display: grid;
  flex: 1;
  grid-template-rows: repeat(4, 25%);
  grid-template-columns: repeat(2, 50%);
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
    padding: 0 20px 0 35px;
    border-radius: 0 15px 0 0;
    color: #ffffff;
    font-size: 1.3rem;
    font-family: "ContentFont";
    line-height: 50px;
    background-color: #ffc400da;
    -webkit-clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%);
    clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%);
    cursor: pointer;

    &:hover {
      background-color: #ffcd2ada;
    }
  }
}

.list_items {
  margin: 15px;
  border-radius: 20px;
  box-sizing: border-box;
  background-color: rgba($color: #ffffff, $alpha: 0.85);
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  justify-content: space-between;

  &:hover {
    margin: 12px;
  }


  .info_container {
    height: 100%;
    padding: 15px 15px 20px 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .room_name {
      span:nth-child(1) {
        color: #af3c3c;
        font-size: 3vw;
      }

      span:nth-child(2) {
        color: #f75830;
        font-size: 3vw;
      }
    }

    .room_id {
      span:nth-child(1) {
        color: #af3c3c;
        font-size: 1.5vw;
      }

      span:nth-child(2) {
        color: #f75830;
        font-size: 1.5vw;
      }
    }
  }

  .player_num_container {
    width: 200px;
    height: 100%;
    border-radius: 0 20px 20px 0;
    background-color: #ffc400da;
    -webkit-clip-path: polygon(25% 0, 100% 0, 100% 100%, 0% 100%);
    clip-path: polygon(25% 0, 100% 0, 100% 100%, 0% 100%);
    display: flex;
    justify-content: center;
    align-items: center;


    span:nth-child(1) {
      color: #f75830;
      font-size: 4vw;
      margin-left: 30px;
    }

    span:nth-child(2) {
      color: #af3c3c;
      font-size: 4vw;
    }

    span:nth-child(3) {
      color: #af3c3c;
      font-size: 4vw;
    }
  }

}
</style>