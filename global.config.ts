import {
    FATPAPER_HOST,
    FATPAPER_LOGIN_PORT,
    FATPAPER_USER_SERVER_PORT,
    ICE_SERVER_PORT,
    MONOPOLY_SERVER_PORT
} from "../global.config";

export const __MONOPOLYSERVER__ = `http://${FATPAPER_HOST}:${MONOPOLY_SERVER_PORT}`;
export const __USERSERVER__ = `http://${FATPAPER_HOST}:${FATPAPER_USER_SERVER_PORT}`;
export const __LOGINPAGEURL__ = `http://${FATPAPER_HOST}:${FATPAPER_LOGIN_PORT}`;
export const __ICESERVER__ = `ice://${FATPAPER_HOST}:${ICE_SERVER_PORT}`;

export const __FATPAPER_HOST__ = FATPAPER_HOST;
export const __ICE_SERVER_PORT__ = ICE_SERVER_PORT;