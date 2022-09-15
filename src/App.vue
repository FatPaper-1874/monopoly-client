<template>
  <router-view></router-view>
  <!-- <input type="text" v-model="userName" placeholder="用户名" />
  <input type="text" v-model="formRoomId" placeholder="房间id" />
  <button @click="joinRoom">进入房间</button>
  <button @click="leaveRoom">离开房间</button>
  <p>当前所有房间: {{roomList}}</p>
  <p>房间ID: {{roomId}}</p>
  <p>当前房间玩家信息: {{playerList}}</p> -->

  <div class="main_background">
    <div class="dollar" v-for="i in 30" :key="i">
      <span v-for="j in 40" :key="j">$</span>
    </div>
  </div>
  <notifications position="top center" :duration="2000">
    <template #body="props">
      <div class="fat-notification" :class="props.item.type">
        <font-awesome-icon class="icon" :icon="['fas', type[props.item.type as string]]" />
        <span>{{props.item.text}}</span>
      </div>
    </template>
  </notifications>
</template>

<script setup lang="ts">

interface Type {
  [key: string]: string;
}

const type: Type = {
  'success': 'circle-check',
  'warn': 'circle-exclamation',
  'error': 'circle-xmark',
}
</script>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  border: 0;
}

html {
  font-size: 16px;
}

#app {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'ContentFont';
  position: relative;
  overflow: hidden;
}

.fat-notification {
  margin-top: 20px;
  padding: 10px 20px;
  border: 5px solid #f5f5f5a6;
  border-radius: 10px;
  color: rgba($color: #ffffff, $alpha: 0.95);

  .icon{
    margin-right: 10px;
  }

  &.success {
    background: #68cd86;
  }

  &.warn {
    background: #ffb648;
  }

  &.error {
    background: #e54d42;
  }
}

.main_background {
  position: absolute;
  width: 200vw;
  height: 100vh;
  top: 0;
  left: 0;
  overflow: hidden;
  z-index: -1000;
  user-select: none;

  .dollar {
    width: 200vw;
    height: 8vw;
    color: #ffe261;
    background-color: #ffb24e;
    -webkit-animation: 8s rowRight linear infinite normal;
    animation: 8s rowRight linear infinite normal;
    overflow: hidden;
    // rotate: (20deg);

    span {
      font-size: 7vw;
      display: inline-block;
      width: 10vw;
      height: 8vw;
      line-height: 7.5vw;
      text-align: center;
    }

    &:nth-child(even) {
      color: #ffb24e;
      height: 6vw;
      background-color: #ffe261;
      -webkit-animation: 14s rowLeft linear infinite normal;
      animation: 14s rowLeft linear infinite normal;

      span {
        font-size: 4vw;
        display: inline-block;
        width: 5vw;
        height: 6vw;
        line-height: 6vw;
        text-align: center;
      }
    }
  }
}

@keyframes rowRight {
  0% {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }

  100% {
    -webkit-transform: translate3d(-100vw, 0, 0);
    transform: translate3d(-100vw, 0, 0);
  }
}

@-webkit-keyframes rowRight {
  0% {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }

  100% {
    -webkit-transform: translate3d(-100vw, 0, 0);
    transform: translate3d(-100vw, 0, 0);
  }
}

@keyframes rowLeft {
  0% {
    -webkit-transform: translate3d(-100vw, 0, 0);
    transform: translate3d(-100vw, 0, 0);
  }

  100% {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

@-webkit-keyframes rowLeft {
  0% {
    -webkit-transform: translate3d(-100vw, 0, 0);
    transform: translate3d(-100vw, 0, 0);
  }

  100% {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}
</style>
