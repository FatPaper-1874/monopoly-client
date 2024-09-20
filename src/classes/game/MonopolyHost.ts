import Peer, { DataConnection } from "peerjs";
import { ChatMessage, Role, RoomInfo, SocketMessage, User, UserInRoomInfo, GameSetting } from "@/interfaces/bace";
import { GameOverRule, OperateType } from "@/enums/game";
import { ChangeRoleOperate, ChatMessageType, SocketMsgType } from "@/enums/bace";
import { randomString } from "@/utils";
import { getRoleList } from "@/utils/api/role";
import GameProcessWorker from "@/worker/game-process-worker?worker";
import { WorkerCommMsg } from "@/interfaces/worker";
import { WorkerCommType } from "@/enums/worker";
import { getMapById, getMapsList } from "@/utils/api/map";

export class MonopolyHost {
	private peer: Peer;
	private room: Room;

	private gameThreadWorker: Worker | null = null;

	private clientList: Map<string, DataConnection> = new Map<string, DataConnection>();

	private constructor(peer: Peer, room: Room) {
		this.peer = peer;
		this.room = room;

		this.init(this.peer);
	}

	private init(peer: Peer) {
		const _this = this;
		peer.on("connection", (conn) => {
			let clientUserId = "";
			this.clientList.set(conn.connectionId, conn);
			conn.once("data", (data: any) => {
				const _data: SocketMessage = JSON.parse(data);
				if (_data.type === SocketMsgType.JoinRoom) {
					const user = _data.data as User;
					if (!this.room) throw Error("在房间没创建时加入了房间");
					clientUserId = user.userId;
					this.room.join(user, conn);
				}
			});

			conn.on("data", function (data: any) {
				const socketMessage: SocketMessage = JSON.parse(data.toString());
				console.log("Host Received: ", socketMessage);

				switch (socketMessage.type) {
					case SocketMsgType.RoomChat:
						_this.handleRoomChat(conn, socketMessage, clientUserId);
						break;
					case SocketMsgType.ReadyToggle:
						_this.handleReadyToggle(conn, socketMessage, clientUserId);
						break;
					case SocketMsgType.ChangeRole:
						_this.handleChangeRole(conn, socketMessage, clientUserId);
						break;
					case SocketMsgType.ChangeGameSetting:
						_this.handleChangeGameSetting(conn, socketMessage, clientUserId);
						break;
					case SocketMsgType.GameStart:
						_this.handleGameStart();
						break;
					case SocketMsgType.GameInitFinished:
						_this.handleGameInitFinished(conn, socketMessage, clientUserId);
						break;
					case SocketMsgType.RollDiceResult:
						_this.handleRollDiceResult(conn, socketMessage, clientUserId);
						break;
					case SocketMsgType.UseChanceCard:
						_this.handleUseChanceCard(conn, socketMessage, clientUserId);
						break;
					case SocketMsgType.Animation:
						_this.handleAnimationComplete(conn, socketMessage, clientUserId);
						break;
					case SocketMsgType.BuyProperty:
						_this.handleBuyProperty(conn, socketMessage, clientUserId);
						break;
					case SocketMsgType.BuildHouse:
						_this.handleBuildHouse(conn, socketMessage, clientUserId);
						break;
				}
			});

			conn.on("close", () => {
				console.log("🚀 ~ MonopolyHost ~ conn.close");
			});

			conn.on("error", (e) => {
				console.log("🚀 ~ MonopolyHost ~ conn.error:", e);
			});
		});
	}

	public static async create(roomId: string, peerHost: string, peerPort: number) {
		const peer = await new Promise<Peer>((resolve) => {
			const peer = new Peer({ host: peerHost, port: peerPort });
			peer.on("open", () => {
				console.info("MonopolyHost开启成功");
				resolve(peer);
			});
		});
		const { roleList } = await getRoleList();
		const room = new Room(roomId, roleList);

		return new MonopolyHost(peer, room);
	}

	public broadcast(msg: string) {
		Array.from(this.clientList.values()).forEach((c) => {
			c.send(msg);
		});
	}

	public getPeerId() {
		return this.peer.id;
	}

	private handleRoomChat(socketClient: DataConnection, data: SocketMessage, clientUserId: string) {
		const message = data.data as string;
		this.room.chatBroadcast(message, clientUserId);
	}

	private handleReadyToggle(socketClient: DataConnection, data: SocketMessage, clientUserId: string) {
		this.room.readyToggle(clientUserId);
	}

