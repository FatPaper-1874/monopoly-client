<script setup lang="ts">
</script>

<template>
  <!-- <div class="bg">
    <div class="dollar" v-for="i in 30" :key="i">
      <span v-for="j in 40" :key="j">$</span>
    </div>
  </div> -->

  <RouterView></RouterView>
</template>

<style lang="scss" scoped>
// .bg {
//   position: absolute;
//   width: 200vw;
//   height: 100vh;
//   top: 0;
//   left: 0;
//   overflow: hidden;
//   z-index: -1000;
//   user-select: none;
//   filter: blur(4px);

//   .dollar {
//     width: 200vw;
//     height: 8vw;
//     color: #ffe261;
//     background-color: #ffb24e;
//     -webkit-animation: 8s rowRight linear infinite normal;
//     animation: 8s rowRight linear infinite normal;
//     overflow: hidden;

//     // animation-play-state: paused;

//     span {
//       font-size: 7vw;
//       display: inline-block;
//       width: 10vw;
//       height: 8vw;
//       line-height: 7.5vw;
//       text-align: center;
//     }

//     &:nth-child(even) {
//       color: #ffb24e;
//       height: 6vw;
//       background-color: #ffe261;
//       -webkit-animation: 14s rowLeft linear infinite normal;
//       animation: 14s rowLeft linear infinite normal;

//       // animation-play-state: paused;

//       span {
//         font-size: 4vw;
//         display: inline-block;
//         width: 5vw;
//         height: 6vw;
//         line-height: 6vw;
//         text-align: center;
//       }
//     }
//   }

//   @keyframes rowRight {
//     0% {
//       -webkit-transform: translate3d(0, 0, 0);
//       transform: translate3d(0, 0, 0);
//     }

//     100% {
//       -webkit-transform: translate3d(-100vw, 0, 0);
//       transform: translate3d(-100vw, 0, 0);
//     }
//   }

//   @-webkit-keyframes rowRight {
//     0% {
//       -webkit-transform: translate3d(0, 0, 0);
//       transform: translate3d(0, 0, 0);
//     }

//     100% {
//       -webkit-transform: translate3d(-100vw, 0, 0);
//       transform: translate3d(-100vw, 0, 0);
//     }
//   }

//   @keyframes rowLeft {
//     0% {
//       -webkit-transform: translate3d(-100vw, 0, 0);
//       transform: translate3d(-100vw, 0, 0);
//     }

//     100% {
//       -webkit-transform: translate3d(0, 0, 0);
//       transform: translate3d(0, 0, 0);
//     }
//   }

//   @-webkit-keyframes rowLeft {
//     0% {
//       -webkit-transform: translate3d(-100vw, 0, 0);
//       transform: translate3d(-100vw, 0, 0);
//     }

//     100% {
//       -webkit-transform: translate3d(0, 0, 0);
//       transform: translate3d(0, 0, 0);
//     }
//   }
// }
</style>
