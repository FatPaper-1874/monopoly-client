import axios from "axios";

export const getMapsList = async (page: number, size: number) => {
	const { total, mapsList, current } = (await axios.get("/map/list", { params: { page, size } })).data as any;
	return { total, mapsList, current };
};
