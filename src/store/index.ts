import { createStore } from "vuex";
import RoomInfoInterface from "../class/Interface/RoomInfoInterface";
import GameFrameInterface from "../class/Interface/game/GameFrameInterface";
import { roll } from "@/utils";
import ArrivalEventTypes from "@/class/enums/ArrivalEventTypes";

interface State {
	userId: string;
	userName: string;
	roomId: string;
	roomList: RoomInfoInterface[];
	roomInfo: RoomInfoInterface;
	gameFrame: GameFrameInterface;
	rollResult: number[];
	isShaking: boolean;
	arrivalEventType: ArrivalEventTypes;
	showingRealEstateId: string;
}

const state: State = {
	userId: "",
	userName: "",
	roomId: "",
	roomList: [],
	roomInfo: {
		roomId: "",
		owner: "",
		ownerId: "",
		playerList: [],
	},
	gameFrame: {
		gameInfo: {
			currentRound: -1,
			currentRoundPlayerId: "",
		},
		playerInfoList: [],
		mapInfo: {
			mapItemList: [],
		},
	},
	rollResult: [1, 1],
	//UI

	isShaking: false,
	arrivalEventType: ArrivalEventTypes.None,
	showingRealEstateId: "",
};

export default createStore({
	state: state,
	getters: {},
	mutations: {
		setUserId: (state, data: string) => {
			state.userId = data;
		},
		setUserName: (state, data: string) => {
			state.userName = data;
		},
		setRoomId: (state, data: string) => {
			state.roomId = data;
		},
		setRoomList: (state, data: RoomInfoInterface[]) => {
			state.roomList = data;
		},
		setRoomInfo: (state, data: RoomInfoInterface) => {
			state.roomInfo = data;
		},
		SetGameFrameInfo: (state, data: GameFrameInterface) => {
			state.gameFrame = data;
		},
		SetRollResult: (state, data: number[]) => {
			state.rollResult = data;
		},
		SetShaking: (state, data: boolean) => {
			state.isShaking = data;
		},
		setArrivalEventType: (state, data: ArrivalEventTypes) => {
			state.arrivalEventType = data;
		},
		setShowingRealEstateId: (state, data: string) => {
			state.showingRealEstateId = data;
		},
	},
	actions: {
		aSetUserName: (context, data: string) => {
			context.commit("setUserName", data);
		},
		aSetGameFrameInfo: (context, data: GameFrameInterface) => {
			context.commit("SetGameFrameInfo", data);
		},
		aSetRollResult: (context, data: number[]) => {
			const rollPromise = new Promise<void>((resolve, reject) => {
				//假装摇骰子:P
				let count = 0;
				context.commit("SetShaking", true);
				const timer = setInterval(() => {
					if (count < 10) {
						context.commit("SetRollResult", roll(data.length));
						count++;
					} else {
						clearInterval(timer);
						resolve();
					}
				}, 100);
			});
			rollPromise.then(() => {
				context.commit("SetShaking", false);
				context.commit("SetRollResult", data);
			});
		},
	},
	modules: {},
});
