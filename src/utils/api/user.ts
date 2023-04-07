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
