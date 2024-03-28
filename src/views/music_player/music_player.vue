<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {getMusicList} from "@/utils/api/music";
import {MusicType} from "@/interfaces/bace";
import {throttle} from "@/utils";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import MusicListItem from "@/views/music_player/components/music_list_item.vue";

const musicList = ref<MusicType[]>([]);

//播放器状态
const currentMusic = ref<MusicType>();
const musicPlayerEl = ref<HTMLAudioElement | null>(null);
const isLoadingMusicList = ref(false);
const isPlaying = ref(false);

const musicDurationTime = ref(0);
const musicCurrentTime = ref(0);

const controlIcon = computed(() => {
  return isLoadingMusicList.value ? 'spinner' : 'compact-disc'
})

function selectMusic(id: string) {
  const musicToPlay = musicList.value.find((m) => m.id === id);
  const _musicPlayerEl = musicPlayerEl.value
  if (musicToPlay && _musicPlayerEl) {
    if (musicToPlay.exp < Date.now()) {
      loadMusicList().then((_musicList) => {
        musicList.value = _musicList;
        selectMusic(id);
      })
      return;
    } else {
      _musicPlayerEl.src = musicToPlay.url;
      currentMusic.value = musicToPlay;
      isPlaying.value = true;
    }
  }
}

function toggleMusic() {
  if (isPlaying.value) {
    isPlaying.value = false;
    pauseMusic();
  } else {
    isPlaying.value = true;
    playMusic();
  }
}

function playMusic() {
  if (currentMusic.value && musicPlayerEl.value) {
    musicPlayerEl.value.play();
  } else {
    if (musicList.value?.length > 0) {
      selectMusic(musicList.value[0].id);
    }
  }
}

function pauseMusic() {
  musicPlayerEl.value && musicPlayerEl.value.pause();
}

function initMusicPlayer() {
  const _musicPlayerEl = musicPlayerEl.value
  if (_musicPlayerEl) {
    _musicPlayerEl.addEventListener('loadeddata', () => {
      musicDurationTime.value = Math.floor(_musicPlayerEl.duration);
      _musicPlayerEl.play();
    })
    _musicPlayerEl.addEventListener('timeupdate', throttle((event: Event) => {
      musicCurrentTime.value = Math.floor(_musicPlayerEl.currentTime);
    }, 300))
    _musicPlayerEl.addEventListener('ended', () => {
      const _currentMusic = currentMusic.value;
      if (musicList.value.length <= 0) throw new Error("在切换音乐时发生音乐列表为空的错误")
      if (_currentMusic) {
        const currentMusicIndex = musicList.value.findIndex(m => m.id === _currentMusic.id);
        if (currentMusicIndex < 0) {
          selectMusic(musicList.value[0].id);
        } else {
          const nextMusicIndex = (currentMusicIndex + 1) % musicList.value.length;
          selectMusic(musicList.value[nextMusicIndex].id || musicList.value[0].id)
        }
      } else {
        selectMusic(musicList.value[0].id);
      }
    })
  }
}

async function loadMusicList() {
  isLoadingMusicList.value = true;
  const res = await getMusicList();
  isLoadingMusicList.value = false;
  return res;
}

const isMusicListVisible = ref(false);

onMounted(async () => {
  initMusicPlayer();
  musicList.value = await loadMusicList();
  // if (musicList.value?.length > 0) {
  //   playMusic(musicList.value[0].id);
  // }
})
</script>

<template>
  <div class="music-player">
    <audio ref="musicPlayerEl" :src="currentMusic ? currentMusic.url:''"></audio>
    <div class="icon_container">
      <FontAwesomeIcon :beat-fade="!currentMusic" :spin="isPlaying || isLoadingMusicList"
                       class="icon"
                       :icon="controlIcon"/>
    </div>
    <div class="info-container">
      <div :style="{'width': `${ musicCurrentTime / musicDurationTime * 100}%`}" class="progress_bar"></div>
      <span class="common">{{ currentMusic ? '正在播放：' : '' }}</span>
      <span class="music_name">{{ currentMusic ? currentMusic.name : '不知道放什么音乐好' }}</span>
    </div>
    <div class="music_list-toggle">
      <FontAwesomeIcon @click="isMusicListVisible = !isMusicListVisible"
                       class="icon"
                       :icon="isMusicListVisible?'angle-up':'bars'"/>
    </div>
    <div v-show="isMusicListVisible" class="music_list">
      <div class="container">
        <MusicListItem :is-playing="currentMusic?music.id === currentMusic.id:false" @click="selectMusic(music.id)"
                       v-for="music in musicList" :music="music" :key="music.id"/>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.music-player {
  position: fixed;
  left: 0.5rem;
  top: 0;
  min-width: 2.2rem;
  height: 2.2rem;
  border-radius: 0 0 .5rem .5rem;
  background-color: var(--color-second);
  box-shadow: var(--box-shadow);
  padding: .4rem;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  pointer-events: all;
}

.icon {
  color: var(--color-text-white);
  cursor: pointer;
  text-shadow: var(--text-shadow);
}

.icon_container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  & > .icon {
    font-size: 1.4rem;
  }
}

.info-container {
  flex: 1;
  width: 12rem;
  height: 100%;
  font-size: .8rem;
  margin-left: .4rem;
  border-radius: .2rem;
  padding: 0 .2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, .75);
  position: relative;
  overflow: hidden;
  z-index: 1;

  & > * {
    pointer-events: none;
  }

  & > .progress_bar {
    width: 0;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
    background-color: rgba(255, 209, 110, .55);
    transition: width 1s;
  }

  & > .common {
    color: var(--color-second);
  }

  & > .music_name {
    color: var(--color-primary-110);
  }
}

.music_list-toggle {
  margin-left: .3rem;
  margin-right: .1rem;

  & > .icon {
    font-size: 1.2rem;
  }
}

.music_list {
  position: absolute;
  bottom: -15.3rem;
  margin-top: 1rem;
  left: 0;
  width: 100%;
  height: 15rem;
  background-color: var(--color-bg-transparent);
  box-shadow: var(--box-shadow);
  border-radius: .6rem;
  overflow: hidden;

  .container {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    padding: 0 .4rem;
    box-sizing: border-box;
  }
}
</style>