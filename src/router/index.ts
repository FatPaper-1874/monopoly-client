import {createRouter, createWebHashHistory} from "vue-router";
import {useUserInfo} from "@/store";

const routes = [
    {path: "/", name: "login", component: () => import('@/views/login/login.vue')},
    {path: "/room-list", name: "room-list", component: () => import('@/views/hall/room-list.vue')},
    {path: "/room", name: "room", component: () => import('@/views/room/room.vue')},
    {path: "/game", name: "game", component: () => import('@/views/game/game.vue')},
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
        return {name: "login"};
    }
    const user = useUserInfo();
    if (!user.userId && to.name !== "login" && to.name !== "room-list") {
        return {name: "room-list"};
    }
});

export default router;
