import GameInfoInterface from './GameInfoInterface';
import MapInfoInterface from './MapInfoInterface';
import PlayerInfoInterface from './PlayerInfoInterface';

interface GameFrameInterface{
  gameInfo: GameInfoInterface;
  playerInfoList: PlayerInfoInterface[];
  mapInfo: MapInfoInterface;
}

export default GameFrameInterface;