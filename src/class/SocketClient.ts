import CommTypes from "./enums/CommTypes";
import CommInterface from "./Interface/CommInterface";
import store from "@/store";
import { newUserId } from "@/utils";
import MsgInterface from "./Interface/MsgInterface";
import RoomInfoInterface from "./Interface/RoomInfoInterface";
import { notify } from "@kyvg/vue3-notification";
import router from "@/router";
import ArrivalEventTypes from "./enums/ArrivalEventTypes";
import EventResultTypes from "@/class/enums/EventResultTypes";

class SocketClient {
	private socketClient: WebSocket;
	private static instance: SocketClient;

	static getInstance() {
		if (!this.instance) {
			this.instance = new SocketClient();
		}
		return this.instance;
	}

	private constructor() {
		store.commit("setUserId", newUserId());
		const userName = store.state.userName;
		const userId = store.state.userId;

		console.log(userName);
		console.log(userId);

		const webSocketClient = new WebSocket("ws://localhost:3010");
		webSocketClient.onopen = () => {
			const connectSuccessMsg: CommInterface = {
				type: CommTypes.ConnectSuccess,
				msg: {
					sourceId: userId,
					targetId: "",
					data: userName,
					extra: "",
				},
			};
			this.sendMsg(connectSuccessMsg);
			//连接后获取全部房间信息
			const gerRoomListMsg: CommInterface = {
				type: CommTypes.GetRoomList,
				msg: {
					sourceId: store.state.userId,
					targetId: "",
					data: "",
					extra: "",
				},
			};
			this.sendMsg(gerRoomListMsg);
		};
		webSocketClient.onmessage = (data) => {
			const receivedData: CommInterface = JSON.parse(data.data);
			//处理接收的信息
			this.handleReceivedData(receivedData);
		};
		this.socketClient = webSocketClient;
	}

	//处理接收的信息(路由)
	private handleReceivedData(receivedData: CommInterface) {
		switch (receivedData.type) {
			case CommTypes.ConnectSuccess:
				this.handleConnectSuccessReply(receivedData.msg);
				break;
			case CommTypes.GetRoomList:
				this.handleGetRoomListReply(receivedData.msg);
				break;
			case CommTypes.JoinRoom:
				this.handleJoinRoomReply(receivedData.msg);
				break;
			case CommTypes.LeaveRoom:
				this.handleLeaveRoomReply(receivedData.msg);
				break;
			case CommTypes.RoomRadio:
				this.handleRoomRadioReply(receivedData.msg);
				break;
			case CommTypes.RoomMsgRadio:
				this.handleRoomMsgRadioReply(receivedData.msg);
				break;
			case CommTypes.GameFrame:
				this.handleGameFrameRadioReply(receivedData.msg);
				break;
			case CommTypes.RollDice:
				this.handleRollDiceReply(receivedData.msg);
				break;
			case CommTypes.BuyRealEstate:
				this.handleBuyRealEstate(receivedData.msg);
				break;
			case CommTypes.BuildHouse:
				this.handleBuildingHouse(receivedData.msg);
				break;
			case CommTypes.SpecialEvent:
				this.handleSpecialEvent(receivedData.msg);
				break;
			case CommTypes.RoundEnd:
				this.handleRoundEnd(receivedData.msg);
				break;
			default:
				break;
		}
	}

	private handleConnectSuccessReply(msg: MsgInterface) {
		// fatMessage({ text: msg.extra, type: FatMessageType.Success });
		notify({ type: "success", text: msg.extra });
	}

	private handleGetRoomListReply(msg: MsgInterface) {
		const roomList = JSON.parse(msg.data);
		console.log(roomList);
		store.commit("setRoomList", roomList);
	}

	private handleJoinRoomReply(msg: MsgInterface) {
		notify({ type: "success", text: msg.extra });
		const roomId = msg.sourceId;
		store.commit("setRoomId", roomId);
	}

	private handleLeaveRoomReply(msg: MsgInterface) {
		notify({ type: "warn", text: msg.extra });
		store.commit("setRoomId", "");
		store.commit("setRoomInfo", {
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
		});
	}

	private handleRoomRadioReply(msg: MsgInterface) {
		const roomInfo: RoomInfoInterface = JSON.parse(msg.data);
		console.log(roomInfo);
		store.commit("setRoomInfo", roomInfo);
	}

