import PlayerInfoInterface from "./game/PlayerInfoInterface";

interface RoomInfoInterface {
	roomId: string;
	owner: string;
  ownerId: string;
	playerList: PlayerInfoInterface[];
}

export default RoomInfoInterface;
