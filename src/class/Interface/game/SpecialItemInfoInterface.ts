import CostInterface from '../CostInterface';
import PlayerInfoInterface from './PlayerInfoInterface';
interface SpecialItemInfoInterface{
  id: string;
	name: string;
  color: string;
	buildingNum?: number;
	owner?: PlayerInfoInterface | undefined;
  costList?: CostInterface
}

export default SpecialItemInfoInterface;