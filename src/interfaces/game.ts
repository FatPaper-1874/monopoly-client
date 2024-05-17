import {ItemType, MapItem} from "@/interfaces/bace";
import {ChanceCardType} from "@/enums/game";



export interface Property {
    id: string;
    name: string;
    sellCost: number;
    buildCost: number;
    cost_lv0: number;
    cost_lv1: number;
    cost_lv2: number;
    mapItem: MapItem;
    street: Street;
}

export interface Street {
    id: string;
    name: string;
    increase: number;
}

export interface ChanceCard {
    id: string;
    name: string;
    describe: string;
    icon: string;
    color: string;
    effectCode: string;
    type: ChanceCardType;
}

export interface GameMap {
    id: string;
    name: string;
    mapItems: MapItem[];
    properties: Property[];
    chanceCards: ChanceCard[];
    itemTypes: ItemType[];
}