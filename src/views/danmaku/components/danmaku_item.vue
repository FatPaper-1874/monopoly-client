<script setup lang="ts">
import {ChatMessage} from "@/interfaces/bace";

const {message} = defineProps<{ message: ChatMessage }>()
</script>

<template>
  <div class="danmaku_item">
    <span :style="{color: message.user.color}" class="name">{{ message.user.username }}</span>
    <span>: </span>
    <span class="message">{{ message.content }}</span>
  </div>
</template>

<style scoped lang="scss">
.danmaku_item {
  width: auto;
  display: inline-block;
  background-color: rgba(255, 255, 255, .75);
  transform: translateX(-150%);
  position: absolute;
  padding: .3rem .5rem;
  border-radius: .5rem;
}

.danmaku_item {
  & > .message {
    text-shadow: var(--text-shadow);
    color: #151515;
  }
}
</style>