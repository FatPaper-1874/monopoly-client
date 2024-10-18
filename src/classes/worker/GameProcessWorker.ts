import { ChanceCard as ChanceCardFromDB, GameInfo, GameInitInfo, GameMap, MapItem } from "@/interfaces/game";
import { Player } from "./class/Player";
import { Property } from "./class/Property";
import { User, UserInRoomInfo, GameSetting, SocketMessage, GameLog } from "@/interfaces/bace";
import { compileTsToJs, getRandomInteger, randomString } from "@/utils";
import { ChanceCardType, GameLinkItem, GameOverRule, OperateType } from "@/enums/game";
import { ChanceCard } from "./class/ChanceCard";
import { PlayerEvents } from "./enums/game";
import { SocketMsgType } from "@/enums/bace";
import Dice from "./class/Dice";
import { OperateListener } from "./class/OperateListener";
import { WorkerCommMsg } from "@/interfaces/worker";
import { WorkerCommType } from "@/enums/worker";
import { RoundTimeTimer } from "./class/RoundTimeTimer";

import ChanceCardNeedTypes from "./base-interface.d.ts?raw";
import Utils from "./class/Utils?raw";

const chanceCardTyps = [ChanceCardNeedTypes, Utils].join("\n");
const operateListener = new OperateListener();
let gameProcess: GameProcess | null = null;

self.postMessage(<WorkerCommMsg>{
	type: WorkerCommType.WorkerReady,
});

self.addEventListener("message", (ev) => {
	const data: WorkerCommMsg = ev.data;
	switch (data.type) {
		case WorkerCommType.LoadGameInfo:
			{
				const { mapInfo, setting, userList } = data.data;
				gameProcess = new GameProcess(mapInfo, setting, userList);
				gameProcess.start();
			}
			break;
		case WorkerCommType.EmitOperation:
			{
				const { userId, operateType, data: _data } = data.data;
				operateListener.emit(userId, operateType, _data);
			}
			break;
		case WorkerCommType.UserOffLine:
			{
				const { userId } = data.data;
				gameProcess && gameProcess.handlePlayerOffline(userId);
			}
			break;
		case WorkerCommType.UserReconnect:
			{
				const { userId } = data.data;
				gameProcess && gameProcess.handlePlayerReconnect(userId);
			}
			break;
	}
});

function sendToUsers(userIdList: string[], msg: SocketMessage) {
	self.postMessage(<WorkerCommMsg>{
		type: WorkerCommType.SendToUsers,
		data: {
			userIdList,
			data: msg,
		},
	});
}

(async () => {})();

export class GameProcess {
	private mapInfo: GameMap;
	private gameSetting: GameSetting;
	private playerList: Player[] = [];
	private propertyList: Map<string, Property> = new Map();
	private chanceCardInfoList: ChanceCardFromDB[] = [];
	private mapItemList: Map<string, MapItem> = new Map();
	private startTime: number = Date.now();

	//Dynamic Data
	private isGameOver: boolean = false;
	private currentPlayerInRound: Player | null = null;
	private currentRound: number = 0; //当前回合
	private currentMultiplier: number = 1; //当前过路费倍数
	private timeoutList: any[] = []; //计时器列表
	private intervalTimerList: any[] = []; //计时器列表
	private roundTimeTimer: RoundTimeTimer; //倒计时
	private eventMsg: string = ""; //等待事件的信息

	private gameLogList: GameLog[] = [];

	//Setting
	private animationStepDuration_ms: number = 600;

	//Utils
	private dice: Dice;

	constructor(mapInfo: GameMap, gameSetting: GameSetting, users: UserInRoomInfo[]) {
		this.mapInfo = mapInfo;
		this.gameSetting = gameSetting;
		this.dice = new Dice(gameSetting.diceNum);
		this.roundTimeTimer = new RoundTimeTimer(gameSetting.roundTime, 1000);

		this.loadGameMap(mapInfo);
		this.initPlayer(users);
	}

	public async start() {
		this.gameInfoBroadcast();
		this.gameInitBroadcast();

		await this.waitInitFinished();
		await this.gameLoop();
		console.log("游戏结束");
	}

	private loadGameMap(mapInfo: GameMap) {
		const { mapItems, properties, chanceCards } = mapInfo;

		mapItems.forEach((item) => {
			this.mapItemList.set(item.id, item);
		});

		properties.forEach((property) => {
			this.propertyList.set(property.id, new Property(property));
		});

		chanceCards.map((chanceCard) => {
			chanceCard.effectCode = compileTsToJs(chanceCard.effectCode, chanceCardTyps);
			return chanceCard;
		});

		this.chanceCardInfoList = chanceCards;
	}

