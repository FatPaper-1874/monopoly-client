import Peer, { DataConnection } from "peerjs";
import { ChangeRoleOperate, MonopolyWebSocketMsgType, SocketMsgType } from "@/enums/bace";
import { ChatMessage, GameSetting, MonopolyWebSocketMsg, Room, RoomInfo, SocketMessage, User } from "@/interfaces/bace";
import { base64ToFileUrl } from "@/utils";
import { asyncMissionQueue } from "@/utils/async-mission-queue";
import { MonopolyHost } from "@/classes/game/MonopolyHost";
import { PeerClient } from "@/classes/game/PeerClient";
import FPMessage from "@/components/utils/fp-message";
import {
	useChat,
	useGameInfo,
	useLoading,
	useMapData,
	useRoomInfo,
	useRoomList,
	useUserInfo,
	useUserList,
	useUtil,
} from "@/store";
import router from "@/router";
import { GameInfo, GameInitInfo, PropertyInfo } from "@/interfaces/game";
import useEventBus from "@/utils/event-bus";
import { createVNode } from "vue";
import PropertyInfoVue from "@/components/common/property-info.vue";
import { FPMessageBox } from "@/components/utils/fp-message-box";
import { OperateType } from "@/enums/game";
import { send } from "vite";

type MonopolyClientOptions = {
	webSocket: {
		host: string;
		port: number;
	};
	iceServer: {
		host: string;
		port: number;
	};
};

async function createWebSocketClient(options: MonopolyClientOptions): Promise<WebSocket> {
	const { webSocket: wsInfo } = options;
	const ws = new WebSocket(`ws://${wsInfo.host}:${wsInfo.port}`);
	return new Promise((resolve, reject) => {
		try {
			ws.onopen = (ev) => {
				ws.onopen = null;
				resolve(ws);
			};
		} catch (e: any) {
			reject(e.message);
		}
	});
}

export class MonopolyClient {
	private userId: string | undefined;
	private peerId: string | undefined;
	private roomId: string | undefined;

	private options: MonopolyClientOptions;
	private webSocketHost: string;
	private webSocketPort: number;
	private iceServerHost: string;
	private iceServerPort: number;

	private worker: Worker | undefined;
	private webSocketClient: WebSocket | undefined;
	private peerClient: PeerClient | undefined;
	private conn: DataConnection | undefined;

	private gameHost: MonopolyHost | undefined;

	private static instance: MonopolyClient | undefined;

	public static getInstance(): MonopolyClient;
	public static getInstance(options: MonopolyClientOptions): Promise<MonopolyClient>;
	public static getInstance(options?: MonopolyClientOptions) {
		if (this.instance) {
			return this.instance;
		}
		if (options) {
			return (async () => {
				const ws = await createWebSocketClient(options);
				this.instance = new MonopolyClient(ws, options);

				return this.instance;
			})();
		} else {
			if (!this.instance) {
				throw Error("在调用MonopolyClient之前应该先对其初始化, 使用useMonopolyClient时提供options以初始化");
			}
			return this.instance;
		}
	}

	private constructor(ws: WebSocket, options: MonopolyClientOptions) {
		this.webSocketClient = ws;
		const {
			webSocket: { host: wsHost, port: wsPort },
			iceServer: { host: iceHost, port: icePort },
		} = options;

		this.options = options;
		this.webSocketHost = wsHost;
		this.webSocketPort = wsPort;
		this.iceServerHost = iceHost;
		this.iceServerPort = icePort;
		// asyncMessageQueue<MonopolyWebSocketMsgType, MonopolyWebSocketMsg>((callback) => {
		// 	const messageHandler = (ev: MessageEvent) => {
		// 		const data: MonopolyWebSocketMsg = JSON.parse(ev.data);
		// 		callback(data);
		// 	};
		// 	ws.addEventListener("message", messageHandler);
		// 	return () => ws.removeEventListener("message", messageHandler);
		// }, []);
	}

