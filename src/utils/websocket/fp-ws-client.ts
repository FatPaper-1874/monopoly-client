import PropertyInfoVue from "@/components/common/property-info.vue";
import { FPMessageBox } from "@/components/utils/fp-message-box";
import { Store } from "pinia";
import { createVNode } from "vue";
import FPMessage from "../../components/utils/fp-message/index";
import { ChangeRoleOperate, SocketMsgType } from "../../enums/bace";
import { OperateType } from "../../enums/game";
import { GameInfo, GameInitInfo, PropertyInfo, Room, SocketMessage, User, GameSetting } from "../../interfaces/bace";
import router from "../../router";
import {
	useGameInfo,
	useLoading,
	useMapData,
	usePlayerWalk,
	useRoomInfo,
	useRoomList,
	useUserInfo,
	useUserList,
	useUtil,
} from "../../store/index";

interface UserInfo {
	username: string;
	userId: string;
	avatar: string;
	color: string;
}

export class GameSocketClient {
	private socketClient: WebSocket;
	private static instance: GameSocketClient | null;
	private roomInfoStore = useRoomInfo();

	static getInstance(user?: UserInfo): GameSocketClient {
		if (!this.instance) {
			if (user) {
				this.instance = new GameSocketClient(user);
			} else {
				throw Error("必须在首次使用GameSocketClient时提供user信息");
			}
		}
		return <GameSocketClient>this.instance;
	}

	constructor(user: UserInfo) {
		this.socketClient = new WebSocket("ws://127.0.0.1:8001");
		this.socketClient.onclose = () => {};
		this.socketClient.onopen = () => {
			console.log("客户端socket开启连接成功");
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
					case SocketMsgType.RemainingTime:
						this.handleRemainingTime(data);
						break;
					case SocketMsgType.RoundTurn:
						this.handleRoundTurn(data);
						break;
					case SocketMsgType.RollDice:
						this.handleRollDice(data);
						break;
					case SocketMsgType.BuyProperty:
						this.handleBuyProperty(data);
						break;
					case SocketMsgType.BuildHouse:
						this.handleBuildHouse(data);
						break;
					default:
						break;
				}
			};
		};
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
		const roomInfoData = data.data;
		if (roomInfoData) {
			this.roomInfoStore.roomId = roomInfoData.roomId;
			this.roomInfoStore.ownerId = roomInfoData.ownerId;
			this.roomInfoStore.ownerName = roomInfoData.ownerName;
			this.roomInfoStore.userList = roomInfoData.userList;
			this.roomInfoStore.roleList = roomInfoData.roleList;
			this.roomInfoStore.gameSetting = roomInfoData.gameSetting;
		}
	}

	private handleGameStart(data: SocketMessage) {
		const loadingStore = useLoading();
		loadingStore.loading = true;
	}

	private handleGameInit(data: SocketMessage) {
		if (data.data) {
			const loadingStore = useLoading();
			loadingStore.text = "获取数据成功，加载中...";

			const gameInitInfo: GameInitInfo = data.data;

			const mapDataStore = useMapData();
			mapDataStore.$patch(gameInitInfo);

			const gameInfoStore = useGameInfo();
			gameInfoStore.currentRound = gameInitInfo.currentRound;
			gameInfoStore.currentPlayerInRound = gameInitInfo.currentPlayerInRound;
			gameInfoStore.currentMultiplier = gameInitInfo.currentMultiplier;

			router.replace({ name: "game" });
		} else {
			FPMessage({ type: "error", message: "获取地图初始数据失败" });
		}
	}

	private handleGameInfo(data: SocketMessage) {
		if (data.data == "error") return;

		const gameInfoStore = useGameInfo();
		const gameInfo: GameInfo = data.data;
		try {
			gameInfoStore.currentPlayerInRound = gameInfo.currentPlayerInRound;
			gameInfoStore.currentRound = gameInfo.currentRound;
			gameInfoStore.currentMultiplier = gameInfo.currentMultiplier;
			gameInfoStore.playersList = gameInfo.playerList;
			gameInfoStore.propertiesList = gameInfo.properties;
		} catch {}
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
		const gameInfoStore = useGameInfo();
		gameInfoStore.isMyTurn = true;
		const utilStore = useUtil();
		utilStore.canRoll = true;
	}

	private handleRollDice(data: SocketMessage) {
		const rollDicePlayerId: string = data.data.rollDicePlayerId;
		const rollDiceResult: number[] = data.data.rollDiceResult;
		const rollDiveCount: number = data.data.rollDiveCount;

		const playerWalkStore = usePlayerWalk();
		playerWalkStore.updatePlayWalk(rollDicePlayerId, rollDiveCount);

		const utilStore = useUtil();
		utilStore.rollDiceResult = rollDiceResult;
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

	private sendMsg(type: SocketMsgType, data: any, roomId: string = this.roomInfoStore.roomId, extra: any = undefined) {
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

	public joinRoom(roomId: string) {
		this.sendMsg(SocketMsgType.JoinRoom, "", roomId);
	}

	public leaveRoom() {
		this.sendMsg(SocketMsgType.LeaveRoom, "");
		this.roomInfoStore.$reset();
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
		this.sendMsg(SocketMsgType.RollDice, OperateType.RollDice);
		const gameInfoStore = useGameInfo();
		gameInfoStore.isMyTurn = false;
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
}
