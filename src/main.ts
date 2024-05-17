import {createApp} from "vue";
import "@/assets/style.scss";
import "@/assets/ui.scss";
import "@/assets/font/font.css";
import App from "./App.vue";
import router from "./router";
import {createPinia} from "pinia";
import "./axios";

/* import the fontawesome core */
import {library} from "@fortawesome/fontawesome-svg-core";

/* import font awesome icon component */
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

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
    faWifi
} from "@fortawesome/free-solid-svg-icons";
import {chanceCardSource, chanceCardTarget} from "./directives/chanceCardDrag";
// "bolt", "bomb", "heart", "house", "palette", "sack-dollar", "wand-magic-sparkles"
/* add icons to the library */
library.add(faBolt,
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
    faWifi);

createApp(App)
    .directive("chanceCardSource", chanceCardSource)
    .directive("chanceCardTarget", chanceCardTarget)
    .use(router)
    .use(createPinia())
    .component("font-awesome-icon", FontAwesomeIcon)
    .mount("#app");
