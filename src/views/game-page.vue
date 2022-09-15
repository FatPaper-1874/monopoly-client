<template>
  <div id="game_page">
    <div class="top_bar">
      <button id="go_back">退出游戏</button>
      <span class="title">{{roomInfo.owner}}的房间</span>
    </div>
    <div class="game_container map">

      <!-- 棋子↓ -->
      <div v-for="(player, index) in gameFrameInfo.playerInfoList" :key="player.id" class="small_size_avatar avatar"
        :style="{'background-color': player.color, 'grid-area': `item${player.currentGrid}`, 'place-self': playerItemPosition[index]}">
        <font-awesome-icon class="icon" :icon="['fas', player.icon]" />
      </div>
      <!-- 棋子↑ -->

      <div class="map_items" v-for="(item, index) in gameFrameInfo.mapInfo.mapItemList" :key="item.id"
        :style="{'grid-area': 'item'+index, 'border-color': item.color}">
        <Popper :placement="(index > 13 && index< 21) || index > 34? 'right' : 'top'" :hover="true">
          <div class="map_item_name">{{item.name}}</div>
          <template #content v-if="item.costList">
            <div class="map_item_info" :style="{'border-color': item.color}">
              <span :style="{'background-color': item.color}" class="title">{{item.name}}</span>
              <p>买地价: {{item.costList?.buy || '—'}}¥</p>
              <p>起楼价: {{item.costList?.build || '—'}}¥</p>
              <p>过路费: {{item.costList?.pass || '—'}}¥</p>
              <p>一栋房子过路费: {{item.costList?.oneHouse || '—'}}¥</p>
              <p>两栋房子过路费: {{item.costList?.towHouse || '—'}}¥</p>
              <p>别墅过路费: {{item.costList?.villa || '—'}}¥</p>
              <p>拥有者:{{item.owner?.name}}</p>
            </div>
          </template>
        </Popper>
      </div>

      <div class="control_area">
        <div class="roll_dice control_area_item" :class="{'roll_dice_unable': !isOwnTrun}" @click="handleRollDice">
          <font-awesome-icon icon="fa-solid fa-dice" />
          <span>摇骰子</span>
        </div>

        <div class="dice_container control_area_item">
          <span v-for="(num,index) in rollResult" :key="index">
            <font-awesome-icon :class="{'animate-shaking' : isShaking}" class="icon"
              :icon="['fas', `dice-${diceNameIndex[num - 1]}`]" />
          </span>
        </div>

        <div class="deal_container control_area_item">
          <div v-if="arrivalEventTypes === ArrivalEventTypes.Buy && showingRealEstateId !== '' && isOwnTrun">
            <span class="title">{{showingRealEstate.name}}</span>
            <p>买地价: {{showingRealEstate.costList.buy}}¥</p>
            <p>起楼价: {{showingRealEstate.costList.build}}¥</p>
            <p>过路费: {{showingRealEstate.costList.pass}}¥</p>
            <p>一栋房子过路费: {{showingRealEstate.costList.oneHouse}}¥</p>
            <p>两栋房子过路费: {{showingRealEstate.costList.towHouse}}¥</p>
            <p>别墅过路费: {{showingRealEstate.costList.villa}}¥</p>
          </div>
          <div v-else>
            <font-awesome-icon style="font-size: 2vw; color: #cfcfcf" icon="fa-solid fa-lock" />
          </div>
        </div>

        <div class="confirm_container">
          <div class="confirm_items control_area_item reject" @click="handleDeal(EventResultTypes.Reject)"
            :class="{'unable': !isOwnTrun ||  arrivalEventTypes === ArrivalEventTypes.None}">
            <font-awesome-icon icon="fa-solid fa-xmark" /><span>拒绝</span>
          </div>
          <div class="confirm_items control_area_item agree" @click="handleDeal(EventResultTypes.Agree)"
            :class="{'unable': !isOwnTrun ||  arrivalEventTypes === ArrivalEventTypes.None}">
            <font-awesome-icon icon="fa-solid fa-check" /><span>同意</span>
          </div>
        </div>
      </div>

      <div class="player_list_container">
        <div class="player_list_items control_area_item"
          :style="{'border-color': gameFrameInfo.gameInfo.currentRoundPlayerId === player.id ? '#ffc42f' : '#ffffff'}"
          v-for="player in gameFrameInfo.playerInfoList" :key="player.id">

          <Popper placement="left" :hover="true">
            <div class="avatar" :style="{'background-color': player.color}">
              <font-awesome-icon class="icon" :icon="['fas', player.icon]" />
            </div>

            <template #content>
              <div class="map_item_info">
                <p>拥有的地产: {{player.ownRealEstate.join(',')}}</p>
              </div>
            </template>
          </Popper>

          <div class="name" :style="{'color': player.color}">{{player.name}}</div>
          <div class="money">{{player.money}}¥</div>
        </div>

        <div class="player_list_items control_area_item empty_item" v-for="i in 6-roomInfo.playerList.length" :key="i">
          <font-awesome-icon icon="fa-solid fa-ban" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import SocketClient from '@/class/SocketClient';
