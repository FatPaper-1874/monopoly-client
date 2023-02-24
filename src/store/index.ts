import { defineStore } from "pinia";
import { User, Room } from "../interfaces/bace";
import { MapItem } from '../../../monopoly-server/src/interfaces/bace';

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
		};
	},
});

export const useMapData = defineStore("mapData", {
	state: ()=> {
		return {
			data: {
				name: "",
				data: new Array<MapItem>(),
			},
		};
	}
})