import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import { useLoading, useUserInfo } from "@/store";

function componentLoadedInterceptor(promise: Promise<any>) {
	return () => {
		const loadingStore = useLoading();
		loadingStore.text = "加载中";
		loadingStore.loading = true;
		return new Promise((resolve) => {
			promise.then((e: any) => {
				loadingStore.loading = false;
				resolve(e);
			});
		});
	};
}

const routes = [
	{ path: "/", name: "login", component: componentLoadedInterceptor(import("@/views/login/login.vue")) },
	{
		path: "/room-router",
		name: "room-router",
		component: componentLoadedInterceptor(import("@/views/room-router/room-router.vue")),
	},
	{ path: "/room", name: "room", component: componentLoadedInterceptor(import("@/views/room/room.vue")) },
	{ path: "/game", name: "game", component: componentLoadedInterceptor(import("@/views/game/game.vue")) },
];

const router = createRouter({ history: import.meta.env.PROD ? createWebHistory() : createWebHashHistory(), routes });

router.beforeEach((to, form) => {
	if (
		// 检查用户是否已登录
		!localStorage.getItem("token") &&
		!localStorage.getItem("user") &&
		//  避免无限重定向
		to.name !== "login"
	) {
		// 将用户重定向到登录页面
		return { name: "login" };
	}
	// const user = useUserInfo();
	// if (!user.userId && to.name !== "login" && to.name !== "room-router") {
	//     return {name: "room-router"};
	// }
});

export default router;
