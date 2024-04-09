import axios from "axios";
import {__MONOPOLYSERVER__} from "../../../global.config";
import {MusicType} from "@/interfaces/bace";

export async function getMusicList() {
    const res = await axios.get(`${__MONOPOLYSERVER__}/music/list`);
    return res.data as MusicType[];
}