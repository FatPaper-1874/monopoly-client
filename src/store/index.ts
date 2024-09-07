import { defineStore } from "pinia";
import { User, Room, Role, ChatMessage } from "@/interfaces/bace";
import { MapItem, PlayerInfo, PropertyInfo, ItemType, ChanceCardInfo, Street } from "@/interfaces/game";
import { GameOverRule } from "@/enums/game";
import { isFullScreen, isLandscape } from "@/utils";

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
			useraccount: "",
			username: "",
			avatar: "",
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
	getters: {
		iAmRoomOwner: (state) => useUserInfo().userId === state.ownerId,
	},
});

export const useMapData = defineStore("map", {
	state: () => {
		return {
			mapId: "",
			mapName: "",
			mapBackground: "",
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
			ping: 0,
			currentPlayerInRound: "",
			currentRound: 0,
			currentMultiplier: 0,
			playersList: new Array<PlayerInfo>(),
			propertiesList: new Array<PropertyInfo>(),
			isGameOver: false,
		};
	},
	getters: {
		isMyTurn: (state) => useUserInfo().userId === state.currentPlayerInRound,
		getMyInfo: (state) => state.playersList.find((p) => p.id === useUserInfo().userId),
	},
});

export const useUtil = defineStore("util", {
	state: () => {
		return {
			isRollDiceAnimationPlay: false,
			rollDiceResult: new Array<number>(),
			remainingTime: 0,
			timeOut: false,
			canRoll: false,
		};
	},
});

export const useChat = defineStore("chat", {
	state: (): {
		chatShow: boolean;
		messageLimit: number;
		chatMessageQueue: Array<ChatMessage>;
		newMessage: ChatMessage | undefined;
		newMessageNum: number;
	} => {
		return {
			chatShow: false,
			messageLimit: 60,
			chatMessageQueue: new Array<ChatMessage>(),
			newMessage: undefined,
			newMessageNum: 0,
		};
	},
	actions: {
		addNewMessage(_newMessage: ChatMessage) {
			this.chatMessageQueue.push(_newMessage);
			this.newMessage = _newMessage;
			if (!this.chatShow) this.newMessageNum += 1;
			if (this.chatMessageQueue.length > this.messageLimit) {
				this.chatMessageQueue.shift();
			}
		},
		resetNewMessageNum() {
			this.newMessageNum = 0;
		},
	},
});

export const useDeviceStatus = defineStore("deviceStatus", {
	state: () => {
		return {
			isFullScreen: false,
			isLandscape: false,
			isMobile: false,
			isFocus: false,
		};
	},
});
