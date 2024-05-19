import axios from "axios";
import {__MONOPOLYSERVER__} from "../../../global.config";
import {Music} from "@/interfaces/bace";

export const getMusicList = async (page: number, size: number) => {
    const { total, musicList, current } = (await axios.get(`${__MONOPOLYSERVER__}/music/list`, { params: { page, size } })).data as any;
    return { total, musicList, current };
};