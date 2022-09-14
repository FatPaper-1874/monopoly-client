<template>
  <div id="game_page">
    <div class="top_bar">
      <button id="go_back">退出游戏</button>
      <span class="title">{{}}的房间</span>
    </div>
    <div class="game_container">
      <div class="center_area"></div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
#game_page {
  width: 100vw;
  height: 100vh;
  background-color: rgba($color: #ffffff, $alpha: 0.7);
  display: flex;
  flex-direction: column;

  .top_bar {
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: space-between;
    background-color: #ff8534da;

    .title {
      flex: 1;
      color: #ffffff;
      font-size: 1.3rem;
      line-height: 50px;
      padding-left: 10px;
    }

    button {
      border: 0;
      padding: 0 20px;
      color: #ffffff;
      font-size: 1.3rem;
      font-family: "ContentFont";
      line-height: 50px;
      background-color: #ffc400da;
      cursor: pointer;

      &:hover {
        background-color: #ffcd2ada;
      }
    }
  }
}

.game_container {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  flex: 1;
  display: grid;
  grid-template-columns: 8% repeat(12, 7%) 8%;
  grid-template-rows: 15% repeat(7, 10%) 15%;
  grid-template-areas:
    "item21 item22 item23 item24 item25 item26 item27 item28 item29 item30 item31 item32 item33 item34"
    "item20 center center center center center center center center center center center center item35"
    "item19 center center center center center center center center center center center center item36"
    "item18 center center center center center center center center center center center center item37"
    "item17 center center center center center center center center center center center center item38"
    "item16 center center center center center center center center center center center center item39"
    "item15 center center center center center center center center center center center center item40"
    "item14 center center center center center center center center center center center center item41"
    "item13 item12 item11 item10 item9 item8 item7 item6 item5 item4 item3 item2 item1 item0";

  .center_area {
    grid-area: center;
  }
}
</style>