import { createRouter, createWebHashHistory } from "vue-router";
import loginVue from "../view/login.vue";
import roomListVue from "../view/room-list.vue";
import roomVue from "../view/room.vue";
import gameVue from '../view/game/game.vue';

const routes = [
	{ path: "/", name: "login", component: loginVue },
	{ path: "/room-list", name: "room-list", component: roomListVue },
	{ path: "/room", name: "room", component: roomVue },
	{ path: "/game", name: "game", component: gameVue},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

router.beforeEach((to, form)=>{
	if (
		// 检查用户是否已登录
		!localStorage.getItem('token') &&
		//  避免无限重定向
		to.name !== 'login'
	) {
		// 将用户重定向到登录页面
		return { name: 'login' }
	}
})


export default router;