	private initPlayer(users: UserInRoomInfo[]) {
		this.playerList = users.map((user) => {
			const player = new Player(
				user,
				this.gameSetting.initMoney,
				getRandomInteger(0, this.mapInfo.indexList.length - 1)
			);

			player.setCardsList(this.getRandomChanceCard(4));

			//如果使用player.cost()函数附带target参数, 会触发客户端的金钱转移动画
			player.addEventListener(PlayerEvents.AfterCost, (money, target) => {
				const msg: SocketMessage = {
					type: SocketMsgType.CostMoney,
					source: "server",
					data: {
						player: player.getPlayerInfo(),
						money: parseInt(money + ""),
						target: target ? target.getPlayerInfo() : undefined,
					},
				};
				this.gameBroadcast(msg);
				return;
			});

			//如果使用player.gain()函数附带source参数, 会触发客户端的金钱转移动画
			player.addEventListener(PlayerEvents.AfterGain, (money, source) => {
				const msg: SocketMessage = {
					type: SocketMsgType.GainMoney,
					source: "server",
					data: {
						player: player.getPlayerInfo(),
						money: parseInt(money + ""),
						source: source ? source.getPlayerInfo() : undefined,
					},
				};
				this.gameBroadcast(msg);
				return;
			});

			player.addEventListener(PlayerEvents.AfterSetMoney, () => {
				this.gameOverCheck();
			});

			player.addEventListener(PlayerEvents.AfterCost, () => {
				this.gameOverCheck();
			});

			player.addEventListener(PlayerEvents.Walk, async (step: number) => {
				const walkId = randomString(16);
				const msg: SocketMessage = {
					type: SocketMsgType.PlayerWalk,
					source: "server",
					data: { playerId: player.getId(), step, walkId },
				};
				const sourceIndex = player.getPositionIndex();
				const total = this.mapInfo.indexList.length;
				const newIndex = (((sourceIndex + step) % total) + total) % total;
				player.setPositionIndex(newIndex);
				this.gameInfoBroadcast();
				this.gameBroadcast(msg);

				//在计划的动画完成事件后取消监听, 防止客户端因特殊情况没有发送动画完成的指令造成永久等待
				const animationDuration = this.animationStepDuration_ms * (Math.abs(step) + 3);
				let animationTimer = setTimeout(() => {
					operateListener.emit(player.getId(), OperateType.Animation + walkId);
				}, animationDuration);
				await operateListener.onceAsync(player.getId(), OperateType.Animation + walkId, () => {
					clearTimeout(animationTimer);
				});
				player.emit(PlayerEvents.AnimationFinished);
				return step;
			});

			player.addEventListener(PlayerEvents.Tp, async (positionIndex: number) => {
				const msg: SocketMessage = {
					type: SocketMsgType.PlayerTp,
					source: "server",
					data: { playerId: player.getId(), positionIndex },
				};
				player.setPositionIndex(positionIndex);
				this.gameInfoBroadcast();
				this.gameBroadcast(msg);

				//在计划的动画完成事件后取消监听, 防止客户端因特殊情况没有发送动画完成的指令造成永久等待
				const animationDuration = this.animationStepDuration_ms * (this.dice.getResultNumber() + 5);
				let animationTimer = setTimeout(() => {
					operateListener.emit(player.getId(), OperateType.Animation);
				}, animationDuration);
				await operateListener.onceAsync(player.getId(), OperateType.Animation, () => {
					clearTimeout(animationTimer);
				});
				player.emit(PlayerEvents.AnimationFinished);
				return positionIndex;
			});

			// player.addEventListener(PlayerEvents.AfterGainCard, (num: number) => {
			// 	const cardsList = player.getCardsList();
			// 	const addCardsList = this.getRandomChanceCard(num);
			// 	player.setCardsList(cardsList.concat(addCardsList));
			// });

			player.addEventListener(PlayerEvents.AfterSetBankrupted, (isBankrupted: boolean) => {
				if (isBankrupted) {
					//破产剥夺财产
					Array.from(this.propertyList.values()).map((property) => {
						const owner = property.getOwner();
						if (owner && owner.getId() === player.getId()) {
							property.setOwner(undefined);
						}
					});
					player.setCardsList([]);
					this.gameOverCheck();
					if (this.currentPlayerInRound === player) {
						operateListener.removeAll(player.getId());
						player.removeAllListeners();
					}
				}
			});
			return player;
		});

		this.currentPlayerInRound = this.playerList[0];
	}

