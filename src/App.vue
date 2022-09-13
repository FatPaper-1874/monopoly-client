<template>
  <router-view></router-view>
  <!-- <input type="text" v-model="userName" placeholder="用户名" />
  <input type="text" v-model="formRoomId" placeholder="房间id" />
  <button @click="joinRoom">进入房间</button>
  <button @click="leaveRoom">离开房间</button>
  <p>当前所有房间: {{roomList}}</p>
  <p>房间ID: {{roomId}}</p>
  <p>当前房间玩家信息: {{playerList}}</p> -->

  <div class="bg"></div>
  <div class="bg bg2"></div>
  <div class="bg bg3"></div>
</template>

<script setup lang="ts">

</script>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  border: 0;
}

html{
  font-size:16px;
}

#app {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'ContentFont';
}

.bg {
  animation: slide 3s ease-in-out infinite alternate;
  background-image: linear-gradient(-60deg, rgb(255, 110, 110) 50%, rgb(255, 188, 101) 50%);
  bottom: 0;
  left: -50%;
  opacity: .5;
  position: fixed;
  right: -50%;
  top: 0;
  z-index: -1;
}

.bg2 {
  animation-direction: alternate-reverse;
  animation-duration: 4s;
}

.bg3 {
  animation-duration: 5s;
}

@keyframes slide {
  0% {
    transform: translateX(-25%);
  }

  100% {
    transform: translateX(25%);
  }
}
</style>
