<script setup lang='ts'>
import { onMounted, computed } from 'vue';
import { ThreeBuilder } from '../utils/three/three-builder';
import { useMapData } from '../store/index';

const windowWidth = computed(() => window.innerWidth);
const windowHeight = computed(() => window.innerHeight);

onMounted(() => {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  const threeBuilder = new ThreeBuilder(canvas);


  const mapDataStore = useMapData();
  console.log(mapDataStore.data.data);
  threeBuilder.loadMap(mapDataStore.data.data);
})
</script>

<template>
  <div class="game-page">
    <div class="ui-container"></div>
    <canvas id="game-canvas" :width="windowWidth" :height="windowHeight"></canvas>
  </div>
</template>

<style lang='scss' scoped>
.game-page {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
}

.ui-container,
#game-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.ui-container {
  z-index: 1000;
}

#game-canvas {
  z-index: 500;
  display: block;
}
</style>