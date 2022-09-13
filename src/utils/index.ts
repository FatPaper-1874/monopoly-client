function newUserId() {
	return "user-xxxx-4xxx".replace(/[x]/g,  (c) => {
		const r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export {
  newUserId,
}