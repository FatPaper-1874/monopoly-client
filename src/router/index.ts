import { createRouter, createWebHashHistory } from "vue-router";
import loginVue from "@/views/login/login.vue";
import roomListVue from "@/views/hall/room-list.vue";
import roomVue from "@/views/room/room.vue";
import gameVue from "@/views/game/game.vue";
import { useUserInfo } from "@/store";

const routes = [
	{ path: "/", name: "login", component: loginVue },
	{ path: "/room-list", name: "room-list", component: roomListVue },
	{ path: "/room", name: "room", component: roomVue },
	{ path: "/game", name: "game", component: gameVue },
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

router.beforeEach((to, form) => {
	if (
		// 检查用户是否已登录
		!localStorage.getItem("token") &&
		//  避免无限重定向
		to.name !== "login"
	) {
		// 将用户重定向到登录页面
		return { name: "login" };
	}
	const user = useUserInfo();
	if (!user.userId && to.name !== "login" && to.name !== "room-list") {
		return { name: "room-list" };
	}
});

export default router;