	private handleChangeRole(socketClient: DataConnection, data: SocketMessage, clientUserId: string) {
		this.room.changeRole(clientUserId, data.data);
	}

	private handleChangeGameSetting(socketClient: DataConnection, data: SocketMessage, clientUserId: string) {
		this.room.changeGameSetting(data.data);
	}

	private handleGameStart() {
		this.room.startGame();
	}

	private handleGameInitFinished(socketClient: DataConnection, data: SocketMessage, clientUserId: string) {
		this.room.emitOperationToWorker(clientUserId, OperateType.GameInitFinished);
	}

	private handleRollDiceResult(socketClient: DataConnection, data: SocketMessage, clientUserId: string) {
		this.room.emitOperationToWorker(clientUserId, OperateType.RollDice);
	}

	private handleUseChanceCard(socketClient: DataConnection, data: SocketMessage, clientUserId: string) {
		const chanceCardId: string = data.data;
		const targetId: string | string[] = data.extra;
		if (targetId) {
			if (typeof targetId === "string") {
				this.room.emitOperationToWorker(clientUserId, OperateType.UseChanceCard, chanceCardId, [targetId]);
			} else {
				this.room.emitOperationToWorker(clientUserId, OperateType.UseChanceCard, chanceCardId, targetId);
			}
		} else {
			this.room.emitOperationToWorker(clientUserId, OperateType.UseChanceCard, chanceCardId);
		}
	}

	private handleAnimationComplete(socketClient: DataConnection, data: SocketMessage, clientUserId: string) {
		const operateType: OperateType = data.data;
		this.room.emitOperationToWorker(clientUserId, operateType);
	}

	private handleBuyProperty(socketClient: DataConnection, data: SocketMessage, clientUserId: string) {
		const operateType: OperateType = data.data;
		this.room.emitOperationToWorker(clientUserId, operateType, data.extra);
	}

	private handleBuildHouse(socketClient: DataConnection, data: SocketMessage, clientUserId: string) {
		const operateType: OperateType = data.data;
		this.room.emitOperationToWorker(clientUserId, operateType, data.extra);
	}
}

interface UserInRoom extends UserInRoomInfo {
	socketClient: DataConnection;
}

class Room {
	private roomId: string;
	private userList: Map<string, UserInRoom>;
	private ownerId: string = "";
	private gameSetting: GameSetting;
	private roleList: Role[];
	private gameProcess: Worker | undefined;
	public isStarted: boolean;

	constructor(roomId: string, roleList: Role[]) {
		this.roomId = roomId;
		this.ownerId = "";
		this.roleList = roleList;
		this.isStarted = false;
		this.userList = new Map();
		this.gameSetting = {
			gameOverRule: GameOverRule.Earn100000,
			initMoney: 20000,
			multiplier: 1,
			multiplierIncreaseRounds: 2,
			mapId: "",
			roundTime: 20,
			diceNum: 2,
		};
	}

	public getRoomId() {
		return this.roomId;
	}

	public getOwner() {
		return {
			userId: this.ownerId,
			username: this.userList.get(this.ownerId)?.username || "",
		};
	}

	public getUserList(): UserInRoom[] {
		return Array.from(this.userList.values());
	}

	// public isUserOffLine(userId: string): boolean {
	//     let res = false;
	//     //没有这个用户以及游戏尚未开启均判断为不是断线 无需重连
	//     if (this.hasUser(userId) && this.gameProcess && this.gameProcess.getPlayerIsOffline(userId)) {
	//         res = true;
	//     }
	//     return res;
	// }

	public chatBroadcast(content: string, userId: string) {
		if (!content) return;
		const user = this.userList.get(userId);
		if (!user) return;
		const userInfo: UserInRoomInfo = {
			userId: user.userId,
			username: user.username,
			avatar: user.avatar,
			color: user.color,
			role: user.role,
			isReady: user.isReady,
		};
		const message: ChatMessage = {
			id: randomString(16),
			type: ChatMessageType.Text,
			content,
			user: userInfo,
			time: Date.now(),
		};
		this.roomBroadcast({
			type: SocketMsgType.RoomChat,
			data: message,
			source: "room",
		});
	}

	/**
	 * 将房间的信息广播到房间内的全部用户, 通常在房间界面会用到
	 */
	public roomInfoBroadcast() {
		const roomInfo = this.getRoomInfo();
		const msg: SocketMessage = {
			type: SocketMsgType.RoomInfo,
			source: "server",
			roomId: this.roomId,
			data: roomInfo,
		};
		this.roomBroadcast(msg);
	}

