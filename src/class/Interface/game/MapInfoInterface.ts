import RealEstateInfoInterface from "./RealEstateInfoInterface";
import SpecialItemInfoInterface from "./SpecialItemInfoInterface";

interface MapInfoInterface {
  mapItemList: Array<RealEstateInfoInterface | SpecialItemInfoInterface>;
}

export default MapInfoInterface