<script setup lang="ts">

import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {computed, ref} from "vue";


const isFullScreen = ref(false);

document.addEventListener('fullscreenchange', () => {
  isFullScreen.value = (document.fullscreenElement !== null)
})

async function requestFullScreen() {
  const element = document.documentElement
  if (element.requestFullscreen) {
    await element.requestFullscreen();
    //@ts-ignore
  } else if (element.mozRequestFullScreen) { // 兼容Firefox
    //@ts-ignore
    await element.mozRequestFullScreen();
    //@ts-ignore
  } else if (element.webkitRequestFullscreen) { // 兼容Chrome和Safari
    //@ts-ignore
    await element.webkitRequestFullscreen();
  }
}

async function exitFullScreen() {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
    //@ts-ignore
  } else if (document.mozCancelFullScreen) { // 兼容Firefox
    //@ts-ignore
    await document.mozCancelFullScreen();
    //@ts-ignore
  } else if (document.webkitExitFullscreen) { // 兼容Chrome和Safari
    //@ts-ignore
    await document.webkitExitFullscreen();
  }
}
</script>

<template>
  <div v-show="!isFullScreen" @click="requestFullScreen" id="request-full-screen-mask">
    <div class="text_container">
      <span>请点击任意区域进入全屏</span>
      <FontAwesomeIcon beat class="icon" icon="expand"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
#request-full-screen-mask {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999999;
  background-color: #000000;
  color: #ffffff;
  font-size: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;

  .text_container {
    text-align: center;
    & > span {
      margin-right: 1rem;
    }

  }
}
</style>