<script setup lang='ts'>
</script>

<template>
  <Transition name="popover" appear>
    <slot></slot>
  </Transition>
</template>

<style lang='scss' scoped>
.popover-enter-active,
.popover-leave-active {
  transition: all 0.3s ease-in;
}

.popover-enter-from,
.popover-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>