	private getRandomChanceCard(num: number): ChanceCard[] {
		let tempChanceCardList: ChanceCard[] = [];
		for (let i = 0; i < num; i++) {
			const getIndex = Math.floor(Math.random() * this.chanceCardInfoList.length);
			const card = this.chanceCardInfoList[getIndex];
			if (card) tempChanceCardList.push(new ChanceCard(card));
		}
		return tempChanceCardList;
	}

	private gameOverCheck() {
		const gameOverRule = this.gameSetting.gameOverRule;
		switch (gameOverRule) {
			case GameOverRule.Earn100000:
				if (
					this.playerList.some((player) => player.getMoney() >= 100000) ||
					(this.playerList.length === 1 && this.playerList.every((p) => p.getIsBankrupted())) || //一个人游戏
					(this.playerList.length > 1 && this.playerList.filter((player) => !player.getIsBankrupted()).length <= 1)
				)
					this.gameOver();
				break;
		}
	}

	public gameInitBroadcast() {
		const {
			id: mapId,
			name: mapName,
			background: mapBackground,
			indexList: mapIndexList,
			itemTypes: itemTypesList,
			streets: streetsList,
			houseModel_lv0: lv0,
			houseModel_lv1: lv1,
			houseModel_lv2: lv2,
		} = this.mapInfo;
		const gameInitInfo: GameInitInfo = {
			mapId: mapId,
			mapName: mapName,
			mapBackground: mapBackground,
			mapItemsList: Array.from(this.mapItemList.values()),
			mapIndexList: mapIndexList,
			itemTypesList: itemTypesList,
			streetsList: streetsList,
			playerList: this.playerList.map((player) => player.getPlayerInfo()),
			properties: Array.from(this.propertyList.values()).map((property) => property.getPropertyInfo()),
			chanceCards: this.chanceCardInfoList,
			currentPlayerInRound: this.currentPlayerInRound ? this.currentPlayerInRound.getId() : "",
			currentRound: this.currentRound,
			currentMultiplier: this.currentMultiplier,
			houseModels: { lv0, lv1, lv2 },
		};

		this.gameBroadcast({
			type: SocketMsgType.GameInit,
			source: "server",
			data: gameInitInfo,
		});
	}

	public gameInfoBroadcast() {
		const gameInfo: GameInfo = {
			currentPlayerInRound: this.currentPlayerInRound ? this.currentPlayerInRound.getId() : "",
			currentRound: this.currentRound,
			currentMultiplier: this.currentMultiplier,
			playerList: this.playerList.map((player) => player.getPlayerInfo()),
			properties: Array.from(this.propertyList.values()).map((property) => property.getPropertyInfo()),
		};
		this.gameBroadcast({
			type: SocketMsgType.GameInfo,
			source: "server",
			data: gameInfo,
		});
	}

	//等待全部玩家加载完成
	private async waitInitFinished() {
		const promiseArr: Promise<any>[] = [];
		this.playerList.forEach((player) => {
			promiseArr.push(operateListener.onceAsync(player.getId(), OperateType.GameInitFinished, () => {}));
		});
		await Promise.all(promiseArr);

		this.gameBroadcast({ type: SocketMsgType.GameInitFinished, data: "", source: "server" });
	}

	private async gameLoop() {
		this.roundTimeTimer.setIntervalFunction(this.roundRemainingTimeBroadcast);
		while (!this.isGameOver) {
			let currentPlayerIndex = 0;
			while (currentPlayerIndex < this.playerList.length) {
				this.gameInfoBroadcast();
				const currentPlayer = this.playerList[currentPlayerIndex];
				if (currentPlayer.getIsBankrupted()) {
					currentPlayerIndex++;
					continue;
				}

				if (currentPlayer.getStop() > 0) {
					this.gameMsgNotifyBroadcast("info", `${currentPlayer.getName()}睡着了,跳过回合`);
					this.gameLogBroadcast(
						`${this.createGameLinkItem(GameLinkItem.Player, currentPlayer.getId())}睡着了,跳过回合`
					);
					currentPlayer.setStop(currentPlayer.getStop() - 1);
					currentPlayerIndex++;
					continue;
				}
				this.currentPlayerInRound = this.playerList[currentPlayerIndex];
				this.roundTurnNotify(this.currentPlayerInRound);
				this.gameInfoBroadcast();

				await this.gameRound(this.currentPlayerInRound);
				currentPlayerIndex++;
			}
			this.nextRound();
		}
		this.roundTimeTimer.clearInterval();
	}

