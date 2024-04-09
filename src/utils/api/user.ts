import { __USERSERVER__ } from "../../../global.config";
import axios from "axios";

interface UserInfo {
	username: string;
	useraccount: string;
	id: string;
	avatar: string;
	color: string;
}

export async function getUserByToken(token: string) {
	const res = await axios.get(`${__USERSERVER__}/user/info`, { data: { token } });
	return res.data as UserInfo;
}
