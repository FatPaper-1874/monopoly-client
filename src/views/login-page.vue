<template>
  <div id="login_page">
    <div class="top_bar">BIG FW</div>
    <div class="form_container">
      <input type="text" name="" id="name_input" v-model="userName" maxlength="7" placeholder="输入用户名(最多7个字符)">
      <button id="login_button" @click="handlePlayClick">Play!</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import store from '@/store';
import router from '../router/index';

const userName = ref('');

const handlePlayClick = () => {
  if (userName.value.length > 1) {
    store.dispatch('aSetUserName', userName.value);
    router.replace("room-list");
  } else {
    alert("输入你条名啦7头");
  }
}
</script>

<style lang="scss" scoped>
#login_page {
  width: 450px;
  border-radius: 15px;
  background-color: rgba($color: #ffffff, $alpha: 0.7);
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);

  .top_bar {
    height: 70px;
    line-height: 70px;
    color: #ffffff;
    font-size: 2rem;
    padding-left: 15px;
    border-radius: 15px 15px 0 0;
    background-color: #ff8534da;
  }

  .form_container {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

#name_input {
  width: 300px;
  height: 50px;
  outline-style: none;
  border: 1px solid rgba($color: #ffffff, $alpha: 0.5);
  border-radius: 10px;
  padding: 0;
  padding: 10px 15px;
  box-sizing: border-box;
  font-family: "Microsoft soft";
  font-size: 1.3rem;

  &:focus {
    outline: 0;
    -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
      #ffb05c;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
      #ffb05c;
  }
}

#login_button {
  width: 170px;
  height: 50px;
  margin-top: 15px;
  border: 0;
  border-radius: 10px;
  font-size: 1.2rem;
  background-color: #ff9422;
  color: #ffffff;
  font-family: 'ContentFont';
  cursor: pointer;

  &:hover {
    background-color: #ffa23e;
  }
}
</style>