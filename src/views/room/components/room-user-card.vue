<script setup lang="ts">
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {lightenColor, randomString} from "@/utils";
import {computed, ref, reactive, onMounted, watch, nextTick} from "vue";
import {Role, User} from "@/interfaces/bace";
import {useRoomInfo, useUserInfo} from "@/store";
import {ChangeRoleOperate} from "@/enums/bace";
import {GameSocketClient} from "@/utils/websocket/fp-ws-client";
import {RolePreviewer} from "@/views/room/utils/RolePreviewer";

const props = defineProps<{ user: User | undefined }>();

const user = computed(() => props.user);
const lightColor = computed(() => user.value ? lightenColor(user.value.color, 15) : "#ffffff");
const avatarSrc = computed(() => user.value ? `http://${user.value.avatar}` : "");
const isMe = computed(() => user.value ? user.value.userId === useUserInfo().userId : false)

const handleChangeRole = (operate: ChangeRoleOperate) => {
  const serverClient = GameSocketClient.getInstance();
  serverClient.changeRole(operate);
};

const canvasId = randomString(16);
let rolePreviewer: RolePreviewer | undefined;

onMounted(() => {
  nextTick(() => {
    const canvasEl = document.getElementById(canvasId) as HTMLCanvasElement;
    rolePreviewer = new RolePreviewer(canvasEl, true);
    watch(() => props.user, (newUser, oldUser) => {
      if (rolePreviewer && newUser && newUser.role.id !== (oldUser?.role.id || "")) {
        rolePreviewer.loadRole(`http://${newUser.role.baseUrl}/`, newUser.role.fileName);
      }
    }, {immediate: true, deep: true})
  })
})
</script>

<template>
  <div class="room-user-card">
    <div class="ready-tag" v-if="user && user.isReady">准备</div>
    <div class="choose-role" v-else-if="user && user.role" :style="{ 'background-color': user.role.color }">
      <font-awesome-icon v-if="isMe" @click="handleChangeRole(ChangeRoleOperate.Prev)" class="icon" icon="angle-left"/>
      <span>{{ user.role.roleName }}</span>
      <font-awesome-icon
          v-if="isMe"
          @click="handleChangeRole(ChangeRoleOperate.Next)"
          class="icon"
          icon="angle-right"
      />
    </div>
    <div class="choose-role" v-else-if="user && !user.role">
      <span>选择角色</span>
    </div>

    <div v-if="user && user.username" class="user-info">
      <div class="avatar" :style="{ 'background-color': user.color }">
        <img :src="avatarSrc" alt="avatar"/>
      </div>
      <div class="info" :style="{ 'background-color': lightColor }">
        <span class="username">{{ user.username }}</span>
      </div>
    </div>

    <!--    <div v-else-if="isban" class="ban">-->
    <!--      <font-awesome-icon class="icon" icon="ban"/>-->
    <!--    </div>-->

    <div class="role-container">
      <canvas :id="canvasId"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.room-user-card {
  width: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 0.8rem;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(3px);
  box-sizing: border-box;
  box-shadow: var(--box-shadow);

  & > .ready-tag,
  .choose-role {
    position: absolute;
    bottom: 5%;
    width: 100%;
    font-size: 1.5rem;
    height: 2.6rem;
    line-height: 2.6rem;
    color: #ffffff;
    background-color: rgb(255, 221, 25);
    text-align: center;
    box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.1);
    text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  & > .choose-role {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 0;
    user-select: none;
    background-color: rgba(185, 185, 185, 0.8);
    padding: 0 0.6rem;
    box-sizing: border-box;

    & > span {
      flex: 1;
    }

    & > svg:hover {
      cursor: pointer;
    }
  }

  & > .ban {
    font-size: 5rem;
    color: rgba(196, 196, 196, 0.6);
  }

  & > .user-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
    position: absolute;
    left: 0;
    top: 0;

    & > .avatar {
      $icon-size: 2.4rem;
      min-width: $icon-size;
      min-height: $icon-size;
      width: $icon-size;
      height: $icon-size;
      text-align: center;
      line-height: $icon-size;
      // border: 4px solid #ffffff;
      font-size: 1.2rem;
      color: #ffffff;
      box-shadow: var(--box-shadow);
      z-index: 101;
      overflow: hidden;

      & > img {
        width: $icon-size;
        height: $icon-size;
      }
    }

    & > .info {
      height: 2.4rem;
      text-align: center;
      flex: 1;
      // border: 4px solid #ffffff;
      border-left: 0px;
      box-shadow: var(--box-shadow);

      & > .username {
        line-height: 2.4rem;
        color: #ffffff;
        font-size: 1.1rem;
        text-shadow: var(--text-shadow);
      }
    }
  }
}

.role-container {
  width: 100%;
  height: 100%;

  & > .no-role {
    font-size: 10rem;
    color: rgba($color: #777777, $alpha: 0.2);
  }

  & canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>