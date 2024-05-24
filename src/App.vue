<script setup lang="ts">
import FullScreenMask from "@/views/screen_mask/screen_mask.vue";
import Loading from "@/components/utils/fp-loading/fp-loading.vue";
import Background from "@/views/background/background.vue";
import Ping from "@/components/common/ping.vue";
import {computed} from 'vue';
import {useRoute} from "vue-router";
import Chat from "@/views/chat/chat.vue";
import MusicPlayer from "@/views/music_player/music_player.vue";
import DanmakuContainer from "@/views/danmaku/danmaku_container.vue";
import {isMobileDevice} from "@/utils";

const isMobile = isMobileDevice();
const isInGame = computed(() => useRoute() ? useRoute().name === 'game' : false);
const canChat = computed(() => useRoute() ? (useRoute().name === 'room' || useRoute().name === 'game') : false);
const isLogin = computed(() => useRoute() ? useRoute().name === 'login' : true);
</script>

<template>
  <FullScreenMask v-if="isMobile"/>
  <Chat v-if="canChat"/>
  <DanmakuContainer v-if="canChat"/>
  <Background v-if="!isInGame"/>
  <Loading/>
  <RouterView></RouterView>
  <Ping />
  <MusicPlayer v-show="!isLogin"/>
</template>

<style lang="scss" scoped></style>
