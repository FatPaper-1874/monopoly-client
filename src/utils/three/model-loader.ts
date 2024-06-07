import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { __MONOPOLYSERVER__ } from "../../../global.config";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const gltfLoader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('./draco/');
gltfLoader.setDRACOLoader(draco);

export function loadModel(name: string): Promise<GLTF> {
	return new Promise<GLTF>((resolve, reject) => {
		gltfLoader.load(
			`https://fatpaper-1304992673.cos.ap-guangzhou.myqcloud.com/monopoly/static/${name}`,
			(glft: GLTF) => {
				resolve(glft);
			},
			undefined,
			(error) => {
				reject(error);
			}
		);
	});
}
