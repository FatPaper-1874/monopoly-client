function newUserId() {
	return "user-xxxx-4xxx".replace(/[x]/g, (c) => {
		const r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function roll(diceNum: number) {
	const resultArray = [];
	for (let rollCount = 0; rollCount < diceNum; rollCount++) {
		resultArray.push(getRandomInteger(1, 6));
	}
	return resultArray;
}

function getRandomInteger(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { newUserId, roll };
