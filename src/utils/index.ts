export const lightenColor = (hexColor: string, amount: number): string => {
	// Remove the '#' character from the beginning of the string
	hexColor = hexColor.slice(1);

	// Convert the hex color to RGB
	const r = parseInt(hexColor.slice(0, 2), 16);
	const g = parseInt(hexColor.slice(2, 4), 16);
	const b = parseInt(hexColor.slice(4, 6), 16);

	// Calculate the new RGB values by decreasing each by the specified amount
	const newR = Math.max(r - amount, 0);
	const newG = Math.max(g - amount, 0);
	const newB = Math.max(b - amount, 0);

	// Convert the new RGB values back to hex
	const newHexColor = `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB
		.toString(16)
		.padStart(2, "0")}`;

	return newHexColor;
};

export const getRandomInteger = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
