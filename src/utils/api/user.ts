import axios from "axios";
import { useUserInfo } from "../../store/index";

export const getUserInfo = async () => {
	const res = await axios.get("/user/info");
	if (res.status === 200) {
		const userInfo = useUserInfo();
		userInfo.$patch({
			userId: res.data.id,
			username: res.data.username,
			avatar: res.data.avatar,
			color: res.data.color,
		});
		return true;
	} else {
		return false;
	}
};
