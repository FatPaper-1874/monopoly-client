import { createApp } from "vue";
import "./style.scss";
import "./assets/font/font.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from 'pinia'
import "./axios"

/* import the fontawesome core */
import { library } from "@fortawesome/fontawesome-svg-core";

/* import font awesome icon component */
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* import specific icons */
import { fas } from "@fortawesome/free-solid-svg-icons";
import FPMessage from "./components/utils/fp-message/index";

/* add icons to the library */
library.add(fas);

createApp(App)
.use(router)
.use(createPinia())
.component("font-awesome-icon", FontAwesomeIcon).mount("#app");
