import { ChanceCardType } from "@/enums/game";
import { ChanceCard as ChanceCardFromDB, ChanceCardInfo } from "@/interfaces/game";
import { ChanceCardInterface, PlayerInterface, PropertyInterface } from "../interface";
import { GameProcess } from "../GameProcessWorker";

export class ChanceCard implements ChanceCardInterface {
	private id: string;
	private name: string;
	private describe: string;
	private type: ChanceCardType;
	private color: string;
	private icon: string;
	private effectCode: string;
	private effectFunction: Function;

	constructor(chanceCard: ChanceCardFromDB) {
		this.id = crypto.randomUUID();
		this.name = chanceCard.name;
		this.describe = chanceCard.describe;
		this.type = chanceCard.type;
		this.color = chanceCard.color;
		this.icon = chanceCard.icon;
		this.effectCode = chanceCard.effectCode;
		const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
		this.effectFunction = new AsyncFunction("sourcePlayer", "target", "gameProcess", this.effectCode);
	}

	public getId = () => this.id;
	public getName = () => this.name;
	public getDescribe = () => this.describe;
	public getColor = () => this.color;
	public getType = () => this.type;
	public getIcon = () => this.icon;
	public getEffectCode = () => this.effectCode;

	public async use(
		sourcePlayer: PlayerInterface,
		target: PlayerInterface | PropertyInterface | PlayerInterface[] | PropertyInterface[] | null,
		gameProcess: GameProcess
	) {
		try {
			await this.effectFunction(sourcePlayer, target, gameProcess);
		} catch (e: any) {
			throw Error(e.message);
		}
	}

	public getChanceCardInfo(): ChanceCardInfo {
		const chanceCardInfo: ChanceCardInfo = {
			id: this.id,
			name: this.name,
			describe: this.describe,
			color: this.color,
			type: this.type,
			icon: this.icon,
		};
		return chanceCardInfo;
	}
}
