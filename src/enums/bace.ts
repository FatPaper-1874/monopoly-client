export enum SocketMsgType {
	ConfirmIdentity = 1000, //确认身份(websocket从客户端获取id)
	UserList, //大厅玩家信息广播
	RoomList, //房间列表广播
	JoinRoom, //加入房间
	LeaveRoom, //离开房间
	RoomInfo, //房间信息广播
	ReadyToggle, //准备状态切换
	ChangeRole, //切换角色
	GameStart, //游戏开始
}

export enum ChangeRoleOperate {
	Prev, //上一个角色
	Next, //下一个角色
}