	private async gameRound(currentPlayer: Player) {
		await currentPlayer.emit(PlayerEvents.BeforeRound, currentPlayer);
		this.gameInfoBroadcast();
		this.roundTimeTimer.setTimeOutFunction(null); //开始倒计时
		this.useChanceCardListener(currentPlayer);
		await this.waitRollDice(currentPlayer); //监听投骰子
		await this.handleArriveEvent(currentPlayer); //处理玩家到达某个格子的事件
		await currentPlayer.emit(PlayerEvents.AfterRound, currentPlayer);
	}

	private async useChanceCardListener(sourcePlayer: Player) {
		const userId = sourcePlayer.getId();
		const roundTime = this.gameSetting.roundTime;

		await new Promise(async (resolve, reject) => {
			let isRoundEnd = false;

			const handleRollDice = () => {
				isRoundEnd = true;
				operateListener.removeAll(userId, OperateType.UseChanceCard); //取消监听器
				this.roundTimeTimer.stop();
				resolve("RollDice");
			};

			const handleUseChanceCardTimeOut = () => {
				isRoundEnd = true;
				operateListener.remove(userId, OperateType.RollDice, handleRollDice);
				operateListener.removeAll(userId, OperateType.UseChanceCard);
				operateListener.emit(userId, OperateType.RollDice); //帮玩家自动投骰子
			};

			//超时自动投骰子

			//摇骰子就取消监听机会卡的使用
			operateListener.once(userId, OperateType.RollDice, handleRollDice);

			while (!isRoundEnd) {
				//监听使用机会卡事件并且处理事件
				this.eventMsg = `等待 ${sourcePlayer.getName()} 执行回合`;
				this.roundTimeTimer.setTimeOutFunction(handleUseChanceCardTimeOut);
				await operateListener.onceAsync(userId, OperateType.UseChanceCard, async (resultArr: any) => {
					this.roundTimeTimer.stop();
					const [chanceCardId, targetIdList = new Array<string>()] = resultArr;
					const chanceCard = sourcePlayer.getCardById(chanceCardId);
					if (chanceCard) {
						let error = ""; //收集错误信息
						try {
							switch (
								chanceCard.getType() //根据机会卡的类型执行不同操作
							) {
								case ChanceCardType.ToSelf:
									await chanceCard.use(sourcePlayer, sourcePlayer, this); //直接使用
									this.gameMsgNotifyBroadcast(
										"info",
										`${sourcePlayer.getName()} 对自己使用了机会卡: "${chanceCard.getName()}"`
									);
									this.gameLogBroadcast(
										`${this.createGameLinkItem(
											GameLinkItem.Player,
											sourcePlayer.getId()
										)} 对自己使用了机会卡: ${this.createGameLinkItem(
											GameLinkItem.ChanceCard,
											chanceCard.getSourceId()
										)}`
									);
									break;
								case ChanceCardType.ToOtherPlayer:
								case ChanceCardType.ToPlayer:
									const _targetPlayer = this.playerList.find((player) => player.getId() === targetIdList[0]); //获取目标玩家对象
									if (!_targetPlayer) {
										error = "目标玩家不存在";
										break;
									}
									await chanceCard.use(sourcePlayer, _targetPlayer, this);
									this.gameMsgNotifyBroadcast(
										"info",
										`${sourcePlayer.getName()} 对玩家 ${_targetPlayer.getName()} 使用了机会卡: "${chanceCard.getName()}"`
									);
									this.gameLogBroadcast(
										`${this.createGameLinkItem(
											GameLinkItem.Player,
											sourcePlayer.getId()
										)} 对玩家 ${this.createGameLinkItem(
											GameLinkItem.Player,
											_targetPlayer.getId()
										)} 使用了机会卡: ${this.createGameLinkItem(GameLinkItem.ChanceCard, chanceCard.getSourceId())}`
									);
									break;
								case ChanceCardType.ToProperty:
									const _targetProperty = this.propertyList.get(targetIdList[0]);
									if (!_targetProperty) {
										error = "目标建筑/地皮不存在";
										break;
									}
									await chanceCard.use(sourcePlayer, _targetProperty, this);
									this.gameMsgNotifyBroadcast(
										"info",
										`${sourcePlayer.getName()} 对地皮 ${_targetProperty.getName()} 使用了机会卡: "${chanceCard.getName()}"`
									);
									this.gameLogBroadcast(
										`${this.createGameLinkItem(
											GameLinkItem.Player,
											sourcePlayer.getId()
										)} 对地皮 ${this.createGameLinkItem(
											GameLinkItem.Property,
											_targetProperty.getId()
										)} 使用了机会卡: ${this.createGameLinkItem(GameLinkItem.ChanceCard, chanceCard.getSourceId())}`
									);
									break;
								case ChanceCardType.ToMapItem:
									const _targetIdList = targetIdList as string[];
									const _targetPlayerList: Player[] = [];
									_targetIdList.forEach((id) => {
										//获取目标玩家列表
										const _tempPlayer = this.playerList.find((player) => player.getId() === id);
										if (_tempPlayer) {
											_targetPlayerList.push(_tempPlayer);
										}
									});
									if (_targetPlayerList.length === 0) {
										error = "选中的玩家不存在";
										break;
									}
									await chanceCard.use(sourcePlayer, _targetPlayerList, this);
									break;
							}
						} catch (e: any) {
							error = e.message;
						}
						if (error) {
							const errorMsg: SocketMessage = {
								type: SocketMsgType.MsgNotify,
								data: "",
								source: "server",
								msg: {
									type: "error",
									content: error,
								},
							};
							sendToUsers([sourcePlayer.getId()], errorMsg);
							const callBackMsg: SocketMessage = {
								type: SocketMsgType.UseChanceCard,
								data: "error",
								source: "server",
							};
							sendToUsers([sourcePlayer.getId()], callBackMsg);
						} else {
							sourcePlayer.loseCard(chanceCardId);
							const successMsg: SocketMessage = {
								type: SocketMsgType.MsgNotify,
								data: "",
								source: "server",
								msg: {
									type: "success",
									content: `机会卡 ${chanceCard.getName()} 使用成功！`,
								},
							};
							isRoundEnd = true;

							this.eventMsg = `等待 ${sourcePlayer.getName()} 掷骰子`;
							this.roundTimeTimer.setTimeOutFunction(handleUseChanceCardTimeOut);
							sendToUsers([sourcePlayer.getId()], successMsg);
							const callBackMsg: SocketMessage = {
								type: SocketMsgType.UseChanceCard,
								data: "",
								source: "server",
							};
							sendToUsers([sourcePlayer.getId()], callBackMsg);
						}

						this.gameInfoBroadcast();
					} else {
						const errorMsg: SocketMessage = {
							type: SocketMsgType.MsgNotify,
							data: "",
							source: "server",
							msg: {
								type: "error",
								content: "机会卡使用失败: 未知的机会卡ID",
							},
						};
						sendToUsers([sourcePlayer.getId()], errorMsg);
					}
				});
			}
		});
	}

