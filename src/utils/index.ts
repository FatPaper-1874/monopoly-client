export const lightenColor = (color: string): string => {
	// 匹配 RGB 颜色字符串中的小数值
	const regex = /([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)/;
	const match = color.match(regex);
	if (match) {
		// 将字符串转换为数字并减少 10%
		const r = Math.round(parseFloat(match[1]));
		const g = Math.round(parseFloat(match[2]));
		const b = Math.round(parseFloat(match[3]));

		const newR = Math.round(r * 0.95);
		const newG = Math.round(g * 0.95);
		const newB = Math.round(b * 0.95);

		// 确保每个通道值在 0-255 之间
		const clampedR = Math.min(255, Math.max(0, newR));
		const clampedG = Math.min(255, Math.max(0, newG));
		const clampedB = Math.min(255, Math.max(0, newB));

		// 返回新的 RGB 颜色值
		return `rgb(${clampedR}, ${clampedG}, ${clampedB})`;
	} else {
		return "rgb(0, 0, 0)";
	}
};

export function modifyColor(color: string, s: number): string {
	// 匹配 RGB 颜色字符串中的小数值
	const regex = /([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)/;
	const match = color.match(regex);
	if (match) {
		// 将字符串转换为数字并减少 10%
		const r = Math.round(parseFloat(match[1]));
		const g = Math.round(parseFloat(match[2]));
		const b = Math.round(parseFloat(match[3]));

		const newR = Math.round(r * s);
		const newG = Math.round(g * s);
		const newB = Math.round(b * s);

		// 确保每个通道值在 0-255 之间
		const clampedR = Math.min(255, Math.max(0, newR));
		const clampedG = Math.min(255, Math.max(0, newG));
		const clampedB = Math.min(255, Math.max(0, newB));

		// 返回新的 RGB 颜色值
		return `rgb(${clampedR}, ${clampedG}, ${clampedB})`;
	} else {
		return "rgb(255, 255, 255)";
	}
}

export const getRandomInteger = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const rgb2hex = (rgb: string) => {
	const regex = /([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)/;
	const match = rgb.match(regex);
	if (!match) return "#FFFFFF";
	const r = Math.round(parseFloat(match[1]));
	const g = Math.round(parseFloat(match[2]));
	const b = Math.round(parseFloat(match[3]));
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
