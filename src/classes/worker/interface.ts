import { ChanceCardType } from "@/enums/game";
import { User } from "@/interfaces/bace";
import { ChanceCardInfo, PropertyInfo } from "@/interfaces/game";

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
	buildUp: () => void;

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
	gainProperty: (property: PropertyInterface) => void;
	loseProperty: (propertyId: string) => void;

	//机会卡相关
	getCardsList: () => ChanceCardInterface[];
	setCardsList: (newChanceCardList: ChanceCardInterface[]) => void;
	getCardById: (cardId: string) => ChanceCardInterface | undefined;
	gainCard: (num: number) => void;
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
	walk: (step: number) => void;
	tp: (positionIndex: number) => void;
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
		target: PlayerInterface | PropertyInterface | PlayerInterface[] | PropertyInterface[]
	) => void;

	getChanceCardInfo: () => ChanceCardInfo;
}