	public async joinRoom(roomId: string) {
		if (!this.webSocketClient)
			throw Error("在调用MonopolyClient之前应该先对其初始化, 使用useMonopolyClient时提供options以初始化");
		if (this.webSocketClient.readyState === WebSocket.CLOSED) {
			this.webSocketClient = await createWebSocketClient(this.options);
		}
		const ws = this.webSocketClient;

		//向服务器发出申请
		this.sendToWebSocketServer(MonopolyWebSocketMsgType.JoinRoom, roomId);

		//同步队列等待服务器响应
		await asyncMissionQueue<MonopolyWebSocketMsgType, MonopolyWebSocketMsg>(
			(callback, cancle) => {
				function messageHandler(ev: MessageEvent) {
					const data: MonopolyWebSocketMsg = JSON.parse(ev.data);
					callback(data);
				}

				function errorHandler(ev: MessageEvent) {
					const data = JSON.parse(ev.data) as MonopolyWebSocketMsg;
					switch (data.type) {
						case MonopolyWebSocketMsgType.Error:
							cancle(`服务器驳回: ${data.data}`);
							break;
					}
				}

				function removeEventListeners() {
					ws.removeEventListener("message", messageHandler);
					ws.removeEventListener("message", errorHandler);
				}

				ws.addEventListener("message", messageHandler);
				ws.addEventListener("message", errorHandler);
				return removeEventListeners;
			},
			[
				{
					type: MonopolyWebSocketMsgType.JoinRoom,
					fn: async (_data) => {
						const data = _data.data;
						let hostPeerId = data;
						if (data.create) {
							if (this.gameHost) throw Error("你已经是主机了,为什么要再次创建房间!!!");
							// 创建一个临时的 URL 指向 Blob 数据
							this.gameHost = await MonopolyHost.create(data.roomId, this.iceServerHost, this.iceServerPort);
							hostPeerId = this.gameHost.getPeerId();
							this.sendToWebSocketServer(MonopolyWebSocketMsgType.CreateRoom, hostPeerId);
						}
						await this.linkToGameHost(hostPeerId);
					},
				},
			]
		).catch((e) => {
			FPMessage({ type: "error", message: e });
		});
	}

	private async linkToGameHost(hostPeerId: string) {
		try {
			if (!this.peerClient) {
				this.peerClient = await PeerClient.create(this.iceServerHost, this.iceServerPort);
			}
			this.conn = await this.peerClient.linkToHost(hostPeerId);
			const { userId, username, color, avatar } = useUserInfo();
			const user: User = {
				userId,
				username,
				color,
				avatar,
				isReady: false,
			};
			this.sendMsg(SocketMsgType.JoinRoom, user);

			this.conn.on("data", (_data: any) => {
				// const data = JSON.parse(_data as string);
				const data: SocketMessage = JSON.parse(_data);
				if (data.msg) {
					FPMessage({
						type: data.msg.type as "info" | "success" | "warning" | "error",
						message: data.msg.content,
					});
				}
				console.log("Client Receive: ", data);

				switch (data.type) {
					case SocketMsgType.Heart:
						this.handleHeart(data);
						break;
					case SocketMsgType.ConfirmIdentity:
						this.handleConfirmIdentity();
						break;
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
					case SocketMsgType.RoomChat:
						this.handleRoomChatReply(data);
						break;
					case SocketMsgType.GameStart:
						this.handleGameStart(data);
						break;
					case SocketMsgType.GameInit:
						this.handleGameInit(data);
						break;
					case SocketMsgType.GameInitFinished:
						this.handleGameInitFinished();
						break;
					case SocketMsgType.GameInfo:
						this.handleGameInfo(data);
						break;
					case SocketMsgType.RemainingTime:
						this.handleRemainingTime(data);
						break;
					case SocketMsgType.RoundTurn:
						this.handleRoundTurn();
						break;
					case SocketMsgType.RollDiceStart:
						this.handleRollDiceAnimationPlay();
						break;
					case SocketMsgType.RollDiceResult:
						this.handleRollDiceResult(data);
						break;
					case SocketMsgType.UseChanceCard:
						this.handleUsedChanceCard(data);
						break;
					case SocketMsgType.PlayerWalk:
						this.handlePlayerWalk(data);
						break;
					case SocketMsgType.PlayerTp:
						this.handlePlayerTp(data);
						break;
					case SocketMsgType.BuyProperty:
						this.handleBuyProperty(data);
						break;
					case SocketMsgType.BuildHouse:
						this.handleBuildHouse(data);
						break;
					case SocketMsgType.GameOver:
						this.handleGameOver(data);
					default:
						break;
				}
			});
		} catch (e: any) {
			FPMessage({ type: "error", message: e });
		}
	}

