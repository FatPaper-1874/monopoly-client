import * as THREE from "three";

export const lightenColor = (hexColor: string, amount: number): string => {
	// Remove the '#' character from the beginning of the string
	hexColor = hexColor.slice(1);

	// Convert the hex color to RGB
	const r = parseInt(hexColor.slice(0, 2), 16);
	const g = parseInt(hexColor.slice(2, 4), 16);
	const b = parseInt(hexColor.slice(4, 6), 16);

	// Calculate the new RGB values by decreasing each by the specified amount
	const newR = Math.max(r - amount, 0);
	const newG = Math.max(g - amount, 0);
	const newB = Math.max(b - amount, 0);

	// Convert the new RGB values back to hex
	const newHexColor = `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB
		.toString(16)
		.padStart(2, "0")}`;

	return newHexColor;
};

export const getRandomInteger = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function arrayBufferToImgUrl(buffer: number[]): string {
	return (
		"data:image/png;base64," +
		window.btoa(new Uint8Array(buffer).reduce((res, byte) => res + String.fromCharCode(byte), ""))
	);
}

export function shuffleArray<T>(arr: T[]) {
	return arr.sort(function () {
		return 0.5 - Math.random();
	});
}

export function randomString(length: number) {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let randomString = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		randomString += characters.charAt(randomIndex);
	}
	return randomString;
}

export function throttle(fn: Function, interval: number, first = false) {
	let lastTime = first ? 0 : Date.now();

	return function () {
		if (Date.now() >= interval + lastTime) {
			lastTime = Date.now();
			fn(...arguments);
		}
	};
}

export function debounce(fn: Function, delay_ms: number) {
	let timer: NodeJS.Timeout;
	return function () {
		clearTimeout(timer);
		timer = setTimeout(() => {
			fn(...arguments);
		}, delay_ms);
	};
}

export function getScreenPosition(object3D: THREE.Object3D, camera: THREE.Camera) {
	if (!object3D) return new THREE.Vector2();
	const tempPosition = new THREE.Vector3(0, 0, 0);
	object3D.getWorldPosition(tempPosition);
	tempPosition.project(camera);
	return new THREE.Vector2(tempPosition.x, -tempPosition.y);
}

export async function requestFullScreen() {
	const element = document.documentElement;
	if (element.requestFullscreen) {
		await element.requestFullscreen();
		//@ts-ignore
	} else if (element.mozRequestFullScreen) {
		// 兼容Firefox
		//@ts-ignore
		await element.mozRequestFullScreen();
		//@ts-ignore
	} else if (element.webkitRequestFullscreen) {
		// 兼容Chrome和Safari
		//@ts-ignore
		await element.webkitRequestFullscreen();
	}
}

export async function exitFullScreen() {
	if (isFullScreen()) {
		if (document.exitFullscreen) {
			await document.exitFullscreen();
			//@ts-ignore
		} else if (document.mozCancelFullScreen) {
			// 兼容Firefox
			//@ts-ignore
			await document.mozCancelFullScreen();
			//@ts-ignore
		} else if (document.webkitExitFullscreen) {
			// 兼容Chrome和Safari
			//@ts-ignore
			await document.webkitExitFullscreen();
		}
	}
}

export function setTimeOutAsync(delay: number = 1000, fn?: Function) {
	return new Promise((reslove) => {
		setTimeout(() => {
			if (fn) fn();
			reslove("");
		}, delay);
	});
}

export function isMobileDevice() {
	return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isFullScreen() {
	return document.fullscreenElement !== null;
}

export function isLandscape() {
	return window.matchMedia("(orientation: landscape)").matches;
}

export function hexToRgbNormalized(hex:string) {
	// Remove the hash at the start if it's there
	hex = hex.replace(/^#/, '');

	// Parse the r, g, b values
	const bigint = parseInt(hex, 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	// Convert to 0-1 range
	const rNormalized = r / 255;
	const gNormalized = g / 255;
	const bNormalized = b / 255;

	return { r: rNormalized, g: gNormalized, b: bNormalized };
}