	private handleRoomMsgRadioReply(msg: MsgInterface) {
		notify({ type: msg.data || "success", text: msg.extra });
	}

	private handleGameFrameRadioReply(msg: MsgInterface) {
		const gameFrameInfo = JSON.parse(msg.data);
		console.log(gameFrameInfo);
		store.dispatch("aSetGameFrameInfo", gameFrameInfo).then(() => {
			router.replace("/game-page");
		});
	}

	private handleRollDiceReply(msg: MsgInterface) {
		const rollDiceResult = JSON.parse(msg.data);
		store.dispatch("aSetRollResult", rollDiceResult);
		console.log(rollDiceResult);
	}

	private handleBuyRealEstate(msg: MsgInterface) {
		store.commit("setArrivalEventType", ArrivalEventTypes.Buy);
		store.commit("setShowingRealEstateId", msg.data);
		notify({ type: "success", text: msg.extra });
	}

	private handleBuildingHouse(msg: MsgInterface){
		store.commit("setArrivalEventType", ArrivalEventTypes.Building);
		store.commit("setShowingRealEstateId", msg.data);
		notify({ type: "success", text: msg.extra });
	}

	private handleSpecialEvent(msg: MsgInterface) {
		//收到走到特殊格子信息, 直接回复, 无需UI变化
		const replySpecialEventMsg: CommInterface = {
			type: CommTypes.SpecialEvent,
			msg: {
				sourceId: "",
				targetId: "",
				data: JSON.stringify(EventResultTypes.Agree),
				extra: "",
			},
		};

		this.sendMsg(replySpecialEventMsg);
	}

	private handleRoundEnd(msg: MsgInterface) {
		store.commit("setAfterRoll", false);
		store.commit("setShowingRealEstateId", ""); //清除交易框的内容
		store.commit("setArrivalEventType", ArrivalEventTypes.None); //重置交易状态
		notify({ type: msg.data || "success", text: msg.extra });
	}

	private sendMsg(msg: CommInterface) {
		if (this.socketClient.OPEN) {
			this.socketClient.send(JSON.stringify(msg));
		}
	}

	public joinRoom(userName: string, roomId?: string) {
		const userId: string = store.state.userId;
		const sendMsg: CommInterface = {
			type: CommTypes.JoinRoom,
			msg: {
				sourceId: userId,
				targetId: roomId || "",
				data: userName,
				extra: "",
			},
		};
		this.sendMsg(sendMsg);
	}

	public leaveRoom(roomId: string) {
		const userId: string = store.state.userId;
		const sendMsg: CommInterface = {
			type: CommTypes.LeaveRoom,
			msg: {
				sourceId: userId,
				targetId: roomId,
				data: "",
				extra: "",
			},
		};
		this.sendMsg(sendMsg);
	}

	public startGame(roomId: string) {
		const userId: string = store.state.userId;
		const sendMsg: CommInterface = {
			type: CommTypes.StartGame,
			msg: {
				sourceId: userId,
				targetId: roomId,
				data: "",
				extra: "",
			},
		};
		this.sendMsg(sendMsg);
	}

	public rollDice() {
		const userId: string = store.state.userId;
		const sendMsg: CommInterface = {
			type: CommTypes.RollDice,
			msg: {
				sourceId: userId,
				targetId: "",
				data: "",
				extra: "",
			},
		};
		this.sendMsg(sendMsg);
	}

	public sendBuyRealEstateResult(result: EventResultTypes) {
		const userId: string = store.state.userId;
		const eventResultMsg: CommInterface = {
			type: CommTypes.BuyRealEstate,
			msg: {
				sourceId: userId,
				targetId: "server",
				data: JSON.stringify(result),
				extra: "",
			},
		};
		this.sendMsg(eventResultMsg);
	}

	public sendBuildHouseResult(result: EventResultTypes) {
		const userId: string = store.state.userId;
		const eventResultMsg: CommInterface = {
			type: CommTypes.BuildHouse,
			msg: {
				sourceId: userId,
				targetId: "server",
				data: JSON.stringify(result),
				extra: "",
			},
		};
		this.sendMsg(eventResultMsg);
	}
}

export default SocketClient;
