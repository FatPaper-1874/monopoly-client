import axios from "axios";
import FPMessage from "@/components/utils/fp-message";
import router from "@/router/index";
import {__MONOPOLYSERVER__} from "@/global.config";

axios.defaults.baseURL = __MONOPOLYSERVER__;
axios.defaults.headers.common["Authorization"] = localStorage.getItem("token");

//请求拦截器
axios.interceptors.request.use(
    function (config) {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers!["Authorization"] = token;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// 响应拦截器
axios.interceptors.response.use(
    function (response) {
        const msg = response.data.msg;
        if (msg) {
            const status = response.data.status;
            if (status == 200) {
                //成功请求
                FPMessage({
                    type: "success",
                    message: msg,
                });
            } else if (status == 401) {
                //token过期
                FPMessage({
                    type: "warning",
                    message: msg,
                });
            } else {
                //用户输入数据错误
                FPMessage({
                    type: "error",
                    message: msg,
                });
            }
        }
        return response.data;
    },
    function (error) {
        console.log("🚀 ~ file: index.d.ts:54 ~ error.response:", error.response);
        let message = "";
        switch (error.response.status) {
            case 400:
                message = "请求错误(400)";
                break;
            case 401: {
                message = "未授权，请重新登录(401)";
                // FPMessage({
                //     message, type: "error", delay: 1500, onClosed: () => {
                //         localStorage.setItem("token", "");
                //         router.replace({name: "login"});
                //         return Promise.reject(message);
                //     }
                // })
                break;
            }
            case 403:
                message = "拒绝访问(403)";
                break;
            case 404:
                message = "请求出错(404)";
                break;
            case 408:
                message = "请求超时(408)";
                break;
            case 500:
                message = "服务器错误(500)";
                break;
            case 501:
                message = "服务未实现(501)";
                break;
            case 502:
                message = "网络错误(502)";
                break;
            case 503:
                message = "服务不可用(503)";
                break;
            case 504:
                message = "网络超时(504)";
                break;
            case 505:
                message = "HTTP版本不受支持(505)";
                break;
            default:
                message = `连接出错(${error.response.status})!`;
        }
        return Promise.reject(error.response.data.msg || message);
    }
);