	private sendToWebSocketServer(type: MonopolyWebSocketMsgType, data: any) {
		if (this.webSocketClient) this.webSocketClient.send(JSON.stringify({ type, data }));
	}

	private handleHeart(data: SocketMessage) {
		const gameInfoStore = useGameInfo();
		gameInfoStore.ping = Date.now() - data.data;
	}

	private handleConfirmIdentity() {}

	private handleUserListReply(data: User[]) {
		const userListStore = useUserList();
		userListStore.userList = data;
	}

	private handleRoomListReply(data: Room[]) {
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
		router.replace({ name: "room-router" });
	}

	private handleRoomInfoReply(data: SocketMessage) {
		const roomInfoData = data.data as RoomInfo;
		const roomInfoStore = useRoomInfo();
		roomInfoData &&
			roomInfoStore.$patch({
				roomId: roomInfoData.roomId,
				ownerId: roomInfoData.ownerId,
				ownerName: roomInfoData.ownerName,
				userList: roomInfoData.userList,
				roleList: roomInfoData.roleList,
				gameSetting: roomInfoData.gameSetting,
			});
	}

	private handleRoomChatReply(res: SocketMessage) {
		const message = res.data as ChatMessage;
		useChat().addNewMessage(message);
	}

	private handleGameStart(data: SocketMessage) {
		const loadingStore = useLoading();
		loadingStore.loading = true;
	}

	private handleGameInit(data: SocketMessage) {
		if (data.data) {
			const loadingStore = useLoading();
			loadingStore.text = "获取数据成功，加载中...";

			const gameInitInfo = data.data as GameInitInfo;

			const mapDataStore = useMapData();
			mapDataStore.$patch(gameInitInfo);

			const gameInfoStore = useGameInfo();
			gameInitInfo &&
				gameInfoStore.$patch({
					currentRound: gameInitInfo.currentRound,
					currentPlayerInRound: gameInitInfo.currentPlayerInRound,
					currentMultiplier: gameInitInfo.currentMultiplier,
				});

			router.replace({ name: "game" });
		} else {
			FPMessage({ type: "error", message: "获取地图初始数据失败" });
		}
	}

	private handleGameInitFinished() {
		useLoading().hideLoading();
	}

	private handleGameInfo(data: SocketMessage) {
		if (data.data == "error") return;
		const gameInfoStore = useGameInfo();
		const gameInfo: GameInfo = data.data;
		gameInfo &&
			gameInfoStore.$patch({
				currentPlayerInRound: gameInfo.currentPlayerInRound,
				currentRound: gameInfo.currentRound,
				currentMultiplier: gameInfo.currentMultiplier,
				playersList: gameInfo.playerList,
				propertiesList: gameInfo.properties,
			});
	}

	private handleRemainingTime(data: SocketMessage) {
		const remainingTime = data.data;
		const utilStore = useUtil();
		utilStore.remainingTime = remainingTime;
		utilStore.timeOut = remainingTime <= 0;
		if (remainingTime <= 0) {
			utilStore.canRoll = false;
		}
	}

	private handleRoundTurn() {
		const utilStore = useUtil();
		utilStore.canRoll = true;
		useEventBus().emit("RoundTurn");
	}

	private handleRollDiceAnimationPlay() {
		const utilStore = useUtil();
		utilStore.isRollDiceAnimationPlay = true;
	}

	private handleRollDiceResult(data: SocketMessage) {
		const rollDiceResult: number[] = data.data.rollDiceResult;

		const utilStore = useUtil();
		utilStore.rollDiceResult = rollDiceResult;
		utilStore.isRollDiceAnimationPlay = false;
	}

