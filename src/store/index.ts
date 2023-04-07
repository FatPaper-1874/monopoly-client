import { defineStore } from "pinia";
import {
	User,
	Room,
	Role,
	MapItem,
	PlayerInfo,
	PropertyInfo,
	ItemType,
	ChanceCardInfo,
	Street,
} from "../interfaces/bace";
import { GameOverRule } from "@/enums/game";

export const useLoading = defineStore("loading", {
	state: () => {
		return {
			loading: false,
			text: "",
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
			gameSetting: {
				gameOverRule: GameOverRule.LeftOnePlayer,
				initMoney: 100000,
				multiplier: 1,
				multiplierIncreaseRounds: 2,
				mapId: "",
				roundTime: 15,
				diceNum: 2,
			},
		};
	},
});

export const useMapData = defineStore("map", {
	state: () => {
		return {
			mapId: "",
			mapName: "",
			mapItemsList: new Array<MapItem>(),
			mapIndexList: new Array<string>(),
			itemTypesList: new Array<ItemType>(),
			playerList: new Array<PlayerInfo>(),
			properties: new Array<PropertyInfo>(),
			chanceCards: new Array<ChanceCardInfo>(),
			streetsList: new Array<Street>(),
		};
	},
});

export const useGameInfo = defineStore("gameInfo", {
	state: () => {
		return {
			isMyTurn: false,
			currentPlayerInRound: "",
			currentRound: 0,
			currentMultiplier: 0,
			playersList: new Array<PlayerInfo>(),
			propertiesList: new Array<PropertyInfo>(),
		};
	},
});

export const useUtil = defineStore("uitl", {
	state: () => {
		return {
			rollDiceResult: new Array<number>(),
			remainingTime: 0,
			timeOut: false,
			canRoll: false,
		};
	},
});

export const usePlayerWalk = defineStore("playerWalk", {
	state: () => {
		return {
			walkPlayerId: "",
			walkstep: 0,
			timeStamp: 0,
		};
	},
	actions: {
		updatePlayWalk(walkPlayerId: string, walkstep: number) {
			this.walkPlayerId = walkPlayerId;
			this.walkstep = walkstep;
			this.timeStamp = new Date().getTime();
		},
	},
});
