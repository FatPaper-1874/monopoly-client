import { __MONOPOLYSERVER__ } from "@/global.config";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const gltfLoader = new GLTFLoader();

export function loadModel(name: string): Promise<GLTF> {
	return new Promise<GLTF>((resolve, reject) => {
		gltfLoader.load(
			`/models/${name}`,
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
