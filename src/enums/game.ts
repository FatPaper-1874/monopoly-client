export enum GameOverRule {
	OnePlayerGoBroke, //一位玩家破产
	LeftOnePlayer, //只剩一位玩家
}

export enum OperateType {
	RollDice = "RollDice", //前端掷骰子
	UseChanceCard = "UseChanceCard", //使用机会卡
	Animation = "AnimationComplete", //前端动画完成回馈
	BuyProperty = "BuyProperty", //买房子
	BuildHouse = "BuildHouse", //升级房子
}

export enum ChanceCardType {
	ToSelf = "ToSelf",
	ToSinglePlayer = "ToSinglePlayer",
	ToMultiPlayers = "ToMultiPlayers",
	ToProperty = "ToProperty",
}
