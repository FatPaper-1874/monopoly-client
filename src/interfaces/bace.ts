import {ChanceCardType, GameOverRule} from "@/enums/game";
import {ChatMessageType, SocketMsgType} from "../enums/bace";

export interface GameSetting {
    gameOverRule: GameOverRule; //游戏结束的判定规则
    initMoney: number; //初始金钱
    multiplier: number; //倍率涨幅
    multiplierIncreaseRounds: number; //上涨的回合数(隔x个回合上涨一次倍率)
    roundTime: number;
    mapId: string;
    diceNum: number;
}

export interface Music {
    id: string,
    name: string,
    url: string,
}

export interface SocketMessage {
    type: SocketMsgType;
    source: string;
    roomId?: string;
    data: any;
    msg?: {
        type: string;
        content: string;
    };
    extra?: any;
}

export interface User {
    userId: string;
    username: string;
    isReady: boolean;
    avatar: string;
    color: string;
    role: Role;
}

export interface Room {
    roomId: string;
    ownerId: string;
    ownerName: string;
    userNum: number;
}

export interface Role {
    id: string;
    baseUrl: string;
    roleName: string;
    fileName: string;
    color: string;
}

export interface RoomInfo {
    roomId: string;
    userList: Array<{
        userId: string;
        username: string;
        isReady: boolean;
        color: string;
        avatar: string;
    }>;
    isStarted: boolean;
    ownerId: string;
    ownerName: string;
    roleList: Role[];
    gameSetting: GameSetting;
}

export interface MapItem {
    id: string;
    x: number;
    y: number;
    type: TypeItem;
    linkto?: MapItem;
    property?: PropertyInfo;
}

export interface TypeItem {
    id: string;
    color: string;
    name: string;
    model: string;
    size: number;
}

export interface PropertyInfo {
    id: string;
    name: string;
    buildingLevel: number;
    buildCost: number;
    sellCost: number;
    cost_lv0: number;
    cost_lv1: number;
    cost_lv2: number;
    owner?: {
        id: string;
        name: string;
        color: string;
        avatar: string;
    };
}

export interface PlayerInfo {
    id: string;
    user: User;
    money: number;
    properties: PropertyInfo[];
    chanceCards: ChanceCardInfo[];
    positionIndex: number;
    isStop: boolean;
    isBankrupted: boolean;
    isOffline: boolean;
}

export interface ChanceCardInfo {
    id: string;
    name: string;
    describe: string;
    color: string;
    type: ChanceCardType;
    icon: string;
}

export interface GameInitInfo {
    mapId: string;
    mapName: string;
    mapBackground: string;
    mapItemsList: MapItem[];
    mapIndexList: string[];
    itemTypesList: ItemType[];
    playerList: PlayerInfo[];
    properties: PropertyInfo[];
    chanceCards: ChanceCardInfo[];
    streetsList: Street[];
    currentPlayerInRound: string;
    currentRound: number;
    currentMultiplier: number;
}

export interface GameInfo {
    currentPlayerInRound: string;
    currentRound: number;
    currentMultiplier: number;
    playerList: PlayerInfo[];
    properties: PropertyInfo[];
}

export interface ItemType {
    id: string;
    color: string;
    name: string;
    model: Model;
    size: number;
}

export interface Model {
    id: string;
    name: string;
    fileUrl: string;
    fileName: string;
}

export interface Street {
    id: string;
    name: string;
    increase: number;
}

export interface ChatMessage {
    id: string;
    type: ChatMessageType;
    user: User;
    content: string;
    time: number;
}
