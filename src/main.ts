import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/font/font.css'
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { fas } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(fas)


const app = createApp(App)
app.config.globalProperties.$httpUrl = 'https://www.baidu.com';

app.use(store).use(router).component('font-awesome-icon', FontAwesomeIcon).mount('#app')
