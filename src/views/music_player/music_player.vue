<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { getMusicList } from "@/utils/api/music";
import { Music } from "@/interfaces/bace";
import { throttle } from "@/utils";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import MusicListItem from "@/views/music_player/components/music_list_item.vue";
import { __PROTOCOL__ } from "@G/global.config";

const musicList = ref<Music[]>([]);

//播放器状态
const currentMusic = ref<Music | undefined>();
const musicPlayerEl = ref<HTMLAudioElement | null>(null);
const isLoadingMusicList = ref(false);
const isPlaying = ref(false);

const musicDurationTime = ref(0);
const musicCurrentTime = ref(0);

const controlIcon = computed(() => {
	return isLoadingMusicList.value ? "spinner" : "compact-disc";
});

function selectMusic(id: string) {
	const musicToPlay = musicList.value.find((m) => m.id === id);
	const _musicPlayerEl = musicPlayerEl.value;
	if (musicToPlay && _musicPlayerEl) {
		// if (musicToPlay.exp < Date.now()) {
		//   loadMusicList().then((_musicList) => {
		//     musicList.value = _musicList;
		//     selectMusic(id);
		//   })
		//   return;
		// } else {
		//   _musicPlayerEl.src = musicToPlay.url;
		//   currentMusic.value = musicToPlay;
		//   isPlaying.value = true;
		// }
		_musicPlayerEl.src = `${__PROTOCOL__}://${musicToPlay.url}`;

		nextTick(() => {
			_musicPlayerEl.play().catch(() => {});
			currentMusic.value = musicToPlay;
			isPlaying.value = true;
		});
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
	if (musicPlayerEl.value) {
		if (!currentMusic.value) {
			if (musicList.value?.length > 0) {
				selectMusic(musicList.value[0].id);
			}
		}
		musicPlayerEl.value.play().catch(() => {
			isPlaying.value = false;
		});
	}
}

function pauseMusic() {
	musicPlayerEl.value && musicPlayerEl.value.pause();
}

function initMusicPlayer() {
	const _musicPlayerEl = musicPlayerEl.value;
	if (_musicPlayerEl) {
		_musicPlayerEl.addEventListener("loadeddata", () => {
			musicDurationTime.value = Math.floor(_musicPlayerEl.duration);
			_musicPlayerEl.play().catch(() => {
				isPlaying.value = false;
			});
		});
		_musicPlayerEl.addEventListener(
			"timeupdate",
			throttle((event: Event) => {
				musicCurrentTime.value = Math.floor(_musicPlayerEl.currentTime);
			}, 300)
		);
	}
}

function handleMusicEnded() {
	const _currentMusic = currentMusic.value;
	if (musicList.value.length <= 0) throw new Error("在切换音乐时发生音乐列表为空的错误");
	if (_currentMusic) {
		const currentMusicIndex = musicList.value.findIndex((m) => m.id === _currentMusic.id);
		if (currentMusicIndex < 0) {
			playMusic();
		} else {
			const nextMusicIndex = (currentMusicIndex + 1) % musicList.value.length;
			selectMusic(musicList.value[nextMusicIndex].id || musicList.value[0].id);
		}
	} else {
		playMusic();
	}
}

async function loadMusicList() {
	isLoadingMusicList.value = true;
	const { musicList } = await getMusicList(1, 1000);
	isLoadingMusicList.value = false;
	return musicList;
}

const isMusicListVisible = ref(false);

onMounted(async () => {
	initMusicPlayer();
	musicList.value = await loadMusicList();
	// if (musicList.value?.length > 0) {
	// 	playMusic();
	// }
});
</script>

<template>
	<div class="music-player">
		<audio
			@ended="handleMusicEnded"
			ref="musicPlayerEl"
			:src="currentMusic ? `${__PROTOCOL__}://${currentMusic.url}` : ''"
			autoplay
			loop
		></audio>
		<div @click="toggleMusic()" class="icon_container">
			<FontAwesomeIcon
				:beat-fade="!currentMusic"
				:spin="isPlaying || isLoadingMusicList"
				class="icon"
				:icon="controlIcon"
			/>
		</div>
		<div class="info-container">
			<div :style="{ width: `${(musicCurrentTime / musicDurationTime) * 100}%` }" class="progress_bar"></div>
			<div v-if="!isPlaying" class="common" style="width: 100%">点击唱片播放音乐</div>
			<div v-else class="music_name">
				<span>{{ currentMusic && currentMusic.name }}</span>
			</div>
		</div>
		<div class="music_list-toggle">
			<FontAwesomeIcon
				@click="isMusicListVisible = !isMusicListVisible"
				class="icon"
				:icon="isMusicListVisible ? 'angle-up' : 'bars'"
			/>
		</div>
		<div v-show="isMusicListVisible" class="music_list">
			<div class="container">
				<MusicListItem
					:is-playing="currentMusic ? music.id === currentMusic.id : false"
					@click="selectMusic(music.id)"
					v-for="music in musicList"
					:music="music"
					:key="music.id"
				/>
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
	border-radius: 0 0 0.5rem 0.5rem;
	background-color: var(--color-second);
	box-shadow: var(--box-shadow);
	padding: 0.4rem;
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
	font-size: 0.8rem;
	margin-left: 0.4rem;
	border-radius: 0.2rem;
	padding: 0 0.2rem;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.75);
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
		background-color: rgba(255, 209, 110, 0.55);
		transition: width 1s;
	}

	& > .common {
		display: inline-block;
		color: var(--color-second);
		white-space: nowrap;
		text-align: center;
	}

	& > .music_name {
		display: inline-block;
		flex: 1;
		overflow-x: hidden;

		& > span {
			animation: 15s wordsLoop linear infinite normal;
			white-space: nowrap;
			color: var(--color-primary-110);
			display: inline-block;

			@keyframes wordsLoop {
				0% {
					transform: translateX(0px);
					-webkit-transform: translateX(0px);
				}
				50% {
					transform: translateX(-100%);
					-webkit-transform: translateX(-100%);
				}
				100% {
					transform: translateX(0px);
					-webkit-transform: translateX(0px);
				}
			}

			@-webkit-keyframes wordsLoop {
				0% {
					transform: translateX(0px);
					-webkit-transform: translateX(0px);
				}

				50% {
					transform: translateX(-100%);
					-webkit-transform: translateX(-100%);
				}
				100% {
					transform: translateX(0px);
					-webkit-transform: translateX(0px);
				}
			}
		}
	}
}

.music_list-toggle {
	margin-left: 0.3rem;
	margin-right: 0.1rem;

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
	border-radius: 0.6rem;
	overflow: hidden;

	.container {
		width: 100%;
		height: 100%;
		overflow-y: scroll;
		padding: 0 0.4rem;
		box-sizing: border-box;
	}
}
</style>
