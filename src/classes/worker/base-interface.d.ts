enum ChanceCardType {
	ToSelf = "ToSelf",
	ToOtherPlayer = "ToOtherPlayer",
	ToProperty = "ToProperty",
	ToMapItem = "ToMapItem",
}

enum GameOverRule {
	OnePlayerGoBroke, //一位玩家破产
	LeftOnePlayer, //只剩一位玩家
	Earn100000, //挣100000块钱
}

interface GameProcess {
	gameSetting: GameSetting;
	isDistory: boolean;

	//Static Data
	mapId: string;
	mapName: string;
	mapBackground: string;
	propertiesList: Map<string, Property>;
	mapItemsList: Map<string, MapItem>;
	chanceCardsList: ChanceCardFromDB[];
	mapIndexList: string[];
	playersList: Player[];
	itemTypesList: ItemType[];
	streetsList: Street[];
	animationStepDuration_ms: number;

	//Dynamic Data
	currentPlayerInRound: Player;
	currentRound: number;
	currentMultiplier: number;
	timeoutList: any[];
	intervalTimerList: any[];

	useChanceCardListener(sourcePlayer: Player): Promise<void>;
	waitRollDice(player: Player): Promise<void>;
	handleArriveEvent(arrivedPlayer: Player): Promise<void>;
	getRandomChanceCard(num: number): ChanceCard[];
	gameInfoBroadcast(): void;
	gameBroadcast(msg: SocketMessage): void;
	gameMsgNotifyBroadcast(type: "success" | "warning" | "error" | "info", msg: string);
	getPlayerById(id: string): Player | undefined;
}

interface GameSetting {
	gameOverRule: GameOverRule; //游戏结束的判定规则
	initMoney: number; //初始金钱
	multiplier: number; //倍率涨幅
	multiplierIncreaseRounds: number; //上涨的回合数(隔x个回合上涨一次倍率)
	roundTime: number;
	mapId: string;
	diceNum: number;
}

enum PlayerEvents {
	GetPropertiesList = "GetPropertiesList",
	GetCardsList = "GetCardsList",
	GetMoney = "GetMoney",
	GetStop = "GetStop",
	GetIsBankrupted = "GetIsBankrupted",
	AnimationFinished = "AnimationFinished",
	Walk = "Walk",
	Tp = "Tp",

	BeforeSetPropertiesList = "BeforeSetPropertiesList",
	AfterSetPropertiesList = "AfterSetPropertiesList",

	BeforeGainProperty = "BeforeGainProperty",
	AfterGainProperty = "AfterGainProperty",

	BeforeRound = "BeforeRound",
	AfterRound = "AfterRound",

	BeforeLoseProperty = "BeforeLoseProperty",
	AfterLoseProperty = "AfterLoseProperty",

	BeforeSetCardsList = "BeforeSetCardsList",
	AfterSetCardsList = "AfterSetCardsList",

	BeforeGainCard = "BeforeGainCard",
	AfterGainCard = "AfterGainCard",

	BeforeLoseCard = "BeforeLoseCard",
	AfterLoseCard = "AfterLoseCard",

	BeforeSetMoney = "BeforeSetMoney",
	AfterSetMoney = "AfterSetMoney",

	BeforeGain = "BeforeGain",
	AfterGain = "AfterGain",

	BeforeCost = "BeforeCost",
	AfterCost = "AfterCost",

	BeforeStop = "BeforeStop",
	AfterStop = "AfterStop",

	BeforeTp = "BeforeTp",
	AfterTp = "AfterTp",

	BeforeWalk = "BeforeWalk",
	AfterWalk = "AfterWalk",

	BeforeSetBankrupted = "BeforeSetBankrupted",
	AfterSetBankrupted = "AfterSetBankrupted",
}

interface PlayerEventsCallback {
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

	[PlayerEvents.BeforeGainProperty]: (newProperty: PropertyInterface) => undefined;
	[PlayerEvents.AfterGainProperty]: (newProperty: PropertyInterface) => undefined;

	[PlayerEvents.BeforeLoseProperty]: (lostProperty: PropertyInterface) => undefined;
	[PlayerEvents.AfterLoseProperty]: (lostProperty: PropertyInterface) => undefined;

	[PlayerEvents.BeforeSetCardsList]: (newCardList: ChanceCardInterface[]) => ChanceCardInterface[] | undefined;
	[PlayerEvents.AfterSetCardsList]: (newCardList: ChanceCardInterface[]) => undefined;

	[PlayerEvents.BeforeGainCard]: (gainCard: ChanceCardInterface) => ChanceCardInterface | undefined;
	[PlayerEvents.AfterGainCard]: (gainCard: ChanceCardInterface) => undefined;

	[PlayerEvents.BeforeLoseCard]: (lostCard: ChanceCardInterface) => ChanceCardInterface | undefined;
	[PlayerEvents.AfterLoseCard]: (lostCard: ChanceCardInterface) => undefined;

