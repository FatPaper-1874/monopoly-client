<script setup lang="ts">
import Loading from "@/components/utils/fp-loading/fp-loading.vue";
import Background from "@/views/background/background.vue";
import Ping from "@/components/common/ping.vue";
import {computed} from 'vue';
import {useRoute} from "vue-router";
import Chat from "@/views/chat/chat.vue";
import MusicPlayer from "@/views/music_player/music_player.vue";
import DanmakuContainer from "@/views/danmaku/danmaku_container.vue";

const isInGame = computed(() => useRoute().name === 'game');
const canChat = computed(() => useRoute().name === 'room' || useRoute().name === 'game');
// const isLogin = computed(() => useRoute().name === 'login');
</script>

<template>
  <Chat v-if="canChat"/>
  <DanmakuContainer v-if="canChat"/>
  <Background v-if="!isInGame"/>
  <Loading/>
  <RouterView></RouterView>
  <Ping></Ping>
<!--  <MusicPlayer v-show="!isLogin"/>-->
</template>

<style lang="scss" scoped></style>
