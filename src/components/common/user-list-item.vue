<script setup lang='ts'>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
const props = defineProps({
  username: {
    type: String,
    default: ""
  },
  color: {
    type: String,
    default: "#ffb24e"
  },
  icon: {
    type: String,
    default: "user"
  },
});
</script>

<template>
  <div class="user-list-item">
    <div class="avatar" :style="{ 'background-color': color }">
      <font-awesome-icon class="icon" :icon="icon" />
    </div>
    <p class="username" :style="{ 'color': color }">{{ username }}</p>
  </div>
</template>

<style lang='scss' scoped>
.user-list-item {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border-radius: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);

  &>.avatar {
    width: 3em;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 1em;
  }

  &>.username{
    flex: 1;
    text-align: center;
  }
}
</style>