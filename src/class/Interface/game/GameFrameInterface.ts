import MapInfoInterface from './MapInfoInterface';
import PlayerInfoInterface from './PlayerInfoInterface';

interface GameFrameInterface{
  playerInfoList: PlayerInfoInterface[];
  mapInfo: MapInfoInterface;
}

export default GameFrameInterface;