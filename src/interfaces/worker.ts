import { WorkerCommType } from "@/enums/worker";
import { GameSetting, SocketMessage, User, UserInRoomInfo } from "./bace";
import { GameMap } from "./game";
import { OperateType } from "@/enums/game";

export type WorkerCommMsg = {
	[K in keyof WorkerCommDataTypeMap]: {
		type: K;
		data: WorkerCommDataTypeMap[K];
	};
}[keyof WorkerCommDataTypeMap];

interface WorkerCommDataTypeMap {
	//Worker Receive
	[WorkerCommType.LoadGameInfo]: { setting: GameSetting; mapInfo: GameMap; userList: UserInRoomInfo[] };
	[WorkerCommType.EmitOperation]: { userId: string; operateType: OperateType; data: SocketMessage };
	[WorkerCommType.UserOffLine]: { userId: string };
	[WorkerCommType.UserReconnect]: { userId: string };

	//Host Receive
	[WorkerCommType.WorkerReady]: undefined;
	[WorkerCommType.SendToUsers]: { userIdList: string[]; data: SocketMessage };
	[WorkerCommType.GameStart]: undefined;
	[WorkerCommType.GameOver]: undefined;
}