	/**
	 * 将信息广播到房间内的全部用户
	 */
	public roomBroadcast(msg: SocketMessage) {
		Array.from(this.userList.values()).forEach((user: UserInRoom) => {
			user.socketClient.send(JSON.stringify(msg));
		});
	}

	/**
	 * 获取房间的信息
	 * @returns 返回房间的信息
	 */
	private getRoomInfo(): RoomInfo {
		const roomInfo: RoomInfo = {
			roomId: this.roomId,
			userList: Array.from(this.userList.values()).map((user) => ({
				userId: user.userId,
				username: user.username,
				isReady: user.isReady,
				color: user.color,
				avatar: user.avatar,
				role: user.role,
			})),
			isStarted: this.isStarted,
			ownerId: this.getOwner().userId,
			ownerName: this.getOwner().username,
			roleList: this.roleList,
			gameSetting: this.gameSetting,
		};
		return roomInfo;
	}

	/**
	 * 转变某个用户的准备状态
	 * @param _user 要转变准备状态用户的id或实例
	 */
	readyToggle(_user: UserInRoomInfo): boolean;
	readyToggle(_user: string): boolean;
	public readyToggle(_user: UserInRoomInfo | string) {
		const user = this.userList.get(typeof _user === "string" ? _user : _user.userId);
		if (user) {
			user.isReady = !user.isReady;
			this.roomInfoBroadcast();
			return user.isReady;
		}
		return false;
	}

	/**
	 * 用户加入房间
	 * @param user 加入房间的用户的id或实例
	 * @param conn peer链接
	 * @returns 是否加入成功
	 */
	public join(user: User, conn: DataConnection) {
		if (this.userList.has(user.userId)) {
			//用户已在房间内
			this.sendToClient(
				conn,
				SocketMsgType.JoinRoom,
				{ roomId: this.roomId },
				{
					type: "warning",
					content: "你已在房间中",
				},
				this.roomId
			);
			return false;
		} else {
			const userInRoom: UserInRoom = {
				...user,
				socketClient: conn,
				role: this.roleList[Math.floor(Math.random() * this.roleList.length)],
				isReady: false,
			};
			if (Array.from(this.userList.values()).length === 0) this.ownerId = userInRoom.userId;
			this.userList.set(user.userId, userInRoom);
			this.sendToClient(
				conn,
				SocketMsgType.JoinRoom,
				{ roomId: this.roomId },
				{
					type: "success",
					content: "加入房间成功",
				},
				this.roomId
			);
			this.roomInfoBroadcast();
			return true;
		}
	}

	/**
	 * 用户离开房间
	 * @param user 离开房间的用户的id
	 * @returns 玩家离开后房间是否为空
	 */
	public leave(userId: string): boolean {
		//房间中还有更多玩家的情况
		// if (this.isStarted) {
		//     //游戏已经开始，处理断线
		//     this.handleUserOffline(userId);
		//     if (this.gameProcess && this.gameProcess.getIsAllPlayerOffline()) {
		//         //如果所有人都断线了, 解散房间
		//         this.gameProcess.destroy();
		//         return true;
		//     } else {
		//         return false;
		//     }
		// } else {
		//游戏没有开始，仍在房间页面
		if (this.userList.size === 1) {
			//房间最后一个人退出, 退出后解散房间
			this.userList.delete(userId);
			// if (this.gameProcess) this.gameProcess.destroy();
			return true;
		} else {
			if (this.ownerId === userId) {
				//如果是房主离开, 转移房主
				this.ownerId = Array.from(this.userList.keys())[0];
				const owner = this.userList.get(this.ownerId);
				if (owner) owner.isReady = false;
			}
			this.userList.delete(userId);
			this.roomInfoBroadcast();
			return false;
		}
		// }
	}

	public changeRole(_userId: string, operate: ChangeRoleOperate): void {
		const user = this.userList.get(_userId);
		if (user) {
			const roleIndex = this.roleList.findIndex((role) => role.id === user.role!.id);
			const newIndex =
				operate === ChangeRoleOperate.Next
					? roleIndex + 1 >= this.roleList.length
						? 0
						: roleIndex + 1
					: roleIndex - 1 < 0
					? this.roleList.length - 1
					: roleIndex - 1;
			user.role = this.roleList[newIndex];

			this.roomInfoBroadcast();
		} else {
			return;
		}
	}