	private async waitRollDice(player: Player) {
		const userId = player.getId();
		//等待客户端点击回馈或者破产
		await new Promise((resolve, reject) => {
			//正常情况: 等待客户端点击回馈
			operateListener.onceAsync(userId, OperateType.RollDice, resolve);

			//中道崩殂就跳过回合
			player.addEventListener(PlayerEvents.AfterSetBankrupted, (isBankrupted) => {
				if (isBankrupted) {
					reject("bankrupted");
				}
			});
		})
			.then(async () => {
				this.gameBroadcast({
					type: SocketMsgType.RollDiceStart,
					source: "server",
					data: "",
				});
				//摇骰子
				this.dice.roll();
				//让骰子摇一会 :P
				await this.sleep(1500);
				//发送信息
				const msgToRollDice: SocketMessage = {
					type: SocketMsgType.RollDiceResult,
					source: "server",
					data: {
						rollDiceResult: this.dice.getResultArray(),
						rollDiceCount: this.dice.getResultNumber(),
						rollDicePlayerId: player.getId(),
					},
					msg: {
						type: "info",
						content: `${player.getName()} 摇到的点数是: ${this.dice.getResultArray().join("-")}`,
					},
				};
				this.gameLogBroadcast(
					`${this.createGameLinkItem(GameLinkItem.Player, player.getId())}摇到的点数是: ${this.dice
						.getResultArray()
						.join("-")}`
				);
				//通知全部客户端
				this.gameBroadcast(msgToRollDice);
				//设置玩家的位置
				await player.walk(this.dice.getResultNumber());
			})
			.catch(() => {})
			.finally(() => {
				//更新游戏信息
				this.gameInfoBroadcast();
			});
	}

