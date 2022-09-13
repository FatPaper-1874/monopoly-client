interface RoomInfoInterface {
	roomId: string;
	owner: string;
  ownerId: string;
	playerList: PlayerInterface[];
}

interface PlayerInterface {
	id: string;
	name: string;
  color: string;
  icon: string;
	ready: boolean;
}

export default RoomInfoInterface;