	public changeGameSetting(gameSetting: GameSetting): void {
		this.gameSetting = gameSetting;
		this.roomBroadcast({
			type: SocketMsgType.MsgNotify,
			source: "server",
			data: "",
			msg: { type: "info", content: "地图设置有变更" },
		});
		this.roomInfoBroadcast();
	}

	public async startGame() {
		if (!Array.from(this.userList.values()).every((item) => item.userId == this.ownerId || item.isReady)) {
			this.roomBroadcast({
				type: SocketMsgType.GameStart,
				source: "server",
				data: "error",
				msg: { type: "warning", content: "有玩家未准备" },
			});
			return;
		}
		if (this.isStarted || this.gameProcess) return;
		this.isStarted = true;
		this.gameProcess = new GameProcessWorker();
		this.gameProcess.addEventListener("message", (ev) => {
			const msg: WorkerCommMsg = ev.data;
			switch (msg.type) {
				case WorkerCommType.WorkerReady:
					handleWorkerReady();
					break;
				case WorkerCommType.SendToUsers:
					handleSendToUsers(msg.data);
					break;
			}
		});
		this.isStarted = false;

		const handleWorkerReady = async () => {
			if (!this.gameSetting.mapId || !this.gameProcess) return;
			const mapInfo = await getMapById(this.gameSetting.mapId);
			this.gameProcess.postMessage(<WorkerCommMsg>{
				type: WorkerCommType.LoadGameInfo,
				data: {
					setting: this.gameSetting,
					mapInfo,
					userList: Array.from(this.userList.values()).map((u) => {
						const { socketClient, ...userInfo } = u;
						return userInfo;
					}),
				},
			});
		};

		const handleSendToUsers = (data: { userIdList: string[]; data: SocketMessage }) => {
			for (let index = 0; index < data.userIdList.length; index++) {
				const userId = data.userIdList[index];
				const user = this.userList.get(userId);
				user && user.socketClient.send(JSON.stringify(data.data));
			}
		};
	}

	/**
	 * 获取房间内用户数量
	 * @return  用户数量
	 */
	public getUserNum() {
		return this.userList.size;
	}

	/**
	 * 处理user在游戏时断线
	 * @param userId 要查找的用户的id或实例
	 */
	// private handleUserOffline(userId: string) {
	//     const user = this.userList.get(userId);
	//     if (!user) return;
	//     if (this.gameProcess) {
	//         this.gameProcess.handlePlayerDisconnect(userId);
	//     }
	//     this.roomInfoBroadcast();
	// }

	// public handleUserReconnect(user: UserInRoom) {
	//     const oldUser = this.userList.get(user.userId);
	//     if (oldUser) {
	//         oldUser.socketClient = user.socketClient;
	//         this.roomInfoBroadcast();
	//         this.gameProcess && this.gameProcess.handlePlayerReconnect(user);
	//     } else {
	//         console.log("奇怪的玩家 in room");
	//     }
	// }

	/**
	 * 房间中是否存在该用户
	 * @param _user 要查找的用户的id或实例
	 */
	public hasUser(_user: UserInRoomInfo | undefined): boolean;
	public hasUser(_user: string): boolean;
	public hasUser(_user: UserInRoomInfo | undefined | string): boolean {
		if (!_user) return false;
		return this.userList.has(typeof _user === "string" ? _user : _user.userId);
	}

	public emitOperationToWorker(userId: string, operateType: OperateType, ...data: any) {
		if (!this.gameProcess) throw Error("在worker还没创建时给worker发信息");
		this.gameProcess.postMessage(<WorkerCommMsg>{
			type: WorkerCommType.EmitOperation,
			data: {
				userId,
				operateType,
				data,
			},
		});
	}

	/**
	 * 向指定客户端发送信息
	 * @param socketClient 要发送信息的客户端/或者用户id
	 * @param type 发送的信息类型
	 * @param data 发送的信息本体
	 * @param msg 可以使客户端触发message组件的信息
	 * @param roomId 房间Id
	 */
	public sendToClient(
		socketClient: DataConnection,
		type: SocketMsgType,
		data: any,
		msg?: { type: "success" | "warning" | "error" | "info"; content: string },
		roomId?: string
	) {
		const msgToSend: SocketMessage = {
			type,
			data,
			source: "server",
			roomId,
			msg,
		};
		socketClient.send(JSON.stringify(msgToSend));
	}
}
