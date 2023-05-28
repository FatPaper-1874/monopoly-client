import axios from "axios";
import { useUserInfo } from "../../store/index";

export const getUserInfo = async () => {
	const res = await axios.get("/user/info");
	if (res.status === 200) {
		const userInfoStore = useUserInfo();
		const user = {
			userId: res.data.id,
			username: res.data.username,
			avatar: res.data.avatar,
			color: res.data.color,
		};
		userInfoStore.$patch(user);
		return user;
	} else {
		return null;
	}
};

export const apiLogin = async (username: string, password: string) => {
	const res = await axios.post("/user/login", {
		username,
		password,
	});
	localStorage.setItem("token", "Bearer " + res.data.token);
	return res.status === 200 ? true : false;
};

export const apiRegister = async (username: string, password: string) => {
	const res = await axios.post("/user/register", {
		username,
		password,
	});
	return res.status === 200 ? true : false;
};
