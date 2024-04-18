import PropertyInfoVue from "@/components/common/property-info.vue";
import { FPMessageBox } from "@/components/utils/fp-message-box";
import { log } from "console";
import { Store } from "pinia";
import { createVNode } from "vue";
import FPMessage from "@/components/utils/fp-message/index";
import { ChangeRoleOperate, SocketMsgType } from "@/enums/bace";
import { OperateType } from "@/enums/game";
import {
	GameInfo,
	GameInitInfo,
	PropertyInfo,
	Room,
	SocketMessage,
	User,
	GameSetting,
	ChatMessage,
	RoomInfo,
} from "@/interfaces/bace";
import router from "@/router";
import {
	useChat,
	useGameInfo,
	useLoading,
	useMapData,
	usePlayerWalkAnimation,
	useRoomInfo,
	useRoomList,
	useUserInfo,
	useUserList,
	useUtil,
} from "@/store/index";
import {randomString} from "@/utils";
import {FATPAPER_HOST, MONOPOLY_SOCKET_PORT} from "../../../../global.config";

interface UserInfo {
	username: string;
	useraccount: string;
	userId: string;
	avatar: string;
	color: string;
}

export class GameSocketClient {
	private socketClient: WebSocket;
	private static instance: GameSocketClient | null;

	static getInstance(token?: string): GameSocketClient {
		if (!this.instance) {
			if (token) {
				this.instance = new GameSocketClient(token);
			} else {
				throw Error("必须在首次使用GameSocketClient时提供token");
			}
		}
		return <GameSocketClient>this.instance;
	}

	constructor(token: string) {
		this.socketClient = new WebSocket(`ws://${FATPAPER_HOST}:${MONOPOLY_SOCKET_PORT}`);
		this.socketClient.onclose = () => {};
		this.socketClient.onopen = () => {
			console.log("客户端socket开启连接成功");
			this.sendMsg(SocketMsgType.ConfirmIdentity, JSON.stringify({ token }));
			this.socketClient.onmessage = (e) => {
				const data: SocketMessage = JSON.parse(e.data);
				if (data.msg) {
					FPMessage({ type: data.msg.type as "info" | "success" | "warning" | "error", message: data.msg.content });
				}

				switch (data.type) {
					case SocketMsgType.Heart:
						this.handleHeart(data);
						break;
					case SocketMsgType.ConfirmIdentity:
						this.handleConfirmIdentity(data.data);
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
					case SocketMsgType.GameInfo:
						this.handleGameInfo(data);
						break;
					case SocketMsgType.RemainingTime:
						this.handleRemainingTime(data);
						break;
					case SocketMsgType.RoundTurn:
						this.handleRoundTurn(data);
						break;
					case SocketMsgType.RollDiceStart:
						this.handleRollDiceAnimationPlay();
						break;
					case SocketMsgType.RollDiceResult:
						this.handleRollDiceResult(data);
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
			};
		};
	}

	private handleHeart(data: SocketMessage) {
		const gameInfoStore = useGameInfo();

		gameInfoStore.ping = Date.now() - data.data;
	}

	private handleConfirmIdentity(userDataRes: UserInfo) {
		if (!userDataRes) {
			localStorage.removeItem("token");
			router.replace({ name: "login" });
		}
	}

	private handleUserListReply(data: User[]) {
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

	private handleGameInfo(data: SocketMessage) {
		if (data.data == "error") return;
		const gameInfoStore = useGameInfo();
		const gameInfo: GameInfo = data.data;
		console.log(gameInfo)
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

	private handleRoundTurn(data: SocketMessage) {
		const utilStore = useUtil();
		utilStore.canRoll = true;
	}

	private handleRollDiceAnimationPlay() {
		const utilStore = useUtil();
		utilStore.isRollDiceAnimationPlay = true;
	}

	private handleRollDiceResult(data: SocketMessage) {
		const rollDicePlayerId: string = data.data.rollDicePlayerId;
		const rollDiceResult: number[] = data.data.rollDiceResult;
		const rollDiveCount: number = data.data.rollDiveCount;

		const playerWalkStore = usePlayerWalkAnimation();
		playerWalkStore.updatePlayWalk(rollDicePlayerId, rollDiveCount);

		const utilStore = useUtil();
		utilStore.rollDiceResult = rollDiceResult;
		utilStore.isRollDiceAnimationPlay = false;
	}

	private handleBuyProperty(data: SocketMessage) {
		const property: PropertyInfo = data.data;

		const vnode = createVNode(PropertyInfoVue, { property });

		FPMessageBox({
			title: "购买地皮",
			content: vnode,
			cancleText: "不买",
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
			cancleText: "不升级",
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

	public joinRoom(roomId: string) {
		this.sendMsg(SocketMsgType.JoinRoom, "", roomId);
		useLoading().$patch({loading: true, text: "正在尝试进入房间"})
	}

	public leaveRoom() {
		useLoading().$patch({loading: true, text: "正在离开房间"})
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
		this.socketClient.close();
		GameSocketClient.instance = null;
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
		this.socketClient.send(JSON.stringify(msgToSend));
	}
}
