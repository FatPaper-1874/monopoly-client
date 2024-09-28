export class RoundTimeTimer {
	private roundTime: number;
	private intervalMs: number = 1000;
	private timeoutTimer: any;
	private intervalTimer: any;
	private timeOutFunction: Function | null = null;
	private intervalFunction: ((remainingTime: number) => void) | null = null;

	private currentRemainingTime = 0;

	constructor(roundTime: number, intervalMs = 1000) {
		this.roundTime = roundTime;
		this.intervalMs = intervalMs;
		this.currentRemainingTime = roundTime;
	}

	public async start(callback: Function | null, timeS: number = this.roundTime): Promise<void> {
		return new Promise((resolve) => {
			if (callback) this.timeOutFunction = callback;
			if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
			this.currentRemainingTime = this.roundTime;
			this.runIntervalFunction();
			if (this.timeOutFunction)
				this.timeoutTimer = setTimeout(() => {
					this.runTimeOutFunction();
					resolve();
				}, timeS * 1000);
		});
	}

	public async setTimeOutFunction(newFunction: Function | null) {
		this.timeOutFunction = newFunction;
		await this.start(newFunction);
	}

	public setIntervalFunction(countDownCallback: (remainingTime: number) => void | null) {
		this.intervalFunction = countDownCallback;
		if (this.intervalTimer) clearInterval(this.intervalTimer);
		this.intervalTimer = setInterval(() => {
			this.runIntervalFunction();
		}, this.intervalMs);
	}

	public async waitAsyncResolveOrTimeOut(asyncFunction: Promise<any>, resetInterval = true) {
		if (resetInterval) this.start(null);
		await Promise.race([asyncFunction, this.start]);
		this.timeOutFunction && this.timeOutFunction();
		this.clearTimeout();
	}

	private runIntervalFunction() {
		if (!this.intervalFunction) return;
		if (this.currentRemainingTime > 0) this.currentRemainingTime--;
		this.intervalFunction(this.currentRemainingTime);
	}

	private runTimeOutFunction() {
		if (!this.timeOutFunction) return;
		this.currentRemainingTime = 0;
		this.timeOutFunction();
		this.clearTimeout();
	}

	public clearTimeout() {
		if (this.timeoutTimer) {
			clearTimeout(this.timeoutTimer);
			this.timeoutTimer = null;
		}
	}

	public clearInterval() {
		if (this.intervalTimer) {
			clearInterval(this.intervalTimer);
			this.intervalTimer = null;
		}
	}

	public destroy() {
		this.clearTimeout();
		this.clearInterval();
	}
}
