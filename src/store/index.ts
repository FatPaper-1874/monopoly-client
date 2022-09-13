import { createStore } from "vuex";
import RoomInfoInterface from "../class/Interface/RoomInfoInterface";

interface State {
	userId: string;
	userName: string;
	roomId: string;
	roomList: RoomInfoInterface[];
	roomInfo: RoomInfoInterface;
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
	},
	actions: {
    aSetUserName: (context, data: string) => {
			context.commit('setUserName', data);
		},
  },
	modules: {},
});
