interface PlayerInfoInterface{
  id:string;
  name:string;
  color: string;
  icon: string;
  ready: boolean;
  money: number;
  currentGrid: number;
  stop: boolean;
  ownRealEstate: string[]
}

export default PlayerInfoInterface;