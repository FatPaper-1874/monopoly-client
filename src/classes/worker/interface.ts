import { ChanceCardType } from "@/enums/game";
import { User } from "@/interfaces/bace";
import { ChanceCardInfo, PropertyInfo } from "@/interfaces/game";
import { GameProcess } from "./GameProcessWorker";
import { PlayerEvents } from "./enums/game";

export interface PlayerEventsCallback {
	[PlayerEvents.GetPropertiesList]: () => PropertyInterface[];
	[PlayerEvents.GetCardsList]: () => ChanceCardInterface[];
	[PlayerEvents.GetMoney]: () => number;
	[PlayerEvents.GetStop]: () => number;
	[PlayerEvents.GetIsBankrupted]: () => boolean;
	[PlayerEvents.AnimationFinished]: (value: void | PromiseLike<void>) => void;
	[PlayerEvents.Walk]: (walkValue: number) => Promise<number>;
	[PlayerEvents.Tp]: (tpValue: number) => Promise<number>;

	[PlayerEvents.BeforeSetPropertiesList]: (newPropertiesList: PropertyInterface[]) => PropertyInterface[] | undefined;
	[PlayerEvents.AfterSetPropertiesList]: (newPropertiesList: PropertyInterface[]) => undefined;

	[PlayerEvents.BeforeRound]: (player: PlayerInterface) => Promise<void>;
	[PlayerEvents.AfterRound]: (player: PlayerInterface) => Promise<void>;

	// [PlayerEvents.BeforeGainProperty]: (newProperty: PropertyInterface) => PropertyInterface | undefined;
	// [PlayerEvents.AfterGainProperty]: (newProperty: PropertyInterface) => undefined;

	[PlayerEvents.BeforeLoseProperty]: (lostProperty: PropertyInterface) => PropertyInterface | undefined;
	[PlayerEvents.AfterLoseProperty]: (lostProperty: PropertyInterface) => undefined;

	[PlayerEvents.BeforeSetCardsList]: (newCardList: ChanceCardInterface[]) => ChanceCardInterface[] | undefined;
	[PlayerEvents.AfterSetCardsList]: (newCardList: ChanceCardInterface[]) => undefined;

	[PlayerEvents.BeforeGainCard]: (gainCard: ChanceCardInterface) => ChanceCardInterface | undefined;
	[PlayerEvents.AfterGainCard]: (gainCard: ChanceCardInterface) => undefined;

	[PlayerEvents.BeforeLoseCard]: (lostCard: ChanceCardInterface) => ChanceCardInterface | undefined;
	[PlayerEvents.AfterLoseCard]: (lostCard: ChanceCardInterface) => undefined;

	[PlayerEvents.BeforeSetMoney]: (moneyValue: number) => number | undefined;
	[PlayerEvents.AfterSetMoney]: (moneyValue: number) => undefined;

	[PlayerEvents.BeforeGain]: (gainMoney: number) => number | undefined;
	[PlayerEvents.AfterGain]: (gainMoney: number) => undefined;

	[PlayerEvents.BeforeCost]: (costMoney: number) => number | undefined;
	[PlayerEvents.AfterCost]: (costMoney: number) => undefined;

	[PlayerEvents.BeforeStop]: (stopValue: number) => number | undefined;
	[PlayerEvents.AfterStop]: (stopValue: number) => undefined;

	[PlayerEvents.BeforeTp]: (tpValue: number) => number | undefined;
	[PlayerEvents.AfterTp]: (tpValue: number) => undefined;

	[PlayerEvents.BeforeWalk]: (walkValue: number) => number | undefined;
	[PlayerEvents.AfterWalk]: (walkValue: number) => undefined;

	[PlayerEvents.BeforeSetBankrupted]: (isBankrupted: boolean) => boolean;
	[PlayerEvents.AfterSetBankrupted]: (isBankrupted: boolean) => undefined;
}

export interface PropertyInterface {
	//房产信息
	getId: () => string;
	getName: () => string;
	getBuildingLevel: () => number;
	getBuildCost: () => number;
	getSellCost: () => number;
	getCost_lv0: () => number;
	getCost_lv1: () => number;
	getCost_lv2: () => number;
	getOwner: () => { id: string; name: string; color: string; avatar: string } | undefined;
	getPassCost: () => number;

	//设置房产信息
	setOwner: (player: PlayerInterface | undefined) => void;
	setBuildingLevel: (level: 0 | 1 | 2) => void;

	getPropertyInfo: () => PropertyInfo;
}

export interface PlayerInterface {
	//玩家信息
	getUser: () => User;
	getId: () => string;
	getName: () => string;

	//地产相关
	getPropertiesList: () => PropertyInterface[];
	setPropertiesList: (newPropertiesList: PropertyInterface[]) => void;
	// gainProperty: (property: PropertyInterface) => void;
	// loseProperty: (property: PropertyInterface) => void;

	//机会卡相关
	getCardsList: () => ChanceCardInterface[];
	setCardsList: (newChanceCardList: ChanceCardInterface[]) => void;
	getCardById: (cardId: string) => ChanceCardInterface | undefined;
	gainCard: (gainCard: ChanceCardInterface) => void;
	loseCard: (cardId: string) => void;

	//钱相关
	setMoney: (money: number) => void;
	getMoney: () => number;
	cost: (money: number) => boolean;
	gain: (money: number) => number;

	//游戏相关
	setStop: (stop: number) => void;
	getStop: () => number;
	setPositionIndex: (newIndex: number) => void;
	getPositionIndex: () => number;
	walk: (step: number) => Promise<void>;
	tp: (positionIndex: number) => Promise<void>;
	addEventListener: <K extends PlayerEvents>(eventName: K, fn: PlayerEventsCallback[K], triggerTimes?: number) => void;
}

export interface ChanceCardInterface {
	getId: () => string;
	getName: () => string;
	getDescribe: () => string;
	getIcon: () => string;
	getType: () => ChanceCardType;
	getColor: () => string;
	getEffectCode: () => string;
	use: (
		sourcePlayer: PlayerInterface,
		target: PlayerInterface | PropertyInterface | PlayerInterface[] | PropertyInterface[],
		gameProcess: GameProcess
	) => Promise<void>;

	getChanceCardInfo: () => ChanceCardInfo;
}
