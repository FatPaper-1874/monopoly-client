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
  isban: {
    type: Boolean,
    default: false,
  },
  isReady: {
    type: Boolean,
    default: false,
  },
  isRoomOwner: {
    type: Boolean,
    default: false,
  }
});
</script>

<template>
  <div class="room-user-card">

    <div class="ready-tag" v-if="isReady">准备</div>

    <div v-if="username" class="user-info">
      <div v-if="isRoomOwner" class="owner-tag">
        <font-awesome-icon class="icon" icon="crown" />
      </div>
      <div class="avatar" :style="{ 'background-color': color }">
        <font-awesome-icon class="icon" :icon="icon" />
      </div>
      <div class="info">
        <span class="username">{{ username }}</span>
      </div>
    </div>

    <div v-else-if="isban" class="ban">
      <font-awesome-icon class="icon" icon="ban" />
    </div>

  </div>
</template>

<style lang='scss' scoped>
.room-user-card {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 20px;
  border: 7px solid rgba(255, 255, 255, 0.7);
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(3px);
  padding: 20px 10px;
  box-sizing: border-box;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);

  &>.ready-tag {
    position: absolute;
    bottom: 10%;
    width: 100%;
    font-size: 1.5em;
    height: 1.5em;
    line-height: 1.5em;
    color: #ffffff;
    background-color: rgb(255, 221, 25);
    text-align: center;
    box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.1);
    text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  &>.ban {
    font-size: 5em;
    color: rgba(196, 196, 196, 0.6)
  }

  &>.user-info {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;

    &>.owner-tag {
      position: relative;

      &>.icon {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 2.5em;
        position: absolute;
        color: rgb(255, 221, 25);
        z-index: 100;
      }
    }

    &>.avatar {
      $icon-size: 110px;
      min-width: $icon-size;
      min-height: $icon-size;
      width: $icon-size;
      height: $icon-size;
      text-align: center;
      line-height: $icon-size;
      border: 5px solid #ffffff;
      border-radius: 50%;
      font-size: 50px;
      color: #ffffff;
      box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    }

    &>.info {

      &>.username {
        color: #ffffff;
        font-size: 1.7em;
        text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.2);
      }
    }
  }


}
</style>