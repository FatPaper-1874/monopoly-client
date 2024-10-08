import { createApp } from "vue";
import "@/assets/style.scss";
import "@/assets/ui.scss";
import "@/assets/font/font.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import "./axios";

/* import the fontawesome core */
import { library } from "@fortawesome/fontawesome-svg-core";

/* import font awesome icon component */
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* import specific icons */
import {
	faBolt,
	faBomb,
	faHeart,
	faHouse,
	faPalette,
	faSackDollar,
	faWandMagicSparkles,
	faCircleCheck,
	faCircleExclamation,
	faCircleXmark,
	faCircleInfo,
	faQuestionCircle,
	faLinkSlash,
	faClose,
	faWifi,
	faCompactDisc,
	faSpinner,
	faAngleUp,
	faAngleLeft,
	faAngleRight,
	faBars,
	faExpand,
	faRotate,
	faComments,
	faClock,
	faClockRotateLeft,
	faVideo,
	faBullhorn,
	faBug,
	faCode,
	faCircleUser,
	faGamepad,
	faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { chanceCardSource } from "./directives/chanceCardDrag";
import { useDeviceStatus } from "@/store";
import { isFullScreen as _isFullScreen, isLandscape as _isLandscape, isMobileDevice } from "@/utils";

library.add(
	faBolt,
	faBomb,
	faHeart,
	faHouse,
	faPalette,
	faSackDollar,
	faWandMagicSparkles,
	faCircleCheck,
	faCircleExclamation,
	faCircleXmark,
	faCircleInfo,
	faQuestionCircle,
	faLinkSlash,
	faClose,
	faWifi,
	faCompactDisc,
	faSpinner,
	faAngleUp,
	faAngleLeft,
	faAngleRight,
	faBars,
	faExpand,
	faRotate,
	faComments,
	faClock,
	faClockRotateLeft,
	faVideo,
	faBullhorn,
	faBug,
	faCode,
	faCircleUser,
	faGamepad,
	faCopy
);
const pinia = createPinia();
createApp(App)
	.use(router)
	.use(pinia)
	.directive("chanceCardSource", chanceCardSource)
	.component("font-awesome-icon", FontAwesomeIcon)
	.mount("#app");

initDeviceStatusListener();

function initDeviceStatusListener() {
	const deviceStatus = useDeviceStatus();
	deviceStatus.isFullScreen = _isFullScreen();
	deviceStatus.isLandscape = _isLandscape();
	deviceStatus.isMobile = isMobileDevice();
	deviceStatus.isFocus = document.visibilityState === "visible";

	window.addEventListener("fullscreenchange", (e) => {
		deviceStatus.isFullScreen = _isFullScreen();
	});

	window.addEventListener("resize", (e) => {
		deviceStatus.isLandscape = _isLandscape();
	});

	document.addEventListener("visibilitychange", () => {
		deviceStatus.isFocus = document.visibilityState === "visible";
	});
}
