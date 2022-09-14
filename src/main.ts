import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/assets/font/font.css";
/* import the fontawesome core */
import { library } from "@fortawesome/fontawesome-svg-core";

/* import font awesome icon component */
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* import specific icons */
import { fas } from "@fortawesome/free-solid-svg-icons";

/* add icons to the library */
library.add(fas);

import Notifications from "@kyvg/vue3-notification";
import Popper from "vue3-popper";

const app = createApp(App);

app.use(store).use(router).use(Notifications).component("font-awesome-icon", FontAwesomeIcon).component("Popper", Popper).mount("#app");
