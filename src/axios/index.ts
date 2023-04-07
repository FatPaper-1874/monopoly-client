import axios from "axios";
import FPMessage from "@/components/utils/fp-message";
import router from "@/router/index";

axios.defaults.baseURL = "http://localhost:8000";
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
				localStorage.setItem("token", "");
				router.replace({ name: "login" });
			} else if (status == 500) {
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
		return Promise.reject(error);
	}
);
