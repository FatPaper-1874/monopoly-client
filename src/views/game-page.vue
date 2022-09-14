<template>
  <div id="game_page">
    <div class="top_bar">
      <button id="go_back">退出游戏</button>
      <span class="title">{{roomInfo.owner}}的房间</span>
    </div>
    <div class="game_container">
      <div class="map_items" v-for="(item, index) in gameFrameInfo.mapInfo.mapItemList" :key="item.id"
        :style="{'grid-area': 'item'+index, 'border-color': item.color}">
        <Popper :placement="(index > 13 && index< 21) || index > 34? 'right' : 'top'" hover="true">
          <span>{{item.name}}</span>
          <template #content>
            <div class="map_item_info">
              <p>买地价: {{item.costList?.buy}}</p>
              <p>起楼价: {{item.costList?.build}}</p>
              <p>过路费: {{item.costList?.pass}}</p>
              <p>一栋房子过路费: {{item.costList?.oneHouse}}</p>
              <p>两栋房子过路费: {{item.costList?.towHouse}}</p>
              <p>别墅过路费: {{item.costList?.villa}}</p>
              <p>拥有者:{{item.owner?.name}}</p>
            </div>
          </template>
        </Popper>
      </div>
      <div class="center_area"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import store from '@/store';
import { computed } from 'vue';

const roomInfo = computed(() => store.state.roomInfo);
const gameFrameInfo = computed(() => store.state.gameFrame);
</script>

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

  .map_items {
    text-align: center;
    margin: 2.5px;
    box-sizing: border-box;
    padding: 5px;
    border-bottom: 3px solid;
    border-radius: 5px;
    background-color: rgba($color: #ffffff, $alpha: 0.8);

    span {
      user-select: none;
      cursor: pointer;
    }
  }

  .map_item_info {
    padding: 0 15px;
    border-radius: 5px;
    border: 4px solid #dadadab6;
    background-color: #ffffff;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  }
}
</style>