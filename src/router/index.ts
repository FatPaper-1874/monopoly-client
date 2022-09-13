import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import LoginView from '../views/login-page.vue'
import RoomListView from '../views/room-list.vue'
import RoomView from '../views/room-page.vue'
import store from '@/store';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'LoginView',
    component: LoginView,
  },
  {
    path: '/room-list',
    name: "RoomListView",
    component: RoomListView,
    beforeEnter: (to, from, next) => {
      if(store.state.userName == ''){
        next('/')
      } else {
        next();
      }
    }
  },
  {
    path: '/room-page',
    name: "RoomView",
    component: RoomView,
    beforeEnter: (to, from, next) => {
      if(store.state.userName == ''){
        next('/')
      } else {
        next();
      }
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
