import { GameSetting } from "@/interfaces/bace";

export class GameProcess {
	private gameSetting: GameSetting;
	private isDestroy: boolean = false;
	private worker: Worker;

	constructor(gameSetting: GameSetting) {
		this.gameSetting = gameSetting;
		this.worker = new GameProcessWorker();
	}

	// private messageBriage;

	public async start() {}
}