import store from '@/store';
import { computed } from 'vue';
import RealEstateInfoInterface from '../class/Interface/game/RealEstateInfoInterface';
import ArrivalEventTypes from '@/class/enums/ArrivalEventTypes';
import EventResultTypes from '@/class/enums/EventResultTypes';
import CommInterface from '../class/Interface/CommInterface';

const socketClient = SocketClient.getInstance();
const roomInfo = computed(() => store.state.roomInfo);
const gameFrameInfo = computed(() => store.state.gameFrame);
const rollResult = computed(() => store.state.rollResult);
const isShaking = computed(() => store.state.isShaking);
const isOwnTrun = computed(() => store.state.gameFrame.gameInfo.currentRoundPlayerId == store.state.userId);
const arrivalEventTypes = computed(() => store.state.arrivalEventType);
const showingRealEstateId = computed(() => store.state.showingRealEstateId);
const showingRealEstate = computed(() => {
  const realEstateToShow: RealEstateInfoInterface = store.state.gameFrame.mapInfo.mapItemList.find(realEstate => realEstate.id === store.state.showingRealEstateId) as RealEstateInfoInterface;
  return realEstateToShow;
})

const diceNameIndex = ['one', 'two', 'three', 'four', 'five', 'six'];
const playerItemPosition = ['center start', 'center center', 'center end', 'end start', 'end center', 'end end'];

const handleRollDice = () => {
  socketClient.rollDice();
}

const handleDeal = (result: EventResultTypes) => {  //处理交易函数
  socketClient.sendBuyRealEstateResult(result);
}
</script>

