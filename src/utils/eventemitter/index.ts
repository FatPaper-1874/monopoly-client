export default class EventEmitter {
	private static instance: EventEmitter | undefined;
	private eventMap: Map<string, { fn: Function; isOnce: boolean }[]>;

	constructor() {
		this.eventMap = new Map();
	}

	static getInstance() {
		if (!this.instance) {
			this.instance = new EventEmitter();
		}
		return this.instance;
	}

	public on(eventName: string, fn: Function) {
		if (!this.eventMap.has(eventName)) {
			this.eventMap.set(eventName, []);
		}
		const fnArr = this.eventMap.get(eventName);
		fnArr && fnArr.push({ fn, isOnce: false });
	}

	public once(eventName: string, fn: Function) {
		if (!this.eventMap.has(eventName)) {
			this.eventMap.set(eventName, []);
		}
		const fnArr = this.eventMap.get(eventName);
		fnArr && fnArr.push({ fn, isOnce: true });
	}

	public emit(eventName: string, ...args: any[]) {
		const fnArr = this.eventMap.get(eventName);
		if (fnArr) {
			for (let index = 0; index < fnArr.length; index++) {
				const fobj = fnArr[index];
				fobj.fn.apply(this, args);
				if (fobj.isOnce) {
					fnArr.splice(index, 1);
					index--;
				}
			}
		}
	}

	public remove(eventName: string, fn: Function) {
		const fnArr = this.eventMap.get(eventName);
		if (fnArr) {
			const removeIndex = fnArr.findIndex((fobj) => fobj.fn === fn);
			fnArr.splice(removeIndex, 1);
		}
	}

	public removeAll(eventName: string) {
		if (this.eventMap.has(eventName)) this.eventMap.delete(eventName);
	}
}
