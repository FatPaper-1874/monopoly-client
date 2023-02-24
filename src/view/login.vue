<script setup lang='ts'>
import { apiLogin } from '../utils/api/login';
import { ref, onBeforeMount } from 'vue';
import router from '../router';

onBeforeMount(() => {
  if (localStorage.getItem('token')) {
    router.push({ name: "room-list" });
  }
});

const username = ref("");
const password = ref("");

const handleLogin = async() => {
  if(await apiLogin(username.value, password.value)){
    router.push({ name: "room-list" });
  };
}
</script>

<template>
  <div class="login-page">
    <div class="title">
      <span>天上人间大富翁</span>
    </div>
    <div class="form-container">
      <span>账号</span>
      <input class="fp-input" type="text" id="username" v-model="username" />
      <span>密码</span>
      <input class="fp-input" type="password" id="password" v-model="password" />

      <button @click="handleLogin()" class="fp-button login-button">登录</button>
    </div>
  </div>

</template>

<style lang='scss' scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-container {
  width: 26rem;
  margin-top: 7.5rem;
  padding: 1.8rem 1.25rem;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.5);

  &>input {
    margin: 10px 0;
    height: 3.4rem;
    font-size: 1.2rem;
    color: #ff9114;
  }

  &>span {
    display: block;
    font-size: 1.6rem;
    color: #ffffff;
    text-shadow: 2px 2px #ff9114;
  }

  &>.login-button {
    width: 100%;
    padding: 13px;
    margin-top: 35px;
    font-size: 1.6em;
  }
}

.title {
  margin-top: 30px;

  &>span {
    font-size: 6em;
    color: #ffffff;
    letter-spacing: 0.3em;
    display: block;
    position: relative;

    &::before,
    &::after {
      content: "天上人间大富翁";
    }

    &:before,
    &:after {
      position: absolute;
      left: 0;
      top: 0;
    }

    &:before {
      color: #ff9114;
      z-index: -1;
      animation: rotate1 5s ease-in-out infinite;
    }

    &:after {
      color: #7e7e7e;
      z-index: -2;
      animation: rotate2 5s ease-in-out infinite;
    }
  }

  @keyframes rotate1 {

    0%,
    100% {
      -webkit-transform: translate3d(3px, 3px, 3px);
      transform: translate3d(3px, 3px, 3px);
    }

    50% {
      -webkit-transform: translate3d((-3px, 3px, -3px));
      transform: translate3d((-3px, 3px, -3px));
    }
  }

  @keyframes rotate2 {

    0%,
    100% {
      -webkit-transform: translate3d(5px, 5px, 5px);
      transform: translate3d(5px, 5px, 5px);
    }

    50% {
      -webkit-transform: translate3d((-5px, 5px, -5px));
      transform: translate3d((-5px, 5px, -5px));
    }
  }
}
</style>