	private async handleArriveEvent(arrivedPlayer: Player) {
		if (arrivedPlayer.getIsBankrupted()) return;
		const playerPositionIndex = arrivedPlayer.getPositionIndex();
		const arriveItemId = this.mapInfo.indexList[playerPositionIndex];
		const arriveItem = this.mapItemList.get(arriveItemId);

		if (!arriveItem) return;
		if (arriveItem.linkto) {
			const linkMapItem = arriveItem.linkto;
			if (!linkMapItem.property) return;
			const property = this.propertyList.get(linkMapItem.property.id);
			if (!property) return;
			const arrivePropertyMsg: SocketMessage = {
				type: SocketMsgType.BuyProperty,
				source: "server",
				data: property.getPropertyInfo(),
				msg: {
					type: "",
					content: "",
				},
			};

			// let roundRemainingTime = this.gameSetting.roundTime;
			const owner = property.getOwner();
			if (owner) {
				//地皮有主人
				if (owner.getId() === arrivedPlayer.getId()) {
					//地产是自己的
					if (property.getBuildingLevel() < 2) {
						//添加定时器计算操作剩余时间
						// this.roundRemainingTimeBroadcast(roundRemainingTime);
						// intervalTimer = setInterval(() => {
						// 	this.roundRemainingTimeBroadcast(roundRemainingTime);
						// 	if (roundRemainingTime > 0) {
						// 		roundRemainingTime--;
						// 	} else {
						// 		operateListener.emit(arrivedPlayer.getId(), OperateType.BuildHouse, false);
						// 	}
						// }, 1000);
						// this.intervalTimerList.push(intervalTimer);

						this.eventMsg = `等待 ${arrivedPlayer.getName()} 升级房子`;
						this.roundTimeTimer.setTimeOutFunction(() => {
							operateListener.emit(arrivedPlayer.getId(), OperateType.BuildHouse, false);
						}); //到时间就结束操作

						//已有房产, 升级房屋
						arrivePropertyMsg.type = SocketMsgType.BuildHouse;
						arrivePropertyMsg.msg = {
							type: "success",
							content: `你到达了你的${property.getName()}，可以升级房子`,
						};
						sendToUsers([arrivedPlayer.getId()], arrivePropertyMsg);
						const playerRes = await operateListener.onceAsync(
							arrivedPlayer.getId(),
							OperateType.BuildHouse,
							(data) => data[0]
						);
						this.roundRemainingTimeBroadcast(0);
						if (playerRes) {
							this.handlePlayerBuildUp(arrivedPlayer, property);
						}
					}
				} else {
					//地产是别人的
					const ownerPlayer = this.getPlayerById(owner.getId());
					if (!ownerPlayer) return;
					const passCost = property.getPassCost() * this.currentMultiplier;
					this.handlePayToSomeOne(arrivedPlayer, ownerPlayer, passCost);
					arrivePropertyMsg.type = SocketMsgType.MsgNotify;
					arrivePropertyMsg.msg = {
						type: "error",
						content: `你到达了${owner.getName()}的地皮: ${property.getName()}，支付了${passCost}￥过路费`,
					};
					sendToUsers([arrivedPlayer.getId()], arrivePropertyMsg);
					arrivePropertyMsg.msg = {
						type: "success",
						content: `${arrivedPlayer.getName()}到达了你的地皮: ${property.getName()}，支付了${passCost}￥过路费`,
					};
					sendToUsers([ownerPlayer.getId()], arrivePropertyMsg);
					arrivePropertyMsg.msg = {
						type: "info",
						content: `${arrivedPlayer.getName()}到达了${owner.getName()}的地皮: ${property.getName()}，支付了${passCost}￥过路费`,
					};
					sendToUsers(
						this.playerList
							.filter((p) => p.getId() !== arrivedPlayer.getId() && p.getId() !== owner.getId())
							.map((p) => p.getId()),
						arrivePropertyMsg
					);
					this.gameInfoBroadcast();
					this.gameLogBroadcast(
						`${this.createGameLinkItem(GameLinkItem.Player, arrivedPlayer.getId())}到达了${this.createGameLinkItem(
							GameLinkItem.Player,
							owner.getId()
						)}的地皮: ${this.createGameLinkItem(GameLinkItem.Property, property.getId())}，支付了${passCost}￥过路费`
					);
				}
			} else {
				this.eventMsg = `等待 ${arrivedPlayer.getName()} 购买地皮`;
				this.roundTimeTimer.setTimeOutFunction(() => {
					operateListener.emit(arrivedPlayer.getId(), OperateType.BuyProperty, false);
				}); //到时间就结束操作

				//地皮没有购买
				arrivePropertyMsg.type = SocketMsgType.BuyProperty;
				arrivePropertyMsg.msg = {
					type: "success",
					content: `你到达了${property.getName()}，可以买下这块地皮`,
				};
				//空地, 买房
				sendToUsers([arrivedPlayer.getId()], arrivePropertyMsg);
				//等待客户端回应买房
				const playerRes = await operateListener.onceAsync(
					arrivedPlayer.getId(),
					OperateType.BuyProperty,
					(data) => data[0]
				);
				this.roundRemainingTimeBroadcast(0);
				if (playerRes) {
					this.handlePlayerBuyProperty(arrivedPlayer, property);
				}
			}
		} else if (arriveItem.arrivedEvent) {
			const effectCode = arriveItem.arrivedEvent.effectCode;
			if (effectCode) {
				const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
				const arrivedFunction = new AsyncFunction("arrivedPlayer", "gameProcess", effectCode);
				await arrivedFunction(arrivedPlayer, this);
			}
		}
		this.gameInfoBroadcast();
	}

