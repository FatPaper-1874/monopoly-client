import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";

export function getDracoLoader(){
    const draco = new DRACOLoader();
    draco.setDecoderPath('./draco/');
    return draco;
}