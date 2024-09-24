import { __MONOPOLYSERVER__ } from "@G/global.config";
import axios from "axios";

export async function joinRoomApi(roomId: string) {
	const { hostPeerId, needCreate, deleteIntervalMs } = (
		await axios.get(`${__MONOPOLYSERVER__}/room-router/join`, {
			params: { roomId },
		})
	).data as any;
	return { hostPeerId, needCreate, deleteIntervalMs };
}

export async function emitHostPeerId(roomId: string, hostPeerId: string) {
	await axios.post(`${__MONOPOLYSERVER__}/room-router/emit-host`, { roomId, hostPeerId });
}

export async function emitRoomHeart(roomId: string) {
	await axios.get(`${__MONOPOLYSERVER__}/room-router/heart`, { params: { roomId } });
}