	private getPlayerById(id: string) {
		return this.playerList.find((player) => player.getId() === id);
	}

	private handlePayToSomeOne(source: Player, target: Player, money: number) {
		target.gain(money, source);
		return source.cost(money, target);
	}

	private nextRound() {
		this.currentRound++;
		this.gameOverCheck();
		if (this.currentRound % this.gameSetting.multiplierIncreaseRounds === 0) {
			this.currentMultiplier += this.gameSetting.multiplier;
		}
	}

	private handlePlayerBuyProperty(player: Player, property: Property) {
		const msgToSend: SocketMessage = {
			type: SocketMsgType.MsgNotify,
			source: "server",
			data: "",
			msg: {
				type: "",
				content: "",
			},
		};
		if (player.getMoney() > property.getSellCost()) {
			if (player.cost(property.getSellCost())) {
				property.setOwner(player);
				msgToSend.msg = { type: "success", content: `购买 ${property.getName()} 成功！` };
			} else {
				msgToSend.msg = { type: "warning", content: "买完就没钱咯" };
			}
		} else {
			msgToSend.msg = { type: "error", content: "不够钱啊穷鬼" };
		}
		this.gameInfoBroadcast();
		sendToUsers([player.getId()], msgToSend);
		this.gameMsgNotifyBroadcast("info", `${player.getName()} 买下了 ${property.getName()}`);
		this.gameLogBroadcast(
			`${this.createGameLinkItem(GameLinkItem.Player, player.getId())} 买下了 ${this.createGameLinkItem(
				GameLinkItem.Property,
				property.getId()
			)}`
		);
		return;
	}

	private roundTurnNotify(player: Player) {
		const msgToSend: SocketMessage = {
			type: SocketMsgType.RoundTurn,
			source: "server",
			data: "",
			msg: {
				type: "info",
				content: "现在是你的回合啦！",
			},
		};
		sendToUsers([player.getId()], msgToSend);
		this.gameLogBroadcast(`---接下来是${this.createGameLinkItem(GameLinkItem.Player, player.getId())}的回合---`);
	}

	public roundRemainingTimeBroadcast = (remainingTime: number) => {
		const eventMsg = this.eventMsg;
		const msg: SocketMessage = {
			type: SocketMsgType.RemainingTime,
			source: "server",
			data: { eventMsg, remainingTime },
		};
		this.gameBroadcast(msg);
	};

