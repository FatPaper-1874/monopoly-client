import { ChangeRoleOperate, SocketMsgType } from "../../enums/bace";
import { GameInitInfo, Room, SocketMessage, User } from "../../interfaces/bace";
import { useUserInfo, useUserList, useRoomList, useRoomInfo, useMap, useLoading, useGameInfo } from "../../store/index";
import FPMessage from "../../components/utils/fp-message/index";
import router from "../../router";

export class GameSocketClient {
	private socketClient: WebSocket;
	private static instance: GameSocketClient;

	static getInstance(): GameSocketClient {
		if (!this.instance) {
			this.instance = new GameSocketClient();
		}
		return this.instance;
	}

	constructor() {
		const userInfo = useUserInfo();
		this.socketClient = new WebSocket("ws://127.0.0.1:8001");
		this.socketClient.onopen = () => {
			console.log("客户端socket开启连接成功");
			const user = {
				username: userInfo.username,
				userId: userInfo.userId,
				avatar: userInfo.avatar,
				color: userInfo.color,
			};
			this.sendMsg(SocketMsgType.ConfirmIdentity, JSON.stringify(user));
			this.socketClient.onmessage = (e) => {
				const data: SocketMessage = JSON.parse(e.data);
				if (data.msg) {
					FPMessage({ type: data.msg.type, message: data.msg.content });
				}
				switch (data.type) {
					case SocketMsgType.UserList:
						this.handleUserListReply(data.data);
						break;
					case SocketMsgType.RoomList:
						this.handleRoomListReply(data.data);
						break;
					case SocketMsgType.JoinRoom:
						this.handleJoinRoomReply(data);
						break;
					case SocketMsgType.LeaveRoom:
						this.handleLeaveRoomReply(data);
						break;
					case SocketMsgType.RoomInfo:
						this.handleRoomInfoReply(data);
						break;
					case SocketMsgType.GameStart:
						this.handleGameStart(data);
						break;
					case SocketMsgType.GameInit:
						this.handleGameInit(data);
						break;
					case SocketMsgType.GameInfo:
						this.handleGameInfo(data);
						break;
				}
			};
		};
	}

	private handleUserListReply(data: User[]) {
		console.log(data);
		const userListStore = useUserList();
		userListStore.userList = data;
	}

	private handleRoomListReply(data: Room[]) {
		console.log(data);
		const roomListStore = useRoomList();
		roomListStore.roomList = data;
	}

	private handleJoinRoomReply(data: SocketMessage) {
		if (data.roomId) {
			useRoomInfo().roomId = data.roomId;
			router.replace({ name: "room" });
		}
	}

	private handleLeaveRoomReply(data: SocketMessage) {
		useRoomInfo().$reset(); //重置房间信息
		router.replace({ name: "room-list" });
	}

	private handleRoomInfoReply(data: SocketMessage) {
		const roomInfoData = data.data;
		if (roomInfoData) {
			const roomInfo = useRoomInfo();
			roomInfo.roomId = roomInfoData.roomId;
			roomInfo.ownerId = roomInfoData.ownerId;
			roomInfo.ownerName = roomInfoData.ownerName;
			roomInfo.userList = roomInfoData.userList;
			roomInfo.roleList = roomInfoData.roleList;
		}
	}

	private handleGameStart(data: SocketMessage) {
		const loadingStore = useLoading();
		loadingStore.loading = true;
	}

	private handleGameInit(data: SocketMessage) {
		const loadingStore = useLoading();
		loadingStore.loading = false;
		if (data.data == "error") return;
		const mapDataStore = useMap();
		const gameInfoStore = useGameInfo();
		const gameInitInfo: GameInitInfo = data.data;
		try {
			mapDataStore.mapData = gameInitInfo.mapData;
			mapDataStore.mapIndex = gameInitInfo.mapIndex;
			gameInfoStore.playerList = gameInitInfo.playerList;
			gameInfoStore.properties = gameInitInfo.properties;
			router.replace({ name: "game" });
		} catch {}
	}

	private handleGameInfo(data: SocketMessage) {
		if (data.data == "error") return;
		const gameInfoStore = useGameInfo();
		const gameInitInfo: GameInitInfo = data.data;
		try {
			gameInfoStore.playerList = gameInitInfo.playerList;
			gameInfoStore.properties = gameInitInfo.properties;
		} catch {}
	}

	private sendMsg(type: SocketMsgType, data: any, roomId?: string) {
		const userInfo = useUserInfo();
		const msgToSend: SocketMessage = {
			type,
			source: userInfo.userId,
			roomId,
			data,
		};
		this.socketClient.send(JSON.stringify(msgToSend));
	}

	public joinRoom(roomId: string) {
		this.sendMsg(SocketMsgType.JoinRoom, "", roomId);
	}

	public leaveRoom(roomId: string) {
		this.sendMsg(SocketMsgType.LeaveRoom, "", roomId);
	}

	public readyToggle(roomId: string) {
		this.sendMsg(SocketMsgType.ReadyToggle, "", roomId);
	}

	public changeRole(roomId: string, operate: ChangeRoleOperate) {
		this.sendMsg(SocketMsgType.ChangeRole, operate, roomId);
	}

	public startGame(roomId: string) {
		this.sendMsg(SocketMsgType.GameStart, "", roomId);
	}
}
