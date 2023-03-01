import { SocketMsgType } from "../enums/bace";

export interface SocketMessage {
	type: SocketMsgType;
	source: string;
	roomId?: string;
	data: any;
	msg?: {
		type: string;
		content: string;
	};
}

export interface User {
	userId: string;
	username: string;
	isReady: boolean;
	avatar: string;
	color: string;
	role: Role;
}

export interface Room {
	roomId: string;
	ownerId: string;
	ownerName: string;
	userNum: number;
}

export interface Role{
	id: string,
	rolename: string,
	filename: string,
	color: string,
}

export interface RoomInfo {
	roomId: string;
	userList: Array<{
		userId: string;
		username: string;
		isReady: boolean;
		color: string;
		avatar: string;
	}>;
	isStarted: boolean;
	ownerId: string;
	ownerName: string;
}

export interface MapItem {
	id: string;
	x: number;
	y: number;
	type: TypeItem;
	link?: MapItem;
}

export interface TypeItem {
	color: string;
	name: string;
	module: string;
	size: number;
}
