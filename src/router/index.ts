import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import { useLoading, useUserInfo } from "@/store";


const routes = [
	{ path: "/", name: "login", component: () => import("@/views/login/login.vue") },
	{ path: "/room-list", name: "room-list", component: () => import("@/views/hall/room-list.vue") },
	{ path: "/room", name: "room", component: () => import("@/views/room/room.vue") },
	{ path: "/game", name: "game", component: () => import("@/views/game/game.vue") },
];

const router = createRouter({history: import.meta.env.PROD ? createWebHistory() : createWebHashHistory(), routes});

router.beforeEach((to, form) => {
    const loadingStore = useLoading();
	loadingStore.text = "加载中";
	loadingStore.loading = true;
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

router.afterEach(() => {
    const loadingStore = useLoading();
	loadingStore.text = "";
	loadingStore.loading = false;
});

export default router;
