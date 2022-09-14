import CommTypes from "./enums/CommTypes";
import CommInterface from "./Interface/CommInterface";
import store from "@/store";
import { newUserId } from "@/utils";
import MsgInterface from "./Interface/MsgInterface";
import RoomInfoInterface from "./Interface/RoomInfoInterface";
import { notify } from "@kyvg/vue3-notification";

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
		notify({ type: "success", text: msg.extra });
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
}

export default SocketClient;
