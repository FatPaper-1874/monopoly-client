import CostInterface from "../CostInterface";
import PlayerInfoInterface from "./PlayerInfoInterface";

interface RealEstateInfoInterface {
	id: string;
	name: string;
	buildingNum: number;
	owner: PlayerInfoInterface | undefined;
	costList: CostInterface;
	color: string;
}

export default RealEstateInfoInterface;