	[PlayerEvents.BeforeSetMoney]: (moneyValue: number) => number | undefined;
	[PlayerEvents.AfterSetMoney]: (moneyValue: number) => undefined;

	[PlayerEvents.BeforeGain]: (gainMoney: number, source?: PlayerInterface) => number | undefined;
	[PlayerEvents.AfterGain]: (gainMoney: number, source?: PlayerInterface) => undefined;

	[PlayerEvents.BeforeCost]: (costMoney: number, target?: PlayerInterface) => number | undefined;
	[PlayerEvents.AfterCost]: (costMoney: number, target?: PlayerInterface) => undefined;

	[PlayerEvents.BeforeStop]: (stopValue: number) => number | undefined;
	[PlayerEvents.AfterStop]: (stopValue: number) => undefined;

	[PlayerEvents.BeforeTp]: (tpValue: number) => number | undefined;
	[PlayerEvents.AfterTp]: (tpValue: number) => undefined;

	[PlayerEvents.BeforeWalk]: (walkValue: number) => number | undefined;
	[PlayerEvents.AfterWalk]: (walkValue: number) => undefined;

	[PlayerEvents.BeforeSetBankrupted]: (isBankrupted: boolean) => boolean;
	[PlayerEvents.AfterSetBankrupted]: (isBankrupted: boolean) => undefined;
}

interface PropertyInterface {
	//房产信息
	getId: () => string;
	getName: () => string;
	getBuildingLevel: () => number;
	getBuildCost: () => number;
	getSellCost: () => number;
	getCost_lv0: () => number;
	getCost_lv1: () => number;
	getCost_lv2: () => number;
	getOwner: () => PlayerInterface | undefined;
	getPassCost: () => number;

	//设置房产信息
	setOwner: (player: PlayerInterface | undefined) => void;
	setBuildingLevel: (level: 0 | 1 | 2) => void;

	getPropertyInfo: () => PropertyInfo;
}

interface PlayerInterface {
	//玩家信息
	getUser: () => User;
	getId: () => string;
	getName: () => string;

	//地产相关
	getPropertiesList: () => PropertyInterface[];
	setPropertiesList: (newPropertiesList: PropertyInterface[]) => void;
	gainProperty: (property: PropertyInterface) => void;
	loseProperty: (property: PropertyInterface) => void;

	//机会卡相关
	getCardsList: () => ChanceCardInterface[];
	setCardsList: (newChanceCardList: ChanceCardInterface[]) => void;
	getCardById: (cardId: string) => ChanceCardInterface | undefined;
	gainCard: (gainCard: ChanceCardInterface) => void;
	loseCard: (cardId: string) => void;

	//钱相关
	setMoney: (money: number) => void;
	getMoney: () => number;
	cost: (money: number, target?: PlayerInterface) => boolean;
	gain: (money: number, source?: PlayerInterface) => number;

	//游戏相关
	setStop: (stop: number) => void;
	getStop: () => number;
	setPositionIndex: (newIndex: number) => void;
	getPositionIndex: () => number;
	setBankrupted: (isBankrupted: boolean) => void;
	getIsBankrupted: () => boolean;
	walk: (step: number) => Promise<void>;
	tp: (positionIndex: number) => Promise<void>;

	addEventListener: <K extends PlayerEvents>(
		eventName: K,
		fn: PlayerEventsCallback[K],
		triggerTimes?: number,
		buff?: Buff
	) => void;
	removeListener(eventName: PlayerEvents, id: string): void;
	removeAllListeners(eventName: PlayerEvents): void;
	updateBuff(buffId: string, newBuff: Buff): void;

	getPlayerInfo: () => PlayerInfo;
}

interface ChanceCardInterface {
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

interface ChanceCardFromDB {
	id: string;
	name: string;
	describe: string;
	icon: string;
	color: string;
	type: ChanceCardType;
	effectCode: string;
}

interface Street {
	id: string;
	name: string;
	increase: number;
}

interface MapItem {
	_id: string;
	id: string;
	x: number;
	y: number;
	rotation: 0 | 1 | 2 | 3;
	type: ItemType;
	linkto?: MapItem;
	arrivedEvent?: ArrivedEvent;
	property?: Property;
}

interface ItemType {
	id: string;
	color: string;
	name: string;
	model: Model;
	effectCode?: string;
	hasEvent: boolean;
	size: number;
}

interface Street {
	id: string;
	name: string;
	increase: number;
}

interface Model {
	id: string;
	name: string;
	fileUrl: string;
	fileName: string;
}

interface User {
	userId: string;
	username: string;
	socketClient: WebSocket;
	avatar: string;
	color: string;
}

interface Buff {
	id?: string;
	name: string;
	describe: string;
	source: string;
}

type Utils = {
	randomString: (length: number) => string;
};