	private handleUsedChanceCard(data: SocketMessage) {
		const { userId, chanceCardId } = data.data as { userId: string; chanceCardId: string };
	}

	private handlePlayerWalk(data: SocketMessage) {
		const { playerId, step } = data.data as { playerId: string; step: number };
		useEventBus().emit("player-walk", playerId, step);
	}

	private handlePlayerTp(data: SocketMessage) {
		const { playerId, positionIndex } = data.data as { playerId: string; positionIndex: number };
		useEventBus().emit("player-tp", playerId, positionIndex);
	}

	private handleBuyProperty(data: SocketMessage) {
		const property: PropertyInfo = data.data;

		const vnode = createVNode(PropertyInfoVue, { property });

		FPMessageBox({
			title: "购买地皮",
			content: vnode,
			cancelText: "不买",
			confirmText: "买！",
		})
			.then(() => {
				this.sendMsg(SocketMsgType.BuyProperty, OperateType.BuyProperty, undefined, true);
			})
			.catch(() => {
				this.sendMsg(SocketMsgType.BuyProperty, OperateType.BuyProperty, undefined, false);
			});
	}

	private handleBuildHouse(data: SocketMessage) {
		const property: PropertyInfo = data.data;

		const vnode = createVNode(PropertyInfoVue, { property });

		FPMessageBox({
			title: "升级房子",
			content: vnode,
			cancelText: "不升级",
			confirmText: "升级！",
		})
			.then(() => {
				this.sendMsg(SocketMsgType.BuildHouse, OperateType.BuildHouse, undefined, true);
			})
			.catch(() => {
				this.sendMsg(SocketMsgType.BuildHouse, OperateType.BuildHouse, undefined, false);
			});
	}

	private handleGameOver(data: SocketMessage) {
		const gameInfoStore = useGameInfo();
		gameInfoStore.isGameOver = true;
	}

	public sendRoomChatMessage(message: string, roomId: string) {
		this.sendMsg(SocketMsgType.RoomChat, message, roomId);
	}

	public leaveRoom() {
		this.sendMsg(SocketMsgType.LeaveRoom, "");
		const roomInfoStore = useRoomInfo();
		roomInfoStore.$reset();
		useChat().$reset();
	}

	public readyToggle() {
		this.sendMsg(SocketMsgType.ReadyToggle, "");
	}

	public changeRole(operate: ChangeRoleOperate) {
		this.sendMsg(SocketMsgType.ChangeRole, operate);
	}

	public changeGameSetting(gameSetting: GameSetting) {
		this.sendMsg(SocketMsgType.ChangeGameSetting, gameSetting);
	}

	public startGame() {
		this.sendMsg(SocketMsgType.GameStart, "");
	}

	public gameInitFinished() {
		this.sendMsg(SocketMsgType.GameInitFinished, "");
	}

	public rollDice() {
		this.sendMsg(SocketMsgType.RollDiceResult, OperateType.RollDice);
		const utilStore = useUtil();
		utilStore.canRoll = false;
	}

	public useChanceCard(cardId: string, target?: string | string[]) {
		this.sendMsg(SocketMsgType.UseChanceCard, cardId, undefined, target);
	}

	public AnimationComplete() {
		this.sendMsg(SocketMsgType.Animation, OperateType.Animation);
	}

	public disConnect() {
		this.conn && this.conn.close();
	}

	private sendMsg(type: SocketMsgType, data: any, roomId: string = useRoomInfo().roomId, extra: any = undefined) {
		const userInfo = useUserInfo();
		const msgToSend: SocketMessage = {
			type,
			source: userInfo.userId,
			roomId,
			data,
			extra,
		};
		this.conn && this.conn.send(JSON.stringify(msgToSend));
	}
}

function useMonopolyClient(): MonopolyClient;
function useMonopolyClient(options: MonopolyClientOptions): Promise<MonopolyClient>;
function useMonopolyClient(options?: MonopolyClientOptions) {
	return options ? MonopolyClient.getInstance(options) : MonopolyClient.getInstance();
}

export default useMonopolyClient;
