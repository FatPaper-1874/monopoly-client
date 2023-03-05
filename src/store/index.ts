import { defineStore } from "pinia";
import { User, Room, Role, MapItem, PlayerInfo, PropertyInfo } from '../interfaces/bace';

export const useLoading = defineStore("loading", {
	state: () => {
		return {
			loading: false,
		};
	},
});

export const useUserInfo = defineStore("userInfo", {
	state: () => {
		return {
			userId: "",
			username: "",
			avatar: "user",
			color: "",
		};
	},
});

export const useUserList = defineStore("userList", {
	state: () => {
		return {
			userList: new Array<User>(),
		};
	},
});

export const useRoomList = defineStore("roomList", {
	state: () => {
		return {
			roomList: new Array<Room>(),
		};
	},
});

export const useRoomInfo = defineStore("roomInfo", {
	state: () => {
		return {
			roomId: "",
			ownerId: "",
			ownerName: "",
			userList: new Array<User>(),
			roleList: new Array<Role>(),
		};
	},
});

export const useMap = defineStore("map", {
	state: () => {
		return {
			mapData: new Array<MapItem>(),
			mapIndex: new Array<string>(),
		};
	},
});

export const useGameInfo = defineStore("gameInfo", {
	state: () => {
		return {
			playerList: new Array<PlayerInfo>(),
			properties: new Array<PropertyInfo>(),
		};
	},
});
