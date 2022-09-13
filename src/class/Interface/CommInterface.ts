import CommTypes from "../enums/CommTypes";
import MsgInterface from "./MsgInterface";

interface CommInterface {
	type: CommTypes;
	msg: MsgInterface;
}

export default CommInterface;