<style lang="scss" scoped>
#game_page {
  width: 100vw;
  height: 100vh;
  background-color: rgba($color: #ffffff, $alpha: 0.7);
  display: flex;
  flex-direction: column;
  position: relative;

  >.top_bar {
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: space-between;
    background-color: #ff8534da;

    >.title {
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
    "item20 control control control control control control control control control playerList playerList playerList item35"
    "item19 control control control control control control control control control playerList playerList playerList item36"
    "item18 control control control control control control control control control playerList playerList playerList item37"
    "item17 control control control control control control control control control playerList playerList playerList item38"
    "item16 control control control control control control control control control playerList playerList playerList item39"
    "item15 control control control control control control control control control playerList playerList playerList item40"
    "item14 control control control control control control control control control playerList playerList playerList item41"
    "item13 item12 item11 item10 item9 item8 item7 item6 item5 item4 item3 item2 item1 item0";


  .control_area {
    grid-area: control;
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: repeat(7, 1fr);
    grid-template-areas:
      "rolldice rolldice ether ether ether ether deal deal deal"
      "rolldice rolldice ether ether ether ether deal deal deal"
      "rollresult rollresult ether ether ether ether deal deal deal"
      "control control control control control control deal deal deal"
      "control control control control control control deal deal deal"
      "control control control control control control deal deal deal"
      "control control control control control control confirm confirm confirm";

    .roll_dice {
      grid-area: rolldice;
      border-radius: 20px;
      border: 4px solid #ffffff;
      background-color: rgba($color: #ffffff, $alpha: 0.7);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: 2vw;
      color: #ff8534;
      user-select: none;
      cursor: pointer;

      &:hover {
        background-color: rgba($color: #f8f8f8, $alpha: 0.8);
      }
    }

    .dice_container {
      grid-area: rollresult;
      border-radius: 20px;
      border: 4px solid #ffffff;
      background-color: rgba($color: #ffffff, $alpha: 0.7);
      display: flex;
      box-sizing: border-box;
      justify-content: center;
      align-items: center;

      >span {
        display: block;
        margin: 0 10px;
        font-size: 3.5vw;
        color: #ffc400;
      }
    }

    .deal_container {
      grid-area: deal;
      border-radius: 20px;
      border: 4px solid #ffffff;
      background-color: rgba($color: #ffffff, $alpha: 0.7);
      display: flex;
      box-sizing: border-box;
      justify-content: center;
      align-items: center;

      .title {
        font-size: 2vw;
      }
    }

    .confirm_container {
      grid-area: confirm;
      display: grid;
      grid-template-columns: 1fr 1fr;


      .confirm_items {
        border-radius: 20px;
        border: 4px solid #ffffffa2;
        background-color: rgba($color: #ffffff, $alpha: 0.7);
        display: flex;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
        color: #ffffff;
        user-select: none;
        cursor: pointer;
        font-size: 1.2vw;

        >span {
          margin-left: 5px;
        }
      }

      .confirm_items.reject {
        background-color: #e54d42c2;

        &:hover {
          background-color: #e54d42;
        }
      }

      .confirm_items.agree {
        background-color: #68cd86c2;

        &:hover {
          background-color: #68cd86;
        }
      }

      .confirm_items.unable {
        color: #cfcfcf !important;
        background-color: rgba($color: #ffffff, $alpha: 0.7) !important;

        &:hover {
          background-color: rgba($color: #ffffff, $alpha: 0.7) !important;
        }
      }
    }
  }

  .player_list_container {
    margin: 2.5px;
    grid-area: playerList;
    display: grid;
    grid-template-rows: repeat(6, 1fr);

    >.player_list_items {
      border-radius: 20px;
      border: 4px solid #ffffff;
      background-color: rgba($color: #ffffff, $alpha: 0.8);
      display: flex;
      align-items: center;

      >.name {
        font-size: 1.5vw;
        margin-left: 10px;
      }

      >.money {
        font-size: 1.5vw;
        margin-left: 10px;
      }
    }

    >.empty_item {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #e7e7e7d3;
      color: #747474;
      font-size: 2.5vw;
    }

  }

  .map_items {
    text-align: center;
    margin: 2.5px;
    box-sizing: border-box;
    padding: 5px;
    border-bottom: 3px solid;
    border-radius: 5px;
    background-color: rgba($color: #ffffff, $alpha: 0.8);

    .map_item_name {
      user-select: none;
      cursor: pointer;
      display: block;
      width: 100%;
    }
  }

  
}

@-webkit-keyframes shaking {
  25% {
    -webkit-transform: translateX(4px);
  }

  50%,
  100% {
    -webkit-transform: translateX(0);
  }

  75% {
    -webkit-transform: translateX(-4px);
  }
}

@keyframes shaking {
  25% {
    transform: translateX(4px);
  }

  50%,
  100% {
    transform: translateX(0);
  }

  75% {
    transform: translateX(-4px);
  }
}

.animate-shaking {
  -webkit-animation: shaking 0.1s linear 11;
  animation: shaking 0.1s linear 11;
}

.control_area_item {
  margin: 2.5px;
}

.map_item_info {
    padding: 0 15px;
    border-radius: 20px;
    border: 4px solid #dadadab6;
    background-color: #ffffff;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);

    .title {
      font-size: large;
      margin-top: 5px;
      padding: 7px 20px;
      border-radius: 5px;
      color: #ffffff;
    }
  }

.avatar {
  width: 3.5vw;
  height: 3.5vw;
  border: 4px solid #ffffff9c;
  border-radius: 50%;
  color: #ffffff;
  line-height: 3.5vw;
  text-align: center;
  font-size: 2vw;
  margin-left: 10px;
}

.small_size_avatar {
  width: 30px;
  height: 30px;
  border: 2px solid #ffffff9c;
  line-height: 30px;
  font-size: 18px;
  margin: 5px;
  z-index: 100;
  float: right;
  transition: 1s all;
}

.roll_dice_unable {
  color: #cfcfcf !important;
  cursor: no-drop !important;

  &:hover {
    background-color: rgba($color: #ffffff, $alpha: 0.7) !important;
  }
}
</style>