	private handlePlayerBuildUp(player: Player, property: Property) {
		const msgToSend: SocketMessage = {
			type: SocketMsgType.MsgNotify,
			source: "server",
			data: "",
			msg: {
				type: "",
				content: "",
			},
		};
		if (player.getMoney() > property.getSellCost()) {
			if (player.cost(property.getBuildCost())) {
				property.buildUp();
				msgToSend.msg = { type: "success", content: `BuildUP ${property.getName()} 成功！` };
			} else {
				msgToSend.msg = { type: "warning", content: "升级完就没钱咯" };
			}
		} else {
			msgToSend.msg = { type: "error", content: "不够钱啊穷鬼" };
		}
		sendToUsers([player.getId()], msgToSend);
		this.gameInfoBroadcast();
		this.gameMsgNotifyBroadcast(
			"info",
			`${player.getName()}把地皮${property.getName()}升到了${property.getBuildingLevel()}级`
		);
		this.gameLogBroadcast(
			`${this.createGameLinkItem(GameLinkItem.Player, player.getId())}把地皮${this.createGameLinkItem(
				GameLinkItem.Property,
				property.getId()
			)}升到了${property.getBuildingLevel()}级`
		);
		return;
	}

	public handlePlayerOffline(userId: string) {
		const player = this.getPlayerById(userId);
		if (player) {
			player.setIsOffline(true);
			this.gameInfoBroadcast();
		}
	}

	public handlePlayerReconnect(userId: string) {
		const player = this.playerList.find((player) => {
			return player.getUser().userId === userId;
		});
		if (player) {
			player.setIsOffline(false);
			const {
				id: mapId,
				name: mapName,
				background: mapBackground,
				indexList: mapIndexList,
				itemTypes: itemTypesList,
				streets: streetsList,
				houseModel_lv0: lv0,
				houseModel_lv1: lv1,
				houseModel_lv2: lv2,
			} = this.mapInfo;
			const gameInitInfo: GameInitInfo = {
				mapId: mapId,
				mapName: mapName,
				mapBackground: mapBackground,
				mapItemsList: Array.from(this.mapItemList.values()),
				mapIndexList: mapIndexList,
				itemTypesList: itemTypesList,
				streetsList: streetsList,
				playerList: this.playerList.map((player) => player.getPlayerInfo()),
				properties: Array.from(this.propertyList.values()).map((property) => property.getPropertyInfo()),
				chanceCards: this.chanceCardInfoList,
				currentPlayerInRound: this.currentPlayerInRound ? this.currentPlayerInRound.getId() : "",
				currentRound: this.currentRound,
				currentMultiplier: this.currentMultiplier,
				houseModels: { lv0, lv1, lv2 },
			};
			sendToUsers([userId], <SocketMessage>{
				type: SocketMsgType.GameInit,
				source: "server",
				data: gameInitInfo,
			});
			operateListener.once(userId, OperateType.GameInitFinished, () => {
				sendToUsers([userId], <SocketMessage>{
					type: SocketMsgType.GameInitFinished,
					data: "",
					source: "server",
				});
			});
			this.gameInfoBroadcast();
		} else {
			console.log("奇怪的玩家 in game");
		}
	}

	private sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	private gameOver() {
		this.gameInfoBroadcast();
		this.gameBroadcast({
			type: SocketMsgType.GameOver,
			source: "server",
			data: "游戏结束",
			msg: { content: "游戏结束", type: "info" },
		});
		self.postMessage(<WorkerCommMsg>{
			type: WorkerCommType.GameOver,
		});
		this.isGameOver = true;
		this.destroy();
	}

	public gameMsgNotifyBroadcast(type: "success" | "warning" | "error" | "info", msg: string) {
		this.gameBroadcast({
			type: SocketMsgType.MsgNotify,
			data: "",
			msg: { type, content: msg },
			source: "server",
		});
	}

	public gameLogBroadcast(log: string) {
		const gameLog: GameLog = { time: Date.now() - this.startTime, content: log };
		this.gameLogList.push(gameLog);
		this.gameBroadcast({
			type: SocketMsgType.GameLog,
			data: gameLog,
			source: "server",
		});
	}

	public getGameLog() {
		return this.gameLogList;
	}

	public gameBroadcast(msg: SocketMessage) {
		sendToUsers(
			this.playerList.map((u) => u.getId()),
			msg
		);
	}

	public createGameLinkItem(type: GameLinkItem, id: string) {
		return `@-#${type}#-#${id}#`;
	}

	public destroy() {
		this.isGameOver = true;
		this.playerList.forEach((p) => {
			operateListener.removeAll(p.getId());
		});
		this.intervalTimerList.forEach((id) => {
			clearInterval(id);
		});
		this.timeoutList.forEach((id) => {
			clearTimeout(id);
		});
	}
}
