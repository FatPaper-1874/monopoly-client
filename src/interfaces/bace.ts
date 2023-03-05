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

export interface Role {
	id: string;
	rolename: string;
	filename: string;
	color: string;
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

export interface PropertyInfo {
	id: string;
	name: string;
	buildingLevel: number;
	sellCost: number;
	cost_lv0: number;
	cost_lv1: number;
	cost_lv2: number;
	owner: {
		id: string;
		name: string;
	};
}

export interface PlayerInfo {
	user: User;
	money: number;
	properties: PropertyInfo[];
	cards: ChanceCardInfo[];
	positionIndex: number;
}

export interface ChanceCardInfo {
	id: string;
	name: string;
	describe: string;
	icon: string;
}

export interface GameInitInfo {
	mapData: MapItem[];
	mapIndex: string[];
	playerList: PlayerInfo[];
	properties: PropertyInfo[];
	chanceCards: ChanceCardInfo[];
}

export interface GameInfo {
	playerList: PlayerInfo[];
	properties: PropertyInfo[];
}
